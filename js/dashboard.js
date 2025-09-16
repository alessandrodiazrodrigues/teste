// =================== DASHBOARD EXECUTIVO ===================
window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo...');
    
    const container = document.getElementById('dashExecutivoContent');
    if (!container) {
        logError('Container dashExecutivoContent não encontrado');
        return;
    }
    
    // Calcular KPIs consolidados
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let ppsTotal = 0;
    let ppsCont = 0;
    let spictElegiveis = 0;
    let spictTotal = 0;
    
    Object.values(window.hospitalData).forEach(hospital => {
        totalLeitos += hospital.leitos.length;
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                leitosOcupados++;
                
                if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.startsWith('Hoje')) {
                    leitosEmAlta++;
                }
                
                if (leito.paciente.pps) {
                    const ppsNum = parseInt(leito.paciente.pps);
                    if (!isNaN(ppsNum)) {
                        ppsTotal += ppsNum;
                        ppsCont++;
                    }
                }
                
                if (leito.paciente.spictBr === 'Elegível') {
                    spictElegiveis++;
                }
                spictTotal++;
            }
        });
    });
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const ppsMedia = ppsCont > 0 ? Math.round(ppsTotal / ppsCont) : 0;
    const spictPerc = spictTotal > 0 ? Math.round((spictElegiveis / spictTotal) * 100) : 0;
    
    container.innerHTML = `
        <div class="dashboard-executivo">
            <!-- Título Principal -->
            <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
                Rede Hospitalar Externa
            </h2>
            
            <!-- KPIs Grid (6 colunas x 2 linhas) -->
            <div class="executive-kpis-grid">
                <!-- Box Principal com Gauge -->
                <div class="kpi-principal">
                    <div class="gauge-container">
                        <canvas id="gaugeExecutivo" width="200" height="100"></canvas>
                        <div class="gauge-value">${ocupacaoGeral}%</div>
                        <div class="gauge-label">OCUPAÇÃO GERAL</div>
                    </div>
                    <div class="hospitais-list">
                        ${Object.entries(window.hospitalData).map(([id, hospital]) => {
                            const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
                            const perc = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
                            return `<div class="hospital-item">
                                <span class="hospital-nome">${hospital.nome}</span>
                                <span class="hospital-pct">${perc}%</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                
                <!-- KPIs Linha 1 -->
                <div class="kpi-box">
                    <div class="kpi-value">${Object.keys(window.hospitalData).length}</div>
                    <div class="kpi-label">HOSPITAIS</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-value">${totalLeitos}</div>
                    <div class="kpi-label">TOTAL DE LEITOS</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-value">${leitosOcupados}</div>
                    <div class="kpi-label">LEITOS OCUPADOS</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-value">${leitosVagos}</div>
                    <div class="kpi-label">LEITOS VAGOS</div>
                </div>
                
                <!-- KPIs Linha 2 -->
                <div class="kpi-box">
                    <div class="kpi-value">${leitosEmAlta}</div>
                    <div class="kpi-label">LEITOS EM ALTA</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-value">3.2d</div>
                    <div class="kpi-label">TPH</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-value">${ppsMedia}%</div>
                    <div class="kpi-label">PPS MÉDIO</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-value">${spictPerc}%</div>
                    <div class="kpi-label">SPICT-BR ELEGÍVEL</div>
                </div>
            </div>
            
            <!-- Gráficos Executivos -->
            <div class="executive-charts">
                <div class="chart-container">
                    <h3>Análise Preditiva de Altas em ${new Date().toLocaleDateString('pt-BR')}</h3>
                    <canvas id="graficoAltasExecutivo"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Análise Preditiva de Concessões em ${new Date().toLocaleDateString('pt-BR')}</h3>
                    <canvas id="graficoConcessoesExecutivo"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Análise Preditiva de Linha de Cuidados em ${new Date().toLocaleDateString('pt-BR')}</h3>
                    <canvas id="graficoLinhasExecutivo"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar gráficos após DOM estar pronto
    setTimeout(() => {
        if (window.renderGaugeExecutivo) {
            window.renderGaugeExecutivo(ocupacaoGeral);
        }
        if (window.renderGraficosExecutivos) {
            window.renderGraficosExecutivos();
        }
    }, 100);
    
    logSuccess('Dashboard Executivo renderizado');
};

// =================== DASHBOARD HOSPITALAR ===================
window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        logError('Container dashHospitalarContent não encontrado');
        return;
    }
    
    let html = '<div class="dashboard-hospitalar">';
    html += `<h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
                Dashboard Hospitalar
             </h2>`;
    html += '<div class="hospitalar-grid">';
    
    Object.entries(window.hospitalData).forEach(([hospitalId, hospital]) => {
        const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
        const vagos = hospital.leitos.length - ocupados;
        const emAlta = hospital.leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente &&
            l.paciente.previsaoAlta && 
            l.paciente.previsaoAlta.startsWith('Hoje')
        ).length;
        const ocupacao = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
        
        html += `
            <div class="hospital-section" data-hospital="${hospitalId}">
                <h3 class="hospital-title">${hospital.nome}</h3>
                
                <!-- KPIs do Hospital -->
                <div class="hospital-kpis">
                    <div class="hospital-gauge">
                        <canvas id="gauge${hospitalId}" width="120" height="60"></canvas>
                        <div class="gauge-label">${ocupacao}%</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${hospital.leitos.length}</div>
                        <div class="kpi-label">TOTAL</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${ocupados}</div>
                        <div class="kpi-label">OCUPADOS</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${vagos}</div>
                        <div class="kpi-label">VAGOS</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${emAlta}</div>
                        <div class="kpi-label">EM ALTA</div>
                    </div>
                </div>
                
                <!-- Gráficos do Hospital -->
                <div class="hospital-graficos">
                    <div class="chart-container">
                        <h4>Projeção de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Projeção de Concessões em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-type-selector">
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'concessoes', 'scatter')">Bolinhas</button>
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'concessoes', 'bubble')">Agrupadas</button>
                            <button class="chart-type-btn active" onclick="changeChartType('${hospitalId}', 'concessoes', 'bar')">Barras</button>
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'concessoes', 'line')">Linhas</button>
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'concessoes', '3d')">3D</button>
                        </div>
                        <canvas id="graficoConcessoes${hospitalId}"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Projeção Linha de Cuidados em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-type-selector">
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'linhas', 'scatter')">Bolinhas</button>
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'linhas', 'bubble')">Agrupadas</button>
                            <button class="chart-type-btn active" onclick="changeChartType('${hospitalId}', 'linhas', 'bar')">Barras</button>
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'linhas', 'line')">Linhas</button>
                            <button class="chart-type-btn" onclick="changeChartType('${hospitalId}', 'linhas', '3d')">3D</button>
                        </div>
                        <canvas id="graficoLinhas${hospitalId}"></canvas>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // Renderizar todos os gráficos
    setTimeout(() => {
        Object.keys(window.hospitalData).forEach(hospitalId => {
            if (window.renderHospitalCharts) {
                window.renderHospitalCharts(hospitalId);
            }
        });
    }, 100);
    
    logSuccess('Dashboard Hospitalar renderizado');
};

// =================== FUNÇÃO PARA MUDANÇA DE TIPO DE GRÁFICO ===================
window.changeChartType = function(hospitalId, chartType, newType) {
    logInfo(`Mudando tipo de gráfico: ${hospitalId} - ${chartType} - ${newType}`);
    
    // Atualizar botões visuais
    const chartContainer = document.getElementById(`grafico${chartType === 'concessoes' ? 'Concessoes' : 'Linhas'}${hospitalId}`);
    if (chartContainer) {
        const selector = chartContainer.closest('.chart-container').querySelector('.chart-type-selector');
        if (selector) {
            selector.querySelectorAll('.chart-type-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }
    }
    
    // Re-renderizar gráfico
    if (chartType === 'concessoes' && window.renderHospitalConcessoesChart) {
        window.renderHospitalConcessoesChart(hospitalId, newType);
    } else if (chartType === 'linhas' && window.renderHospitalLinhasChart) {
        window.renderHospitalLinhasChart(hospitalId, newType);
    }
};

// =================== ESTILOS ADICIONAIS PARA DASHBOARDS ===================
const dashboardStyles = `
<style>
.dashboard-executivo {
    padding: 20px;
}

.dashboard-hospitalar {
    padding: 20px;
}

.hospital-graficos {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 20px;
}

/* Responsive para gráficos hospitalares */
@media (min-width: 1400px) {
    .hospital-graficos {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .hospital-kpis {
        flex-direction: column;
        gap: 10px;
    }
    
    .chart-type-selector {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .chart-type-btn {
        font-size: 10px;
        padding: 4px 8px;
    }
}
</style>
`;

// Adicionar estilos ao documento apenas uma vez
if (!document.getElementById('dashboardStyles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'dashboardStyles';
    styleElement.innerHTML = dashboardStyles;
    document.head.appendChild(styleElement);
}

logSuccess('Dashboard.js carregado e configurado');

// =================== DASHBOARD EXECUTIVO ===================
window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo...');
    
    const container = document.getElementById('dashExecutivoContent');
    if (!container) return;
    
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
            if (leito.status === 'ocupado') {
                leitosOcupados++;
                if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.startsWith('Hoje')) {
                    leitosEmAlta++;
                }
                if (leito.paciente.pps) {
                    ppsTotal += parseInt(leito.paciente.pps);
                    ppsCont++;
                }
                if (leito.paciente.spictBr === 'Elegível') {
                    spictElegiveis++;
                }
                spictTotal++;
            }
        });
    });
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacaoGeral = Math.round((leitosOcupados / totalLeitos) * 100);
    const ppsMedia = ppsCont > 0 ? Math.round(ppsTotal / ppsCont) : 0;
    const spictPerc = spictTotal > 0 ? Math.round((spictElegiveis / spictTotal) * 100) : 0;
    
    container.innerHTML = `
        <div class="dashboard-executivo">
            <!-- KPIs Grid (6 colunas x 2 linhas) -->
            <div class="kpis-grid-executivo">
                <!-- Box Principal com Gauge -->
                <div class="kpi-box-principal">
                    <canvas id="gaugeExecutivo" width="200" height="100"></canvas>
                    <div class="gauge-info">
                        <div class="gauge-percent">${ocupacaoGeral}%</div>
                        <div class="gauge-label">Ocupação Geral</div>
                    </div>
                    <div class="hospitais-list">
                        ${Object.values(window.hospitalData).map(h => {
                            const ocupados = h.leitos.filter(l => l.status === 'ocupado').length;
                            const perc = Math.round((ocupados / h.leitos.length) * 100);
                            return `<div class="hospital-item">${h.nome}: ${perc}%</div>`;
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
            
            <!-- Gráficos -->
            <div class="graficos-container">
                <div class="grafico-box">
                    <h3>Análise Preditiva de Altas em ${new Date().toLocaleDateString('pt-BR')}</h3>
                    <canvas id="graficoAltasExecutivo"></canvas>
                </div>
                <div class="grafico-box">
                    <h3>Análise Preditiva de Concessões em ${new Date().toLocaleDateString('pt-BR')}</h3>
                    <canvas id="graficoConcessoesExecutivo"></canvas>
                </div>
                <div class="grafico-box">
                    <h3>Análise Preditiva de Linha de Cuidados em ${new Date().toLocaleDateString('pt-BR')}</h3>
                    <canvas id="graficoLinhasExecutivo"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar gráficos
    setTimeout(() => {
        if (window.renderGaugeExecutivo) window.renderGaugeExecutivo(ocupacaoGeral);
        if (window.renderGraficosExecutivos) window.renderGraficosExecutivos();
    }, 100);
    
    logSuccess('Dashboard Executivo renderizado');
};

// =================== DASHBOARD HOSPITALAR ===================
window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (!container) return;
    
    let html = '<div class="dashboard-hospitalar">';
    
    Object.entries(window.hospitalData).forEach(([hospitalId, hospital]) => {
        const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
        const vagos = hospital.leitos.length - ocupados;
        const emAlta = hospital.leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente.previsaoAlta && 
            l.paciente.previsaoAlta.startsWith('Hoje')
        ).length;
        const ocupacao = Math.round((ocupados / hospital.leitos.length) * 100);
        
        html += `
            <div class="hospital-dashboard-section">
                <h3>${hospital.nome}</h3>
                
                <!-- KPIs do Hospital -->
                <div class="hospital-kpis">
                    <div class="kpi-gauge-small">
                        <canvas id="gauge${hospitalId}" width="100" height="50"></canvas>
                        <div class="gauge-value-small">${ocupacao}%</div>
                    </div>
                    <div class="kpi-box-small">
                        <div class="kpi-value">${hospital.leitos.length}</div>
                        <div class="kpi-label">TOTAL</div>
                    </div>
                    <div class="kpi-box-small">
                        <div class="kpi-value">${ocupados}</div>
                        <div class="kpi-label">OCUPADOS</div>
                    </div>
                    <div class="kpi-box-small">
                        <div class="kpi-value">${vagos}</div>
                        <div class="kpi-label">VAGOS</div>
                    </div>
                    <div class="kpi-box-small">
                        <div class="kpi-value">${emAlta}</div>
                        <div class="kpi-label">EM ALTA</div>
                    </div>
                </div>
                
                <!-- Gráficos do Hospital -->
                <div class="hospital-graficos">
                    <div class="grafico-box-small">
                        <h4>Projeção de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                    <div class="grafico-box-small">
                        <h4>Projeção de Concessões em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-selector">
                            <button onclick="changeChartType('${hospitalId}', 'concessoes', 'scatter')">Bolinhas</button>
                            <button onclick="changeChartType('${hospitalId}', 'concessoes', 'scatter-grouped')">Bolinhas Agrupadas</button>
                            <button onclick="changeChartType('${hospitalId}', 'concessoes', 'bar')" class="active">Barras</button>
                            <button onclick="changeChartType('${hospitalId}', 'concessoes', 'line')">Linhas</button>
                            <button onclick="changeChartType('${hospitalId}', 'concessoes', '3d')">3D</button>
                        </div>
                        <canvas id="graficoConcessoes${hospitalId}"></canvas>
                    </div>
                    <div class="grafico-box-small">
                        <h4>Projeção Linha de Cuidados em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-selector">
                            <button onclick="changeChartType('${hospitalId}', 'linhas', 'scatter')">Bolinhas</button>
                            <button onclick="changeChartType('${hospitalId}', 'linhas', 'scatter-grouped')">Bolinhas Agrupadas</button>
                            <button onclick="changeChartType('${hospitalId}', 'linhas', 'bar')" class="active">Barras</button>
                            <button onclick="changeChartType('${hospitalId}', 'linhas', 'line')">Linhas</button>
                            <button onclick="changeChartType('${hospitalId}', 'linhas', '3d')">3D</button>
                        </div>
                        <canvas id="graficoLinhas${hospitalId}"></canvas>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Renderizar todos os gráficos
    setTimeout(() => {
        Object.keys(window.hospitalData).forEach(hospitalId => {
            if (window.renderHospitalCharts) window.renderHospitalCharts(hospitalId);
        });
    }, 100);
    
    logSuccess('Dashboard Hospitalar renderizado');
};

// =================== ESTILOS DO DASHBOARD ===================
const dashboardStyles = `
<style>
.dashboard-executivo {
    padding: 20px;
}

.kpis-grid-executivo {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, 100px);
    gap: 15px;
    margin-bottom: 30px;
}

.kpi-box-principal {
    grid-column: span 2;
    grid-row: span 2;
    background: var(--card);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
}

.kpi-box {
    background: var(--card);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
}

.kpi-value {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 5px;
}

.kpi-label {
    font-size: 12px;
    text-transform: uppercase;
    opacity: 0.8;
}

.hospitais-list {
    margin-top: 15px;
    width: 100%;
}

.hospital-item {
    padding: 5px 0;
    font-size: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.graficos-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}

.grafico-box {
    background: var(--card);
    border-radius: 12px;
    padding: 20px;
    color: white;
}

.grafico-box h3 {
    margin-bottom: 20px;
    font-size: 16px;
}

.dashboard-hospitalar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 20px;
}

.hospital-dashboard-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hospital-kpis {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.kpi-box-small {
    flex: 1;
    background: var(--card);
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    color: white;
}

.chart-selector {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
}

.chart-selector button {
    padding: 5px 10px;
    background: #e5e7eb;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.chart-selector button.active {
    background: #3b82f6;
    color: white;
}
</style>
`;

// Adicionar estilos ao documento
if (!document.getElementById('dashboardStyles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'dashboardStyles';
    styleElement.innerHTML = dashboardStyles;
    document.head.appendChild(styleElement);
}

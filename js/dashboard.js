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
        
        // Renderizar gráficos executivos usando dados consolidados
        renderGraficosExecutivos();
    }, 100);
    
    logSuccess('Dashboard Executivo renderizado');
};

// =================== DASHBOARD HOSPITALAR (LAYOUT VERTICAL CORRIGIDO) ===================
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
                
                <!-- *** CORREÇÃO CRÍTICA: GRÁFICOS EM LAYOUT VERTICAL *** -->
                <div class="hospital-graficos">
                    <!-- Gráfico 1: Projeção de Altas -->
                    <div class="chart-container">
                        <h4>Projeção de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <canvas id="graficoAltas${hospitalId}" height="200"></canvas>
                    </div>
                    
                    <!-- Gráfico 2: Projeção de Concessões -->
                    <div class="chart-container">
                        <h4>Projeção de Concessões em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-type-selector">
                            <button class="chart-type-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar">Barras</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="scatter">Bolinhas</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="line">Linha</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="area">Área</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="radar">Radar</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="polar">Polar</button>
                        </div>
                        <canvas id="graficoConcessoes${hospitalId}" height="200"></canvas>
                    </div>
                    
                    <!-- Gráfico 3: Projeção de Linhas de Cuidado -->
                    <div class="chart-container">
                        <h4>Projeção de Linha de Cuidados em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-type-selector">
                            <button class="chart-type-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="scatter">Bolinhas</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="line">Linha</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="area">Área</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="radar">Radar</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="polar">Polar</button>
                        </div>
                        <canvas id="graficoLinhas${hospitalId}" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // *** ADICIONAR EVENT LISTENERS PARA OS 7 TIPOS DE GRÁFICO ***
    setTimeout(() => {
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hospital = e.target.dataset.hospital;
                const chart = e.target.dataset.chart;
                const type = e.target.dataset.type;
                
                // Atualizar botões visuais
                const selector = e.target.closest('.chart-type-selector');
                selector.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Re-renderizar gráfico com novo tipo
                if (chart === 'concessoes') {
                    const hospitalData = window.hospitalData[hospital];
                    if (hospitalData) {
                        window.renderGraficoConcessoes(`graficoConcessoes${hospital}`, hospitalData, type);
                    }
                } else if (chart === 'linhas') {
                    const hospitalData = window.hospitalData[hospital];
                    if (hospitalData) {
                        window.renderGraficoLinhas(`graficoLinhas${hospital}`, hospitalData, type);
                    }
                }
                
                logInfo(`Gráfico alterado: ${hospital} - ${chart} - ${type}`);
            });
        });
        
        // Renderizar todos os gráficos iniciais
        Object.keys(window.hospitalData).forEach(hospitalId => {
            renderGaugeHospital(hospitalId);
            
            const hospitalData = window.hospitalData[hospitalId];
            if (hospitalData) {
                window.renderGraficoAltas(`graficoAltas${hospitalId}`, hospitalData);
                window.renderGraficoConcessoes(`graficoConcessoes${hospitalId}`, hospitalData, 'bar');
                window.renderGraficoLinhas(`graficoLinhas${hospitalId}`, hospitalData, 'bar');
            }
        });
    }, 100);
    
    logSuccess('Dashboard Hospitalar renderizado com layout vertical');
};

// =================== RENDERIZAR GAUGE DO HOSPITAL ===================
function renderGaugeHospital(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas) return;
    
    const hospitalData = window.hospitalData[hospitalId];
    if (!hospitalData) return;
    
    const ocupados = hospitalData.leitos.filter(l => l.status === 'ocupado').length;
    const total = hospitalData.leitos.length;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    const chartKey = `gauge${hospitalId}`;
    window.destroyChart(chartKey);
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [ocupacao, 100 - ocupacao],
                backgroundColor: [
                    ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f59e0b' : '#16a34a',
                    'rgba(255, 255, 255, 0.1)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: Math.PI,
            rotation: Math.PI,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// =================== RENDERIZAR GRÁFICOS EXECUTIVOS ===================
function renderGraficosExecutivos() {
    // Consolidar dados de todos os hospitais
    const dadosConsolidados = consolidarDadosHospitais();
    
    // Gráfico de Altas Executivo (com divisões Ouro/2R/3R)
    const canvasAltas = document.getElementById('graficoAltasExecutivo');
    if (canvasAltas) {
        renderGraficoAltasConsolidado(dadosConsolidados);
    }
    
    // Gráfico de Concessões Executivo
    const canvasConcessoes = document.getElementById('graficoConcessoesExecutivo');
    if (canvasConcessoes) {
        window.renderGraficoConcessoes('graficoConcessoesExecutivo', dadosConsolidados, 'bar');
    }
    
    // Gráfico de Linhas Executivo
    const canvasLinhas = document.getElementById('graficoLinhasExecutivo');
    if (canvasLinhas) {
        window.renderGraficoLinhas('graficoLinhasExecutivo', dadosConsolidados, 'bar');
    }
}

// =================== CONSOLIDAR DADOS DE TODOS OS HOSPITAIS ===================
function consolidarDadosHospitais() {
    const leitosConsolidados = [];
    
    Object.values(window.hospitalData).forEach(hospital => {
        leitosConsolidados.push(...hospital.leitos);
    });
    
    return {
        nome: 'Consolidado',
        leitos: leitosConsolidados
    };
}

// =================== GRÁFICO DE ALTAS CONSOLIDADO (COM DIVISÕES) ===================
function renderGraficoAltasConsolidado(dadosConsolidados) {
    const canvas = document.getElementById('graficoAltasExecutivo');
    if (!canvas) return;
    
    // *** CORREÇÃO: INCLUIR DIVISÕES OURO/2R/3R PARA HOJE E 24H ***
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h', 'SP'];
    
    const dados = categorias.map(cat => {
        return dadosConsolidados.leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente && 
            l.paciente.previsaoAlta === cat
        ).length;
    });
    
    const cores = categorias.map(cat => {
        if (cat.includes('Ouro')) return '#fbbf24';
        if (cat.includes('2R')) return '#3b82f6';
        if (cat.includes('3R')) return '#8b5cf6';
        if (cat === 'SP') return '#6b7280';
        if (cat === '48h') return '#10b981';
        if (cat === '72h') return '#f59e0b';
        if (cat === '96h') return '#ef4444';
        return '#10b981';
    });
    
    const chartData = {
        labels: categorias,
        datasets: [{
            label: 'Altas Previstas',
            data: dados,
            backgroundColor: cores,
            borderWidth: 0
        }]
    };
    
    window.destroyChart('graficoAltasExecutivo');
    
    window.chartInstances.graficoAltasExecutivo = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: {
            ...window.getChartOptions('Quantidade de Beneficiários', false, 'bar'),
            plugins: {
                ...window.getChartOptions('Quantidade de Beneficiários', false, 'bar').plugins,
                legend: {
                    display: true,
                    position: 'left',
                    align: 'start',
                    labels: {
                        color: '#ffffff',
                        padding: 8,
                        font: { size: 11, weight: 600 },
                        generateLabels: function(chart) {
                            // Agrupar por tipo (Ouro, 2R, 3R, etc.)
                            const grupos = [
                                { nome: 'Ouro', cor: '#fbbf24' },
                                { nome: '2R', cor: '#3b82f6' },
                                { nome: '3R', cor: '#8b5cf6' },
                                { nome: '48h', cor: '#10b981' },
                                { nome: '72h', cor: '#f59e0b' },
                                { nome: '96h', cor: '#ef4444' },
                                { nome: 'SP', cor: '#6b7280' }
                            ];
                            
                            return grupos.map((grupo, index) => ({
                                text: grupo.nome,
                                fillStyle: grupo.cor,
                                hidden: false,
                                index: index,
                                pointStyle: 'rect'
                            }));
                        }
                    }
                }
            }
        }
    });
}

// =================== ESTILOS ADICIONAIS PARA DASHBOARDS ===================
const dashboardStyles = `
<style>
.dashboard-executivo {
    padding: 20px;
}

.dashboard-hospitalar {
    padding: 20px;
}

/* *** GARANTIR LAYOUT VERTICAL DOS GRÁFICOS HOSPITALARES *** */
.hospital-graficos {
    display: grid !important;
    grid-template-columns: 1fr !important;
    grid-template-rows: auto auto auto !important;
    gap: 20px !important;
    margin-top: 20px;
}

.hospital-section .chart-container {
    width: 100% !important;
    margin-bottom: 0 !important;
}

/* Responsive para gráficos hospitalares */
@media (max-width: 768px) {
    .hospital-kpis {
        flex-direction: column;
        gap: 10px;
    }
    
    .chart-type-selector {
        flex-wrap: wrap;
        justify-content: center;
        gap: 4px;
    }
    
    .chart-type-btn {
        font-size: 10px;
        padding: 4px 8px;
        min-width: 60px;
    }
    
    /* GARANTIR QUE GRÁFICOS FIQUEM UM EMBAIXO DO OUTRO NO MOBILE */
    .hospital-graficos {
        grid-template-columns: 1fr !important;
        gap: 15px !important;
    }
}

/* Cores específicas para cada tipo de gráfico */
.chart-type-btn[data-type="bar"] { border-left: 3px solid #3b82f6; }
.chart-type-btn[data-type="scatter"] { border-left: 3px solid #10b981; }
.chart-type-btn[data-type="line"] { border-left: 3px solid #8b5cf6; }
.chart-type-btn[data-type="area"] { border-left: 3px solid #f59e0b; }
.chart-type-btn[data-type="radar"] { border-left: 3px solid #ef4444; }
.chart-type-btn[data-type="polar"] { border-left: 3px solid #14b8a6; }

.chart-type-btn.active[data-type="bar"] { background: #3b82f6; }
.chart-type-btn.active[data-type="scatter"] { background: #10b981; }
.chart-type-btn.active[data-type="line"] { background: #8b5cf6; }
.chart-type-btn.active[data-type="area"] { background: #f59e0b; }
.chart-type-btn.active[data-type="radar"] { background: #ef4444; }
.chart-type-btn.active[data-type="polar"] { background: #14b8a6; }
</style>
`;

// Adicionar estilos ao documento apenas uma vez
if (!document.getElementById('dashboardStyles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'dashboardStyles';
    styleElement.innerHTML = dashboardStyles;
    document.head.appendChild(styleElement);
}

logSuccess('Dashboard.js carregado - Layout vertical forçado + 7 tipos de gráfico implementados');

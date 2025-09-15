// =================== DASHBOARD HOSPITALAR - VISÃO DETALHADA ===================

// Estado dos gráficos selecionados por hospital
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar' }
};

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar');
    
    const container = document.getElementById('dashboardContainer');
    if (!container) return;
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
            Dashboard Hospitalar
        </h2>
        
        <div class="hospitalar-grid">
            ${Object.keys(CONFIG.HOSPITAIS).map(hospitalId => {
                const hospital = CONFIG.HOSPITAIS[hospitalId];
                const kpis = calcularKPIsHospital(hospitalId);
                
                return `
                    <div class="hospital-section" data-hospital="${hospitalId}">
                        <h3 class="hospital-title">${hospital.nome}</h3>
                        
                        <!-- KPIs do Hospital -->
                        <div class="hospital-kpis">
                            <div class="hospital-gauge">
                                <canvas id="gauge${hospitalId}" width="120" height="60"></canvas>
                                <div class="gauge-label">${kpis.ocupacao}%</div>
                            </div>
                            <div class="kpi-mini">
                                <div class="kpi-value">${kpis.total}</div>
                                <div class="kpi-label">TOTAL</div>
                            </div>
                            <div class="kpi-mini">
                                <div class="kpi-value">${kpis.ocupados}</div>
                                <div class="kpi-label">OCUPADOS</div>
                            </div>
                            <div class="kpi-mini">
                                <div class="kpi-value">${kpis.vagos}</div>
                                <div class="kpi-label">VAGOS</div>
                            </div>
                            <div class="kpi-mini">
                                <div class="kpi-value">${kpis.emAlta}</div>
                                <div class="kpi-label">EM ALTA</div>
                            </div>
                        </div>
                        
                        <!-- Projeção de Altas -->
                        <div class="chart-container">
                            <h4>Projeção de Altas em ${hoje}</h4>
                            <canvas id="chartAltas${hospitalId}" height="200"></canvas>
                        </div>
                        
                        <!-- Projeção de Concessões -->
                        <div class="chart-container">
                            <h4>Projeção de Concessões em ${hoje}</h4>
                            <div class="chart-type-selector">
                                <button class="chart-type-btn ${graficosState[hospitalId].concessoes === 'scatter' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="concessoes" 
                                        data-type="scatter">
                                    Bolinhas
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].concessoes === 'bubble' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="concessoes" 
                                        data-type="bubble">
                                    Agrupadas
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].concessoes === 'bar' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="concessoes" 
                                        data-type="bar">
                                    Barras
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].concessoes === 'line' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="concessoes" 
                                        data-type="line">
                                    Linha
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].concessoes === 'bar3d' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="concessoes" 
                                        data-type="bar3d">
                                    3D
                                </button>
                            </div>
                            <canvas id="chartConcessoes${hospitalId}" height="200"></canvas>
                        </div>
                        
                        <!-- Projeção de Linhas de Cuidado -->
                        <div class="chart-container">
                            <h4>Projeção de Linha de Cuidados em ${hoje}</h4>
                            <div class="chart-type-selector">
                                <button class="chart-type-btn ${graficosState[hospitalId].linhas === 'scatter' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="linhas" 
                                        data-type="scatter">
                                    Bolinhas
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].linhas === 'bubble' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="linhas" 
                                        data-type="bubble">
                                    Agrupadas
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].linhas === 'bar' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="linhas" 
                                        data-type="bar">
                                    Barras
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].linhas === 'line' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="linhas" 
                                        data-type="line">
                                    Linha
                                </button>
                                <button class="chart-type-btn ${graficosState[hospitalId].linhas === 'bar3d' ? 'active' : ''}" 
                                        data-hospital="${hospitalId}" 
                                        data-chart="linhas" 
                                        data-type="bar3d">
                                    3D
                                </button>
                            </div>
                            <canvas id="chartLinhas${hospitalId}" height="200"></canvas>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Event listeners para seletores de gráficos
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const hospital = e.target.dataset.hospital;
            const chart = e.target.dataset.chart;
            const type = e.target.dataset.type;
            
            // Atualizar estado
            graficosState[hospital][chart] = type;
            
            // Atualizar botões visuais
            const selector = e.target.closest('.chart-type-selector');
            selector.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Re-renderizar gráfico
            if (chart === 'concessoes') {
                renderGraficoConcessoesHospital(hospital, type);
            } else if (chart === 'linhas') {
                renderGraficoLinhasHospital(hospital, type);
            }
        });
    });
    
    // Renderizar gráficos
    setTimeout(() => {
        Object.keys(CONFIG.HOSPITAIS).forEach(hospitalId => {
            const kpis = calcularKPIsHospital(hospitalId);
            renderGaugeHospital(hospitalId, kpis.ocupacao);
            renderGraficoAltasHospital(hospitalId);
            renderGraficoConcessoesHospital(hospitalId, graficosState[hospitalId].concessoes);
            renderGraficoLinhasHospital(hospitalId, graficosState[hospitalId].linhas);
        });
    }, 100);
};

// Calcular KPIs por hospital
function calcularKPIsHospital(hospitalId) {
    const hospitalData = window.hospitalData[hospitalId];
    if (!hospitalData) return { total: 0, ocupados: 0, vagos: 0, ocupacao: 0, emAlta: 0 };
    
    const leitos = hospitalData.leitos || [];
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const total = leitos.length;
    const emAlta = leitos.filter(l => 
        l.status === 'ocupado' && 
        l.paciente && 
        l.paciente.previsaoAlta && 
        l.paciente.previsaoAlta.includes('Hoje')
    ).length;
    
    return {
        total,
        ocupados,
        vagos: total - ocupados,
        ocupacao: total > 0 ? Math.round((ocupados / total) * 100) : 0,
        emAlta
    };
}

// Renderizar Gauge do Hospital
function renderGaugeHospital(hospitalId, percentual) {
    const ctx = document.getElementById(`gauge${hospitalId}`);
    if (!ctx) return;
    
    const chartKey = `gauge${hospitalId}`;
    destroyChart(chartKey);
    
    const hospital = CONFIG.HOSPITAIS[hospitalId];
    const cor = CHART_COLORS.hospitais[hospital.nome] || '#3b82f6';
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentual, 100 - percentual],
                backgroundColor: [cor, 'rgba(255, 255, 255, 0.1)'],
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

// Gráfico de Altas por Hospital
function renderGraficoAltasHospital(hospitalId) {
    const ctx = document.getElementById(`chartAltas${hospitalId}`);
    if (!ctx) return;
    
    const dados = calcularDadosAltasHospital(hospitalId);
    const chartKey = `altas${hospitalId}`;
    
    destroyChart(chartKey);
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.categorias,
            datasets: [{
                data: dados.valores,
                backgroundColor: dados.cores,
                borderWidth: 0
            }]
        },
        options: {
            ...defaultChartConfig,
            plugins: {
                ...defaultChartConfig.plugins,
                legend: { display: false }
            },
            scales: {
                ...defaultChartConfig.scales,
                x: {
                    ...defaultChartConfig.scales.x,
                    ticks: {
                        ...defaultChartConfig.scales.x.ticks,
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Concessões por Hospital
function renderGraficoConcessoesHospital(hospitalId, tipoGrafico) {
    const ctx = document.getElementById(`chartConcessoes${hospitalId}`);
    if (!ctx) return;
    
    const dados = calcularDadosConcessoesHospital(hospitalId);
    const chartKey = `concessoes${hospitalId}`;
    
    destroyChart(chartKey);
    
    let chartConfig = {
        data: {
            labels: dados.periodos,
            datasets: []
        },
        options: {
            ...defaultChartConfig,
            plugins: {
                ...defaultChartConfig.plugins,
                legend: {
                    ...defaultChartConfig.plugins.legend,
                    labels: {
                        ...defaultChartConfig.plugins.legend.labels,
                        font: {
                            size: 10
                        },
                        padding: 6
                    }
                }
            }
        }
    };
    
    // Configurar tipo de gráfico
    switch (tipoGrafico) {
        case 'scatter':
            chartConfig.type = 'scatter';
            chartConfig.data.datasets = createScatterDataset(dados, 'concessoes');
            chartConfig.options.scales.x = {
                ...defaultChartConfig.scales.x,
                type: 'linear',
                min: -0.5,
                max: 4.5,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        return dados.periodos[value] || '';
                    }
                }
            };
            break;
            
        case 'bubble':
            chartConfig.type = 'bubble';
            chartConfig.data.datasets = createBubbleDataset(dados, 'concessoes');
            chartConfig.options.scales.x = {
                ...defaultChartConfig.scales.x,
                type: 'linear',
                min: -0.5,
                max: 4.5,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        return dados.periodos[value] || '';
                    }
                }
            };
            break;
            
        case 'line':
            chartConfig.type = 'line';
            chartConfig.data.datasets = dados.concessoes.map(concessao => ({
                label: concessao.nome,
                data: concessao.dados,
                borderColor: CHART_COLORS.concessoes[concessao.nome] || '#6b7280',
                backgroundColor: (CHART_COLORS.concessoes[concessao.nome] || '#6b7280') + '20',
                tension: 0.3
            }));
            break;
            
        case 'bar3d':
            chartConfig.type = 'bar';
            chartConfig.data.datasets = dados.concessoes.map((concessao, index) => ({
                label: concessao.nome,
                data: concessao.dados,
                backgroundColor: CHART_COLORS.concessoes[concessao.nome] || '#6b7280',
                borderColor: 'rgba(0, 0, 0, 0.2)',
                borderWidth: 1,
                borderSkipped: false,
                barPercentage: 0.8
            }));
            chartConfig.options.plugins.tooltip = {
                ...defaultChartConfig.plugins.tooltip,
                callbacks: {
                    title: () => 'Visualização 3D',
                    label: (context) => `${context.dataset.label}: ${context.raw}`
                }
            };
            break;
            
        default: // 'bar'
            chartConfig.type = 'bar';
            chartConfig.data.datasets = dados.concessoes.map(concessao => ({
                label: concessao.nome,
                data: concessao.dados,
                backgroundColor: CHART_COLORS.concessoes[concessao.nome] || '#6b7280'
            }));
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
}

// Gráfico de Linhas de Cuidado por Hospital
function renderGraficoLinhasHospital(hospitalId, tipoGrafico) {
    const ctx = document.getElementById(`chartLinhas${hospitalId}`);
    if (!ctx) return;
    
    const dados = calcularDadosLinhasHospital(hospitalId);
    const chartKey = `linhas${hospitalId}`;
    
    destroyChart(chartKey);
    
    let chartConfig = {
        data: {
            labels: dados.periodos,
            datasets: []
        },
        options: {
            ...defaultChartConfig,
            plugins: {
                ...defaultChartConfig.plugins,
                legend: {
                    ...defaultChartConfig.plugins.legend,
                    labels: {
                        ...defaultChartConfig.plugins.legend.labels,
                        font: {
                            size: 10
                        },
                        padding: 6
                    }
                }
            }
        }
    };
    
    // Configurar tipo de gráfico
    switch (tipoGrafico) {
        case 'scatter':
            chartConfig.type = 'scatter';
            chartConfig.data.datasets = createScatterDataset(dados, 'linhas');
            chartConfig.options.scales.x = {
                ...defaultChartConfig.scales.x,
                type: 'linear',
                min: -0.5,
                max: 4.5,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        return dados.periodos[value] || '';
                    }
                }
            };
            break;
            
        case 'bubble':
            chartConfig.type = 'bubble';
            chartConfig.data.datasets = createBubbleDataset(dados, 'linhas');
            chartConfig.options.scales.x = {
                ...defaultChartConfig.scales.x,
                type: 'linear',
                min: -0.5,
                max: 4.5,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        return dados.periodos[value] || '';
                    }
                }
            };
            break;
            
        case 'line':
            chartConfig.type = 'line';
            chartConfig.data.datasets = dados.linhas.map(linha => ({
                label: linha.nome,
                data: linha.dados,
                borderColor: CHART_COLORS.linhasCuidado[linha.nome] || '#6b7280',
                backgroundColor: (CHART_COLORS.linhasCuidado[linha.nome] || '#6b7280') + '20',
                tension: 0.3
            }));
            break;
            
        case 'bar3d':
            chartConfig.type = 'bar';
            chartConfig.data.datasets = dados.linhas.map((linha, index) => ({
                label: linha.nome,
                data: linha.dados,
                backgroundColor: CHART_COLORS.linhasCuidado[linha.nome] || '#6b7280',
                borderColor: 'rgba(0, 0, 0, 0.2)',
                borderWidth: 1,
                borderSkipped: false,
                barPercentage: 0.8
            }));
            chartConfig.options.plugins.tooltip = {
                ...defaultChartConfig.plugins.tooltip,
                callbacks: {
                    title: () => 'Visualização 3D',
                    label: (context) => `${context.dataset.label}: ${context.raw}`
                }
            };
            break;
            
        default: // 'bar'
            chartConfig.type = 'bar';
            chartConfig.data.datasets = dados.linhas.map(linha => ({
                label: linha.nome,
                data: linha.dados,
                backgroundColor: CHART_COLORS.linhasCuidado[linha.nome] || '#6b7280'
            }));
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
}

// Funções de cálculo de dados por hospital
function calcularDadosAltasHospital(hospitalId) {
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h', 'SP'];
    const hospitalData = window.hospitalData[hospitalId];
    
    if (!hospitalData) {
        return { categorias, valores: categorias.map(() => 0), cores: [] };
    }
    
    const leitos = hospitalData.leitos || [];
    
    const valores = categorias.map(cat => {
        return leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente && 
            l.paciente.previsaoAlta === cat
        ).length;
    });
    
    const cores = categorias.map(cat => {
        if (cat.includes('Ouro')) return CHART_COLORS.timeline.Ouro;
        if (cat.includes('2R')) return CHART_COLORS.timeline['2R'];
        if (cat.includes('3R')) return CHART_COLORS.timeline['3R'];
        if (cat === 'SP') return CHART_COLORS.timeline.SP;
        if (cat === '48h') return CHART_COLORS.timeline['48h'];
        if (cat === '72h') return CHART_COLORS.timeline['72h'];
        if (cat === '96h') return CHART_COLORS.timeline['96h'];
        return '#10b981';
    });
    
    return { categorias, valores, cores };
}

function calcularDadosConcessoesHospital(hospitalId) {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const hospitalData = window.hospitalData[hospitalId];
    
    if (!hospitalData) {
        return { periodos, concessoes: [] };
    }
    
    const leitos = hospitalData.leitos || [];
    const concessoesMap = new Map();
    
    // Inicializar todas as concessões
    window.CONCESSOES_LIST.forEach(conc => {
        concessoesMap.set(conc, periodos.map(() => 0));
    });
    
    // REGRA CRÍTICA: Contar apenas no dia exato da alta
    leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente) {
            const paciente = leito.paciente;
            if (!paciente.previsaoAlta || !paciente.concessoes) return;
            
            let periodoIndex = -1;
            
            // Mapear previsão para índice do período
            if (paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
            else if (paciente.previsaoAlta === '48h') periodoIndex = 2;
            else if (paciente.previsaoAlta === '72h') periodoIndex = 3;
            else if (paciente.previsaoAlta === '96h') periodoIndex = 4;
            
            if (periodoIndex >= 0) {
                paciente.concessoes.forEach(concessao => {
                    if (concessoesMap.has(concessao)) {
                        concessoesMap.get(concessao)[periodoIndex]++;
                    }
                });
            }
        }
    });
    
    const concessoes = [];
    concessoesMap.forEach((dados, nome) => {
        if (dados.some(d => d > 0)) {
            concessoes.push({ nome, dados });
        }
    });
    
    return { periodos, concessoes };
}

function calcularDadosLinhasHospital(hospitalId) {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const hospitalData = window.hospitalData[hospitalId];
    
    if (!hospitalData) {
        return { periodos, linhas: [] };
    }
    
    const leitos = hospitalData.leitos || [];
    const linhasMap = new Map();
    
    // Inicializar todas as linhas
    window.LINHAS_CUIDADO_LIST.forEach(linha => {
        linhasMap.set(linha, periodos.map(() => 0));
    });
    
    // REGRA CRÍTICA: Contar apenas no dia exato da alta
    leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente) {
            const paciente = leito.paciente;
            if (!paciente.previsaoAlta || !paciente.linhasCuidado) return;
            
            let periodoIndex = -1;
            
            // Mapear previsão para índice do período
            if (paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
            else if (paciente.previsaoAlta === '48h') periodoIndex = 2;
            else if (paciente.previsaoAlta === '72h') periodoIndex = 3;
            else if (paciente.previsaoAlta === '96h') periodoIndex = 4;
            
            if (periodoIndex >= 0) {
                paciente.linhasCuidado.forEach(linha => {
                    if (linhasMap.has(linha)) {
                        linhasMap.get(linha)[periodoIndex]++;
                    }
                });
            }
        }
    });
    
    const linhas = [];
    linhasMap.forEach((dados, nome) => {
        if (dados.some(d => d > 0)) {
            linhas.push({ nome, dados });
        }
    });
    
    return { periodos, linhas };
}

logSuccess('Dashboard Hospitalar carregado');

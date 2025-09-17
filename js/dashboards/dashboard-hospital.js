// =================== DASHBOARD HOSPITALAR - VERSÃO COMPLETA CORRIGIDA ===================

// Estado dos gráficos selecionados por hospital (7 TIPOS)
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' }
};

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar COMPLETO');
    
    // *** CORREÇÃO: Container correto ***
    let container = document.getElementById('dashHospitalarContent');
    if (!container) {
        const dash1Section = document.getElementById('dash1');
        if (dash1Section) {
            container = document.createElement('div');
            container.id = 'dashHospitalarContent';
            dash1Section.appendChild(container);
        }
    }
    
    if (!container) {
        // Fallback: tentar dashboardContainer
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Hospitalar');
            return;
        }
    }
    
    // *** VERIFICAR SE HÁ DADOS ANTES DE RENDERIZAR ***
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    🔄 Carregando dados hospitalares...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Sincronizando com a API Google Apps Script
                </div>
            </div>
        `;
        
        // *** TENTAR CARREGAR DADOS APÓS 2 SEGUNDOS ***
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar(); // Recursivo
            }
        }, 2000);
        return;
    }
    
    const hospitaisAtivos = Object.keys(CONFIG.HOSPITAIS).filter(id => CONFIG.HOSPITAIS[id].ativo);
    const hospitaisComDados = hospitaisAtivos.filter(id => window.hospitalData[id]);
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="color: #0369a1; margin: 0 0 10px 0;">Dashboard Hospitalar</h3>
                <p><strong>Status:</strong> Aguardando dados dos hospitais ativos</p>
                <p><strong>Hospitais configurados:</strong> ${hospitaisAtivos.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')}</p>
                <p style="color: #28a745; margin-top: 15px;"><em>✅ Conectado à API - Dados carregando...</em></p>
                <button onclick="window.forceDataRefresh()" style="margin-top: 15px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🔄 Forçar Atualização
                </button>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // *** HTML COMPLETO COM TODOS OS GRÁFICOS CORRIGIDOS ***
    container.innerHTML = `
        <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
            Dashboard Hospitalar
        </h2>
        
        <!-- Status dos dados -->
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">
                📊 <strong>Dados por hospital</strong> • ${hospitaisComDados.length} hospitais ativos • Atualizado em ${hoje}
            </p>
        </div>
        
        <div class="hospitalar-grid">
            ${hospitaisComDados.map(hospitalId => {
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
                                <div class="gauge-text">OCUPAÇÃO</div>
                            </div>
                            <div class="kpis-mini-grid">
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
                                    <div class="kpi-value">${kpis.altas}</div>
                                    <div class="kpi-label">PREV ALTA</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- *** GRÁFICOS EMPILHADOS VERTICALMENTE COM 7 TIPOS *** -->
                        <div class="hospital-graficos">
                            <!-- 1. Análise Preditiva de Altas -->
                            <div class="chart-container">
                                <div class="chart-header">
                                    <h4>📈 Análise Preditiva de Altas - ${hoje}</h4>
                                    <div class="chart-controls">
                                        <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="altas" data-type="bar">📊</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="altas" data-type="line">📈</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="altas" data-type="area">🏔️</button>
                                    </div>
                                </div>
                                <canvas id="graficoAltas${hospitalId}" height="200"></canvas>
                            </div>
                            
                            <!-- 2. Concessões -->
                            <div class="chart-container">
                                <div class="chart-header">
                                    <h4>🏠 Concessões Previstas</h4>
                                    <div class="chart-controls">
                                        <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar">📊</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="doughnut">🍩</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="scatter">⚡</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="radar">🎯</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="polar">🌐</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="line">📈</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="area">🏔️</button>
                                    </div>
                                </div>
                                <canvas id="graficoConcessoes${hospitalId}" height="200"></canvas>
                            </div>
                            
                            <!-- 3. Linhas de Cuidado -->
                            <div class="chart-container">
                                <div class="chart-header">
                                    <h4>🩺 Linhas de Cuidado</h4>
                                    <div class="chart-controls">
                                        <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar">📊</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="doughnut">🍩</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="scatter">⚡</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="radar">🎯</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="polar">🌐</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="line">📈</button>
                                        <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="area">🏔️</button>
                                    </div>
                                </div>
                                <canvas id="graficoLinhas${hospitalId}" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // *** AGUARDAR CHART.JS ANTES DE RENDERIZAR ***
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        // *** ADICIONAR EVENT LISTENERS PARA OS 7 TIPOS DE GRÁFICO ***
        setTimeout(() => {
            document.querySelectorAll('.chart-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const hospital = this.dataset.hospital;
                    const chart = this.dataset.chart;
                    const type = this.dataset.type;
                    
                    // Atualizar botões visuais no mesmo grupo
                    const container = this.parentElement;
                    container.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Atualizar estado
                    if (chart === 'altas') {
                        window.graficosState[hospital].preditivos = type;
                        renderAltasHospital(hospital);
                    } else if (chart === 'concessoes') {
                        window.graficosState[hospital].concessoes = type;
                        renderConcessoesHospital(hospital);
                    } else if (chart === 'linhas') {
                        window.graficosState[hospital].linhas = type;
                        renderLinhasHospital(hospital);
                    }
                    
                    logInfo(`Gráfico alterado: ${hospital} - ${chart} - ${type}`);
                });
            });
            
            // Renderizar todos os gráficos iniciais
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId);
                renderLinhasHospital(hospitalId);
            });
            
            logSuccess('Dashboard Hospitalar renderizado com 7 tipos de gráfico');
        }, 100);
    };
    
    aguardarChartJS();
};

// =================== CALCULAR KPIs DE UM HOSPITAL ===================
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    const total = hospital.leitos.length;
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    
    // *** CORREÇÃO: Usar 'prevAlta' em vez de 'previsaoAlta' ***
    const altas = hospital.leitos.filter(l => 
        l.status === 'ocupado' && 
        l.paciente && 
        l.paciente.prevAlta && 
        ['Hoje Ouro', '24h 2R', '48h 3R'].includes(l.paciente.prevAlta)
    ).length;
    
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return { ocupacao, total, ocupados, vagos, altas };
}

// =================== GAUGE DO HOSPITAL (MEIA-LUA) ===================
function renderGaugeHospital(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const kpis = calcularKPIsHospital(hospitalId);
    const ocupacao = kpis.ocupacao;
    
    const chartKey = `gauge${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    try {
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
                circumference: Math.PI, // *** MEIA-LUA HORIZONTAL ***
                rotation: Math.PI,      // *** COMEÇAR NA HORIZONTAL ***
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function() {
                                return `Ocupação: ${ocupacao}%`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Erro ao renderizar gauge:', hospitalId, error);
    }
}

// =================== GRÁFICO DE ALTAS PREDITIVO ===================
function renderAltasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoAltas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const dados = calcularDadosAltasHospital(hospitalId);
    const tipo = window.graficosState[hospitalId].preditivos || 'bar';
    
    const chartKey = `altas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    try {
        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: tipo === 'area' ? 'line' : tipo,
            data: {
                labels: ['Hoje', '24h', '48h', '72h', '96h'], // *** EIXO X HORIZONTAL ***
                datasets: [
                    {
                        label: 'OURO',
                        data: dados.ouro,
                        backgroundColor: tipo === 'area' ? '#fbbf2440' : '#fbbf24',
                        borderColor: '#f59e0b',
                        stack: tipo === 'bar' ? 'timeline' : undefined,
                        fill: tipo === 'area'
                    },
                    {
                        label: '2R',
                        data: dados.r2,
                        backgroundColor: tipo === 'area' ? '#3b82f640' : '#3b82f6',
                        borderColor: '#2563eb',
                        stack: tipo === 'bar' ? 'timeline' : undefined,
                        fill: tipo === 'area'
                    },
                    {
                        label: '3R',
                        data: dados.r3,
                        backgroundColor: tipo === 'area' ? '#8b5cf640' : '#8b5cf6',
                        borderColor: '#7c3aed',
                        stack: tipo === 'bar' ? 'timeline' : undefined,
                        fill: tipo === 'area'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // *** BARRAS HORIZONTAIS ***
                plugins: {
                    legend: {
                        display: true,
                        position: 'left', // *** LEGENDAS À ESQUERDA ***
                        labels: {
                            color: '#ffffff', // *** TEXTO BRANCO ***
                            font: { size: 10, weight: 600 },
                            usePointStyle: true,
                            boxWidth: 12,
                            boxHeight: 12
                        }
                    }
                },
                scales: {
                    x: { // *** EIXOS SEMPRE INTEIROS ***
                        stacked: tipo === 'bar',
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#ffffff',
                            font: { size: 10 },
                            callback: function(value) {
                                return Number.isInteger(value) ? value : '';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        stacked: tipo === 'bar',
                        ticks: {
                            color: '#ffffff',
                            font: { size: 10 },
                            maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                            minRotation: 0
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Erro ao renderizar gráfico de altas:', hospitalId, error);
    }
}

// =================== GRÁFICO DE CONCESSÕES (7 TIPOS) ===================
function renderConcessoesHospital(hospitalId) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const dados = calcularDadosConcessoesHospital(hospitalId);
    const tipo = window.graficosState[hospitalId].concessoes;
    
    if (!dados.labels.length) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('Sem concessões registradas', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    try {
        const ctx = canvas.getContext('2d');
        
        // *** CONFIGURAR GRÁFICO BASEADO NO TIPO ***
        let chartConfig = {
            type: tipo === 'area' ? 'line' : tipo,
            data: {
                labels: dados.labels,
                datasets: [{
                    label: 'Pacientes',
                    data: dados.data,
                    backgroundColor: dados.labels.map(label => getCorConcessao(label)),
                    borderColor: dados.labels.map(label => getCorConcessao(label)),
                    borderWidth: ['line', 'area'].includes(tipo) ? 3 : 1,
                    fill: tipo === 'area'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: ['bar', 'line', 'area'].includes(tipo) ? 'y' : 'x', // *** HORIZONTAL PARA BAR/LINE ***
                plugins: {
                    legend: {
                        display: ['doughnut', 'polar', 'radar'].includes(tipo),
                        position: 'left', // *** LEGENDAS À ESQUERDA ***
                        labels: {
                            color: '#ffffff', // *** TEXTO BRANCO ***
                            font: { size: 9 },
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    }
                }
            }
        };
        
        // *** CONFIGURAÇÕES ESPECÍFICAS POR TIPO ***
        if (['bar', 'line', 'area'].includes(tipo)) {
            chartConfig.options.scales = {
                x: { // *** EIXOS SEMPRE INTEIROS ***
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: 9 },
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        font: { size: 9 },
                        maxRotation: 0,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.substring(0, 12) + '...' : label;
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            };
        }
        
        // *** SCATTER: DADOS ESPECIAIS ***
        if (tipo === 'scatter') {
            chartConfig.data.datasets[0].data = dados.data.map((value, index) => ({
                x: index + 1,
                y: value
            }));
            chartConfig.options.scales = {
                x: { beginAtZero: true, ticks: { stepSize: 1, color: '#ffffff' } },
                y: { beginAtZero: true, ticks: { stepSize: 1, color: '#ffffff' } }
            };
        }
        
        window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
    } catch (error) {
        console.warn('Erro ao renderizar gráfico de concessões:', hospitalId, error);
    }
}

// =================== GRÁFICO DE LINHAS DE CUIDADO (7 TIPOS) ===================
function renderLinhasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const dados = calcularDadosLinhasHospital(hospitalId);
    const tipo = window.graficosState[hospitalId].linhas;
    
    if (!dados.labels.length) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('Sem linhas de cuidado registradas', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    try {
        const ctx = canvas.getContext('2d');
        
        // *** CONFIGURAR GRÁFICO BASEADO NO TIPO ***
        let chartConfig = {
            type: tipo === 'area' ? 'line' : tipo,
            data: {
                labels: dados.labels,
                datasets: [{
                    label: 'Pacientes',
                    data: dados.data,
                    backgroundColor: dados.labels.map(label => getCorLinhaCuidado(label)),
                    borderColor: dados.labels.map(label => getCorLinhaCuidado(label)),
                    borderWidth: ['line', 'area'].includes(tipo) ? 3 : 1,
                    fill: tipo === 'area'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: ['bar', 'line', 'area'].includes(tipo) ? 'y' : 'x', // *** HORIZONTAL PARA BAR/LINE ***
                plugins: {
                    legend: {
                        display: ['doughnut', 'polar', 'radar'].includes(tipo),
                        position: 'left', // *** LEGENDAS À ESQUERDA ***
                        labels: {
                            color: '#ffffff', // *** TEXTO BRANCO ***
                            font: { size: 9 },
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    }
                }
            }
        };
        
        // *** CONFIGURAÇÕES ESPECÍFICAS POR TIPO ***
        if (['bar', 'line', 'area'].includes(tipo)) {
            chartConfig.options.scales = {
                x: { // *** EIXOS SEMPRE INTEIROS ***
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: 9 },
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        font: { size: 9 },
                        maxRotation: 0,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.substring(0, 12) + '...' : label;
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            };
        }
        
        // *** SCATTER: DADOS ESPECIAIS ***
        if (tipo === 'scatter') {
            chartConfig.data.datasets[0].data = dados.data.map((value, index) => ({
                x: index + 1,
                y: value
            }));
            chartConfig.options.scales = {
                x: { beginAtZero: true, ticks: { stepSize: 1, color: '#ffffff' } },
                y: { beginAtZero: true, ticks: { stepSize: 1, color: '#ffffff' } }
            };
        }
        
        window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
    } catch (error) {
        console.warn('Erro ao renderizar gráfico de linhas:', hospitalId, error);
    }
}

// =================== CÁLCULO DE DADOS POR HOSPITAL ===================
function calcularDadosAltasHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ouro: [0, 0, 0, 0, 0], r2: [0, 0, 0, 0, 0], r3: [0, 0, 0, 0, 0] };
    }
    
    // Contar por tipo de alta e período
    const contadores = {
        'Hoje Ouro': [1, 0, 0, 0, 0],
        '24h 2R': [0, 1, 0, 0, 0],
        '48h 3R': [0, 0, 1, 0, 0],
        '72h': [0, 0, 0, 1, 0],
        '96h': [0, 0, 0, 0, 1]
    };
    
    const dados = { ouro: [0, 0, 0, 0, 0], r2: [0, 0, 0, 0, 0], r3: [0, 0, 0, 0, 0] };
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.prevAlta) {
            const prevAlta = leito.paciente.prevAlta;
            
            if (prevAlta.includes('Ouro')) {
                for (let i = 0; i < 5; i++) dados.ouro[i] += (contadores[prevAlta] || [0, 0, 0, 0, 0])[i];
            } else if (prevAlta.includes('2R')) {
                for (let i = 0; i < 5; i++) dados.r2[i] += (contadores[prevAlta] || [0, 0, 0, 0, 0])[i];
            } else if (prevAlta.includes('3R')) {
                for (let i = 0; i < 5; i++) dados.r3[i] += (contadores[prevAlta] || [0, 0, 0, 0, 0])[i];
            }
        }
    });
    
    return dados;
}

function calcularDadosConcessoesHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return { labels: [], data: [] };
    
    const concessoesCount = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
            // *** CORREÇÃO: Processar concessões como string ou array ***
            let concessoesList = [];
            if (typeof leito.paciente.concessoes === 'string') {
                concessoesList = leito.paciente.concessoes.split('|');
            } else if (Array.isArray(leito.paciente.concessoes)) {
                concessoesList = leito.paciente.concessoes;
            }
            
            concessoesList.forEach(concessao => {
                if (concessao && concessao.trim()) {
                    const key = concessao.trim();
                    concessoesCount[key] = (concessoesCount[key] || 0) + 1;
                }
            });
        }
    });
    
    // Pegar top 8 concessões mais comuns
    const sortedConcessoes = Object.entries(concessoesCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
    
    return {
        labels: sortedConcessoes.map(([nome]) => nome),
        data: sortedConcessoes.map(([, count]) => count)
    };
}

function calcularDadosLinhasHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return { labels: [], data: [] };
    
    const linhasCount = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas) {
            // *** CORREÇÃO: Processar linhas como string ou array ***
            let linhasList = [];
            if (typeof leito.paciente.linhas === 'string') {
                linhasList = leito.paciente.linhas.split('|');
            } else if (Array.isArray(leito.paciente.linhas)) {
                linhasList = leito.paciente.linhas;
            }
            
            linhasList.forEach(linha => {
                if (linha && linha.trim()) {
                    const key = linha.trim();
                    linhasCount[key] = (linhasCount[key] || 0) + 1;
                }
            });
        }
    });
    
    // Pegar top 8 linhas mais comuns
    const sortedLinhas = Object.entries(linhasCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
    
    return {
        labels: sortedLinhas.map(([nome]) => nome),
        data: sortedLinhas.map(([, count]) => count)
    };
}

// =================== FUNÇÃO PARA FORÇAR ATUALIZAÇÃO ===================
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares...');
    
    const container = document.getElementById('dashHospitalarContent') || document.getElementById('dashboardContainer');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    🔄 Recarregando dados...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Sincronizando com a API
                </div>
            </div>
        `;
    }
    
    // Tentar recarregar dados
    if (window.loadHospitalData) {
        window.loadHospitalData().then(() => {
            setTimeout(() => {
                window.renderDashboardHospitalar();
            }, 1000);
        });
    } else {
        // Fallback: recarregar após 2 segundos
        setTimeout(() => {
            window.renderDashboardHospitalar();
        }, 2000);
    }
};

// =================== CORES PANTONE PARA GRÁFICOS ===================
function getCorConcessao(nome) {
    const cores = {
        'Transição Domiciliar': '#007A53',
        'Aplicação domiciliar de medicamentos': '#582C83',
        'Fisioterapia': '#009639',
        'Fonoaudiologia': '#FF671F',
        'Aspiração': '#2E1A47',
        'Banho': '#8FD3F4',
        'Curativos': '#00BFB3',
        'Oxigenoterapia': '#64A70B',
        'Recarga de O₂': '#00AEEF',
        'Orientação Nutricional – com dispositivo': '#FFC72C',
        'Orientação Nutricional – sem dispositivo': '#F4E285',
        'Clister': '#E8927C',
        'PICC': '#E03C31'
    };
    return cores[nome] || '#6b7280';
}

function getCorLinhaCuidado(nome) {
    const cores = {
        'Assiste': '#ED0A72',
        'APS': '#007A33',
        'Cuidados Paliativos': '#00B5A2',
        'ICO (Insuficiência Coronariana)': '#A6192E',
        'Oncologia': '#6A1B9A',
        'Pediatria': '#5A646B',
        'Programa Autoimune – Gastroenterologia': '#5C5EBE',
        'Programa Autoimune – Neuro-desmielinizante': '#00AEEF',
        'Programa Autoimune – Neuro-muscular': '#00263A',
        'Programa Autoimune – Reumatologia': '#582D40',
        'Vida Mais Leve Care': '#FFB81C',
        'Crônicos – Cardiologia': '#C8102E',
        'Crônicos – Endocrinologia': '#582C83',
        'Crônicos – Geriatria': '#FF6F1D',
        'Crônicos – Melhor Cuidado': '#556F44',
        'Crônicos – Neurologia': '#0072CE',
        'Crônicos – Pneumologia': '#E35205',
        'Crônicos – Pós-bariátrica': '#003C57',
        'Crônicos – Reumatologia': '#5A0020'
    };
    return cores[nome] || '#6b7280';
}

// =================== CSS COMPLETO PARA DASHBOARD HOSPITALAR ===================
const hospitalCSS = `
<style>
/* =================== LAYOUT PRINCIPAL =================== */
.hospitalar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.hospital-section {
    background: #1a1f2e;
    border-radius: 12px;
    padding: 20px;
    color: white;
    border: 2px solid #374151;
}

.hospital-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    color: #60a5fa;
    text-align: center;
    border-bottom: 2px solid #374151;
    padding-bottom: 10px;
}

/* =================== KPIs =================== */
.hospital-kpis {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-bottom: 25px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.hospital-gauge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

.gauge-label {
    position: absolute;
    font-size: 18px;
    font-weight: 700;
    color: #60a5fa;
    z-index: 10;
    bottom: 20px;
}

.gauge-text {
    margin-top: 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: #e2e8f0;
}

.kpis-mini-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.kpi-mini {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.kpi-value {
    font-size: 20px;
    font-weight: 700;
    color: #60a5fa;
    margin-bottom: 4px;
}

.kpi-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    color: #e2e8f0;
}

/* =================== GRÁFICOS EMPILHADOS VERTICALMENTE =================== */
.hospital-graficos {
    display: grid !important;
    grid-template-columns: 1fr !important;
    grid-template-rows: auto auto auto !important;
    gap: 20px !important;
}

.chart-container {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
}

.chart-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #60a5fa;
}

/* =================== CONTROLES DOS GRÁFICOS (7 TIPOS) =================== */
.chart-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.chart-btn {
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #e2e8f0;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
    min-width: 35px;
    text-align: center;
}

.chart-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #60a5fa;
    transform: translateY(-1px);
}

.chart-btn.active {
    background: #60a5fa;
    border-color: #60a5fa;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
}

/* =================== RESPONSIVIDADE MOBILE =================== */
@media (max-width: 768px) {
    .hospitalar-grid {
        grid-template-columns: 1fr;
    }
    
    .hospital-kpis {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 15px;
    }
    
    .kpis-mini-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
    }
    
    .kpi-mini {
        padding: 8px 4px;
    }
    
    .kpi-value {
        font-size: 16px;
    }
    
    .kpi-label {
        font-size: 8px;
    }
    
    .chart-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .chart-controls {
        width: 100%;
        justify-content: center;
    }
    
    .chart-btn {
        padding: 4px 8px;
        font-size: 11px;
        min-width: 30px;
    }
    
    .hospital-title {
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    .chart-controls {
        gap: 2px;
    }
    
    .chart-btn {
        padding: 3px 6px;
        font-size: 10px;
        min-width: 25px;
    }
    
    .kpis-mini-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
`;

// Adicionar CSS ao documento
if (!document.getElementById('hospitalStyles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'hospitalStyles';
    styleEl.innerHTML = hospitalCSS;
    document.head.appendChild(styleEl);
}

logSuccess('✅ Dashboard Hospitalar COMPLETO CORRIGIDO: 3 gráficos + 7 tipos interativos + KPIs + Gauge + Carregamento');

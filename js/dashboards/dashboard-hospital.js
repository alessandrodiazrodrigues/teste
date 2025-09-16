// =================== DASHBOARD HOSPITALAR - VERSÃO COMPLETA ===================

// Estado dos gráficos selecionados por hospital (7 TIPOS)
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' }
};

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar COMPLETO');
    
    const container = document.getElementById('dashboardContainer');
    if (!container) return;
    
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
                <h3 style="color: #0369a1; margin: 0 0 10px 0;">🏥 Dashboard Hospitalar</h3>
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
    
    // *** HTML COMPLETO COM TODOS OS GRÁFICOS ***
    container.innerHTML = `
        <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
            Dashboard Hospitalar
        </h2>
        
        <!-- Status dos dados -->
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">
                🏥 <strong>Dados por hospital</strong> • ${hospitaisComDados.length} hospitais ativos • Atualizado em ${hoje}
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
                                        <button onclick="changeChartType('${hospitalId}', 'altas', 'bar')" 
                                                class="chart-btn ${window.graficosState[hospitalId].preditivos === 'bar' ? 'active' : ''}">📊</button>
                                        <button onclick="changeChartType('${hospitalId}', 'altas', 'line')" 
                                                class="chart-btn ${window.graficosState[hospitalId].preditivos === 'line' ? 'active' : ''}">📈</button>
                                        <button onclick="changeChartType('${hospitalId}', 'altas', 'area')" 
                                                class="chart-btn ${window.graficosState[hospitalId].preditivos === 'area' ? 'active' : ''}">🏔️</button>
                                    </div>
                                </div>
                                <canvas id="chartAltas${hospitalId}" height="200"></canvas>
                            </div>
                            
                            <!-- 2. Concessões -->
                            <div class="chart-container">
                                <div class="chart-header">
                                    <h4>🏠 Concessões Previstas</h4>
                                    <div class="chart-controls">
                                        <button onclick="changeChartType('${hospitalId}', 'concessoes', 'bar')" 
                                                class="chart-btn ${window.graficosState[hospitalId].concessoes === 'bar' ? 'active' : ''}">📊</button>
                                        <button onclick="changeChartType('${hospitalId}', 'concessoes', 'pie')" 
                                                class="chart-btn ${window.graficosState[hospitalId].concessoes === 'pie' ? 'active' : ''}">🥧</button>
                                        <button onclick="changeChartType('${hospitalId}', 'concessoes', 'doughnut')" 
                                                class="chart-btn ${window.graficosState[hospitalId].concessoes === 'doughnut' ? 'active' : ''}">🍩</button>
                                        <button onclick="changeChartType('${hospitalId}', 'concessoes', 'scatter')" 
                                                class="chart-btn ${window.graficosState[hospitalId].concessoes === 'scatter' ? 'active' : ''}">⚡</button>
                                        <button onclick="changeChartType('${hospitalId}', 'concessoes', 'radar')" 
                                                class="chart-btn ${window.graficosState[hospitalId].concessoes === 'radar' ? 'active' : ''}">🎯</button>
                                        <button onclick="changeChartType('${hospitalId}', 'concessoes', 'polar')" 
                                                class="chart-btn ${window.graficosState[hospitalId].concessoes === 'polar' ? 'active' : ''}">🌐</button>
                                        <button onclick="changeChartType('${hospitalId}', 'concessoes', 'line')" 
                                                class="chart-btn ${window.graficosState[hospitalId].concessoes === 'line' ? 'active' : ''}">📈</button>
                                    </div>
                                </div>
                                <canvas id="chartConcessoes${hospitalId}" height="200"></canvas>
                            </div>
                            
                            <!-- 3. Linhas de Cuidado -->
                            <div class="chart-container">
                                <div class="chart-header">
                                    <h4>🩺 Linhas de Cuidado</h4>
                                    <div class="chart-controls">
                                        <button onclick="changeChartType('${hospitalId}', 'linhas', 'bar')" 
                                                class="chart-btn ${window.graficosState[hospitalId].linhas === 'bar' ? 'active' : ''}">📊</button>
                                        <button onclick="changeChartType('${hospitalId}', 'linhas', 'pie')" 
                                                class="chart-btn ${window.graficosState[hospitalId].linhas === 'pie' ? 'active' : ''}">🥧</button>
                                        <button onclick="changeChartType('${hospitalId}', 'linhas', 'doughnut')" 
                                                class="chart-btn ${window.graficosState[hospitalId].linhas === 'doughnut' ? 'active' : ''}">🍩</button>
                                        <button onclick="changeChartType('${hospitalId}', 'linhas', 'scatter')" 
                                                class="chart-btn ${window.graficosState[hospitalId].linhas === 'scatter' ? 'active' : ''}">⚡</button>
                                        <button onclick="changeChartType('${hospitalId}', 'linhas', 'radar')" 
                                                class="chart-btn ${window.graficosState[hospitalId].linhas === 'radar' ? 'active' : ''}">🎯</button>
                                        <button onclick="changeChartType('${hospitalId}', 'linhas', 'polar')" 
                                                class="chart-btn ${window.graficosState[hospitalId].linhas === 'polar' ? 'active' : ''}">🌐</button>
                                        <button onclick="changeChartType('${hospitalId}', 'linhas', 'line')" 
                                                class="chart-btn ${window.graficosState[hospitalId].linhas === 'line' ? 'active' : ''}">📈</button>
                                    </div>
                                </div>
                                <canvas id="chartLinhas${hospitalId}" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // *** RENDERIZAR GRÁFICOS APÓS DOM ESTAR PRONTO ***
    setTimeout(() => {
        hospitaisComDados.forEach(hospitalId => {
            renderGaugeHospital(hospitalId);
            renderAltasHospital(hospitalId);
            renderConcessoesHospital(hospitalId);
            renderLinhasHospital(hospitalId);
        });
    }, 100);
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
    
    // Contar leitos com previsão de alta hoje/24h
    const altas = hospital.leitos.filter(l => 
        l.status === 'ocupado' && 
        l.paciente && 
        l.paciente.previsaoAlta && 
        (l.paciente.previsaoAlta.includes('Hoje') || l.paciente.previsaoAlta.includes('24h'))
    ).length;
    
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return { ocupacao, total, ocupados, vagos, altas };
}

// =================== GAUGE DO HOSPITAL (MEIA-LUA) ===================
function renderGaugeHospital(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas) return;
    
    const kpis = calcularKPIsHospital(hospitalId);
    const ocupacao = kpis.ocupacao;
    
    const chartKey = `gauge${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
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
            circumference: Math.PI, // *** MEIA-LUA ***
            rotation: Math.PI, // *** COMEÇAR NA HORIZONTAL ***
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// =================== GRÁFICO DE ALTAS PREDITIVO ===================
function renderAltasHospital(hospitalId) {
    const canvas = document.getElementById(`chartAltas${hospitalId}`);
    if (!canvas) return;
    
    const dados = calcularDadosAltasHospital(hospitalId);
    const tipo = window.graficosState[hospitalId].preditivos || 'bar';
    
    const chartKey = `altas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: tipo,
        data: {
            labels: ['Hoje', '24h', '48h', '72h', '96h'], // *** EIXO X HORIZONTAL ***
            datasets: [
                {
                    label: 'OURO',
                    data: dados.ouro,
                    backgroundColor: '#fbbf24',
                    borderColor: '#f59e0b',
                    stack: 'timeline'
                },
                {
                    label: '2R',
                    data: dados.r2,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    stack: 'timeline'
                },
                {
                    label: '3R',
                    data: dados.r3,
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed',
                    stack: 'timeline'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'start', // *** LEGENDAS À ESQUERDA ***
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
                x: {
                    stacked: tipo === 'bar',
                    ticks: {
                        color: '#ffffff',
                        font: { size: 10 },
                        maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                        minRotation: 0
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    stacked: tipo === 'bar',
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1, // *** NÚMEROS INTEIROS ***
                        color: '#ffffff',
                        font: { size: 10 }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
}

// =================== GRÁFICO DE CONCESSÕES (7 TIPOS) ===================
function renderConcessoesHospital(hospitalId) {
    const canvas = document.getElementById(`chartConcessoes${hospitalId}`);
    if (!canvas) return;
    
    const dados = calcularDadosConcessoesHospital(hospitalId);
    const tipo = window.graficosState[hospitalId].concessoes;
    
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    
    // *** CONFIGURAR GRÁFICO BASEADO NO TIPO ***
    let chartConfig = {
        type: tipo,
        data: {
            labels: dados.labels,
            datasets: [{
                label: 'Pacientes',
                data: dados.data,
                backgroundColor: dados.labels.map(label => getCorConcessao(label)),
                borderColor: dados.labels.map(label => getCorConcessao(label)),
                borderWidth: tipo === 'line' ? 3 : 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: ['pie', 'doughnut', 'polar', 'radar'].includes(tipo),
                    position: 'bottom',
                    align: 'start', // *** LEGENDAS À ESQUERDA ***
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
    if (['bar', 'line'].includes(tipo)) {
        chartConfig.options.scales = {
            x: {
                ticks: {
                    color: '#ffffff',
                    font: { size: 9 },
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // *** NÚMEROS INTEIROS ***
                    color: '#ffffff',
                    font: { size: 9 }
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
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
}

// =================== GRÁFICO DE LINHAS DE CUIDADO (7 TIPOS) ===================
function renderLinhasHospital(hospitalId) {
    const canvas = document.getElementById(`chartLinhas${hospitalId}`);
    if (!canvas) return;
    
    const dados = calcularDadosLinhasHospital(hospitalId);
    const tipo = window.graficosState[hospitalId].linhas;
    
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    
    // *** CONFIGURAR GRÁFICO BASEADO NO TIPO ***
    let chartConfig = {
        type: tipo,
        data: {
            labels: dados.labels,
            datasets: [{
                label: 'Pacientes',
                data: dados.data,
                backgroundColor: dados.labels.map(label => getCorLinhaCuidado(label)),
                borderColor: dados.labels.map(label => getCorLinhaCuidado(label)),
                borderWidth: tipo === 'line' ? 3 : 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: ['pie', 'doughnut', 'polar', 'radar'].includes(tipo),
                    position: 'bottom',
                    align: 'start', // *** LEGENDAS À ESQUERDA ***
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
    if (['bar', 'line'].includes(tipo)) {
        chartConfig.options.scales = {
            x: {
                ticks: {
                    color: '#ffffff',
                    font: { size: 9 },
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // *** NÚMEROS INTEIROS ***
                    color: '#ffffff',
                    font: { size: 9 }
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
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
}

// =================== FUNÇÃO PARA MUDAR TIPO DE GRÁFICO ===================
window.changeChartType = function(hospitalId, categoria, novoTipo) {
    window.graficosState[hospitalId][categoria] = novoTipo;
    
    // Re-renderizar o gráfico específico
    if (categoria === 'altas') {
        window.graficosState[hospitalId].preditivos = novoTipo;
        renderAltasHospital(hospitalId);
    } else if (categoria === 'concessoes') {
        renderConcessoesHospital(hospitalId);
    } else if (categoria === 'linhas') {
        renderLinhasHospital(hospitalId);
    }
    
    // Atualizar botões ativos
    const container = document.querySelector(`[data-hospital="${hospitalId}"]`);
    if (container) {
        const chartContainers = container.querySelectorAll('.chart-container');
        let targetContainer;
        
        if (categoria === 'altas') targetContainer = chartContainers[0];
        else if (categoria === 'concessoes') targetContainer = chartContainers[1];
        else if (categoria === 'linhas') targetContainer = chartContainers[2];
        
        if (targetContainer) {
            targetContainer.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
            targetContainer.querySelectorAll('.chart-btn').forEach(btn => {
                if (btn.textContent.includes(getButtonIcon(novoTipo))) {
                    btn.classList.add('active');
                }
            });
        }
    }
    
    logInfo(`Gráfico ${categoria} do hospital ${hospitalId} alterado para ${novoTipo}`);
};

// =================== CÁLCULO DE DADOS POR HOSPITAL ===================
function calcularDadosAltasHospital(hospitalId) {
    // Dados mock para análise preditiva - baseado nos KPIs do hospital
    const kpis = calcularKPIsHospital(hospitalId);
    
    return {
        ouro: [Math.min(kpis.altas, 2), Math.max(0, kpis.altas - 1), 0, 0, 0],
        r2: [Math.floor(kpis.altas / 2), kpis.altas > 2 ? 1 : 0, Math.max(0, kpis.altas - 2), 0, 0],
        r3: [0, kpis.altas > 1 ? 1 : 0, Math.max(0, kpis.altas - 1), Math.max(0, kpis.altas - 3), 0]
    };
}

function calcularDadosConcessoesHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return { labels: [], data: [] };
    
    const concessoesCount = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
            leito.paciente.concessoes.forEach(concessao => {
                concessoesCount[concessao] = (concessoesCount[concessao] || 0) + 1;
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
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhasCuidado) {
            leito.paciente.linhasCuidado.forEach(linha => {
                linhasCount[linha] = (linhasCount[linha] || 0) + 1;
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
    
    const container = document.getElementById('dashboardContainer');
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

// =================== FUNÇÕES AUXILIARES ===================
function getButtonIcon(tipo) {
    const icons = {
        'bar': '📊',
        'pie': '🥧',
        'doughnut': '🍩',
        'line': '📈',
        'scatter': '⚡',
        'radar': '🎯',
        'polar': '🌐',
        'area': '🏔️'
    };
    return icons[tipo] || '📊';
}

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

/* =================== GRÁFICOS EMPILHADOS =================== */
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

logSuccess('✅ Dashboard Hospitalar COMPLETO: 3 gráficos + 7 tipos interativos + KPIs + Gauge + Carregamento');

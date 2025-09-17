// =================== DASHBOARD EXECUTIVO - REDE HOSPITALAR EXTERNA ===================

window.renderDashboardExecutivo = function() {
    logInfo('🏢 Renderizando Dashboard Executivo: REDE HOSPITALAR EXTERNA');
    
    // *** CORREÇÃO: Container correto ***
    let container = document.getElementById('dashExecutivoContent');
    if (!container) {
        const dash2Section = document.getElementById('dash2');
        if (dash2Section) {
            container = document.createElement('div');
            container.id = 'dashExecutivoContent';
            dash2Section.appendChild(container);
            logInfo('Container dashExecutivoContent criado automaticamente');
        }
    }
    
    if (!container) {
        // Fallback: tentar dashboardContainer
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Executivo');
            return;
        }
    }
    
    // *** VERIFICAR SE HÁ DADOS ANTES DE RENDERIZAR ***
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #22c55e; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #22c55e; margin-bottom: 10px; font-size: 20px;">Carregando dados executivos</h2>
                <p style="color: #9ca3af; font-size: 14px;">Consolidando informações da rede hospitalar</p>
                <div style="margin-top: 20px;">
                    <button onclick="window.forceExecutiveRefresh()" style="background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                        🔄 Recarregar Dados
                    </button>
                </div>
            </div>
        `;
        
        // *** TENTAR CARREGAR DADOS APÓS 3 SEGUNDOS ***
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardExecutivo(); // Recursivo
            }
        }, 3000);
        return;
    }
    
    // Verificar quais hospitais têm dados reais
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🏥</div>
                <h2 style="color: #ef4444; margin-bottom: 15px; font-size: 22px;">Nenhum Hospital com Dados</h2>
                <p style="color: #9ca3af; margin-bottom: 20px;">Não foi possível consolidar dados de nenhum hospital configurado.</p>
                <p style="color: #6b7280; font-size: 14px;">Hospitais configurados: ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
                <button onclick="window.forceExecutiveRefresh()" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 15px;">
                    🔄 Recarregar Dados
                </button>
            </div>
        `;
        return;
    }
    
    // Calcular KPIs consolidados
    const kpis = calcularKPIsExecutivos(hospitaisComDados);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // *** CORREÇÃO TÍTULO: "Rede Hospitalar Externa" ***
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            ${getExecutiveCSS()}
            
            <!-- HEADER COM TÍTULO CORRETO -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #22c55e;">
                <h2 style="margin: 0; color: #22c55e; font-size: 24px; font-weight: 700;">🏢 Rede Hospitalar Externa</h2>
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 14px;">
                    <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
                    ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'ais' : ''} conectado${hospitaisComDados.length > 1 ? 's' : ''}
                </div>
            </div>
            
            <!-- KPIS GRID COM FUNDO ESCURO CORRIGIDO -->
            <div class="executive-kpis-grid">
                <!-- KPI Principal: Gauge Horizontal -->
                <div class="kpi-box-principal">
                    <h3>📊 Ocupação Geral</h3>
                    <div class="gauge-container">
                        <canvas id="gaugeOcupacaoExecutivo"></canvas>
                        <div class="gauge-text">
                            <span class="gauge-value">${kpis.ocupacaoGeral}%</span>
                            <span class="gauge-label">Ocupação</span>
                        </div>
                    </div>
                </div>
                
                <!-- KPIs Secundários -->
                <div class="kpi-box">
                    <div class="kpi-icon">🏥</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.hospitaisAtivos}</span>
                        <span class="kpi-label">Hospitais</span>
                    </div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-icon">🛏️</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.totalLeitos}</span>
                        <span class="kpi-label">Total Leitos</span>
                    </div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-icon">👥</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.leitosOcupados}</span>
                        <span class="kpi-label">Ocupados</span>
                    </div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-icon">🔓</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.leitosVagos}</span>
                        <span class="kpi-label">Vagos</span>
                    </div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-icon">📤</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.leitosEmAlta}</span>
                        <span class="kpi-label">Em Alta</span>
                    </div>
                </div>
                
                <!-- CORREÇÃO TPH - Cálculo Correto -->
                <div class="kpi-box">
                    <div class="kpi-icon">⏱️</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.tphMedio.toFixed(1)}</span>
                        <span class="kpi-label">TPH Médio</span>
                    </div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-icon">📈</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.ppsMedio.toFixed(0)}</span>
                        <span class="kpi-label">PPS Médio</span>
                    </div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-icon">🎯</div>
                    <div class="kpi-data">
                        <span class="kpi-value">${kpis.spctCasos}</span>
                        <span class="kpi-label">SPCT Casos</span>
                    </div>
                </div>
            </div>
            
            <!-- GRÁFICOS EXECUTIVOS -->
            <div class="executivo-graficos">
                <!-- Gráfico 1: Análise Preditiva de Altas -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <h3>📊 Análise Preditiva de Altas em DD/MM/AAAA</h3>
                        <p>Gráfico barras agrupadas - Hoje Ouro/2R/3R, 24H, 48H...</p>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="altas" data-type="bar">📊 Barras</button>
                            <button class="chart-btn" data-chart="altas" data-type="line">📈 Linhas</button>
                            <button class="chart-btn" data-chart="altas" data-type="doughnut">🍩 Rosca</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltasExecutivo"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico 2: Análise Preditiva de Concessões -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <h3>🎯 Análise Preditiva de Concessões em DD/MM/AAAA</h3>
                        <p>Gráfico barras empilhadas por hospital</p>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="concessoes" data-type="bar">📊 Barras</button>
                            <button class="chart-btn" data-chart="concessoes" data-type="doughnut">🍩 Rosca</button>
                            <button class="chart-btn" data-chart="concessoes" data-type="polarArea">🎯 Polar</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoesExecutivo"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico 3: Análise Preditiva de Linhas de Cuidado -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <h3>🩺 Análise Preditiva de Linhas de Cuidado em DD/MM/AAAA</h3>
                        <p>Gráfico barras empilhadas por hospital</p>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="linhas" data-type="bar">📊 Barras</button>
                            <button class="chart-btn" data-chart="linhas" data-type="doughnut">🍩 Rosca</button>
                            <button class="chart-btn" data-chart="linhas" data-type="polarArea">🎯 Polar</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoLinhasExecutivo"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Aguardar Chart.js e renderizar gráficos
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            logInfo('Aguardando Chart.js...');
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            // Event listeners para botões de tipos de gráficos
            document.querySelectorAll('[data-chart][data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const chart = e.target.dataset.chart;
                    const type = e.target.dataset.type;
                    
                    // Atualizar botão ativo
                    const grupo = e.target.parentElement;
                    grupo.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    // Renderizar gráfico
                    if (chart === 'altas') {
                        renderAltasExecutivo(type);
                    } else if (chart === 'concessoes') {
                        renderConcessoesExecutivo(type);
                    } else if (chart === 'linhas') {
                        renderLinhasExecutivo(type);
                    }
                    
                    logInfo(`Gráfico executivo alterado: ${chart} - ${type}`);
                });
            });
            
            // *** CORREÇÃO: Renderizar gauge HORIZONTAL e gráficos iniciais ***
            renderGaugeExecutivoHorizontal(kpis.ocupacaoGeral);
            renderAltasExecutivo('bar');
            renderConcessoesExecutivo('bar');
            renderLinhasExecutivo('bar');
            
            logSuccess('✅ Dashboard Executivo: REDE HOSPITALAR EXTERNA - Gauge horizontal + KPIs + 3 gráficos');
        }, 200);
    };
    
    aguardarChartJS();
};

// =================== CALCULAR KPIs CONSOLIDADOS ===================
function calcularKPIsExecutivos(hospitaisComDados) {
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let tphTotal = 0;
    let tphCount = 0;
    let ppsTotal = 0;
    let ppsCount = 0;
    let spctCasos = 0;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            totalLeitos++;
            
            if (leito.status === 'ocupado') {
                leitosOcupados++;
                
                // Verificar se tem alta prevista
                if (leito.paciente && leito.paciente.prevAlta && leito.paciente.prevAlta !== 'Não definido') {
                    leitosEmAlta++;
                }
                
                // *** CORREÇÃO TPH: Validar números ***
                if (leito.paciente && leito.paciente.tph) {
                    const tph = parseFloat(leito.paciente.tph);
                    if (!isNaN(tph) && tph > 0) {
                        tphTotal += tph;
                        tphCount++;
                    }
                }
                
                // PPS
                if (leito.paciente && leito.paciente.pps) {
                    const pps = parseFloat(leito.paciente.pps);
                    if (!isNaN(pps) && pps > 0) {
                        ppsTotal += pps;
                        ppsCount++;
                    }
                }
                
                // SPCT Casos (exemplo: contar casos específicos)
                if (leito.paciente && leito.paciente.linhas && leito.paciente.linhas.includes('Cuidados Paliativos')) {
                    spctCasos++;
                }
            }
        });
    });
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    
    return {
        hospitaisAtivos: hospitaisComDados.length,
        totalLeitos,
        leitosOcupados,
        leitosVagos,
        leitosEmAlta,
        ocupacaoGeral,
        tphMedio: tphCount > 0 ? (tphTotal / tphCount) : 0,
        ppsMedio: ppsCount > 0 ? (ppsTotal / ppsCount) : 0,
        spctCasos
    };
}

// =================== GAUGE HORIZONTAL (MEIA-LUA) - CORREÇÃO CRÍTICA ===================
function renderGaugeExecutivoHorizontal(ocupacao) {
    const canvas = document.getElementById('gaugeOcupacaoExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (window.chartInstances && window.chartInstances.gaugeExecutivo) {
        window.chartInstances.gaugeExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    window.chartInstances.gaugeExecutivo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [ocupacao, 100 - ocupacao],
                backgroundColor: [
                    ocupacao >= 85 ? '#ef4444' : ocupacao >= 70 ? '#f97316' : ocupacao >= 50 ? '#eab308' : '#22c55e',
                    'rgba(255,255,255,0.1)'
                ],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
            },
            rotation: -90,     // *** CORREÇÃO: HORIZONTAL (meia-lua) ***
            circumference: 180 // *** CORREÇÃO: 180 graus ***
        }
    });
    
    logInfo(`✅ Gauge executivo HORIZONTAL renderizado: ${ocupacao}%`);
}

// =================== GRÁFICO DE ALTAS EXECUTIVO ===================
function renderAltasExecutivo(tipo = 'bar') {
    const canvas = document.getElementById('graficoAltasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'altasExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Consolidar dados de todas as altas por categoria
    const categorias = ['Hoje Ouro', '24h 2R', '48h 3R', '72h', '96h', 'Não definido'];
    const dadosConsolidados = [];
    
    // Para cada hospital ativo
    Object.keys(window.hospitalData).forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        const hospitalNome = CONFIG.HOSPITAIS[hospitalId]?.nome || hospitalId;
        const valores = categorias.map(cat => {
            return hospital.leitos.filter(l => 
                l.status === 'ocupado' && 
                l.paciente && 
                l.paciente.prevAlta === cat
            ).length;
        });
        
        dadosConsolidados.push({
            label: hospitalNome,
            data: valores,
            backgroundColor: getHospitalColor(hospitalId),
            borderColor: getHospitalColor(hospitalId),
            borderWidth: 1
        });
    });
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: tipo,
        data: {
            labels: categorias,
            datasets: dadosConsolidados
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: tipo === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            } : {},
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#9ca3af' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
    
    logInfo(`Gráfico de Altas Executivo renderizado (${tipo})`);
}

// =================== GRÁFICO DE CONCESSÕES EXECUTIVO ===================
function renderConcessoesExecutivo(tipo = 'bar') {
    const canvas = document.getElementById('graficoConcessoesExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'concessoesExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Consolidar dados de concessões
    const concessoesMap = new Map();
    
    Object.keys(window.hospitalData).forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
                const concessoes = leito.paciente.concessoes.split('|');
                concessoes.forEach(concessao => {
                    const nome = concessao.trim();
                    if (nome) {
                        concessoesMap.set(nome, (concessoesMap.get(nome) || 0) + 1);
                    }
                });
            }
        });
    });
    
    const labels = Array.from(concessoesMap.keys()).slice(0, 10); // Top 10
    const valores = labels.map(label => concessoesMap.get(label));
    const cores = labels.map(label => window.CHART_COLORS?.concessoes?.[label] || getRandomColor());
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: tipo,
        data: {
            labels,
            datasets: [{
                label: 'Concessões',
                data: valores,
                backgroundColor: cores,
                borderColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: tipo === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af', maxRotation: 45 },
                    grid: { display: false }
                }
            } : {},
            plugins: {
                legend: {
                    display: tipo !== 'bar',
                    position: 'right',
                    labels: { color: '#9ca3af', padding: 10 }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
    
    logInfo(`Gráfico de Concessões Executivo renderizado (${tipo})`);
}

// =================== GRÁFICO DE LINHAS DE CUIDADO EXECUTIVO ===================
function renderLinhasExecutivo(tipo = 'bar') {
    const canvas = document.getElementById('graficoLinhasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'linhasExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Consolidar dados de linhas de cuidado
    const linhasMap = new Map();
    
    Object.keys(window.hospitalData).forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas) {
                const linhas = leito.paciente.linhas.split('|');
                linhas.forEach(linha => {
                    const nome = linha.trim();
                    if (nome) {
                        linhasMap.set(nome, (linhasMap.get(nome) || 0) + 1);
                    }
                });
            }
        });
    });
    
    const labels = Array.from(linhasMap.keys()).slice(0, 10); // Top 10
    const valores = labels.map(label => linhasMap.get(label));
    const cores = labels.map(label => window.CHART_COLORS?.linhasCuidado?.[label] || getRandomColor());
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: tipo,
        data: {
            labels,
            datasets: [{
                label: 'Linhas de Cuidado',
                data: valores,
                backgroundColor: cores,
                borderColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: tipo === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af', maxRotation: 45 },
                    grid: { display: false }
                }
            } : {},
            plugins: {
                legend: {
                    display: tipo !== 'bar',
                    position: 'right',
                    labels: { color: '#9ca3af', padding: 10 }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
    
    logInfo(`Gráfico de Linhas de Cuidado Executivo renderizado (${tipo})`);
}

// =================== FUNÇÕES AUXILIARES ===================
function getHospitalColor(hospitalId) {
    const cores = ['#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444'];
    const index = parseInt(hospitalId.replace('H', '')) - 1;
    return cores[index % cores.length];
}

function getRandomColor() {
    const cores = ['#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#06b6d4', '#a855f7', '#84cc16'];
    return cores[Math.floor(Math.random() * cores.length)];
}

// =================== FUNÇÃO DE FORÇA DE ATUALIZAÇÃO ===================
window.forceExecutiveRefresh = function() {
    logInfo('Forçando atualização dos dados executivos...');
    
    const container = document.getElementById('dashExecutivoContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #22c55e; font-size: 18px; margin-bottom: 15px;">
                    🔄 Recarregando dados executivos...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Consolidando informações da rede
                </div>
            </div>
        `;
    }
    
    // Tentar recarregar dados
    if (window.loadHospitalData) {
        window.loadHospitalData().then(() => {
            setTimeout(() => {
                window.renderDashboardExecutivo();
            }, 1000);
        });
    } else {
        // Fallback: recarregar após 2 segundos
        setTimeout(() => {
            window.renderDashboardExecutivo();
        }, 2000);
    }
};

// =================== CSS EXECUTIVO COMPLETO ===================
function getExecutiveCSS() {
    return `
        <style id="executiveCSS">
            /* KPIS GRID - 6 COLUNAS COM KPI PRINCIPAL */
            .executive-kpis-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                grid-template-rows: auto auto;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            /* KPI PRINCIPAL - GAUGE OCUPA 2 COLUNAS */
            .kpi-box-principal {
                grid-column: span 2;
                background: #1a1f2e;
                border-radius: 12px;
                padding: 20px;
                color: white;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
            }
            
            .kpi-box-principal h3 {
                margin: 0 0 15px 0;
                color: #22c55e;
                font-size: 16px;
                font-weight: 600;
            }
            
            /* CONTAINER DO GAUGE */
            .gauge-container {
                position: relative;
                height: 150px;
                margin: 10px 0;
            }
            
            .gauge-container canvas {
                max-height: 150px !important;
            }
            
            /* TEXTO SOBREPOSTO DO GAUGE */
            .gauge-text {
                position: absolute;
                top: 60%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                pointer-events: none;
            }
            
            .gauge-value {
                display: block;
                font-size: 28px;
                font-weight: 700;
                color: #22c55e;
                line-height: 1;
            }
            
            .gauge-label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                margin-top: 4px;
            }
            
            /* KPIS SECUNDÁRIOS */
            .kpi-box {
                background: #1a1f2e;
                border-radius: 8px;
                padding: 15px;
                color: white;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .kpi-icon {
                font-size: 24px;
                opacity: 0.8;
            }
            
            .kpi-data {
                flex: 1;
            }
            
            .kpi-value {
                display: block;
                font-size: 20px;
                font-weight: 700;
                color: #22c55e;
                line-height: 1.2;
            }
            
            .kpi-label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                margin-top: 2px;
            }
            
            /* GRÁFICOS EXECUTIVOS */
            .executivo-graficos {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .executivo-grafico-card {
                background: #1a1f2e;
                border-radius: 12px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .chart-header h3 {
                margin: 0;
                color: #22c55e;
                font-size: 18px;
                font-weight: 600;
            }
            
            .chart-header p {
                margin: 5px 0 0 0;
                color: #9ca3af;
                font-size: 14px;
            }
            
            .chart-controls {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .chart-btn {
                background: transparent;
                border: 1px solid #374151;
                color: #9ca3af;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .chart-btn:hover {
                border-color: #60a5fa;
                color: #60a5fa;
            }
            
            .chart-btn.active {
                background: #60a5fa;
                border-color: #60a5fa;
                color: white;
            }
            
            .chart-container {
                position: relative;
                height: 400px;
            }
            
            .chart-container canvas {
                max-height: 400px !important;
            }
            
            /* RESPONSIVIDADE */
            @media (max-width: 1200px) {
                .executive-kpis-grid {
                    grid-template-columns: repeat(3, 1fr);
                    grid-template-rows: auto auto auto;
                }
                
                .kpi-box-principal {
                    grid-column: span 3;
                }
            }
            
            @media (max-width: 768px) {
                .executive-kpis-grid {
                    grid-template-columns: 1fr;
                }
                
                .kpi-box-principal {
                    grid-column: span 1;
                }
                
                .chart-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .chart-controls {
                    width: 100%;
                    justify-content: center;
                }
                
                .chart-container {
                    height: 300px;
                }
            }
            
            /* ANIMAÇÕES */
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    `;
}

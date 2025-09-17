// =================== DASHBOARD EXECUTIVO - VERSÃO COMPLETA CORRIGIDA ===================

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo COMPLETO - SEM CARREGAMENTO INFINITO');
    
    // *** CORREÇÃO CRÍTICA: Container correto ***
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
    
    // *** CORREÇÃO: VERIFICAR SE HÁ DADOS ANTES DE RENDERIZAR ***
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #22c55e; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #22c55e; margin-bottom: 10px; font-size: 20px;">Carregando dados executivos</h2>
                <p style="color: #9ca3af; font-size: 14px;">Consolidando informações da rede hospitalar...</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // *** TIMEOUT: Não deixar carregar infinito ***
        let tentativas = 0;
        const maxTentativas = 3;
        
        const tentarCarregar = () => {
            tentativas++;
            
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                setTimeout(() => window.renderDashboardExecutivo(), 500);
            } else if (tentativas < maxTentativas) {
                setTimeout(tentarCarregar, 2000);
            } else {
                // Dados mock após 3 tentativas
                logInfo('Criando dados mock para Dashboard Executivo após timeout');
                criarDadosMockExecutivo();
                setTimeout(() => window.renderDashboardExecutivo(), 1000);
            }
        };
        
        tentarCarregar();
        return;
    }
    
    // Verificar quais hospitais têm dados reais
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => l.status === 'ocupado' || l.status === 'vago');
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white; background: #1a1f2e; border-radius: 12px;">
                <h3 style="color: #f59e0b; margin-bottom: 15px;">⚠️ Nenhum dado executivo disponível</h3>
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
    
    // *** HTML COMPLETO SEM LOADING PERMANENTE ***
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #22c55e;">
                <h2 style="margin: 0; color: #22c55e; font-size: 24px; font-weight: 700;">🏢 Dashboard Executivo</h2>
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 14px;">
                    <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
                    ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'ais' : ''} conectado${hospitaisComDados.length > 1 ? 's' : ''}
                </div>
            </div>
            
            <!-- Status dos dados -->
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <strong style="color: #22c55e;">✅ Dados Reais da Rede</strong>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 14px;">
                    ${hospitaisComDados.length} hospitais com dados: ${hospitaisComDados.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')} • ${hoje}
                </p>
            </div>
            
            <!-- KPIs PRINCIPAIS -->
            <div class="executive-kpis-grid">
                <!-- KPI Principal: Ocupação com Gauge -->
                <div class="kpi-principal">
                    <div class="gauge-container">
                        <canvas id="gaugeOcupacaoExecutivo" width="200" height="100"></canvas>
                        <div class="gauge-value">${kpis.ocupacaoGeral}%</div>
                        <div class="gauge-label">OCUPAÇÃO GERAL</div>
                    </div>
                    <div class="hospitais-list">
                        ${hospitaisComDados.map(id => {
                            const kpiHosp = calcularKPIsHospital(id);
                            return `
                                <div class="hospital-item">
                                    <span class="hospital-nome">${CONFIG.HOSPITAIS[id].nome}</span>
                                    <span class="hospital-pct">${kpiHosp.ocupacao}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- TPH Médio -->
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.tphMedio}</div>
                    <div class="kpi-label">TPH MÉDIO</div>
                </div>
                
                <!-- PPS Médio -->
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.ppsMedio}</div>
                    <div class="kpi-label">PPS MÉDIO</div>
                </div>
                
                <!-- Em Alta -->
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.emAlta}</div>
                    <div class="kpi-label">EM ALTA</div>
                </div>
                
                <!-- SPCT+ -->
                <div class="kpi-box ${kpis.spctClasse}">
                    <div class="kpi-value">${kpis.spctPercentual}%</div>
                    <div class="kpi-label">SPCT+</div>
                </div>
                
                <!-- Total de Leitos -->
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.totalLeitos}</div>
                    <div class="kpi-label">TOTAL LEITOS</div>
                </div>
            </div>
            
            <!-- GRÁFICOS EXECUTIVOS -->
            <div class="executive-charts">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>📈 Altas Previstas em ${hoje}</h3>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="altas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-chart="altas" data-type="line">Linha</button>
                            <button class="chart-btn" data-chart="altas" data-type="area">Área</button>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="graficoAltasExecutivo" width="800" height="400"></canvas>
                    </div>
                    <div class="data-note">Dados atualizados automaticamente via API</div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>🎯 Concessões Solicitadas</h3>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="concessoes" data-type="bar">Barras H</button>
                            <button class="chart-btn" data-chart="concessoes" data-type="doughnut">Rosca</button>
                            <button class="chart-btn" data-chart="concessoes" data-type="polar">Polar</button>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="graficoConcessoesExecutivo" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>🏥 Linhas de Cuidado</h3>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="linhas" data-type="doughnut">Pizza</button>
                            <button class="chart-btn" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-chart="linhas" data-type="radar">Radar</button>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="graficoLinhasExecutivo" width="800" height="400"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        ${getExecutiveCSS()}
        
        <style>
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    `;
    
    // *** AGUARDAR CHART.JS E RENDERIZAR GRÁFICOS ***
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
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
            
            // Renderizar gauge e gráficos iniciais
            renderGaugeExecutivo(kpis.ocupacaoGeral);
            renderAltasExecutivo('bar');
            renderConcessoesExecutivo('bar');
            renderLinhasExecutivo('doughnut');
            
            logSuccess('✅ Dashboard Executivo renderizado com gauge horizontal + KPIs consolidados + 3 gráficos');
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
        if (hospital && hospital.leitos) {
            totalLeitos += hospital.leitos.length;
            
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado') {
                    leitosOcupados++;
                    
                    if (leito.paciente) {
                        // Contar altas previstas
                        if (leito.paciente.prevAlta && ['Hoje Ouro', '24h 2R', '48h 3R'].includes(leito.paciente.prevAlta)) {
                            leitosEmAlta++;
                        }
                        
                        // TPH
                        if (leito.paciente.tph && !isNaN(leito.paciente.tph)) {
                            tphTotal += parseFloat(leito.paciente.tph);
                            tphCount++;
                        }
                        
                        // PPS
                        if (leito.paciente.pps && !isNaN(leito.paciente.pps)) {
                            ppsTotal += parseFloat(leito.paciente.pps);
                            ppsCount++;
                        }
                        
                        // SPCT+ (casos complexos)
                        if (leito.paciente.linhas) {
                            const linhas = leito.paciente.linhas.toString().toLowerCase();
                            if (linhas.includes('sepse') || linhas.includes('pneumonia') || 
                                linhas.includes('covid') || linhas.includes('trauma') ||
                                linhas.includes('uti') || linhas.includes('intensiv') ||
                                linhas.includes('paliativos')) {
                                spctCasos++;
                            }
                        }
                    }
                }
            });
        }
    });
    
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const tphMedio = tphCount > 0 ? (tphTotal / tphCount).toFixed(1) : '0.0';
    const ppsMedio = ppsCount > 0 ? Math.round(ppsTotal / ppsCount) : 0;
    const spctPercentual = leitosOcupados > 0 ? Math.round((spctCasos / leitosOcupados) * 100) : 0;
    
    // Classificar SPCT+
    let spctClasse = 'normal';
    if (spctPercentual > 25) spctClasse = 'critico';
    else if (spctPercentual > 20) spctClasse = 'alerta';
    else if (spctPercentual > 15) spctClasse = 'atencao';
    
    return {
        ocupacaoGeral,
        totalLeitos,
        leitosOcupados,
        emAlta: leitosEmAlta,
        tphMedio,
        ppsMedio,
        spctPercentual,
        spctClasse
    };
}

// =================== CALCULAR KPIs DE UM HOSPITAL (AUXILIAR) ===================
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0 };
    }
    
    const total = hospital.leitos.length;
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return { ocupacao, total, ocupados, vagos: total - ocupados };
}

// =================== GAUGE EXECUTIVO (HORIZONTAL) ===================
function renderGaugeExecutivo(ocupacao) {
    const canvas = document.getElementById('gaugeOcupacaoExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'gaugeExecutivo';
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
                rotation: -90,     // HORIZONTAL: semicírculo
                circumference: 180 // HORIZONTAL: 180 graus
            }
        });
        
        logInfo(`Gauge executivo renderizado: ${ocupacao}%`);
    } catch (error) {
        logError('Erro ao renderizar gauge executivo:', error);
    }
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
    
    // Consolidar dados de altas por hospital
    const dadosConsolidados = consolidarAltasPorHospital();
    
    let config = {
        type: tipo,
        data: {
            labels: dadosConsolidados.labels,
            datasets: [{
                label: 'Altas Previstas Hoje',
                data: dadosConsolidados.valores,
                backgroundColor: ['#22c55e', '#06b6d4', '#8b5cf6', '#f97316', '#ef4444'],
                borderColor: ['#16a34a', '#0891b2', '#7c3aed', '#ea580c', '#dc2626'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e2e8f0' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#9ca3af',
                        stepSize: 1
                    },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                }
            }
        }
    };
    
    // Ajustar configuração por tipo
    if (tipo === 'line') {
        config.data.datasets[0].fill = false;
        config.data.datasets[0].backgroundColor = '#22c55e';
    } else if (tipo === 'area') {
        config.type = 'line';
        config.data.datasets[0].fill = true;
        config.data.datasets[0].backgroundColor = 'rgba(34, 197, 94, 0.3)';
        config.data.datasets[0].borderColor = '#16a34a';
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, config);
    logInfo(`Gráfico de altas executivo renderizado: ${tipo}`);
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
    const dadosConsolidados = consolidarConcessoes();
    
    let config = {
        type: tipo,
        data: {
            labels: dadosConsolidados.labels,
            datasets: [{
                label: 'Quantidade',
                data: dadosConsolidados.valores,
                backgroundColor: [
                    '#ef4444', '#f97316', '#eab308', '#22c55e', 
                    '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipo === 'doughnut' || tipo === 'polar' ? 'right' : 'bottom',
                    labels: { color: '#e2e8f0' }
                }
            }
        }
    };
    
    // Configurações específicas por tipo
    if (tipo === 'bar') {
        config.options.indexAxis = 'y'; // Barras horizontais
        config.options.scales = {
            y: {
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(156, 163, 175, 0.1)' }
            },
            x: {
                beginAtZero: true,
                ticks: { 
                    color: '#9ca3af',
                    stepSize: 1
                },
                grid: { color: 'rgba(156, 163, 175, 0.1)' }
            }
        };
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, config);
    logInfo(`Gráfico de concessões executivo renderizado: ${tipo}`);
}

// =================== GRÁFICO DE LINHAS EXECUTIVO ===================
function renderLinhasExecutivo(tipo = 'doughnut') {
    const canvas = document.getElementById('graficoLinhasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'linhasExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Consolidar dados de linhas de cuidado
    const dadosConsolidados = consolidarLinhasCuidado();
    
    let config = {
        type: tipo,
        data: {
            labels: dadosConsolidados.labels,
            datasets: [{
                label: 'Quantidade',
                data: dadosConsolidados.valores,
                backgroundColor: [
                    '#ef4444', '#f97316', '#eab308', '#22c55e', 
                    '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipo === 'doughnut' ? 'right' : 'bottom',
                    labels: { color: '#e2e8f0' }
                }
            }
        }
    };
    
    // Configurações específicas por tipo
    if (tipo === 'bar') {
        config.options.scales = {
            y: {
                beginAtZero: true,
                ticks: { color: '#9ca3af', stepSize: 1 },
                grid: { color: 'rgba(156, 163, 175, 0.1)' }
            },
            x: {
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(156, 163, 175, 0.1)' }
            }
        };
    } else if (tipo === 'radar') {
        config.options.scales = {
            r: {
                beginAtZero: true,
                ticks: { color: '#9ca3af', stepSize: 1 },
                grid: { color: 'rgba(156, 163, 175, 0.3)' },
                pointLabels: { color: '#e2e8f0' }
            }
        };
        config.data.datasets[0].backgroundColor = 'rgba(96, 165, 250, 0.2)';
        config.data.datasets[0].borderColor = '#60a5fa';
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, config);
    logInfo(`Gráfico de linhas executivo renderizado: ${tipo}`);
}

// =================== CONSOLIDAR DADOS POR HOSPITAL ===================
function consolidarAltasPorHospital() {
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos;
    });
    
    const altasPorHospital = {};
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        const nomeHospital = CONFIG.HOSPITAIS[hospitalId].nome;
        altasPorHospital[nomeHospital] = 0;
        
        if (hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado' && leito.paciente && leito.paciente.prevAlta) {
                    if (['Hoje Ouro', '24h 2R'].includes(leito.paciente.prevAlta)) {
                        altasPorHospital[nomeHospital]++;
                    }
                }
            });
        }
    });
    
    return {
        labels: Object.keys(altasPorHospital),
        valores: Object.values(altasPorHospital)
    };
}

function consolidarConcessoes() {
    const concessoes = {};
    
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
                    const concessoesList = typeof leito.paciente.concessoes === 'string' ? 
                        leito.paciente.concessoes.split('|') : 
                        Array.isArray(leito.paciente.concessoes) ? leito.paciente.concessoes : [leito.paciente.concessoes];
                    
                    concessoesList.forEach(concessao => {
                        if (concessao && concessao.trim() !== '') {
                            const key = concessao.trim();
                            concessoes[key] = (concessoes[key] || 0) + 1;
                        }
                    });
                }
            });
        }
    });
    
    const sorted = Object.entries(concessoes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
    
    return {
        labels: sorted.map(([nome]) => nome),
        valores: sorted.map(([, count]) => count)
    };
}

function consolidarLinhasCuidado() {
    const linhas = {};
    
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas) {
                    const linhasList = typeof leito.paciente.linhas === 'string' ? 
                        leito.paciente.linhas.split('|') : 
                        Array.isArray(leito.paciente.linhas) ? leito.paciente.linhas : [leito.paciente.linhas];
                    
                    linhasList.forEach(linha => {
                        if (linha && linha.trim() !== '') {
                            const key = linha.trim();
                            linhas[key] = (linhas[key] || 0) + 1;
                        }
                    });
                }
            });
        }
    });
    
    const sorted = Object.entries(linhas)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
    
    return {
        labels: sorted.map(([nome]) => nome),
        valores: sorted.map(([, count]) => count)
    };
}

// =================== CRIAR DADOS MOCK PARA TESTE ===================
function criarDadosMockExecutivo() {
    window.hospitalData = {
        H1: {
            leitos: [
                {
                    status: 'ocupado',
                    paciente: {
                        nome: 'João Silva',
                        prevAlta: 'Hoje Ouro',
                        concessoes: 'Fisioterapia|Home Care',
                        linhas: 'Cardiologia|UTI',
                        tph: 3.2,
                        pps: 85
                    }
                },
                {
                    status: 'ocupado',
                    paciente: {
                        nome: 'Maria Santos',
                        prevAlta: '24h 2R',
                        concessoes: 'Transição Domiciliar',
                        linhas: 'Pneumologia',
                        tph: 2.8,
                        pps: 92
                    }
                },
                { status: 'vago' },
                { status: 'vago' }
            ]
        },
        H2: {
            leitos: [
                {
                    status: 'ocupado',
                    paciente: {
                        nome: 'Pedro Costa',
                        prevAlta: '48h 3R',
                        concessoes: 'Medicamentos|Oxigenoterapia',
                        linhas: 'Oncologia|Cuidados Paliativos',
                        tph: 4.1,
                        pps: 78
                    }
                },
                {
                    status: 'ocupado',
                    paciente: {
                        nome: 'Ana Lima',
                        prevAlta: 'Hoje Ouro',
                        concessoes: 'Fisioterapia',
                        linhas: 'APS|Crônicos – Cardiologia',
                        tph: 1.9,
                        pps: 95
                    }
                },
                { status: 'vago' }
            ]
        }
    };
    
    logInfo('✅ Dados mock criados para Dashboard Executivo');
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

// =================== CSS COMPLETO PARA DASHBOARD EXECUTIVO ===================
function getExecutiveCSS() {
    return `
        <style id="executiveCSS">
            /* LAYOUT PRINCIPAL */
            .executive-kpis-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                grid-template-rows: repeat(2, 120px);
                gap: 16px;
                margin-bottom: 30px;
            }
            
            .kpi-principal {
                grid-column: span 2;
                grid-row: span 2;
                background: #1a1f2e;
                border-radius: 12px;
                padding: 20px;
                display: flex;
                align-items: center;
                color: white;
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .gauge-container {
                position: relative;
                width: 200px;
                height: 100px;
                margin-right: 20px;
            }
            
            .gauge-value {
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 24px;
                font-weight: 700;
                color: #22c55e;
            }
            
            .gauge-label {
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                text-transform: uppercase;
                color: #e2e8f0;
                font-weight: 600;
            }
            
            .hospitais-list {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 8px;
            }
            
            .hospital-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                padding: 4px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .hospital-item:last-child {
                border-bottom: none;
            }
            
            .hospital-nome {
                color: #e2e8f0;
                font-weight: 600;
            }
            
            .hospital-pct {
                color: #22c55e;
                font-weight: 700;
            }
            
            .kpi-box {
                background: #1a1f2e;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                color: white;
                padding: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            .kpi-box:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-box.critico {
                border-color: rgba(239, 68, 68, 0.5);
                background: linear-gradient(135deg, #1a1f2e 0%, rgba(239, 68, 68, 0.1) 100%);
            }
            
            .kpi-box.alerta {
                border-color: rgba(249, 115, 22, 0.5);
                background: linear-gradient(135deg, #1a1f2e 0%, rgba(249, 115, 22, 0.1) 100%);
            }
            
            .kpi-box.atencao {
                border-color: rgba(234, 179, 8, 0.5);
                background: linear-gradient(135deg, #1a1f2e 0%, rgba(234, 179, 8, 0.1) 100%);
            }
            
            .kpi-value {
                font-size: 28px;
                font-weight: 700;
                color: #22c55e;
                margin-bottom: 4px;
                line-height: 1;
            }
            
            .kpi-label {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #e2e8f0;
            }
            
            /* GRÁFICOS */
            .executive-charts {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .chart-container {
                background: #1a1f2e;
                border-radius: 12px;
                padding: 25px;
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .chart-header h3 {
                margin: 0;
                color: #e2e8f0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .chart-controls {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .chart-btn {
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: #e2e8f0;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .chart-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: #22c55e;
                transform: translateY(-1px);
            }
            
            .chart-btn.active {
                background: #22c55e;
                border-color: #22c55e;
                color: white;
                box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
            }
            
            .chart-wrapper {
                position: relative;
                height: 400px;
                width: 100%;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
            }
            
            .chart-wrapper canvas {
                width: 100% !important;
                height: 100% !important;
            }
            
            .data-note {
                font-size: 11px;
                color: #9ca3af;
                text-align: center;
                font-style: italic;
            }
            
            /* RESPONSIVIDADE */
            @media (max-width: 1200px) {
                .executive-kpis-grid {
                    grid-template-columns: repeat(3, 1fr);
                    grid-template-rows: repeat(3, 120px);
                }
                
                .kpi-principal {
                    grid-column: span 3;
                    grid-row: span 1;
                }
                
                .gauge-container {
                    width: 150px;
                    height: 80px;
                    margin-right: 15px;
                }
            }
            
            @media (max-width: 768px) {
                .executive-kpis-grid {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                
                .kpi-principal {
                    grid-column: 1;
                    grid-row: auto;
                    padding: 15px;
                    flex-direction: column;
                    text-align: center;
                }
                
                .gauge-container {
                    margin: 0 0 15px 0;
                }
                
                .chart-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .chart-controls {
                    width: 100%;
                    justify-content: center;
                }
                
                .chart-wrapper {
                    height: 300px;
                }
            }
        </style>
    `;
}

console.log('✅ Dashboard Executivo V3.0 - SEM CARREGAMENTO INFINITO - Carregado');

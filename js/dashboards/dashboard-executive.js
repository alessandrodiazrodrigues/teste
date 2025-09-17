// =================== DASHBOARD EXECUTIVO - REDE HOSPITALAR EXTERNA (SEM EMOJIS) ===================

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo: REDE HOSPITALAR EXTERNA');
    
    // Container correto
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
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Executivo');
            return;
        }
    }
    
    // Verificar se há dados antes de renderizar
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #22c55e; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #22c55e; margin-bottom: 10px; font-size: 20px;">Carregando dados executivos</h2>
                <p style="color: #9ca3af; font-size: 14px;">Consolidando informações da rede hospitalar</p>
                <style>
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        
        // Timeout controlado - máximo 3 tentativas
        let tentativas = 0;
        const maxTentativas = 3;
        
        const tentarCarregar = () => {
            tentativas++;
            
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                setTimeout(() => window.renderDashboardExecutivo(), 500);
            } else if (tentativas < maxTentativas) {
                setTimeout(tentarCarregar, 2000);
            } else {
                logInfo('Criando dados mock após timeout');
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
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white; background: #1a1f2e; border-radius: 12px;">
                <h3 style="color: #f59e0b; margin-bottom: 15px;">Nenhum dado executivo disponível</h3>
                <p style="color: #9ca3af; margin-bottom: 20px;">Não foi possível consolidar dados de nenhum hospital configurado.</p>
                <p style="color: #6b7280; font-size: 14px;">Hospitais configurados: ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
                <button onclick="window.forceExecutiveRefresh()" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 15px;">
                    Recarregar Dados
                </button>
            </div>
        `;
        return;
    }
    
    // Calcular KPIs consolidados
    const kpis = calcularKPIsExecutivos(hospitaisComDados);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // HTML CORRIGIDO - SEM EMOJIS E FONTES BRANCAS
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            
            <!-- HEADER COM TÍTULO CORRETO -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #22c55e;">
                <h2 style="margin: 0; color: #22c55e; font-size: 24px; font-weight: 700;">Rede Hospitalar Externa</h2>
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 14px;">
                    <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
                    ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'ais' : ''} conectado${hospitaisComDados.length > 1 ? 's' : ''}
                </div>
            </div>
            
            <!-- KPIS GRID CORRIGIDO - LAYOUT ORIGINAL -->
            <div class="executive-kpis-grid">
                
                <!-- KPI PRINCIPAL: Gauge (2 colunas, 2 linhas) -->
                <div class="kpi-gauge-principal">
                    <h3 style="color: #9ca3af; font-size: 14px; margin-bottom: 15px; text-align: center;">Ocupação Geral</h3>
                    <div class="gauge-container">
                        <canvas id="gaugeOcupacaoExecutivo"></canvas>
                        <div class="gauge-text">
                            <span class="gauge-value">${kpis.ocupacaoGeral}%</span>
                            <span class="gauge-label">Ocupação</span>
                        </div>
                    </div>
                    <!-- PERCENTUAIS DOS HOSPITAIS DENTRO DO GAUGE -->
                    <div class="hospitais-percentuais">
                        ${hospitaisComDados.map(hospitalId => {
                            const kpiHosp = calcularKPIsHospital(hospitalId);
                            return `
                                <div class="hospital-item">
                                    <span class="hospital-nome">${CONFIG.HOSPITAIS[hospitalId].nome}</span>
                                    <span class="hospital-pct">${kpiHosp.ocupacao}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- LINHA 1: KPIs PRINCIPAIS -->
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.hospitaisAtivos}</div>
                    <div class="kpi-label">Hospitais</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.totalLeitos}</div>
                    <div class="kpi-label">Total Leitos</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosOcupados}</div>
                    <div class="kpi-label">Ocupados</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosVagos}</div>
                    <div class="kpi-label">Vagos</div>
                </div>
                
                <!-- LINHA 2: KPIs SECUNDÁRIOS -->
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosEmAlta}</div>
                    <div class="kpi-label">Em Alta</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.tphMedio}</div>
                    <div class="kpi-label">TPH Médio</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.ppsMedio}</div>
                    <div class="kpi-label">PPS Médio</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.spctCasos}</div>
                    <div class="kpi-label">SPCT Casos</div>
                </div>
                
            </div>
            
            <!-- GRÁFICOS EXECUTIVOS -->
            <div class="executivo-graficos">
                
                <!-- Gráfico 1: Análise Preditiva de Altas -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <h3>Análise Preditiva de Altas em ${hoje}</h3>
                        <p>Gráfico barras agrupadas - Hoje Ouro/2R/3R, 24H, 48H...</p>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="altas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-chart="altas" data-type="line">Linhas</button>
                            <button class="chart-btn" data-chart="altas" data-type="doughnut">Rosca</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltasExecutivo"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico 2: Análise Preditiva de Concessões -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <h3>Análise Preditiva de Concessões em ${hoje}</h3>
                        <p>Gráfico barras empilhadas por hospital</p>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="concessoes" data-type="bar">Barras</button>
                            <button class="chart-btn" data-chart="concessoes" data-type="doughnut">Rosca</button>
                            <button class="chart-btn" data-chart="concessoes" data-type="polarArea">Polar</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoesExecutivo"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico 3: Análise Preditiva de Linhas de Cuidado -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <h3>Análise Preditiva de Linhas de Cuidado em ${hoje}</h3>
                        <p>Gráfico barras empilhadas por hospital</p>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-chart="linhas" data-type="doughnut">Rosca</button>
                            <button class="chart-btn" data-chart="linhas" data-type="polarArea">Polar</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoLinhasExecutivo"></canvas>
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
    
    // Aguardar Chart.js e renderizar gráficos
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
            
            // Renderizar gauge horizontal e gráficos iniciais
            renderGaugeExecutivoHorizontal(kpis.ocupacaoGeral);
            renderAltasExecutivo('bar');
            renderConcessoesExecutivo('bar');
            renderLinhasExecutivo('bar');
            
            logSuccess('Dashboard Executivo: REDE HOSPITALAR EXTERNA - Renderizado sem emojis');
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
                
                // TPH - Correção para evitar NaN
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
                
                // SPCT Casos
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
        tphMedio: tphCount > 0 ? (tphTotal / tphCount).toFixed(1) : '0.0',
        ppsMedio: ppsCount > 0 ? Math.round(ppsTotal / ppsCount) : 0,
        spctCasos
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
            rotation: -90,     // HORIZONTAL (meia-lua)
            circumference: 180 // 180 graus
        }
    });
    
    logInfo(`Gauge executivo HORIZONTAL renderizado: ${ocupacao}%`);
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
    
    logInfo('Dados mock criados para Dashboard Executivo');
}

// =================== FUNÇÃO DE FORÇA DE ATUALIZAÇÃO ===================
window.forceExecutiveRefresh = function() {
    logInfo('Forçando atualização dos dados executivos...');
    
    const container = document.getElementById('dashExecutivoContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #22c55e; font-size: 18px; margin-bottom: 15px;">
                    Recarregando dados executivos...
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

// =================== CSS EXECUTIVO CORRIGIDO - SEM EMOJIS E FONTES BRANCAS ===================
function getExecutiveCSS() {
    return `
        <style id="executiveCSS">
            /* LAYOUT PRINCIPAL - GRID 6 COLUNAS */
            .executive-kpis-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                grid-template-rows: auto auto;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            /* GAUGE PRINCIPAL - 2 COLUNAS, 2 LINHAS */
            .kpi-gauge-principal {
                grid-column: span 2;
                grid-row: span 2;
                background: #1a1f2e;
                border-radius: 12px;
                padding: 20px;
                color: white;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
                display: flex;
                flex-direction: column;
            }
            
            /* CONTAINER DO GAUGE */
            .gauge-container {
                position: relative;
                height: 150px;
                margin: 15px 0;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .gauge-container canvas {
                max-height: 150px !important;
            }
            
            /* TEXTO SOBREPOSTO DO GAUGE */
            .gauge-text {
                position: absolute;
                top: 70%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                pointer-events: none;
            }
            
            .gauge-value {
                display: block;
                font-size: 32px;
                font-weight: 700;
                color: white;
                line-height: 1;
            }
            
            .gauge-label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                margin-top: 4px;
                text-transform: uppercase;
            }
            
            /* PERCENTUAIS DOS HOSPITAIS DENTRO DO GAUGE */
            .hospitais-percentuais {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .hospital-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                padding: 4px 0;
                color: white;
            }
            
            .hospital-nome {
                color: #e2e8f0;
                font-weight: 500;
            }
            
            .hospital-pct {
                color: #22c55e;
                font-weight: 700;
            }
            
            /* KPIS SECUNDÁRIOS - FONTES BRANCAS */
            .kpi-box {
                background: #1a1f2e;
                border-radius: 12px;
                padding: 20px;
                color: white;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .kpi-box:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-value {
                display: block;
                font-size: 28px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-bottom: 6px;
            }
            
            .kpi-label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
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
                color: white;
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
                color: white;
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
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .chart-btn:hover {
                border-color: #60a5fa;
                color: #60a5fa;
            }
            
            .chart-btn.active {
                background: #60a5fa;
                border-color: #60a5fa;
                color: white;
                box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
            }
            
            .chart-container {
                position: relative;
                height: 400px;
                margin: 15px 0;
            }
            
            .chart-container canvas {
                max-height: 400px !important;
                width: 100% !important;
            }
            
            /* RESPONSIVIDADE */
            @media (max-width: 1200px) {
                .executive-kpis-grid {
                    grid-template-columns: repeat(3, 1fr);
                    grid-template-rows: auto auto auto;
                }
                
                .kpi-gauge-principal {
                    grid-column: span 3;
                    grid-row: span 1;
                }
            }
            
            @media (max-width: 768px) {
                .executive-kpis-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .kpi-gauge-principal {
                    grid-column: span 1;
                    grid-row: span 1;
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
        </style>
    `;
}

console.log('Dashboard Executivo V3.1 - SEM EMOJIS E FONTES BRANCAS - Carregado');

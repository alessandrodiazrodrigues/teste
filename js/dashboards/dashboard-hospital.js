// =================== DASHBOARD HOSPITALAR - VERSÃO COMPLETA CORRIGIDA ===================

// Estado dos gráficos selecionados por hospital (7 TIPOS)
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' }
};

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar V4.0 - LAYOUT HORIZONTAL KPIs + CORREÇÕES');
    
    // *** CORREÇÃO CRÍTICA: Container correto ***
    let container = document.getElementById('dashHospitalarContent');
    if (!container) {
        const dash1Section = document.getElementById('dash1');
        if (dash1Section) {
            container = document.createElement('div');
            container.id = 'dashHospitalarContent';
            dash1Section.appendChild(container);
            logInfo('Container dashHospitalarContent criado automaticamente');
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
    
    // *** APENAS DADOS REAIS - NUNCA MOCK ***
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados reais da API</h2>
                <p style="color: #9ca3af; font-size: 14px;">Conectando com Google Apps Script V4.0...</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">Somente dados reais são exibidos</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Tentar recarregar dados reais
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 3000);
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
                <h3 style="color: #f59e0b; margin-bottom: 15px;">Nenhum dado hospitalar disponível</h3>
                <p style="color: #9ca3af; margin-bottom: 20px;">Aguardando dados reais da planilha Google (44 colunas).</p>
                <button onclick="window.forceDataRefresh()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Recarregar Dados Reais
                </button>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // *** HTML COMPLETO COM CORREÇÕES ESPECÍFICAS ***
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <h2 style="margin: 0; color: #60a5fa; font-size: 24px; font-weight: 700;">Dashboard Hospitalar V4.0</h2>
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 14px;">
                    <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
                    ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'ais' : ''} com dados reais
                </div>
            </div>
            
            <!-- Status dos dados REAIS -->
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <strong style="color: #22c55e;">Dados Reais da Planilha V4.0</strong>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 14px;">
                    Hospitais: ${hospitaisComDados.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')} • Atualizado em ${hoje}
                </p>
            </div>
            
            <!-- HOSPITAIS EM LAYOUT VERTICAL -->
            <div class="hospitais-container">
                ${hospitaisComDados.map(hospitalId => renderHospitalSection(hospitalId)).join('')}
            </div>
        </div>
        
        ${getHospitalCSS()}
        
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
            document.querySelectorAll('[data-hospital][data-chart][data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const hospital = e.target.dataset.hospital;
                    const chart = e.target.dataset.chart;
                    const type = e.target.dataset.type;
                    
                    // Atualizar botão ativo
                    const grupo = e.target.parentElement;
                    grupo.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    // Atualizar state
                    if (!window.graficosState[hospital]) window.graficosState[hospital] = {};
                    window.graficosState[hospital][chart] = type;
                    
                    // Renderizar gráfico usando funções do dashboard.js V4.0
                    if (chart === 'preditivos') {
                        renderAltasHospital(hospital);
                    } else if (chart === 'concessoes') {
                        const hospitalData = window.hospitalData[hospital];
                        if (hospitalData && window.renderGraficoConcessoesV4) {
                            window.renderGraficoConcessoesV4(`graficoConcessoes${hospital}`, hospitalData, type);
                        }
                    } else if (chart === 'linhas') {
                        const hospitalData = window.hospitalData[hospital];
                        if (hospitalData && window.renderGraficoLinhasV4) {
                            window.renderGraficoLinhasV4(`graficoLinhas${hospital}`, hospitalData, type);
                        }
                    }
                    
                    logInfo(`Gráfico alterado: ${hospital} - ${chart} - ${type}`);
                });
            });
            
            // Renderizar todos os gráficos iniciais
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                renderAltasHospital(hospitalId);
                
                // *** CORREÇÃO: RENDERIZAR CONCESSÕES E LINHAS COM TIPO SCATTER INICIAL ***
                const hospitalData = window.hospitalData[hospitalId];
                if (hospitalData) {
                    renderConcessoesHospital(hospitalId, 'scatter');
                    renderLinhasHospital(hospitalId, 'scatter');
                }
            });
            
            logSuccess('Dashboard Hospitalar V4.0 renderizado com layout horizontal e dados reais');
        }, 100);
    };
    
    aguardarChartJS();
};

// =================== RENDERIZAR SEÇÃO DE UM HOSPITAL - CORREÇÃO HORIZONTAL ===================
function renderHospitalSection(hospitalId) {
    const hospital = CONFIG.HOSPITAIS[hospitalId];
    const kpis = calcularKPIsHospital(hospitalId);
    
    return `
        <div class="hospital-card" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3 class="hospital-title">${hospital.nome}</h3>
                
                <!-- *** CORREÇÃO 1: KPIs EM LAYOUT HORIZONTAL IGUAL AO EXECUTIVO *** -->
                <div class="kpis-horizontal-container">
                    <!-- GAUGE MESMO TAMANHO DOS OUTROS -->
                    <div class="kpi-box-inline kpi-gauge-box">
                        <canvas id="gauge${hospitalId}" width="80" height="40"></canvas>
                        <div class="kpi-value">${kpis.ocupacao}%</div>
                        <div class="kpi-label">OCUPAÇÃO</div>
                    </div>
                    
                    <!-- TOTAL -->
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.total}</div>
                        <div class="kpi-label">TOTAL</div>
                    </div>
                    
                    <!-- OCUPADOS -->
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.ocupados}</div>
                        <div class="kpi-label">OCUPADOS</div>
                    </div>
                    
                    <!-- VAGOS -->
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.vagos}</div>
                        <div class="kpi-label">VAGOS</div>
                    </div>
                    
                    <!-- EM ALTA -->
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.altas}</div>
                        <div class="kpi-label">EM ALTA</div>
                    </div>
                </div>
            </div>
            
            <!-- GRÁFICOS EM LAYOUT VERTICAL -->
            <div class="graficos-verticais">
                <!-- *** CORREÇÃO 2: Gráfico de Altas SEM V4.0 - APENAS BARRAS *** -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Análise Preditiva de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <!-- *** CORREÇÃO 3: Gráfico de Concessões SEM V4.0 *** -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessões Previstas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="scatter">Bolinhas</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="line">Linha</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="area">Área</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="radar">Radar</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="polar">Polar</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="doughnut">Rosca</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoes${hospitalId}" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <!-- *** CORREÇÃO 4: Gráfico de Linhas SEM V4.0 *** -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="scatter">Bolinhas</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="line">Linha</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="area">Área</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="radar">Radar</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="polar">Polar</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="doughnut">Rosca</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoLinhas${hospitalId}" width="800" height="400"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =================== CALCULAR KPIs DE UM HOSPITAL ===================
// *** CORREÇÃO: CALCULAR KPIs COM SOMA CORRETA (ENF + APT + UTI) ***
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    // *** CORREÇÃO: SOMAR TODOS OS TIPOS DE LEITO ***
    let totalEnf = 0, totalApt = 0, totalUti = 0;
    let ocupadosEnf = 0, ocupadosApt = 0, ocupadosUti = 0;
    
    hospital.leitos.forEach(leito => {
        // Identificar tipo de leito
        const tipo = leito.tipo || leito.categoria || 'ENF'; // fallback para ENF
        
        if (tipo.includes('ENF') || tipo.includes('Enfermaria')) {
            totalEnf++;
            if (leito.status === 'ocupado') ocupadosEnf++;
        } else if (tipo.includes('APT') || tipo.includes('Apartamento')) {
            totalApt++;
            if (leito.status === 'ocupado') ocupadosApt++;
        } else if (tipo.includes('UTI')) {
            totalUti++;
            if (leito.status === 'ocupado') ocupadosUti++;
        } else {
            // Se não identificar, contar como ENF
            totalEnf++;
            if (leito.status === 'ocupado') ocupadosEnf++;
        }
    });
    
    const total = totalEnf + totalApt + totalUti;
    const ocupados = ocupadosEnf + ocupadosApt + ocupadosUti;
    const vagos = total - ocupados;
    
    // *** CORREÇÃO: USAR TIMELINE V4.0 CORRIGIDA ***
    const TIMELINE_ALTA_V4 = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R'];
    const altas = hospital.leitos.filter(l => 
        l.status === 'ocupado' && 
        l.paciente && 
        l.paciente.prevAlta && 
        TIMELINE_ALTA_V4.includes(l.paciente.prevAlta)
    ).length;
    
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    logInfo(`KPIs ${hospitalId}: ENF=${totalEnf}, APT=${totalApt}, UTI=${totalUti}, Total=${total}`);
    
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
                        ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f97316' : '#22c55e',
                        'rgba(255,255,255,0.1)'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                rotation: -90,
                circumference: 180
            }
        });
        
        logInfo(`Gauge renderizado para ${hospitalId}: ${ocupacao}%`);
    } catch (error) {
        logError(`Erro ao renderizar gauge ${hospitalId}:`, error);
    }
}

// *** CORREÇÃO 5: GRÁFICO DE ALTAS COM ESPECIFICAÇÕES EXATAS ***
function renderAltasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoAltas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `altas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // *** CORREÇÃO: EIXOS EXATOS - HOJE, 24H, 48H, 72H (SEM SP) ***
    const categorias = ['HOJE', '24H', '48H', '72H'];
    
    // *** CORREÇÃO: SEPARAR HOJE E 24H EM OURO/2R/3R ***
    const dados = {
        'Ouro': [0, 0, 0, 0],
        '2R': [0, 0, 0, 0],
        '3R': [0, 0, 0, 0]
    };
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.prevAlta) {
            let index = -1;
            let tipo = '';
            
            // Mapear previsão de alta para categoria e tipo
            if (leito.paciente.prevAlta === 'Hoje Ouro') { index = 0; tipo = 'Ouro'; }
            else if (leito.paciente.prevAlta === 'Hoje 2R') { index = 0; tipo = '2R'; }
            else if (leito.paciente.prevAlta === 'Hoje 3R') { index = 0; tipo = '3R'; }
            else if (leito.paciente.prevAlta === '24h Ouro') { index = 1; tipo = 'Ouro'; }
            else if (leito.paciente.prevAlta === '24h 2R') { index = 1; tipo = '2R'; }
            else if (leito.paciente.prevAlta === '24h 3R') { index = 1; tipo = '3R'; }
            else if (leito.paciente.prevAlta === '48h') { 
                index = 2; 
                // Para 48h, adicionar como Ouro (cor específica)
                dados['Ouro'][index]++; 
                return;
            }
            else if (leito.paciente.prevAlta === '72h') { 
                index = 3; 
                // Para 72h, adicionar como 2R (cor específica diferente)
                dados['2R'][index]++; 
                return;
            }
            
            if (index >= 0 && tipo && dados[tipo]) {
                dados[tipo][index]++;
            }
        }
    });
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [
                {
                    label: 'Ouro',
                    data: dados['Ouro'],
                    backgroundColor: '#fbbf24',
                    borderWidth: 0
                },
                {
                    label: '2R',
                    data: dados['2R'],
                    backgroundColor: '#3b82f6',
                    borderWidth: 0
                },
                {
                    label: '3R',
                    data: dados['3R'],
                    backgroundColor: '#8b5cf6',
                    borderWidth: 0
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
                    align: 'start',
                    labels: {
                        color: '#ffffff',
                        padding: 15,
                        font: { size: 12, weight: 600 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} beneficiários`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#e2e8f0',
                        font: { size: 12, weight: 600 },
                        maxRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#e2e8f0',
                        font: { size: 12, weight: 600 }
                    },
                    ticks: {
                        stepSize: 1,
                        color: '#e2e8f0',
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
    
    logInfo(`Gráfico de altas CORRIGIDO renderizado para ${hospitalId} com legenda embaixo`);
}

// *** CORREÇÃO: GRÁFICO DE CONCESSÕES COM FALLBACK LOCAL ***
function renderConcessoesHospital(hospitalId, type = 'scatter') {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    // *** PRIMEIRO: TENTAR USAR FUNÇÃO DO DASHBOARD.JS V4.0 ***
    if (window.renderGraficoConcessoesV4) {
        try {
            window.renderGraficoConcessoesV4(`graficoConcessoes${hospitalId}`, hospital, type);
            logInfo(`Gráfico de concessões V4.0 renderizado para ${hospitalId}: ${type}`);
            return;
        } catch (error) {
            logError(`Erro na função V4.0, usando fallback: ${error.message}`);
        }
    }
    
    // *** FALLBACK LOCAL SE V4.0 NÃO FUNCIONAR ***
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Processar dados localmente
    const concessoesCount = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
            const concessoesList = Array.isArray(leito.paciente.concessoes) ? 
                leito.paciente.concessoes : 
                String(leito.paciente.concessoes).split('|');
            
            concessoesList.forEach(concessao => {
                if (concessao && concessao.trim()) {
                    concessoesCount[concessao.trim()] = (concessoesCount[concessao.trim()] || 0) + 1;
                }
            });
        }
    });
    
    const concessoesOrdenadas = Object.entries(concessoesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    if (concessoesOrdenadas.length === 0) {
        return;
    }
    
    const labels = concessoesOrdenadas.map(([nome]) => nome);
    const valores = concessoesOrdenadas.map(([, count]) => count);
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {
        type: type === 'scatter' ? 'scatter' : type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiários',
                data: type === 'scatter' ? 
                    valores.map((value, index) => ({x: index, y: value})) : 
                    valores,
                backgroundColor: '#007A53',
                borderColor: '#007A53',
                borderWidth: type === 'line' ? 2 : 0,
                fill: type === 'area',
                tension: (type === 'line' || type === 'area') ? 0.4 : 0,
                pointRadius: type === 'scatter' ? 8 : 4
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#e2e8f0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 1,
                        color: '#e2e8f0',
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    };
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
    logInfo(`Gráfico de concessões LOCAL renderizado para ${hospitalId}: ${type}`);
}

// *** CORREÇÃO: GRÁFICO DE LINHAS COM FALLBACK LOCAL ***
function renderLinhasHospital(hospitalId, type = 'scatter') {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    // *** PRIMEIRO: TENTAR USAR FUNÇÃO DO DASHBOARD.JS V4.0 ***
    if (window.renderGraficoLinhasV4) {
        try {
            window.renderGraficoLinhasV4(`graficoLinhas${hospitalId}`, hospital, type);
            logInfo(`Gráfico de linhas V4.0 renderizado para ${hospitalId}: ${type}`);
            return;
        } catch (error) {
            logError(`Erro na função V4.0, usando fallback: ${error.message}`);
        }
    }
    
    // *** FALLBACK LOCAL SE V4.0 NÃO FUNCIONAR ***
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Processar dados localmente
    const linhasCount = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas) {
            const linhasList = Array.isArray(leito.paciente.linhas) ? 
                leito.paciente.linhas : 
                String(leito.paciente.linhas).split('|');
            
            linhasList.forEach(linha => {
                if (linha && linha.trim()) {
                    linhasCount[linha.trim()] = (linhasCount[linha.trim()] || 0) + 1;
                }
            });
        }
    });
    
    const linhasOrdenadas = Object.entries(linhasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    if (linhasOrdenadas.length === 0) {
        return;
    }
    
    const labels = linhasOrdenadas.map(([nome]) => nome);
    const valores = linhasOrdenadas.map(([, count]) => count);
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {
        type: type === 'scatter' ? 'scatter' : type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiários',
                data: type === 'scatter' ? 
                    valores.map((value, index) => ({x: index, y: value})) : 
                    valores,
                backgroundColor: '#ED0A72',
                borderColor: '#ED0A72',
                borderWidth: type === 'line' ? 2 : 0,
                fill: type === 'area',
                tension: (type === 'line' || type === 'area') ? 0.4 : 0,
                pointRadius: type === 'scatter' ? 8 : 4
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#e2e8f0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 1,
                        color: '#e2e8f0',
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    };
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
    logInfo(`Gráfico de linhas LOCAL renderizado para ${hospitalId}: ${type}`);
}

// =================== FUNÇÃO DE FORÇA DE ATUALIZAÇÃO - APENAS DADOS REAIS ===================
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares REAIS...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    Recarregando dados reais da API...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Conectando com Google Apps Script V4.0
                </div>
            </div>
        `;
    }
    
    // Tentar recarregar dados reais
    if (window.loadHospitalData) {
        window.loadHospitalData().then(() => {
            setTimeout(() => {
                window.renderDashboardHospitalar();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            window.renderDashboardHospitalar();
        }, 2000);
    }
};

// =================== CSS COMPLETO PARA DASHBOARD HOSPITALAR - LAYOUT HORIZONTAL ===================
function getHospitalCSS() {
    return `
        <style id="hospitalCSS">
            /* LAYOUT PRINCIPAL - VERTICAL */
            .hospitais-container {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }
            
            .hospital-card {
                background: #1a1f2e;
                border-radius: 16px;
                padding: 25px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            .hospital-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }
            
            .hospital-header {
                margin-bottom: 25px;
            }
            
            .hospital-title {
                color: #60a5fa;
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 20px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* *** CORREÇÃO: KPIs LAYOUT HORIZONTAL IGUAL AO EXECUTIVO *** */
            .kpis-horizontal-container {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 16px;
                margin-bottom: 30px;
                padding: 0;
                background: transparent;
                border-radius: 0;
            }
            
            .kpi-box-inline {
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
                min-height: 100px;
            }
            
            .kpi-box-inline:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-gauge-box {
                position: relative;
            }
            
            .kpi-gauge-box canvas {
                margin-bottom: 8px;
                max-width: 80px;
                max-height: 40px;
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
            
            /* LAYOUT VERTICAL DOS GRÁFICOS */
            .graficos-verticais {
                display: flex;
                flex-direction: column;
                gap: 25px;
                width: 100%;
            }
            
            .grafico-item {
                width: 100%;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                padding: 20px;
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
                color: #e2e8f0;
                font-size: 16px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .chart-controls {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }
            
            .chart-btn {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #e2e8f0;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
            }
            
            .chart-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: #60a5fa;
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
                width: 100%;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                padding: 15px;
                box-sizing: border-box;
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 100% !important;
                max-height: 370px !important;
                max-width: calc(100% - 30px) !important;
                object-fit: contain;
            }
            
            /* RESPONSIVIDADE */
            @media (max-width: 1200px) {
                .kpis-horizontal-container {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            
            @media (max-width: 768px) {
                .kpis-horizontal-container {
                    grid-template-columns: 1fr;
                    gap: 10px;
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
                
                .chart-container canvas {
                    max-height: 270px !important;
                }
            }
        </style>
    `;
}

console.log('Dashboard Hospitalar V4.0 COMPLETO CORRIGIDO - Layout horizontal KPIs + Dados reais + Gráficos V4.0 carregado');

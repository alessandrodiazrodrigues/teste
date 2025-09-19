// =================== DASHBOARD HOSPITALAR - VERSÃO COMPLETA CORRIGIDA ===================

// Estado dos gráficos selecionados por hospital (APENAS 4 TIPOS)
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' }
};

// *** PALETA DE CORES PANTONE PARA CONCESSÕES ***
const CORES_CONCESSOES = {
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

// *** PALETA DE CORES PANTONE PARA LINHAS DE CUIDADO ***
const CORES_LINHAS = {
    'Assiste': '#ED0A72',
    'APS': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO': '#A6192E',
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

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar V4.0 - RESTAURANDO VERSÃO FUNCIONANDO');
    
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
    
    // *** HTML COMPLETO - MANTENDO ESTRUTURA ORIGINAL ***
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
                    
                    // Renderizar gráfico COM TIPO CORRETO
                    if (chart === 'preditivos') {
                        renderAltasHospital(hospital); // MANTENDO ORIGINAL
                    } else if (chart === 'concessoes') {
                        renderConcessoesHospital(hospital, type); // APENAS ESTAS DUAS
                    } else if (chart === 'linhas') {
                        renderLinhasHospital(hospital, type); // SERÃO MODIFICADAS
                    }
                    
                    logInfo(`Gráfico alterado: ${hospital} - ${chart} - ${type}`);
                });
            });
            
            // Renderizar todos os gráficos iniciais
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId); // MANTENDO ORIGINAL
                renderAltasHospital(hospitalId); // MANTENDO ORIGINAL
                renderConcessoesHospital(hospitalId, 'bar'); // CORRIGINDO
                renderLinhasHospital(hospitalId, 'bar'); // CORRIGINDO
            });
            
            logSuccess('Dashboard Hospitalar V4.0 renderizado - versão restaurada');
        }, 100);
    };
    
    aguardarChartJS();
};

// =================== RENDERIZAR SEÇÃO DE UM HOSPITAL - MANTENDO ORIGINAL ===================
function renderHospitalSection(hospitalId) {
    const hospital = CONFIG.HOSPITAIS[hospitalId];
    const kpis = calcularKPIsHospital(hospitalId);
    
    return `
        <div class="hospital-card" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3 class="hospital-title">${hospital.nome}</h3>
                
                <!-- KPIs EM LAYOUT HORIZONTAL - MANTENDO ORIGINAL -->
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
                <!-- Gráfico de Altas - MANTENDO ORIGINAL -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Análise Preditiva de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Concessões - APENAS 4 TIPOS -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessões Previstas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="scatter">Bolinhas</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="line">Linha</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="area">Área</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoes${hospitalId}" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Linhas - APENAS 4 TIPOS -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="scatter">Bolinhas</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="line">Linha</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="area">Área</button>
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

// =================== CALCULAR KPIs DE UM HOSPITAL - MANTENDO ORIGINAL ===================
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    // Somar todos os tipos de leito
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
    
    // Usar timeline V4.0 corrigida
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

// =================== GAUGE DO HOSPITAL - MANTENDO ORIGINAL ===================
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

// *** GRÁFICO DE ALTAS - MANTENDO VERSÃO ORIGINAL QUE FUNCIONAVA ***
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
    
    // Eixos exatos - HOJE, 24H, 48H, 72H, 96H (5 COLUNAS)
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    // Separar HOJE e 24H em Ouro/2R/3R, outros com cores únicas
    const dados = {
        'Ouro': [0, 0, 0, 0, 0],
        '2R': [0, 0, 0, 0, 0],
        '3R': [0, 0, 0, 0, 0],
        '48H': [0, 0, 0, 0, 0], // Cor específica para 48H
        '72H': [0, 0, 0, 0, 0], // Cor específica para 72H
        '96H': [0, 0, 0, 0, 0]  // Cor específica para 96H
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
                index = 2; tipo = '48H'; // *** COR ESPECÍFICA PARA 48H ***
            }
            else if (leito.paciente.prevAlta === '72h') { 
                index = 3; tipo = '72H'; // *** COR ESPECÍFICA PARA 72H ***
            }
            else if (leito.paciente.prevAlta === '96h') { 
                index = 4; tipo = '96H'; // *** COR ESPECÍFICA PARA 96H ***
            }
            
            if (index >= 0 && tipo && dados[tipo]) {
                dados[tipo][index]++;
            }
        }
    });
    
    // CALCULAR VALOR MÁXIMO PARA EIXO Y +1 (REFORÇADO)
    const todosDados = [...dados['Ouro'], ...dados['2R'], ...dados['3R'], ...dados['48H'], ...dados['72H'], ...dados['96H']];
    const valorMaximo = Math.max(...todosDados, 0); // Garantir pelo menos 0
    const limiteSuperior = valorMaximo + 1; // SEMPRE +1
    
    logInfo(`Gráfico Altas ${hospitalId}: max=${valorMaximo}, limite=${limiteSuperior}`);
    
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
                },
                {
                    label: '48H',
                    data: dados['48H'],
                    backgroundColor: '#10b981', // *** COR VERDE PARA 48H ***
                    borderWidth: 0
                },
                {
                    label: '72H',
                    data: dados['72H'],
                    backgroundColor: '#f59e0b', // *** COR LARANJA PARA 72H ***
                    borderWidth: 0
                },
                {
                    label: '96H',
                    data: dados['96H'],
                    backgroundColor: '#ef4444', // *** COR VERMELHA PARA 96H ***
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // BARRAS MAIS FINAS
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            // *** FORÇAR MESMA PROPORÇÃO DOS OUTROS GRÁFICOS ***
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    // *** FORÇAR UMA LEGENDA POR LINHA ***
                    maxWidth: 150,
                    labels: {
                        color: '#ffffff',
                        padding: 25, // Maior espaçamento vertical
                        font: { size: 13, weight: 600 }, // *** FONTE 15% MAIOR ***
                        usePointStyle: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        textAlign: 'left'
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
                    // EIXO Y SEMPRE +1 (FORÇADO)
                    max: limiteSuperior,
                    min: 0,
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
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
    
    logInfo(`Gráfico de altas ORIGINAL renderizado para ${hospitalId}`);
}

// *** CORREÇÃO APENAS AQUI: GRÁFICO DE CONCESSÕES ***
function renderConcessoesHospital(hospitalId, type = 'bar') {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // EIXO X: HOJE, 24H, 48H, 72H, 96H
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    // Processar dados por concessão e timeline
    const concessoesPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes && leito.paciente.prevAlta) {
            const concessoesList = Array.isArray(leito.paciente.concessoes) ? 
                leito.paciente.concessoes : 
                String(leito.paciente.concessoes).split('|');
            
            // Mapear prevAlta para timeline
            let timelineIndex = -1;
            if (leito.paciente.prevAlta.includes('Hoje')) timelineIndex = 0; // HOJE (soma Ouro+2R+3R)
            else if (leito.paciente.prevAlta.includes('24h')) timelineIndex = 1; // 24H (soma Ouro+2R+3R)
            else if (leito.paciente.prevAlta === '48h') timelineIndex = 2; // 48H
            else if (leito.paciente.prevAlta === '72h') timelineIndex = 3; // 72H
            else if (leito.paciente.prevAlta === '96h') timelineIndex = 4; // 96H
            
            if (timelineIndex >= 0) {
                concessoesList.forEach(concessao => {
                    if (concessao && concessao.trim()) {
                        const nome = concessao.trim();
                        if (!concessoesPorTimeline[nome]) {
                            concessoesPorTimeline[nome] = [0, 0, 0, 0, 0];
                        }
                        concessoesPorTimeline[nome][timelineIndex]++;
                    }
                });
            }
        }
    });
    
    // Ordenar concessões por total
    const concessoesOrdenadas = Object.entries(concessoesPorTimeline)
        .map(([nome, dados]) => [nome, dados, dados.reduce((a, b) => a + b, 0)])
        .sort((a, b) => b[2] - a[2])
        .slice(0, 6);
    
    if (concessoesOrdenadas.length === 0) return;
    
    // CALCULAR VALOR MÁXIMO PARA EIXO Y +1 (REFORÇADO)
    const todosValores = concessoesOrdenadas.flatMap(([, dados]) => dados);
    const valorMaximo = Math.max(...todosValores, 0); // Garantir pelo menos 0
    const limiteSuperior = valorMaximo + 1; // SEMPRE +1
    
    logInfo(`Gráfico Concessões ${hospitalId}: max=${valorMaximo}, limite=${limiteSuperior}`);
    
    // CRIAR UMA DATASET POR CONCESSÃO
    const datasets = concessoesOrdenadas.map(([nome, dados]) => {
        const cor = CORES_CONCESSOES[nome] || '#007A53';
        
        if (type === 'scatter') {
            // *** PARA SCATTER: MAPEAR VALORES > 0 PARA POSIÇÕES CORRETAS ***
            const pontosValidos = [];
            dados.forEach((value, timelineIndex) => {
                if (value > 0) { // Só adicionar se valor > 0
                    pontosValidos.push(value); // Para gráfico category, usar valor direto
                }
            });
            
            // Se não há pontos válidos, retornar dataset vazio mas visível na legenda
            return {
                label: nome,
                data: pontosValidos.length > 0 ? dados.map(v => v > 0 ? v : null) : [],
                backgroundColor: cor,
                pointRadius: 8,
                showLine: false,
                spanGaps: false
            };
        } else if (type === 'line') {
            return {
                label: nome,
                data: dados,
                backgroundColor: 'transparent',
                borderColor: cor,
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 4
            };
        } else if (type === 'area') {
            return {
                label: nome,
                data: dados,
                backgroundColor: cor + '4D',
                borderColor: cor,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4
            };
        } else {
            return {
                label: nome,
                data: dados,
                backgroundColor: cor,
                borderWidth: 0
            };
        }
    });
    
    const ctx = canvas.getContext('2d');
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: type === 'scatter' ? 'scatter' : type === 'area' ? 'line' : type,
        data: {
            labels: categorias,
            datasets: datasets
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            // *** FORÇAR MESMA PROPORÇÃO DOS OUTROS GRÁFICOS ***
            aspectRatio: 2,
            plugins: {
                legend: { 
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    // *** FORÇAR UMA LEGENDA POR LINHA ***
                    maxWidth: 150,
                    labels: {
                        color: '#ffffff', // *** FONTE BRANCA FORÇADA ***
                        padding: 25, // Maior espaçamento vertical
                        font: { size: 13, weight: 500 }, // *** FONTE 15% MAIOR ***
                        usePointStyle: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        textAlign: 'left'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const value = Math.round(context.parsed.y || context.parsed);
                            return `${context.dataset.label}: ${value} beneficiário${value !== 1 ? 's' : ''}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category', // *** SEMPRE CATEGORY PARA MOSTRAR LABELS ***
                    stacked: false, // *** BARRAS AGRUPADAS, NÃO EMPILHADAS ***
                    ticks: { 
                        color: '#e2e8f0',
                        font: { size: 12, weight: 600 },
                        maxRotation: 0
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    stacked: false, // *** BARRAS AGRUPADAS, NÃO EMPILHADAS ***
                    // *** FORÇAR EIXO Y SEMPRE +1 (CRÍTICO) ***
                    max: limiteSuperior,
                    min: 0,
                    suggestedMax: limiteSuperior, // Dupla garantia
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#e2e8f0',
                        font: { size: 12, weight: 600 }
                    },
                    ticks: { 
                        stepSize: 1,
                        max: limiteSuperior, // Tripla garantia
                        color: '#e2e8f0',
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 && value <= limiteSuperior ? value : '';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
    
    logInfo(`Gráfico de concessões CORRIGIDO: ${type} - timeline + cores`);
}

// *** CORREÇÃO APENAS AQUI: GRÁFICO DE LINHAS ***
function renderLinhasHospital(hospitalId, type = 'bar') {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // EIXO X: HOJE, 24H, 48H, 72H, 96H
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    // Processar dados por linha de cuidado e timeline
    const linhasPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas && leito.paciente.prevAlta) {
            const linhasList = Array.isArray(leito.paciente.linhas) ? 
                leito.paciente.linhas : 
                String(leito.paciente.linhas).split('|');
            
            // Mapear prevAlta para timeline
            let timelineIndex = -1;
            if (leito.paciente.prevAlta.includes('Hoje')) timelineIndex = 0; // HOJE (soma Ouro+2R+3R)
            else if (leito.paciente.prevAlta.includes('24h')) timelineIndex = 1; // 24H (soma Ouro+2R+3R)
            else if (leito.paciente.prevAlta === '48h') timelineIndex = 2; // 48H
            else if (leito.paciente.prevAlta === '72h') timelineIndex = 3; // 72H
            else if (leito.paciente.prevAlta === '96h') timelineIndex = 4; // 96H
            
            if (timelineIndex >= 0) {
                linhasList.forEach(linha => {
                    if (linha && linha.trim()) {
                        const nome = linha.trim();
                        if (!linhasPorTimeline[nome]) {
                            linhasPorTimeline[nome] = [0, 0, 0, 0, 0];
                        }
                        linhasPorTimeline[nome][timelineIndex]++;
                    }
                });
            }
        }
    });
    
    // Ordenar linhas por total
    const linhasOrdenadas = Object.entries(linhasPorTimeline)
        .map(([nome, dados]) => [nome, dados, dados.reduce((a, b) => a + b, 0)])
        .sort((a, b) => b[2] - a[2])
        .slice(0, 6);
    
    if (linhasOrdenadas.length === 0) return;
    
    // CALCULAR VALOR MÁXIMO PARA EIXO Y +1
    const todosValores = linhasOrdenadas.flatMap(([, dados]) => dados);
    const valorMaximo = Math.max(...todosValores);
    const limiteSuperior = valorMaximo + 1;
    
    // CRIAR UMA DATASET POR LINHA DE CUIDADO
    const datasets = linhasOrdenadas.map(([nome, dados]) => {
        const cor = CORES_LINHAS[nome] || '#ED0A72';
        
        if (type === 'scatter') {
            return {
                label: nome,
                data: dados.map((value, index) => ({ x: index, y: value })),
                backgroundColor: cor,
                pointRadius: 8,
                showLine: false
            };
        } else if (type === 'line') {
            return {
                label: nome,
                data: dados,
                backgroundColor: 'transparent',
                borderColor: cor,
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 4
            };
        } else if (type === 'area') {
            return {
                label: nome,
                data: dados,
                backgroundColor: cor + '4D',
                borderColor: cor,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4
            };
        } else {
            return {
                label: nome,
                data: dados,
                backgroundColor: cor,
                borderWidth: 0
            };
        }
    });
    
    const ctx = canvas.getContext('2d');
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: type === 'scatter' ? 'scatter' : type === 'area' ? 'line' : type,
        data: {
            labels: categorias,
            datasets: datasets
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            // *** FORÇAR MESMA PROPORÇÃO DOS OUTROS GRÁFICOS ***
            aspectRatio: 2,
            plugins: {
                legend: { 
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    // *** FORÇAR UMA LEGENDA POR LINHA ***
                    maxWidth: 150,
                    labels: {
                        color: '#ffffff', // *** FONTE BRANCA FORÇADA ***
                        padding: 25, // Maior espaçamento vertical
                        font: { size: 13, weight: 500 }, // *** FONTE 15% MAIOR ***
                        usePointStyle: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        textAlign: 'left'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const value = Math.round(context.parsed.y || context.parsed);
                            return `${context.dataset.label}: ${value} beneficiário${value !== 1 ? 's' : ''}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: type === 'scatter' ? 'linear' : 'category',
                    stacked: type === 'bar',
                    ticks: { 
                        color: '#e2e8f0',
                        font: { size: 12, weight: 600 },
                        maxRotation: 0
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    stacked: type === 'bar',
                    // *** FORÇAR EIXO Y SEMPRE +1 (CRÍTICO) ***
                    max: limiteSuperior,
                    min: 0,
                    suggestedMax: limiteSuperior, // Dupla garantia
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#e2e8f0',
                        font: { size: 12, weight: 600 }
                    },
                    ticks: { 
                        stepSize: 1,
                        max: limiteSuperior, // Tripla garantia
                        color: '#e2e8f0',
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 && value <= limiteSuperior ? value : '';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
    
    logInfo(`Gráfico de linhas CORRIGIDO: ${type} - timeline + cores`);
}

// =================== FUNÇÃO DE FORÇA DE ATUALIZAÇÃO - MANTENDO ORIGINAL ===================
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

// =================== CSS COMPLETO - MANTENDO ORIGINAL ===================
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
            
            /* KPIs LAYOUT HORIZONTAL */
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
                max-width: 100%; /* *** FORÇAR LARGURA IGUAL ****/
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
            
            /* *** GARANTIR LARGURA UNIFORME DOS GRÁFICOS *** */
            .grafico-item {
                width: 100%;
                max-width: 100%;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-sizing: border-box;
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

console.log('Dashboard Hospitalar V4.0 RESTAURADO - Apenas concessões e linhas corrigidas');

// =================== DASHBOARD HOSPITALAR - VERSÃO COMPLETA CORRIGIDA ===================

// Estado dos gráficos selecionados por hospital
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar' }
};

// Estado global para fundo branco
window.fundoBranco = false;

// Paleta de cores Pantone para Concessões
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

// Paleta de cores Pantone para Linhas de Cuidado
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
    logInfo('Renderizando Dashboard Hospitalar');
    
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
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Hospitalar');
            return;
        }
    }
    
    // Verificar dados reais
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados reais da API</h2>
                <p style="color: #9ca3af; font-size: 14px;">Conectando com Google Apps Script...</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">Somente dados reais são exibidos</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 3000);
        return;
    }
    
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
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <h2 style="margin: 0; color: #60a5fa; font-size: 24px; font-weight: 700;">Dashboard Hospitalar</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button id="toggleFundoBtn" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span id="toggleIcon">🌙</span>
                        <span id="toggleText">ESCURO</span>
                    </button>
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 14px;">
                        <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
                        ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'ais' : ''} com dados reais
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <strong style="color: #22c55e;">Dados Reais da Planilha</strong>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 14px;">
                    Hospitais: ${hospitaisComDados.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')} • Atualizado em ${hoje}
                </p>
            </div>
            
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
            
            .toggle-fundo-btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-1px);
            }
            
            .toggle-fundo-btn.active {
                background: #f59e0b !important;
                border-color: #f59e0b !important;
                color: #000000 !important;
            }
        </style>
    `;
    
    const toggleBtn = document.getElementById('toggleFundoBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            window.fundoBranco = !window.fundoBranco;
            
            const icon = document.getElementById('toggleIcon');
            const text = document.getElementById('toggleText');
            
            if (window.fundoBranco) {
                toggleBtn.classList.add('active');
                icon.textContent = '☀️';
                text.textContent = 'CLARO';
            } else {
                toggleBtn.classList.remove('active');
                icon.textContent = '🌙';
                text.textContent = 'ESCURO';
            }
            
            hospitaisComDados.forEach(hospitalId => {
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId, window.graficosState[hospitalId]?.concessoes || 'bar');
                renderLinhasHospital(hospitalId, window.graficosState[hospitalId]?.linhas || 'bar');
            });
            
            logInfo(`Fundo alterado para: ${window.fundoBranco ? 'claro' : 'escuro'}`);
        });
    }
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            document.querySelectorAll('[data-hospital][data-chart][data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const hospital = e.target.dataset.hospital;
                    const chart = e.target.dataset.chart;
                    const type = e.target.dataset.type;
                    
                    const grupo = e.target.parentElement;
                    grupo.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (!window.graficosState[hospital]) {
                        window.graficosState[hospital] = { concessoes: 'bar', linhas: 'bar' };
                    }
                    window.graficosState[hospital][chart] = type;
                    
                    if (chart === 'concessoes') {
                        renderConcessoesHospital(hospital, type);
                    } else if (chart === 'linhas') {
                        renderLinhasHospital(hospital, type);
                    }
                    
                    logInfo(`Gráfico alterado: ${hospital} - ${chart} - ${type}`);
                });
            });
            
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId, 'bar');
                renderLinhasHospital(hospitalId, 'bar');
            });
            
            logSuccess('Dashboard Hospitalar renderizado');
        }, 100);
    };
    
    aguardarChartJS();
};

function renderHospitalSection(hospitalId) {
    const hospital = CONFIG.HOSPITAIS[hospitalId];
    // *** CORREÇÃO: Chamar a função com nome único ***
    const kpis = calcularKPIsParaHospitalDashboard(hospitalId);
    
    return `
        <div class="hospital-card" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3 class="hospital-title">${hospital.nome}</h3>
                
                <div class="kpis-horizontal-container">
                    <div class="kpi-box-inline kpi-gauge-box">
                        <canvas id="gauge${hospitalId}" width="80" height="40"></canvas>
                        <div class="kpi-value">${kpis.ocupacao}%</div>
                        <div class="kpi-label">OCUPAÇÃO</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.total}</div>
                        <div class="kpi-label">TOTAL</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.ocupados}</div>
                        <div class="kpi-label">OCUPADOS</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.vagos}</div>
                        <div class="kpi-label">VAGOS</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.altas}</div>
                        <div class="kpi-label">EM ALTA</div>
                    </div>
                </div>
            </div>
            
            <div class="graficos-verticais">
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Análise Preditiva de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                </div>
                
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
                        <canvas id="graficoConcessoes${hospitalId}"></canvas>
                    </div>
                </div>
                
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
                        <canvas id="graficoLinhas${hospitalId}"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// *** CORREÇÃO: Função renomeada e lógica de "altas" corrigida ***
function calcularKPIsParaHospitalDashboard(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    const total = hospital.leitos.length;
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;

    // *** LÓGICA CORRIGIDA: Contar apenas altas previstas para HOJE, conforme manual ***
    const TIMELINE_ALTA_HOJE = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'];
    const altas = hospital.leitos.filter(l => 
        l.status === 'ocupado' && 
        l.paciente && 
        l.paciente.prevAlta && 
        TIMELINE_ALTA_HOJE.includes(l.paciente.prevAlta)
    ).length;
    
    return { ocupacao, total, ocupados, vagos, altas };
}

// Plugin para fundo branco/escuro nos gráficos (NÃO usado no gauge)
const backgroundPlugin = {
    id: 'customBackground',
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

// Gauge do hospital (SEM plugin de background)
function renderGaugeHospital(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const kpis = calcularKPIsParaHospitalDashboard(hospitalId);
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
    } catch (error) {
        logError(`Erro ao renderizar gauge ${hospitalId}:`, error);
    }
}

// Gráfico de Altas
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
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const dados = {
        'Ouro': [0, 0, 0, 0, 0],
        '2R': [0, 0, 0, 0, 0],
        '3R': [0, 0, 0, 0, 0],
        '48H': [0, 0, 0, 0, 0],
        '72H': [0, 0, 0, 0, 0],
        '96H': [0, 0, 0, 0, 0]
    };
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.prevAlta) {
            let index = -1;
            let tipo = '';
            
            if (leito.paciente.prevAlta === 'Hoje Ouro') { index = 0; tipo = 'Ouro'; }
            else if (leito.paciente.prevAlta === 'Hoje 2R') { index = 0; tipo = '2R'; }
            else if (leito.paciente.prevAlta === 'Hoje 3R') { index = 0; tipo = '3R'; }
            else if (leito.paciente.prevAlta === '24h Ouro') { index = 1; tipo = 'Ouro'; }
            else if (leito.paciente.prevAlta === '24h 2R') { index = 1; tipo = '2R'; }
            else if (leito.paciente.prevAlta === '24h 3R') { index = 1; tipo = '3R'; }
            else if (leito.paciente.prevAlta === '48h') { index = 2; tipo = '48H'; }
            else if (leito.paciente.prevAlta === '72h') { index = 3; tipo = '72H'; }
            else if (leito.paciente.prevAlta === '96h') { index = 4; tipo = '96H'; }
            
            if (index >= 0 && tipo && dados[tipo]) {
                dados[tipo][index]++;
            }
        }
    });
    
    const todosDados = [...dados['Ouro'], ...dados['2R'], ...dados['3R'], ...dados['48H'], ...dados['72H'], ...dados['96H']];
    const valorMaximo = Math.max(...todosDados, 0);
    const limiteSuperior = valorMaximo + 1;
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [
                { label: 'Ouro', data: dados['Ouro'], backgroundColor: '#fbbf24', borderWidth: 0 },
                { label: '2R', data: dados['2R'], backgroundColor: '#3b82f6', borderWidth: 0 },
                { label: '3R', data: dados['3R'], backgroundColor: '#8b5cf6', borderWidth: 0 },
                { label: '48H', data: dados['48H'], backgroundColor: '#10b981', borderWidth: 0 },
                { label: '72H', data: dados['72H'], backgroundColor: '#f59e0b', borderWidth: 0 },
                { label: '96H', data: dados['96H'], backgroundColor: '#ef4444', borderWidth: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: {
                        color: corTexto,
                        padding: 15,
                        font: { size: 13, weight: 600 },
                        usePointStyle: true,
                        pointStyle: 'rect',
                        boxWidth: 12,
                        boxHeight: 12
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
                        color: corTexto,
                        font: { size: 12, weight: 600 },
                        maxRotation: 0
                    },
                    grid: { color: corGrid }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: limiteSuperior,
                    min: 0,
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
}

// Gráfico de Concessões
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
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const concessoesPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes && leito.paciente.prevAlta) {
            const concessoesList = Array.isArray(leito.paciente.concessoes) ? 
                leito.paciente.concessoes : 
                String(leito.paciente.concessoes).split('|');
            
            let timelineIndex = -1;
            if (leito.paciente.prevAlta.includes('Hoje')) timelineIndex = 0;
            else if (leito.paciente.prevAlta.includes('24h')) timelineIndex = 1;
            else if (leito.paciente.prevAlta === '48h') timelineIndex = 2;
            else if (leito.paciente.prevAlta === '72h') timelineIndex = 3;
            else if (leito.paciente.prevAlta === '96h') timelineIndex = 4;
            
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
    
    const concessoesOrdenadas = Object.entries(concessoesPorTimeline)
        .map(([nome, dados]) => [nome, dados, dados.reduce((a, b) => a + b, 0)])
        .sort((a, b) => b[2] - a[2])
        .slice(0, 6);
    
    if (concessoesOrdenadas.length === 0) return;
    
    const todosValores = concessoesOrdenadas.flatMap(([, dados]) => dados);
    const valorMaximo = Math.max(...todosValores, 0);
    const limiteSuperior = valorMaximo + 1;
    
    const datasets = concessoesOrdenadas.map(([nome, dados]) => {
        const cor = CORES_CONCESSOES[nome] || '#007A53';
        
        if (type === 'scatter') {
            const scatterData = [];
            dados.forEach((valor, index) => {
                if (valor > 0) {
                    scatterData.push({ x: index, y: valor });
                }
            });
            return {
                label: nome,
                data: scatterData,
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
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    
    const scatterOptions = type === 'scatter' ? {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                min: -0.5,
                max: 4.5,
                ticks: {
                    stepSize: 1,
                    color: corTexto,
                    font: { size: 12, weight: 600 },
                    callback: function(value) {
                        const index = Math.round(value);
                        return categorias[index] || '';
                    }
                },
                grid: { color: corGrid }
            },
            y: {
                beginAtZero: true,
                max: limiteSuperior,
                min: 0,
                title: { display: true, text: 'Beneficiários', color: corTexto, font: { size: 12, weight: 600 } },
                ticks: { stepSize: 1, color: corTexto, font: { size: 11 }, callback: function(value) { return Number.isInteger(value) && value >= 0 ? value : ''; } },
                grid: { color: corGrid }
            }
        }
    } : {
        scales: {
            x: { stacked: false, ticks: { color: corTexto, font: { size: 12, weight: 600 }, maxRotation: 0 }, grid: { color: corGrid } },
            y: {
                beginAtZero: true,
                stacked: false,
                max: limiteSuperior,
                min: 0,
                title: { display: true, text: 'Beneficiários', color: corTexto, font: { size: 12, weight: 600 } },
                ticks: { stepSize: 1, color: corTexto, font: { size: 11 }, callback: function(value) { return Number.isInteger(value) && value >= 0 ? value : ''; } },
                grid: { color: corGrid }
            }
        }
    };
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: type === 'scatter' ? 'scatter' : type === 'area' ? 'line' : type,
        data: {
            labels: type === 'scatter' ? undefined : categorias,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: { color: corTexto, padding: 15, font: { size: 13, weight: 500 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 12, boxHeight: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${value} beneficiário${value !== 1 ? 's' : ''}`;
                        }
                    }
                }
            },
            ...scatterOptions
        },
        plugins: [backgroundPlugin]
    });
}

// Gráfico de Linhas
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
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const linhasPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas && leito.paciente.prevAlta) {
            const linhasList = Array.isArray(leito.paciente.linhas) ? 
                leito.paciente.linhas : 
                String(leito.paciente.linhas).split('|');
            
            let timelineIndex = -1;
            if (leito.paciente.prevAlta.includes('Hoje')) timelineIndex = 0;
            else if (leito.paciente.prevAlta.includes('24h')) timelineIndex = 1;
            else if (leito.paciente.prevAlta === '48h') timelineIndex = 2;
            else if (leito.paciente.prevAlta === '72h') timelineIndex = 3;
            else if (leito.paciente.prevAlta === '96h') timelineIndex = 4;
            
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
    
    const linhasOrdenadas = Object.entries(linhasPorTimeline)
        .map(([nome, dados]) => [nome, dados, dados.reduce((a, b) => a + b, 0)])
        .sort((a, b) => b[2] - a[2])
        .slice(0, 6);
    
    if (linhasOrdenadas.length === 0) return;
    
    const todosValores = linhasOrdenadas.flatMap(([, dados]) => dados);
    const valorMaximo = Math.max(...todosValores);
    const limiteSuperior = valorMaximo + 1;
    
    const datasets = linhasOrdenadas.map(([nome, dados]) => {
        const cor = CORES_LINHAS[nome] || '#ED0A72';
        
        if (type === 'scatter') {
            const scatterData = [];
            dados.forEach((valor, index) => {
                if (valor > 0) {
                    scatterData.push({ x: index, y: valor });
                }
            });
            return {
                label: nome,
                data: scatterData,
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
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    
    const scatterOptions = type === 'scatter' ? {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                min: -0.5,
                max: 4.5,
                ticks: {
                    stepSize: 1,
                    color: corTexto,
                    font: { size: 12, weight: 600 },
                    callback: function(value) {
                        const index = Math.round(value);
                        return categorias[index] || '';
                    }
                },
                grid: { color: corGrid }
            },
            y: {
                beginAtZero: true,
                max: limiteSuperior,
                min: 0,
                title: { display: true, text: 'Beneficiários', color: corTexto, font: { size: 12, weight: 600 } },
                ticks: { stepSize: 1, color: corTexto, font: { size: 11 }, callback: function(value) { return Number.isInteger(value) && value >= 0 ? value : ''; } },
                grid: { color: corGrid }
            }
        }
    } : {
        scales: {
            x: { stacked: false, ticks: { color: corTexto, font: { size: 12, weight: 600 }, maxRotation: 0 }, grid: { color: corGrid } },
            y: {
                beginAtZero: true,
                stacked: false,
                max: limiteSuperior,
                min: 0,
                title: { display: true, text: 'Beneficiários', color: corTexto, font: { size: 12, weight: 600 } },
                ticks: { stepSize: 1, color: corTexto, font: { size: 11 }, callback: function(value) { return Number.isInteger(value) && value >= 0 ? value : ''; } },
                grid: { color: corGrid }
            }
        }
    };
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: type === 'scatter' ? 'scatter' : type === 'area' ? 'line' : type,
        data: {
            labels: type === 'scatter' ? undefined : categorias,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: { color: corTexto, padding: 15, font: { size: 13, weight: 500 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 12, boxHeight: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${value} beneficiário${value !== 1 ? 's' : ''}`;
                        }
                    }
                }
            },
            ...scatterOptions
        },
        plugins: [backgroundPlugin]
    });
}

// Função de força de atualização
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (container) {
        container.innerHTML = `<div style="text-align: center; padding: 50px;"><div style="color: #60a5fa; font-size: 18px;">Recarregando dados...</div></div>`;
    }
    
    if (window.loadHospitalData) {
        window.loadHospitalData().then(() => {
            setTimeout(() => {
                window.renderDashboardHospitalar();
            }, 1000);
        });
    }
};

// CSS completo
function getHospitalCSS() {
    return `
        <style id="hospitalCSS">
            .hospitais-container { display: flex; flex-direction: column; gap: 30px; }
            .hospital-card { background: #1a1f2e; border-radius: 16px; padding: 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); }
            .hospital-header { margin-bottom: 25px; }
            .hospital-title { color: #60a5fa; font-size: 20px; font-weight: 700; text-transform: uppercase; }
            .kpis-horizontal-container { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
            .kpi-box-inline { text-align: center; }
            .kpi-value { font-size: 28px; font-weight: 700; color: white; }
            .kpi-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; }
            .graficos-verticais { display: flex; flex-direction: column; gap: 25px; }
            .grafico-item { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; }
            .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .chart-header h4 { color: #e2e8f0; }
            .chart-controls { display: flex; gap: 6px; }
            .chart-btn { padding: 6px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; }
            .chart-btn.active { background: #60a5fa; }
            .chart-container { position: relative; height: 400px; }
            @media (max-width: 768px) { .kpis-horizontal-container { grid-template-columns: 1fr; } }
        </style>
    `;
}

console.log('Dashboard Hospitalar - Versão Final Corrigida');

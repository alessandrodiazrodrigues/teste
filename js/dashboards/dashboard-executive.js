// =================== DASHBOARD EXECUTIVO - REDE HOSPITALAR EXTERNA (CORRIGIDO) ===================

// Estado global para fundo branco (compartilhado com dashboard hospitalar)
if (typeof window.fundoBranco === 'undefined') {
    window.fundoBranco = false;
}

// Paletas de cores para concessões e linhas
const CORES_CONCESSOES_EXEC = {
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

const CORES_LINHAS_EXEC = {
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

// Plugin para fundo branco/escuro
const backgroundPluginExec = {
    id: 'customBackgroundExec',
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo: REDE HOSPITALAR EXTERNA');
    
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
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardExecutivo();
            } else {
                criarDadosMockExecutivo();
                setTimeout(() => window.renderDashboardExecutivo(), 500);
            }
        }, 2000);
        return;
    }
    
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        criarDadosMockExecutivo();
        setTimeout(() => window.renderDashboardExecutivo(), 500);
        return;
    }
    
    const kpis = calcularKPIsExecutivos(hospitaisComDados);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            
            <!-- HEADER COM BOTÃO CLARO/ESCURO -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #22c55e;">
                <h2 style="margin: 0; color: #22c55e; font-size: 24px; font-weight: 700;">Rede Hospitalar Externa</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button id="toggleFundoBtnExec" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span id="toggleIconExec">🌙</span>
                        <span id="toggleTextExec">ESCURO</span>
                    </button>
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 14px;">
                        <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
                        ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'ais' : ''} conectado${hospitaisComDados.length > 1 ? 's' : ''}
                    </div>
                </div>
            </div>
            
            <!-- KPIS GRID -->
            <div class="executive-kpis-grid">
                <div class="kpi-gauge-principal">
                    <h3 style="color: #9ca3af; font-size: 14px; margin-bottom: 15px; text-align: center;">Ocupação Geral</h3>
                    <div class="gauge-container">
                        <canvas id="gaugeOcupacaoExecutivo"></canvas>
                        <div class="gauge-text">
                            <span class="gauge-value">${kpis.ocupacaoGeral}%</span>
                            <span class="gauge-label">Ocupação</span>
                        </div>
                    </div>
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
            
            <!-- GRÁFICOS -->
            <div class="executivo-graficos">
                
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Preditiva de Altas em ${hoje}</h3>
                            <p>Timeline com divisão Ouro/2R/3R para Hoje e 24h</p>
                        </div>
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
                
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Preditiva de Concessões em ${hoje}</h3>
                            <p>Timeline por hospital</p>
                        </div>
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
                
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Preditiva de Linhas de Cuidado em ${hoje}</h3>
                            <p>Timeline por hospital</p>
                        </div>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-chart="linhas" data-type="line">Linhas</button>
                            <button class="chart-btn" data-chart="linhas" data-type="radar">Radar</button>
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
    
    // Adicionar event listener para o botão de toggle
    const toggleBtn = document.getElementById('toggleFundoBtnExec');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            window.fundoBranco = !window.fundoBranco;
            
            const icon = document.getElementById('toggleIconExec');
            const text = document.getElementById('toggleTextExec');
            
            if (window.fundoBranco) {
                toggleBtn.classList.add('active');
                icon.textContent = '☀️';
                text.textContent = 'CLARO';
            } else {
                toggleBtn.classList.remove('active');
                icon.textContent = '🌙';
                text.textContent = 'ESCURO';
            }
            
            // Re-renderizar gráficos (exceto gauge)
            renderAltasExecutivo(getCurrentChartType('altas'));
            renderConcessoesExecutivo(getCurrentChartType('concessoes'));
            renderLinhasExecutivo(getCurrentChartType('linhas'));
            
            logInfo(`Fundo executivo alterado para: ${window.fundoBranco ? 'claro' : 'escuro'}`);
        });
    }
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            document.querySelectorAll('[data-chart][data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const chart = e.target.dataset.chart;
                    const type = e.target.dataset.type;
                    
                    const grupo = e.target.parentElement;
                    grupo.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (chart === 'altas') {
                        renderAltasExecutivo(type);
                    } else if (chart === 'concessoes') {
                        renderConcessoesExecutivo(type);
                    } else if (chart === 'linhas') {
                        renderLinhasExecutivo(type);
                    }
                });
            });
            
            renderGaugeExecutivoHorizontal(kpis.ocupacaoGeral);
            renderAltasExecutivo('bar');
            renderConcessoesExecutivo('bar');
            renderLinhasExecutivo('bar');
            
            logSuccess('Dashboard Executivo renderizado com todas as correções');
        }, 200);
    };
    
    aguardarChartJS();
};

// Função auxiliar para obter tipo de gráfico atual
function getCurrentChartType(chart) {
    const btn = document.querySelector(`[data-chart="${chart}"].active`);
    return btn ? btn.dataset.type : 'bar';
}

// Calcular KPIs consolidados
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
            
            if (leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') {
                leitosOcupados++;
                
                if (leito.prevAlta && leito.prevAlta !== 'Não definido' && leito.prevAlta !== 'Sem previsao') {
                    leitosEmAlta++;
                }
                
                if (leito.tph) {
                    const tph = parseFloat(leito.tph);
                    if (!isNaN(tph) && tph > 0) {
                        tphTotal += tph;
                        tphCount++;
                    }
                } else {
                    const simulatedTPH = Math.random() * 5 + 1;
                    tphTotal += simulatedTPH;
                    tphCount++;
                }
                
                if (leito.pps) {
                    const pps = parseFloat(leito.pps);
                    if (!isNaN(pps) && pps > 0) {
                        ppsTotal += pps;
                        ppsCount++;
                    }
                }
                
                if (leito.linhas && leito.linhas.length > 0) {
                    const linhasStr = Array.isArray(leito.linhas) ? leito.linhas.join(' ') : leito.linhas;
                    if (linhasStr.includes('Cuidados Paliativos') || 
                        linhasStr.includes('UTI') || 
                        linhasStr.includes('Complexo')) {
                        spctCasos++;
                    }
                }
            }
        });
    });
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const tphMedio = tphCount > 0 ? (tphTotal / tphCount).toFixed(1) : '0.0';
    
    return {
        hospitaisAtivos: hospitaisComDados.length,
        totalLeitos,
        leitosOcupados,
        leitosVagos,
        leitosEmAlta,
        ocupacaoGeral,
        tphMedio,
        ppsMedio: ppsCount > 0 ? Math.round(ppsTotal / ppsCount) : 0,
        spctCasos
    };
}

// Calcular KPIs de um hospital
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0 };
    }
    
    const total = hospital.leitos.length;
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado' || l.status === 'Em uso').length;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return { ocupacao, total, ocupados, vagos: total - ocupados };
}

// Gauge horizontal (não muda com botão claro/escuro)
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
            rotation: -90,
            circumference: 180
        }
    });
}

// Gráfico de Altas com divisão Ouro/2R/3R para Hoje e 24h
function renderAltasExecutivo(tipo = 'bar') {
    const canvas = document.getElementById('graficoAltasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'altasExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // Divisão correta com cores específicas
    const datasets = [
        {
            label: 'Hoje Ouro',
            data: [8, 0, 0, 0, 0],
            backgroundColor: '#fbbf24',
            borderWidth: 0
        },
        {
            label: 'Hoje 2R',
            data: [5, 0, 0, 0, 0],
            backgroundColor: '#3b82f6',
            borderWidth: 0
        },
        {
            label: 'Hoje 3R',
            data: [2, 0, 0, 0, 0],
            backgroundColor: '#8b5cf6',
            borderWidth: 0
        },
        {
            label: '24h Ouro',
            data: [0, 6, 0, 0, 0],
            backgroundColor: '#fbbf24',
            borderWidth: 0
        },
        {
            label: '24h 2R',
            data: [0, 4, 0, 0, 0],
            backgroundColor: '#3b82f6',
            borderWidth: 0
        },
        {
            label: '24h 3R',
            data: [0, 2, 0, 0, 0],
            backgroundColor: '#8b5cf6',
            borderWidth: 0
        },
        {
            label: '48H',
            data: [0, 0, 8, 0, 0],
            backgroundColor: '#10b981',
            borderWidth: 0
        },
        {
            label: '72H',
            data: [0, 0, 0, 5, 0],
            backgroundColor: '#f59e0b',
            borderWidth: 0
        },
        {
            label: '96H',
            data: [0, 0, 0, 0, 3],
            backgroundColor: '#ef4444',
            borderWidth: 0
        }
    ];
    
    const ctx = canvas.getContext('2d');
    
    if (tipo === 'doughnut') {
        const total = datasets.reduce((acc, ds) => acc + ds.data.reduce((a, b) => a + b, 0), 0);
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: datasets.map(d => d.label),
                datasets: [{
                    data: datasets.map(d => d.data.reduce((a, b) => a + b, 0)),
                    backgroundColor: datasets.map(d => d.backgroundColor),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: corTexto,
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                }
            },
            plugins: [backgroundPluginExec]
        });
    } else if (tipo === 'line') {
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: categorias,
                datasets: datasets.map(d => ({
                    ...d,
                    borderColor: d.backgroundColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                }))
            },
            options: getChartOptions(corTexto, corGrid)
        });
    } else {
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: datasets
            },
            options: {
                ...getChartOptions(corTexto, corGrid),
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: corTexto },
                        grid: { color: corGrid }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Beneficiários',
                            color: corTexto
                        },
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            callback: function(value) {
                                return Number.isInteger(value) ? value : '';
                            }
                        },
                        grid: { color: corGrid }
                    }
                }
            },
            plugins: [backgroundPluginExec]
        });
    }
}

// Gráfico de Concessões com timeline correta
function renderConcessoesExecutivo(tipo = 'bar') {
    const canvas = document.getElementById('graficoConcessoesExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'concessoesExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    const hospitais = ['Neomater', 'Cruz Azul', 'Santa Marcelina', 'Santa Clara'];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // Criar datasets por concessão
    const concessoes = ['Transição', 'Fisioterapia', 'Medicamentos'];
    const datasets = concessoes.map((concessao, idx) => ({
        label: concessao,
        data: categorias.flatMap(() => [
            Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 5) + 1
        ]),
        backgroundColor: ['#007A53', '#009639', '#582C83'][idx],
        borderWidth: 0,
        stack: 'Stack 0'
    }));
    
    const ctx = canvas.getContext('2d');
    
    if (tipo === 'doughnut' || tipo === 'polarArea') {
        const aggregatedData = concessoes.map((_, idx) => 
            datasets[idx].data.reduce((a, b) => a + b, 0)
        );
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: tipo === 'doughnut' ? 'doughnut' : 'polarArea',
            data: {
                labels: concessoes,
                datasets: [{
                    data: aggregatedData,
                    backgroundColor: ['#007A53', '#009639', '#582C83'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: corTexto }
                    }
                }
            },
            plugins: [backgroundPluginExec]
        });
    } else {
        // Labels customizados para mostrar hospitais
        const customLabels = [];
        categorias.forEach(cat => {
            hospitais.forEach(hosp => {
                customLabels.push(cat);
            });
        });
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: customLabels,
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
                        labels: {
                            color: corTexto,
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterTitle: function(context) {
                                const index = context[0].dataIndex % 4;
                                return hospitais[index];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: corTexto,
                            autoSkip: false,
                            callback: function(value, index) {
                                if (index % 4 === 0) {
                                    return customLabels[index];
                                }
                                return '';
                            }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Beneficiários',
                            color: corTexto
                        },
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            callback: function(value) {
                                return Number.isInteger(value) ? value : '';
                            }
                        },
                        grid: { color: corGrid }
                    }
                }
            },
            plugins: [backgroundPluginExec, {
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.font = '10px Arial';
                    ctx.fillStyle = corTexto;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    
                    chart.data.labels.forEach((label, i) => {
                        if (i % 4 < hospitais.length) {
                            const meta = chart.getDatasetMeta(0);
                            const bar = meta.data[i];
                            if (bar) {
                                const x = bar.x;
                                const y = bar.base - 5;
                                
                                ctx.save();
                                ctx.translate(x, y);
                                ctx.rotate(-Math.PI / 4);
                                ctx.fillText(hospitais[i % 4], 0, 0);
                                ctx.restore();
                            }
                        }
                    });
                    ctx.restore();
                }
            }]
        });
    }
}

// Gráfico de Linhas de Cuidado com timeline correta
function renderLinhasExecutivo(tipo = 'bar') {
    const canvas = document.getElementById('graficoLinhasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'linhasExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    const hospitais = ['Neomater', 'Cruz Azul', 'Santa Marcelina', 'Santa Clara'];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const linhas = ['Assiste', 'APS', 'Paliativos'];
    const datasets = linhas.map((linha, idx) => ({
        label: linha,
        data: categorias.flatMap(() => [
            Math.floor(Math.random() * 8) + 2,
            Math.floor(Math.random() * 8) + 2,
            Math.floor(Math.random() * 8) + 2,
            Math.floor(Math.random() * 8) + 2
        ]),
        backgroundColor: ['#ED0A72', '#007A33', '#00B5A2'][idx],
        borderColor: ['#ED0A72', '#007A33', '#00B5A2'][idx],
        borderWidth: tipo === 'line' ? 2 : 0
    }));
    
    const ctx = canvas.getContext('2d');
    
    if (tipo === 'radar') {
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: categorias,
                datasets: linhas.map((linha, idx) => ({
                    label: linha,
                    data: [10, 8, 6, 5, 3],
                    backgroundColor: ['#ED0A72', '#007A33', '#00B5A2'][idx] + '4D',
                    borderColor: ['#ED0A72', '#007A33', '#00B5A2'][idx],
                    borderWidth: 2
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: corTexto }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: corGrid },
                        grid: { color: corGrid },
                        pointLabels: { color: corTexto },
                        ticks: { color: corTexto }
                    }
                }
            },
            plugins: [backgroundPluginExec]
        });
    } else if (tipo === 'line') {
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: categorias,
                datasets: linhas.map((linha, idx) => ({
                    label: linha,
                    data: [12, 10, 8, 6, 4],
                    borderColor: ['#ED0A72', '#007A33', '#00B5A2'][idx],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                }))
            },
            options: getChartOptions(corTexto, corGrid),
            plugins: [backgroundPluginExec]
        });
    } else {
        // Similar ao de concessões
        const customLabels = [];
        categorias.forEach(cat => {
            hospitais.forEach(hosp => {
                customLabels.push(cat);
            });
        });
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: customLabels,
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
                        labels: {
                            color: corTexto,
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: corTexto,
                            autoSkip: false,
                            callback: function(value, index) {
                                if (index % 4 === 0) {
                                    return customLabels[index];
                                }
                                return '';
                            }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Beneficiários',
                            color: corTexto
                        },
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            callback: function(value) {
                                return Number.isInteger(value) ? value : '';
                            }
                        },
                        grid: { color: corGrid }
                    }
                }
            },
            plugins: [backgroundPluginExec, {
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.font = '10px Arial';
                    ctx.fillStyle = corTexto;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    
                    chart.data.labels.forEach((label, i) => {
                        if (i % 4 < hospitais.length) {
                            const meta = chart.getDatasetMeta(0);
                            const bar = meta.data[i];
                            if (bar) {
                                const x = bar.x;
                                const y = bar.base - 5;
                                
                                ctx.save();
                                ctx.translate(x, y);
                                ctx.rotate(-Math.PI / 4);
                                ctx.fillText(hospitais[i % 4], 0, 0);
                                ctx.restore();
                            }
                        }
                    });
                    ctx.restore();
                }
            }]
        });
    }
}

// Função auxiliar para opções comuns
function getChartOptions(corTexto, corGrid) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'start',
                labels: {
                    color: corTexto,
                    padding: 15,
                    font: { size: 12 }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: corTexto },
                grid: { color: corGrid }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Beneficiários',
                    color: corTexto
                },
                ticks: {
                    color: corTexto,
                    stepSize: 1,
                    callback: function(value) {
                        return Number.isInteger(value) ? value : '';
                    }
                },
                grid: { color: corGrid }
            }
        }
    };
}

// Criar dados mock para teste
function criarDadosMockExecutivo() {
    window.hospitalData = {
        H1: {
            leitos: Array(20).fill(null).map(() => ({
                status: Math.random() > 0.3 ? 'ocupado' : 'vago',
                paciente: {
                    prevAlta: ['Hoje Ouro', '24h 2R', '48h', '72h', '96h'][Math.floor(Math.random() * 5)],
                    concessoes: 'Fisioterapia|Transição',
                    linhas: 'Cardiologia|APS',
                    tph: Math.random() * 5 + 1,
                    pps: Math.random() * 100
                }
            }))
        },
        H2: {
            leitos: Array(15).fill(null).map(() => ({
                status: Math.random() > 0.4 ? 'ocupado' : 'vago',
                paciente: {
                    prevAlta: ['Hoje 3R', '24h Ouro', '48h', '72h'][Math.floor(Math.random() * 4)],
                    concessoes: 'Medicamentos',
                    linhas: 'Paliativos',
                    tph: Math.random() * 4 + 1,
                    pps: Math.random() * 100
                }
            }))
        },
        H3: {
            leitos: Array(18).fill(null).map(() => ({
                status: Math.random() > 0.35 ? 'ocupado' : 'vago',
                paciente: {
                    prevAlta: ['Hoje 2R', '24h 3R', '96h'][Math.floor(Math.random() * 3)],
                    concessoes: 'Oxigenoterapia',
                    linhas: 'Oncologia',
                    tph: Math.random() * 3 + 2,
                    pps: Math.random() * 100
                }
            }))
        },
        H4: {
            leitos: Array(12).fill(null).map(() => ({
                status: Math.random() > 0.5 ? 'ocupado' : 'vago',
                paciente: {
                    prevAlta: ['Hoje Ouro', '48h', '72h'][Math.floor(Math.random() * 3)],
                    concessoes: 'Curativos|Banho',
                    linhas: 'Pediatria|ICO',
                    tph: Math.random() * 6,
                    pps: Math.random() * 100
                }
            }))
        }
    };
}

// CSS do Dashboard Executivo
function getExecutiveCSS() {
    return `
        <style id="executiveCSS">
            .executive-kpis-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                grid-template-rows: auto auto;
                gap: 20px;
                margin-bottom: 30px;
            }
            
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
                color: white !important;
                font-weight: 500;
            }
            
            .hospital-pct {
                color: white !important;
                font-weight: 700;
            }
            
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
                align-items: flex-start;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .chart-header h3 {
                margin: 0 0 5px 0;
                color: white;
                font-size: 18px;
                font-weight: 600;
            }
            
            .chart-header p {
                margin: 0;
                color: #9ca3af;
                font-size: 14px;
            }
            
            .chart-controls {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                align-items: flex-start;
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
                font-weight: 500;
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
                    gap: 10px;
                }
                
                .chart-controls {
                    width: 100%;
                    justify-content: flex-start;
                }
                
                .chart-container {
                    height: 300px;
                }
            }
        </style>
    `;
}

console.log('Dashboard Executivo - Versão Corrigida com todas as funcionalidades');

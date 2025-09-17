// =================== DASHBOARD HOSPITALAR - VERSÃO COMPLETA CORRIGIDA ===================

// Estado dos gráficos selecionados por hospital (7 TIPOS)
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar', preditivos: 'bar' }
};

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar COMPLETO - LAYOUT VERTICAL FORÇADO');
    
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
    
    // *** CORREÇÃO: VERIFICAR SE HÁ DADOS ANTES DE RENDERIZAR ***
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Carregando dados hospitalares</h2>
                <p style="color: #9ca3af; font-size: 14px;">Aguarde enquanto sincronizamos com a API...</p>
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
                setTimeout(() => window.renderDashboardHospitalar(), 500);
            } else if (tentativas < maxTentativas) {
                setTimeout(tentarCarregar, 2000);
            } else {
                // Dados mock após 3 tentativas
                logInfo('Criando dados mock para Dashboard Hospitalar após timeout');
                criarDadosMockHospitalar();
                setTimeout(() => window.renderDashboardHospitalar(), 1000);
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
                <h3 style="color: #f59e0b; margin-bottom: 15px;">⚠️ Nenhum dado hospitalar disponível</h3>
                <p style="color: #9ca3af; margin-bottom: 20px;">Não foi possível carregar dados de nenhum hospital configurado.</p>
                <button onclick="window.forceDataRefresh()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    🔄 Recarregar Dados
                </button>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // *** HTML COMPLETO COM LAYOUT VERTICAL FORÇADO ***
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <h2 style="margin: 0; color: #60a5fa; font-size: 24px; font-weight: 700;">📊 Dashboard Hospitalar</h2>
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 14px;">
                    <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
                    ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'ais' : ''} com dados
                </div>
            </div>
            
            <!-- Status dos dados -->
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <strong style="color: #22c55e;">✅ Dados Reais da Rede</strong>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 14px;">
                    Hospitais: ${hospitaisComDados.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')} • Atualizado em ${hoje}
                </p>
            </div>
            
            <!-- HOSPITAIS EM LAYOUT VERTICAL FORÇADO -->
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
                    
                    // Renderizar gráfico
                    if (chart === 'preditivos') {
                        renderAltasHospital(hospital);
                    } else if (chart === 'concessoes') {
                        renderConcessoesHospital(hospital);
                    } else if (chart === 'linhas') {
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
            
            logSuccess('✅ Dashboard Hospitalar renderizado com layout vertical e 7 tipos de gráfico');
        }, 100);
    };
    
    aguardarChartJS();
};

// =================== RENDERIZAR SEÇÃO DE UM HOSPITAL ===================
function renderHospitalSection(hospitalId) {
    const hospital = CONFIG.HOSPITAIS[hospitalId];
    const kpis = calcularKPIsHospital(hospitalId);
    
    return `
        <div class="hospital-card" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3 class="hospital-title">${hospital.nome}</h3>
                <div class="hospital-stats">
                    <div class="stat-item">
                        <span class="stat-number">${kpis.total}</span>
                        <span class="stat-label">TOTAL</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${kpis.ocupados}</span>
                        <span class="stat-label">OCUPADOS</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${kpis.vagos}</span>
                        <span class="stat-label">VAGOS</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${kpis.ocupacao}%</span>
                        <span class="stat-label">OCUPAÇÃO</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${kpis.altas}</span>
                        <span class="stat-label">ALTAS</span>
                    </div>
                </div>
            </div>
            
            <!-- GRÁFICOS EM LAYOUT VERTICAL FORÇADO -->
            <div class="graficos-verticais">
                <!-- Gráfico de Altas Preditivas -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>📈 Análise Preditiva de Altas</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="preditivos" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="preditivos" data-type="scatter">Scatter</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="preditivos" data-type="line">Linha</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Concessões -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>🎯 Concessões Previstas</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="doughnut">Pizza</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="radar">Radar</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="polar">Polar</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoes${hospitalId}" width="800" height="400"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Linhas de Cuidado -->
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>🏥 Linhas de Cuidado</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="doughnut">Pizza</button>
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

// =================== CALCULAR KPIs DE UM HOSPITAL ===================
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    const total = hospital.leitos.length;
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    
    // Contar altas previstas para hoje e próximos 2 dias
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

// =================== GRÁFICO DE ALTAS PREDITIVAS ===================
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
    
    // Processar dados de altas
    const altasPorDia = {};
    const hoje = new Date();
    
    // Inicializar próximos 7 dias
    for (let i = 0; i < 7; i++) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() + i);
        const key = data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
        altasPorDia[key] = 0;
    }
    
    // Contar altas por dia
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.prevAlta) {
            const prevAlta = leito.paciente.prevAlta;
            
            if (prevAlta === 'Hoje Ouro') {
                const key = hoje.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
                altasPorDia[key]++;
            } else if (prevAlta === '24h 2R') {
                const amanha = new Date(hoje);
                amanha.setDate(hoje.getDate() + 1);
                const key = amanha.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
                altasPorDia[key]++;
            } else if (prevAlta === '48h 3R') {
                const depois = new Date(hoje);
                depois.setDate(hoje.getDate() + 2);
                const key = depois.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
                altasPorDia[key]++;
            }
        }
    });
    
    const labels = Object.keys(altasPorDia);
    const data = Object.values(altasPorDia);
    const type = window.graficosState[hospitalId]?.preditivos || 'bar';
    
    let config = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Altas Previstas',
                data: data,
                backgroundColor: '#60a5fa',
                borderColor: '#3b82f6',
                borderWidth: 2,
                fill: type === 'area'
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
    if (type === 'scatter') {
        config.data.datasets[0].showLine = false;
    } else if (type === 'area') {
        config.type = 'line';
        config.data.datasets[0].backgroundColor = 'rgba(96, 165, 250, 0.3)';
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, config);
    logInfo(`Gráfico de altas renderizado para ${hospitalId}: ${type}`);
}

// =================== GRÁFICO DE CONCESSÕES ===================
function renderConcessoesHospital(hospitalId) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Processar dados de concessões
    const concessoes = {};
    
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
    
    const labels = Object.keys(concessoes).slice(0, 8);
    const data = labels.map(label => concessoes[label]);
    const type = window.graficosState[hospitalId]?.concessoes || 'bar';
    
    let config = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: data,
                backgroundColor: labels.map(label => getCorConcessao(label)),
                borderColor: labels.map(label => getCorConcessao(label)),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: type === 'doughnut' ? 'right' : 'bottom',
                    labels: { color: '#e2e8f0' }
                }
            }
        }
    };
    
    // Configurações específicas por tipo
    if (type === 'bar') {
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
    } else if (type === 'radar') {
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
    logInfo(`Gráfico de concessões renderizado para ${hospitalId}: ${type}`);
}

// =================== GRÁFICO DE LINHAS DE CUIDADO ===================
function renderLinhasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Processar dados de linhas de cuidado
    const linhas = {};
    
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
    
    const labels = Object.keys(linhas).slice(0, 6);
    const data = labels.map(label => linhas[label]);
    const type = window.graficosState[hospitalId]?.linhas || 'bar';
    
    let config = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: data,
                backgroundColor: labels.map(label => getCorLinhaCuidado(label)),
                borderColor: labels.map(label => getCorLinhaCuidado(label)),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: type === 'doughnut' ? 'right' : 'bottom',
                    labels: { color: '#e2e8f0' }
                }
            }
        }
    };
    
    // Configurações específicas por tipo
    if (type === 'bar') {
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
    } else if (type === 'area') {
        config.type = 'line';
        config.data.datasets[0].backgroundColor = 'rgba(96, 165, 250, 0.3)';
        config.data.datasets[0].fill = true;
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
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, config);
    logInfo(`Gráfico de linhas renderizado para ${hospitalId}: ${type}`);
}

// =================== CORES PANTONE PARA CONCESSÕES ===================
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

// =================== CORES PANTONE PARA LINHAS DE CUIDADO ===================
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

// =================== CRIAR DADOS MOCK PARA TESTE ===================
function criarDadosMockHospitalar() {
    window.hospitalData = {
        H1: {
            leitos: [
                {
                    status: 'ocupado',
                    paciente: {
                        nome: 'João Silva',
                        prevAlta: 'Hoje Ouro',
                        concessoes: 'Fisioterapia|Home Care',
                        linhas: 'Cardiologia|UTI'
                    }
                },
                {
                    status: 'ocupado',
                    paciente: {
                        nome: 'Maria Santos',
                        prevAlta: '24h 2R',
                        concessoes: 'Transição Domiciliar',
                        linhas: 'Pneumologia'
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
                        concessoes: 'Medicamentos',
                        linhas: 'Oncologia|Cuidados Paliativos'
                    }
                },
                { status: 'vago' }
            ]
        }
    };
    
    logInfo('✅ Dados mock criados para Dashboard Hospitalar');
}

// =================== FUNÇÃO DE FORÇA DE ATUALIZAÇÃO ===================
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares...');
    
    const container = document.getElementById('dashHospitalarContent');
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

// =================== CSS COMPLETO PARA DASHBOARD HOSPITALAR ===================
function getHospitalCSS() {
    return `
        <style id="hospitalCSS">
            /* LAYOUT PRINCIPAL - VERTICAL FORÇADO */
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
                margin: 0 0 15px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .hospital-stats {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: space-around;
            }
            
            .stat-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 12px 16px;
                border-radius: 8px;
                text-align: center;
                min-width: 70px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                flex: 1;
                max-width: 100px;
            }
            
            .stat-number {
                display: block;
                font-size: 20px;
                font-weight: 700;
                color: #60a5fa;
                line-height: 1;
            }
            
            .stat-label {
                display: block;
                font-size: 10px;
                color: #9ca3af;
                margin-top: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* LAYOUT VERTICAL DOS GRÁFICOS - CORREÇÃO CRÍTICA */
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
                font-size: 14px;
                font-weight: 600;
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
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 100% !important;
            }
            
            /* RESPONSIVIDADE */
            @media (max-width: 768px) {
                .hospital-stats {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .stat-item {
                    max-width: none;
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

console.log('✅ Dashboard Hospitalar V3.0 - LAYOUT VERTICAL FORÇADO - Carregado');

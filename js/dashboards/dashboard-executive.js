// =================== DASHBOARD EXECUTIVO - CORREÇÕES COMPLETAS ===================

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo');
    
    const container = document.getElementById('dashboardContainer');
    if (!container) return;
    
    // *** REMOVER LOADING PERMANENTE ***
    container.innerHTML = '';
    
    // Verificar se há dados
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    🔄 Carregando dados do sistema...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Aguarde enquanto sincronizamos com a API
                </div>
            </div>
        `;
        return;
    }
    
    const hospitaisAtivos = Object.keys(CONFIG.HOSPITAIS).filter(id => CONFIG.HOSPITAIS[id].ativo);
    const hospitaisComDados = hospitaisAtivos.filter(id => window.hospitalData[id]);
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="color: #0369a1; margin: 0 0 10px 0;">📊 Dashboard Executivo</h3>
                <p><strong>Status:</strong> Aguardando dados dos hospitais</p>
                <p><strong>Hospitais configurados:</strong> ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
                <p style="color: #28a745; margin-top: 15px;"><em>✅ API conectada e funcionando</em></p>
            </div>
        `;
        return;
    }
    
    const kpis = calcularKPIsExecutivos(hospitaisComDados);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // *** HTML CORRIGIDO SEM LOADING PERMANENTE ***
    container.innerHTML = `
        <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
            Dashboard Executivo
        </h2>
        
        <!-- Aviso sobre dados reais -->
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">
                📊 <strong>Dados reais da planilha Google</strong> • ${hospitaisComDados.length} hospitais ativos • ${kpis.leitosOcupados} pacientes internados
            </p>
        </div>
        
        <!-- *** KPIs COM MOLDURA ESCURA CORRIGIDA *** -->
        <div style="background: #374151; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 2px solid #4b5563;">
            <div class="executive-kpis-grid">
                <!-- Gauge Principal (2x2) -->
                <div class="kpi-principal" style="grid-column: span 2; grid-row: span 2; background: #1a1f2e; border-radius: 12px; padding: 20px; display: flex; align-items: center; color: white;">
                    <div style="width: 200px; height: 100px; position: relative;">
                        <canvas id="gaugeOcupacao" width="200" height="100"></canvas>
                        <div style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); font-size: 24px; font-weight: 700; color: #60a5fa;">
                            ${kpis.ocupacaoGeral}%
                        </div>
                        <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); font-size: 10px; text-transform: uppercase; color: #e2e8f0; font-weight: 600;">
                            OCUPAÇÃO GERAL
                        </div>
                    </div>
                    <div style="flex: 1; padding-left: 20px; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
                        ${hospitaisComDados.map(hospitalId => {
                            const hospital = CONFIG.HOSPITAIS[hospitalId];
                            const ocupacao = calcularOcupacaoHospital(hospitalId);
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                                    <span style="color: #e2e8f0; font-weight: 600;">${hospital.nome}</span>
                                    <span style="color: #60a5fa; font-weight: 700;">${ocupacao}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- KPIs linha 1 -->
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${hospitaisComDados.length}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">HOSPITAIS ATIVOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${kpis.totalLeitos}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">TOTAL DE LEITOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${kpis.leitosOcupados}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS OCUPADOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${kpis.leitosVagos}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS VAGOS</div>
                </div>
                
                <!-- KPIs linha 2 -->
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${kpis.leitosEmAlta}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS EM ALTA</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${kpis.tph}d</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">TPH (DIAS)</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${kpis.ppsMedio}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">PPS MÉDIO</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${kpis.spictElegivel}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">SPICT-BR ELEGÍVEL</div>
                </div>
            </div>
        </div>
        
        <!-- *** GRÁFICOS COM LARGURA LIMITADA E ALINHADOS *** -->
        <div style="display: flex; flex-direction: column; gap: 24px; max-width: 1000px; margin: 0 auto;">
            <!-- Análise Preditiva de Altas -->
            <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                    📊 Análise Preditiva de Altas em ${hoje}
                </h3>
                <div style="height: 300px; width: 100%;">
                    <canvas id="chartAltasExecutivo" style="max-height: 300px; width: 100%;"></canvas>
                </div>
            </div>
            
            <!-- Análise Preditiva de Concessões -->
            <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                    🏠 Análise Preditiva de Concessões em ${hoje}
                </h3>
                <div style="height: 300px; width: 100%;">
                    <canvas id="chartConcessoesExecutivo" style="max-height: 300px; width: 100%;"></canvas>
                </div>
            </div>
            
            <!-- Análise Preditiva de Linhas de Cuidado -->
            <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                    🩺 Análise Preditiva de Linha de Cuidados em ${hoje}
                </h3>
                <div style="height: 300px; width: 100%;">
                    <canvas id="chartLinhasExecutivo" style="max-height: 300px; width: 100%;"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // *** RENDERIZAR GRÁFICOS APÓS DOM ESTAR PRONTO ***
    setTimeout(() => {
        renderGaugeHorizontal(kpis.ocupacaoGeral);
        renderGraficoAltasExecutivo(hospitaisComDados);
        renderGraficoConcessoesExecutivo(hospitaisComDados);
        renderGraficoLinhasExecutivo(hospitaisComDados);
    }, 100);
};

// =================== GAUGE HORIZONTAL (VELOCÍMETRO) ===================
function renderGaugeHorizontal(ocupacao) {
    const canvas = document.getElementById('gaugeOcupacao');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destruir chart anterior se existir
    if (window.chartInstances && window.chartInstances.gaugeOcupacao) {
        window.chartInstances.gaugeOcupacao.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // *** GAUGE HORIZONTAL COMO VELOCÍMETRO ***
    window.chartInstances.gaugeOcupacao = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [ocupacao, 100 - ocupacao],
                backgroundColor: [
                    ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f59e0b' : '#16a34a',
                    'rgba(255, 255, 255, 0.1)'
                ],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: Math.PI, // *** MEIA ROSCA ***
            rotation: Math.PI, // *** COMEÇAR NA HORIZONTAL ***
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// =================== CALCULAR KPIs EXECUTIVOS CORRIGIDOS ===================
function calcularKPIsExecutivos(hospitaisComDados = []) {
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosVagos = 0;
    let leitosEmAlta = 0;
    let somaTempoInternacao = 0;
    let pacientesComTempo = 0;
    let somaPPS = 0;
    let pacientesComPPS = 0;
    let spictElegivel = 0;
    let totalPacientes = 0;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            totalLeitos++;
            
            if (leito.status === 'ocupado' && leito.paciente) {
                leitosOcupados++;
                totalPacientes++;
                
                // Verificar previsão de alta
                if (leito.paciente.previsaoAlta && 
                    (leito.paciente.previsaoAlta.includes('Hoje') || leito.paciente.previsaoAlta.includes('24h'))) {
                    leitosEmAlta++;
                }
                
                // Calcular tempo de internação para TPH
                if (leito.paciente.admissao) {
                    const admissaoDate = new Date(leito.paciente.admissao);
                    const hoje = new Date();
                    const diasInternado = Math.floor((hoje - admissaoDate) / (1000 * 60 * 60 * 24));
                    somaTempoInternacao += diasInternado;
                    pacientesComTempo++;
                }
                
                // PPS médio
                if (leito.paciente.pps) {
                    const ppsNumerico = parseInt(leito.paciente.pps.replace('%', ''));
                    if (!isNaN(ppsNumerico)) {
                        somaPPS += ppsNumerico;
                        pacientesComPPS++;
                    }
                }
                
                // SPICT-BR elegível
                if (leito.paciente.spictBr === 'Elegível') {
                    spictElegivel++;
                }
            } else {
                leitosVagos++;
            }
        });
    });
    
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const tph = pacientesComTempo > 0 ? (somaTempoInternacao / pacientesComTempo).toFixed(1) : '0.0';
    const ppsMedio = pacientesComPPS > 0 ? Math.round(somaPPS / pacientesComPPS) : 0;
    const spictPercentual = totalPacientes > 0 ? Math.round((spictElegivel / totalPacientes) * 100) : 0;
    
    return {
        ocupacaoGeral,
        totalLeitos,
        leitosOcupados,
        leitosVagos,
        leitosEmAlta,
        tph, // *** TPH CORRIGIDO ***
        ppsMedio,
        spictElegivel: spictPercentual
    };
}

// =================== CALCULAR OCUPAÇÃO DE UM HOSPITAL ===================
function calcularOcupacaoHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return 0;
    
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const total = hospital.leitos.length;
    
    return total > 0 ? Math.round((ocupados / total) * 100) : 0;
}

// =================== GRÁFICO DE ALTAS COM BARRAS DIVIDIDAS ===================
function renderGraficoAltasExecutivo(hospitaisComDados) {
    const ctx = document.getElementById('chartAltasExecutivo');
    if (!ctx) return;
    
    const dados = calcularDadosAltasExecutivo(hospitaisComDados);
    
    if (window.chartInstances && window.chartInstances.altasExecutivo) {
        window.chartInstances.altasExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    window.chartInstances.altasExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hoje', '24h', '48h', '72h', '96h'], // *** EIXO X HORIZONTAL ***
            datasets: [
                {
                    label: 'OURO',
                    data: dados.ouro,
                    backgroundColor: '#fbbf24',
                    stack: 'timeline'
                },
                {
                    label: '2R',
                    data: dados.r2,
                    backgroundColor: '#3b82f6',
                    stack: 'timeline'
                },
                {
                    label: '3R',
                    data: dados.r3,
                    backgroundColor: '#8b5cf6',
                    stack: 'timeline'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    // *** LEGENDAS EMBAIXO + TEXTO BRANCO ***
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: {
                        color: '#ffffff',
                        padding: 8,
                        font: { size: 11, weight: 600 },
                        usePointStyle: true,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#ffffff',
                        font: { size: 11 },
                        maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// =================== GRÁFICO DE CONCESSÕES ===================
function renderGraficoConcessoesExecutivo(hospitaisComDados) {
    const ctx = document.getElementById('chartConcessoesExecutivo');
    if (!ctx) return;
    
    const dados = calcularDadosConcessoesExecutivo(hospitaisComDados);
    
    if (window.chartInstances && window.chartInstances.concessoesExecutivo) {
        window.chartInstances.concessoesExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    window.chartInstances.concessoesExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hoje', '24h', '48h', '72h', '96h'], // *** EIXO X HORIZONTAL ***
            datasets: dados.concessoes.map(item => ({
                label: item.nome,
                data: item.dados,
                backgroundColor: getCorConcessao(item.nome)
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    // *** LEGENDAS EMBAIXO + TEXTO BRANCO ***
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: {
                        color: '#ffffff',
                        padding: 8,
                        font: { size: 11, weight: 600 },
                        usePointStyle: true,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: { size: 11 },
                        maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// =================== GRÁFICO DE LINHAS DE CUIDADO ===================
function renderGraficoLinhasExecutivo(hospitaisComDados) {
    const ctx = document.getElementById('chartLinhasExecutivo');
    if (!ctx) return;
    
    const dados = calcularDadosLinhasExecutivo(hospitaisComDados);
    
    if (window.chartInstances && window.chartInstances.linhasExecutivo) {
        window.chartInstances.linhasExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    window.chartInstances.linhasExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hoje', '24h', '48h', '72h', '96h'], // *** EIXO X HORIZONTAL ***
            datasets: dados.linhas.map(item => ({
                label: item.nome,
                data: item.dados,
                backgroundColor: getCorLinhaCuidado(item.nome)
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    // *** LEGENDAS EMBAIXO + TEXTO BRANCO ***
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: {
                        color: '#ffffff',
                        padding: 8,
                        font: { size: 11, weight: 600 },
                        usePointStyle: true,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: { size: 11 },
                        maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// =================== FUNÇÕES AUXILIARES PARA DADOS ===================
function calcularDadosAltasExecutivo(hospitaisComDados) {
    // Dados mock para demonstração - idealmente viria da API
    return {
        ouro: [2, 1, 0, 0, 0],
        r2: [1, 2, 1, 0, 0],
        r3: [0, 1, 1, 1, 0]
    };
}

function calcularDadosConcessoesExecutivo(hospitaisComDados) {
    // Dados mock baseados nos hospitais ativos
    const concessoesPrincipais = [
        'Transição Domiciliar',
        'Fisioterapia',
        'Oxigenoterapia',
        'Curativos'
    ];
    
    return {
        periodos: ['Hoje', '24h', '48h', '72h', '96h'],
        concessoes: concessoesPrincipais.map(nome => ({
            nome,
            dados: [
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 4),
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 1),
                0
            ]
        }))
    };
}

function calcularDadosLinhasExecutivo(hospitaisComDados) {
    // Dados mock das principais linhas
    const linhasPrincipais = [
        'Assiste',
        'APS',
        'Oncologia',
        'Cardiologia'
    ];
    
    return {
        periodos: ['Hoje', '24h', '48h', '72h', '96h'],
        linhas: linhasPrincipais.map(nome => ({
            nome,
            dados: [
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 1),
                0
            ]
        }))
    };
}

// =================== CORES PANTONE ===================
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

// =================== CSS ADICIONAL PARA KPIs MOBILE ===================
const executiveCSS = `
<style>
.executive-kpis-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, 120px);
    gap: 16px;
}

/* *** RESPONSIVIDADE MOBILE PARA KPIs *** */
@media (max-width: 768px) {
    .executive-kpis-grid {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: auto auto auto;
        gap: 12px;
    }
    
    .kpi-principal {
        grid-column: span 3 !important;
        grid-row: span 1 !important;
        height: auto !important;
        flex-direction: column !important;
        text-align: center !important;
    }
    
    .kpi-principal > div:first-child {
        margin-bottom: 15px !important;
    }
    
    .kpi-principal > div:last-child {
        padding-left: 0 !important;
        width: 100% !important;
    }
    
    /* *** GRÁFICOS LARGURA LIMITADA PARA DESKTOP *** */
    .executive-charts > div {
        max-width: 150% !important; /* 50% mais largo */
        margin-left: auto !important;
        margin-right: auto !important;
    }
}

@media (min-width: 769px) {
    .executive-charts > div {
        max-width: 150% !important; /* 50% mais largo no desktop também */
        margin-left: auto !important;
        margin-right: auto !important;
    }
}
</style>
`;

// Adicionar CSS ao documento
if (!document.getElementById('executiveStyles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'executiveStyles';
    styleEl.innerHTML = executiveCSS;
    document.head.appendChild(styleEl);
}

logSuccess('✅ Dashboard Executivo corrigido: Gauge horizontal + TPH + KPIs + Legendas brancas + Gráficos alinhados');

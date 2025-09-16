// =================== DASHBOARD EXECUTIVO - REDE HOSPITALAR EXTERNA ===================

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo');
    
    const container = document.getElementById('executiveDashboardContainer') || 
        document.getElementById('dashExecutivoContent') || 
        (() => {
            const section = document.getElementById('dash2');
            if (section) {
                const newContainer = document.createElement('div');
                newContainer.id = 'executiveDashboardContainer';
                section.appendChild(newContainer);
                return newContainer;
            }
            return null;
        })();
    
    if (!container) {
        logError('Container para Dashboard Executivo não encontrado');
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // NOVO: Verificar quais hospitais têm dados reais
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => 
            l.status === 'ocupado' && l.paciente && l.paciente.nome && l.paciente.matricula
        );
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h2 style="color: #1a1f2e; margin-bottom: 20px;">Dashboard Executivo</h2>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
                    <h3 style="color: #6c757d; margin-bottom: 15px;">📋 Aguardando Dados da Planilha</h3>
                    <p style="margin-bottom: 10px;">Nenhum hospital possui dados de pacientes na planilha Google.</p>
                    <p><strong>Hospitais configurados:</strong> ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
                    <p style="color: #28a745; margin-top: 15px;"><em>✅ API conectada e funcionando</em></p>
                </div>
            </div>
        `;
        return;
    }
    
    const kpis = calcularKPIsExecutivos(hospitaisComDados);
    
    // HTML do Dashboard
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
        
        <!-- *** KPIs COM FUNDO ESCURO *** -->
        <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <div class="executive-kpis-grid">
                <!-- Gauge Principal (2x2) -->
                <div class="kpi-principal">
                    <div class="gauge-container">
                        <canvas id="gaugeOcupacao" width="200" height="100"></canvas>
                        <div class="gauge-value">${kpis.ocupacaoGeral}%</div>
                        <div class="gauge-label">OCUPAÇÃO GERAL</div>
                    </div>
                    <div class="hospitais-list">
                        ${hospitaisComDados.map(hospitalId => {
                            const hospital = CONFIG.HOSPITAIS[hospitalId];
                            const ocupacao = calcularOcupacaoHospital(hospitalId);
                            return `
                                <div class="hospital-item">
                                    <span class="hospital-nome">${hospital.nome}</span>
                                    <span class="hospital-pct">${ocupacao.percentual}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- KPIs Linha 1 -->
                <div class="kpi-box">
                    <div class="kpi-value">${hospitaisComDados.length}</div>
                    <div class="kpi-label">HOSPITAIS ATIVOS</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.totalLeitos}</div>
                    <div class="kpi-label">TOTAL DE LEITOS</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosOcupados}</div>
                    <div class="kpi-label">LEITOS OCUPADOS</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosVagos}</div>
                    <div class="kpi-label">LEITOS VAGOS</div>
                </div>
                
                <!-- KPIs Linha 2 -->
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosEmAlta}</div>
                    <div class="kpi-label">LEITOS EM ALTA</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.tph}</div>
                    <div class="kpi-label">TPH (DIAS)</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.ppsMedio}%</div>
                    <div class="kpi-label">PPS MÉDIO</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.spictElegivel}%</div>
                    <div class="kpi-label">SPICT-BR ELEGÍVEL</div>
                </div>
            </div>
        </div>
        
        <!-- Gráficos -->
        <div class="executive-charts">
            <!-- Análise Preditiva de Altas -->
            <div class="chart-container" style="max-width: 800px; margin: 0 auto 24px auto;">
                <h3>Análise Preditiva de Altas em ${hoje}</h3>
                <canvas id="chartAltasExecutivo" height="300"></canvas>
            </div>
            
            <!-- Análise Preditiva de Concessões -->
            <div class="chart-container" style="max-width: 800px; margin: 0 auto 24px auto;">
                <h3>Análise Preditiva de Concessões em ${hoje}</h3>
                <canvas id="chartConcessoesExecutivo" height="300"></canvas>
            </div>
            
            <!-- Análise Preditiva de Linhas de Cuidado -->
            <div class="chart-container" style="max-width: 800px; margin: 0 auto 24px auto;">
                <h3>Análise Preditiva de Linha de Cuidados em ${hoje}</h3>
                <canvas id="chartLinhasExecutivo" height="300"></canvas>
            </div>
        </div>
    `;
    
    // Renderizar gráficos após o DOM estar pronto
    setTimeout(() => {
        renderGaugeOcupacao(kpis.ocupacaoGeral);
        renderGraficoAltasExecutivo(hospitaisComDados);
        renderGraficoConcessoesExecutivo(hospitaisComDados);
        renderGraficoLinhasExecutivo(hospitaisComDados);
    }, 100);
};

// Calcular KPIs consolidados APENAS dos hospitais com dados reais
function calcularKPIsExecutivos(hospitaisComDados = []) {
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let totalPPS = 0;
    let pacientesComPPS = 0;
    let pacientesElegiveis = 0;
    let totalPacientes = 0;
    let tempoTotalInternacao = 0; // EM DIAS
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital) return;
        
        const leitos = hospital.leitos || [];
        totalLeitos += leitos.length;
        
        leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                leitosOcupados++;
                totalPacientes++;
                
                // PPS
                if (leito.paciente.pps) {
                    const ppsValue = parseInt(leito.paciente.pps);
                    if (!isNaN(ppsValue)) {
                        totalPPS += ppsValue;
                        pacientesComPPS++;
                    }
                }
                
                // SPICT-BR
                if (leito.paciente.spictBr === 'Elegível') {
                    pacientesElegiveis++;
                }
                
                // Altas hoje
                if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.includes('Hoje')) {
                    leitosEmAlta++;
                }
                
                // *** CORREÇÃO DO TPH: CALCULAR EM DIAS, NÃO HORAS ***
                if (leito.paciente.admissao) {
                    const dias = calcularDiasInternacao(leito.paciente.admissao);
                    tempoTotalInternacao += dias;
                }
            }
        });
    });
    
    return {
        totalHospitais: hospitaisComDados.length,
        totalLeitos,
        leitosOcupados,
        leitosVagos: totalLeitos - leitosOcupados,
        leitosEmAlta,
        ocupacaoGeral: totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0,
        tph: totalPacientes > 0 ? Math.round(tempoTotalInternacao / totalPacientes) : 0, // *** TPH EM DIAS ***
        ppsMedio: pacientesComPPS > 0 ? Math.round(totalPPS / pacientesComPPS) : 0,
        spictElegivel: totalPacientes > 0 ? Math.round((pacientesElegiveis / totalPacientes) * 100) : 0
    };
}

// Calcular ocupação por hospital (somente se tiver dados)
function calcularOcupacaoHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital) return { ocupados: 0, total: 0, percentual: 0 };
    
    const leitos = hospital.leitos || [];
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const total = leitos.length;
    
    return {
        ocupados,
        total,
        percentual: total > 0 ? Math.round((ocupados / total) * 100) : 0
    };
}

// *** CORREÇÃO CRÍTICA: GAUGE HORIZONTAL COMO VELOCÍMETRO ***
function renderGaugeOcupacao(percentual) {
    const ctx = document.getElementById('gaugeOcupacao');
    if (!ctx) return;
    
    if (window.chartInstances && window.chartInstances.gaugeOcupacao) {
        window.chartInstances.gaugeOcupacao.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Definir cor baseada na ocupação
    let corGauge = '#16a34a'; // Verde para ocupação baixa
    if (percentual >= 80) corGauge = '#ef4444'; // Vermelho para alta
    else if (percentual >= 60) corGauge = '#f59e0b'; // Amarelo para média
    else if (percentual >= 40) corGauge = '#3b82f6'; // Azul para média-baixa
    
    window.chartInstances.gaugeOcupacao = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentual, 100 - percentual],
                backgroundColor: [corGauge, 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // *** CORREÇÃO CRÍTICA: GAUGE HORIZONTAL (VELOCÍMETRO) ***
            circumference: Math.PI, // 180 graus (semicírculo)
            rotation: Math.PI,      // Inicia na horizontal (180° rotacionado)
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// Função auxiliar para calcular dias de internação
function calcularDiasInternacao(dataAdmissao) {
    if (!dataAdmissao) return 0;
    try {
        // Tentar diferentes formatos de data
        let admissao;
        if (typeof dataAdmissao === 'string' && dataAdmissao.includes('/')) {
            // Formato brasileiro: DD/MM/YYYY
            const parts = dataAdmissao.split(' ')[0].split('/');
            admissao = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            admissao = new Date(dataAdmissao);
        }
        
        const hoje = new Date();
        const diff = hoje - admissao;
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    } catch (error) {
        console.warn('Erro ao calcular dias de internação:', error);
        return 0;
    }
}

// *** GRÁFICO DE ALTAS COM LEGENDAS EMBAIXO + DIVISÕES OURO/2R/3R ***
function renderGraficoAltasExecutivo(hospitaisComDados) {
    const ctx = document.getElementById('chartAltasExecutivo');
    if (!ctx) return;
    
    const dados = calcularDadosAltasExecutivoComDivisoes(hospitaisComDados);
    
    if (window.chartInstances && window.chartInstances.altasExecutivo) {
        window.chartInstances.altasExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    window.chartInstances.altasExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.categorias,
            datasets: dados.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    // *** CORREÇÃO CRÍTICA: LEGENDAS EMBAIXO + TEXTO BRANCO ***
                    display: true,
                    position: 'bottom',
                    align: 'start', // Justificado à esquerda
                    labels: {
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        padding: 8,
                        font: { size: 11, weight: 600 },
                        usePointStyle: true,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#60a5fa',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Quantidade de Beneficiários',
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 12, weight: 600 }
                    }
                },
                x: {
                    stacked: true,
                    ticks: {
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 11 },
                        maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// Gráfico de Concessões com legendas corrigidas
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
            labels: dados.periodos,
            datasets: dados.concessoes.map(item => ({
                label: item.nome,
                data: item.dados,
                backgroundColor: CHART_COLORS.concessoes[item.nome] || '#6b7280'
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    // *** CORREÇÃO CRÍTICA: LEGENDAS EMBAIXO + TEXTO BRANCO ***
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: {
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        padding: 8,
                        font: { size: 11, weight: 600 },
                        usePointStyle: true,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Quantidade de Beneficiários',
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 12, weight: 600 }
                    }
                },
                x: {
                    stacked: true,
                    ticks: {
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 11 },
                        maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// Gráfico de Linhas de Cuidado com legendas corrigidas
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
            labels: dados.periodos,
            datasets: dados.linhas.map(item => ({
                label: item.nome,
                data: item.dados,
                backgroundColor: CHART_COLORS.linhasCuidado[item.nome] || '#6b7280'
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    // *** CORREÇÃO CRÍTICA: LEGENDAS EMBAIXO + TEXTO BRANCO ***
                    display: true,
                    position: 'bottom',
                    align: 'start',
                    labels: {
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        padding: 8,
                        font: { size: 11, weight: 600 },
                        usePointStyle: true,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Quantidade de Beneficiários',
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 12, weight: 600 }
                    }
                },
                x: {
                    stacked: true,
                    ticks: {
                        color: '#ffffff', // *** TEXTO BRANCO ***
                        font: { size: 11 },
                        maxRotation: 0, // *** SEMPRE HORIZONTAL ***
                        minRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// *** FUNÇÕES DE CÁLCULO COM DIVISÕES OURO/2R/3R ***
function calcularDadosAltasExecutivoComDivisoes(hospitaisComDados) {
    // *** CATEGORIAS COM DIVISÕES OURO/2R/3R ***
    const categorias = ['Hoje', '24h', '48h', '72h', '96h'];
    
    // Datasets separados para cada divisão
    const datasets = [
        {
            label: 'Ouro',
            data: [0, 0, 0, 0, 0],
            backgroundColor: '#fbbf24', // Cor Ouro
            stack: 'stack'
        },
        {
            label: '2R',
            data: [0, 0, 0, 0, 0],
            backgroundColor: '#3b82f6', // Cor 2R
            stack: 'stack'
        },
        {
            label: '3R',
            data: [0, 0, 0, 0, 0],
            backgroundColor: '#8b5cf6', // Cor 3R
            stack: 'stack'
        },
        {
            label: 'Outros',
            data: [0, 0, 0, 0, 0],
            backgroundColor: '#6b7280', // Cor padrão
            stack: 'stack'
        }
    ];
    
    hospitaisComDados.forEach(hospitalId => {
        const hospitalData = window.hospitalData[hospitalId];
        if (!hospitalData) return;
        
        const leitos = hospitalData.leitos || [];
        
        leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente && leito.paciente.previsaoAlta) {
                const previsao = leito.paciente.previsaoAlta;
                
                // Mapear para índices dos períodos
                let periodoIndex = -1;
                let divisaoIndex = 3; // Padrão: Outros
                
                if (previsao.includes('Hoje')) {
                    periodoIndex = 0;
                    if (previsao.includes('Ouro')) divisaoIndex = 0;
                    else if (previsao.includes('2R')) divisaoIndex = 1;
                    else if (previsao.includes('3R')) divisaoIndex = 2;
                } else if (previsao.includes('24h')) {
                    periodoIndex = 1;
                    if (previsao.includes('Ouro')) divisaoIndex = 0;
                    else if (previsao.includes('2R')) divisaoIndex = 1;
                    else if (previsao.includes('3R')) divisaoIndex = 2;
                } else if (previsao === '48h') {
                    periodoIndex = 2;
                } else if (previsao === '72h') {
                    periodoIndex = 3;
                } else if (previsao === '96h') {
                    periodoIndex = 4;
                }
                
                if (periodoIndex >= 0) {
                    datasets[divisaoIndex].data[periodoIndex]++;
                }
            }
        });
    });
    
    return { categorias, datasets };
}

// Funções de cálculo de dados - APENAS hospitais com dados reais
function calcularDadosConcessoesExecutivo(hospitaisComDados) {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const concessoesMap = new Map();
    
    // Inicializar todas as concessões
    window.CONCESSOES_LIST.forEach(conc => {
        concessoesMap.set(conc, periodos.map(() => 0));
    });
    
    // REGRA CRÍTICA: Contar apenas no dia exato da alta - SOMENTE hospitais com dados
    hospitaisComDados.forEach(hospitalId => {
        const hospitalData = window.hospitalData[hospitalId];
        if (!hospitalData) return;
        
        const leitos = hospitalData.leitos || [];
        
        leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                const paciente = leito.paciente;
                if (!paciente.previsaoAlta || !paciente.concessoes) return;
                
                let periodoIndex = -1;
                
                // Mapear previsão para índice do período
                if (paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
                else if (paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
                else if (paciente.previsaoAlta === '48h') periodoIndex = 2;
                else if (paciente.previsaoAlta === '72h') periodoIndex = 3;
                else if (paciente.previsaoAlta === '96h') periodoIndex = 4;
                
                if (periodoIndex >= 0) {
                    paciente.concessoes.forEach(concessao => {
                        if (concessoesMap.has(concessao)) {
                            concessoesMap.get(concessao)[periodoIndex]++;
                        }
                    });
                }
            }
        });
    });
    
    const concessoes = [];
    concessoesMap.forEach((dados, nome) => {
        if (dados.some(d => d > 0)) {
            concessoes.push({ nome, dados });
        }
    });
    
    return { periodos, concessoes };
}

function calcularDadosLinhasExecutivo(hospitaisComDados) {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const linhasMap = new Map();
    
    // Inicializar todas as linhas
    window.LINHAS_CUIDADO_LIST.forEach(linha => {
        linhasMap.set(linha, periodos.map(() => 0));
    });
    
    // REGRA CRÍTICA: Contar apenas no dia exato da alta - SOMENTE hospitais com dados
    hospitaisComDados.forEach(hospitalId => {
        const hospitalData = window.hospitalData[hospitalId];
        if (!hospitalData) return;
        
        const leitos = hospitalData.leitos || [];
        
        leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                const paciente = leito.paciente;
                if (!paciente.previsaoAlta || !paciente.linhasCuidado) return;
                
                let periodoIndex = -1;
                
                // Mapear previsão para índice do período
                if (paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
                else if (paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
                else if (paciente.previsaoAlta === '48h') periodoIndex = 2;
                else if (paciente.previsaoAlta === '72h') periodoIndex = 3;
                else if (paciente.previsaoAlta === '96h') periodoIndex = 4;
                
                if (periodoIndex >= 0) {
                    paciente.linhasCuidado.forEach(linha => {
                        if (linhasMap.has(linha)) {
                            linhasMap.get(linha)[periodoIndex]++;
                        }
                    });
                }
            }
        });
    });
    
    const linhas = [];
    linhasMap.forEach((dados, nome) => {
        if (dados.some(d => d > 0)) {
            linhas.push({ nome, dados });
        }
    });
    
    return { periodos, linhas };
}

// *** DEFINIR CORES GLOBAIS PARA GARANTIA ***
if (!window.CHART_COLORS) {
    window.CHART_COLORS = {
        concessoes: {
            "Transição Domiciliar": "#007A53",
            "Aplicação domiciliar de medicamentos": "#582C83",
            "Fisioterapia": "#009639",
            "Fonoaudiologia": "#FF671F",
            "Aspiração": "#2E1A47",
            "Banho": "#8FD3F4",
            "Curativos": "#00BFB3",
            "Oxigenoterapia": "#64A70B",
            "Recarga de O2": "#00AEEF",
            "Orientação Nutricional - com dispositivo": "#FFC72C",
            "Orientação Nutricional - sem dispositivo": "#F4E285",
            "Clister": "#E8927C",
            "PICC": "#E03C31"
        },
        linhasCuidado: {
            "Assiste": "#ED0A72",
            "APS": "#007A33",
            "Cuidados Paliativos": "#00B5A2",
            "ICO (Insuficiência Coronariana)": "#A6192E",
            "Oncologia": "#6A1B9A",
            "Pediatria": "#5A646B",
            "Programa Autoimune - Gastroenterologia": "#5C5EBE",
            "Programa Autoimune - Neuro-desmielinizante": "#00AEEF",
            "Programa Autoimune - Neuro-muscular": "#00263A",
            "Programa Autoimune - Reumatologia": "#582D40",
            "Vida Mais Leve Care": "#FFB81C",
            "Crônicos - Cardiologia": "#C8102E",
            "Crônicos - Endocrinologia": "#582C83",
            "Crônicos - Geriatria": "#FF6F1D",
            "Crônicos - Melhor Cuidado": "#556F44",
            "Crônicos - Neurologia": "#0072CE",
            "Crônicos - Pneumologia": "#E35205",
            "Crônicos - Pós-bariátrica": "#003C57",
            "Crônicos - Reumatologia": "#5A0020"
        }
    };
}

logSuccess('Dashboard Executivo carregado - GAUGE HORIZONTAL + TPH CORRIGIDO + LEGENDAS BRANCAS EMBAIXO + DIVISÕES OURO/2R/3R');

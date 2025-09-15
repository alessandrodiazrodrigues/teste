// =================== DASHBOARD EXECUTIVO - REDE HOSPITALAR EXTERNA ===================

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo');
    
    const container = document.getElementById('executiveDashboardContainer');
    if (!container) return;
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    const kpis = calcularKPIsExecutivos();
    
    // HTML do Dashboard
    container.innerHTML = `
        <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
            Rede Hospitalar Externa
        </h2>
        
        <!-- Grid de KPIs -->
        <div class="executive-kpis-grid">
            <!-- Gauge Principal (2x2) -->
            <div class="kpi-principal">
                <div class="gauge-container">
                    <canvas id="gaugeOcupacao" width="200" height="100"></canvas>
                    <div class="gauge-value">${kpis.ocupacaoGeral}%</div>
                    <div class="gauge-label">OCUPAÇÃO GERAL</div>
                </div>
                <div class="hospitais-list">
                    ${Object.keys(CONFIG.HOSPITAIS).map(hospitalId => {
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
                <div class="kpi-value">${kpis.totalHospitais}</div>
                <div class="kpi-label">HOSPITAIS</div>
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
                <div class="kpi-value">${kpis.tph}h</div>
                <div class="kpi-label">TPH</div>
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
        
        <!-- Gráficos -->
        <div class="executive-charts">
            <!-- Análise Preditiva de Altas -->
            <div class="chart-container">
                <h3>Análise Preditiva de Altas em ${hoje}</h3>
                <canvas id="chartAltasExecutivo" height="300"></canvas>
            </div>
            
            <!-- Análise Preditiva de Concessões -->
            <div class="chart-container">
                <h3>Análise Preditiva de Concessões em ${hoje}</h3>
                <canvas id="chartConcessoesExecutivo" height="300"></canvas>
            </div>
            
            <!-- Análise Preditiva de Linhas de Cuidado -->
            <div class="chart-container">
                <h3>Análise Preditiva de Linha de Cuidados em ${hoje}</h3>
                <canvas id="chartLinhasExecutivo" height="300"></canvas>
            </div>
        </div>
    `;
    
    // Renderizar gráficos após o DOM estar pronto
    setTimeout(() => {
        renderGaugeOcupacao(kpis.ocupacaoGeral);
        renderGraficoAltasExecutivo();
        renderGraficoConcessoesExecutivo();
        renderGraficoLinhasExecutivo();
    }, 100);
};

// Calcular KPIs consolidados
function calcularKPIsExecutivos() {
    const hospitaisAtivos = Object.keys(CONFIG.HOSPITAIS);
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let totalPPS = 0;
    let pacientesComPPS = 0;
    let pacientesElegiveis = 0;
    let totalPacientes = 0;
    let tempoTotalInternacao = 0;
    
    hospitaisAtivos.forEach(hospitalId => {
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
                
                // Tempo de internação
                if (leito.paciente.admissao) {
                    const dias = calcularDiasInternacao(leito.paciente.admissao);
                    tempoTotalInternacao += dias;
                }
            }
        });
    });
    
    return {
        totalHospitais: hospitaisAtivos.length,
        totalLeitos,
        leitosOcupados,
        leitosVagos: totalLeitos - leitosOcupados,
        leitosEmAlta,
        ocupacaoGeral: totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0,
        tph: totalPacientes > 0 ? Math.round(tempoTotalInternacao / totalPacientes * 24) : 0,
        ppsMedio: pacientesComPPS > 0 ? Math.round(totalPPS / pacientesComPPS) : 0,
        spictElegivel: totalPacientes > 0 ? Math.round((pacientesElegiveis / totalPacientes) * 100) : 0
    };
}

// Calcular ocupação por hospital
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

// Renderizar Gauge de Ocupação
function renderGaugeOcupacao(percentual) {
    const ctx = document.getElementById('gaugeOcupacao');
    if (!ctx) return;
    
    destroyChart('gaugeOcupacao');
    
    window.chartInstances.gaugeOcupacao = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentual, 100 - percentual],
                backgroundColor: ['#3b82f6', 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: Math.PI,
            rotation: Math.PI,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// Gráfico de Altas Executivo
function renderGraficoAltasExecutivo() {
    const ctx = document.getElementById('chartAltasExecutivo');
    if (!ctx) return;
    
    const dados = calcularDadosAltasExecutivo();
    
    destroyChart('altasExecutivo');
    
    window.chartInstances.altasExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.categorias,
            datasets: dados.hospitais.map(hospital => ({
                label: hospital.nome,
                data: hospital.dados,
                backgroundColor: hospital.nome === 'Neomater' ? 
                    'rgba(255, 255, 255, 0.9)' : 
                    CHART_COLORS.hospitais[hospital.nome] || '#6b7280',
                borderColor: hospital.nome === 'Neomater' ? '#0a2b52' : 'transparent',
                borderWidth: hospital.nome === 'Neomater' ? 2 : 0
            }))
        },
        options: {
            ...defaultChartConfig,
            scales: {
                ...defaultChartConfig.scales,
                x: {
                    ...defaultChartConfig.scales.x,
                    ticks: {
                        ...defaultChartConfig.scales.x.ticks,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Gráfico de Concessões Executivo
function renderGraficoConcessoesExecutivo() {
    const ctx = document.getElementById('chartConcessoesExecutivo');
    if (!ctx) return;
    
    const dados = calcularDadosConcessoesExecutivo();
    
    destroyChart('concessoesExecutivo');
    
    window.chartInstances.concessoesExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.periodos,
            datasets: dados.concessoes.map(concessao => ({
                label: concessao.nome,
                data: concessao.dados,
                backgroundColor: CHART_COLORS.concessoes[concessao.nome] || '#6b7280'
            }))
        },
        options: {
            ...defaultChartConfig,
            scales: {
                ...defaultChartConfig.scales,
                x: { 
                    ...defaultChartConfig.scales.x,
                    stacked: true 
                },
                y: { 
                    ...defaultChartConfig.scales.y,
                    stacked: true
                }
            }
        }
    });
}

// Gráfico de Linhas de Cuidado Executivo
function renderGraficoLinhasExecutivo() {
    const ctx = document.getElementById('chartLinhasExecutivo');
    if (!ctx) return;
    
    const dados = calcularDadosLinhasExecutivo();
    
    destroyChart('linhasExecutivo');
    
    window.chartInstances.linhasExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.periodos,
            datasets: dados.linhas.map(linha => ({
                label: linha.nome,
                data: linha.dados,
                backgroundColor: CHART_COLORS.linhasCuidado[linha.nome] || '#6b7280'
            }))
        },
        options: {
            ...defaultChartConfig,
            scales: {
                ...defaultChartConfig.scales,
                x: { 
                    ...defaultChartConfig.scales.x,
                    stacked: true 
                },
                y: { 
                    ...defaultChartConfig.scales.y,
                    stacked: true
                }
            }
        }
    });
}

// Funções de cálculo de dados
function calcularDadosAltasExecutivo() {
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h'];
    const hospitais = [];
    
    Object.keys(CONFIG.HOSPITAIS).forEach(hospitalId => {
        const hospital = CONFIG.HOSPITAIS[hospitalId];
        const hospitalData = window.hospitalData[hospitalId];
        if (!hospitalData) return;
        
        const leitos = hospitalData.leitos || [];
        const dados = categorias.map(cat => {
            return leitos.filter(l => 
                l.status === 'ocupado' && 
                l.paciente && 
                l.paciente.previsaoAlta === cat
            ).length;
        });
        
        hospitais.push({
            nome: hospital.nome,
            dados: dados
        });
    });
    
    return { categorias, hospitais };
}

function calcularDadosConcessoesExecutivo() {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const concessoesMap = new Map();
    
    // Inicializar todas as concessões
    window.CONCESSOES_LIST.forEach(conc => {
        concessoesMap.set(conc, periodos.map(() => 0));
    });
    
    // REGRA CRÍTICA: Contar apenas no dia exato da alta
    Object.keys(CONFIG.HOSPITAIS).forEach(hospitalId => {
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

function calcularDadosLinhasExecutivo() {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const linhasMap = new Map();
    
    // Inicializar todas as linhas
    window.LINHAS_CUIDADO_LIST.forEach(linha => {
        linhasMap.set(linha, periodos.map(() => 0));
    });
    
    // REGRA CRÍTICA: Contar apenas no dia exato da alta
    Object.keys(CONFIG.HOSPITAIS).forEach(hospitalId => {
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

logSuccess('Dashboard Executivo carregado');

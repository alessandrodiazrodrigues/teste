// =================== DASHBOARD CORRIGIDO - GRÁFICOS FUNCIONAIS ===================

// =================== DASHBOARD EXECUTIVO CORRIGIDO ===================
window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo...');
    
    const container = document.getElementById('dashExecutivoContent');
    if (!container) {
        // Criar container se não existir
        const section = document.getElementById('dash2');
        if (section) {
            const newContainer = document.createElement('div');
            newContainer.id = 'dashExecutivoContent';
            section.appendChild(newContainer);
            return window.renderDashboardExecutivo();
        }
        logError('Container dashExecutivoContent não encontrado');
        return;
    }
    
    // Verificar se há dados dos hospitais
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h3>⏳ Carregando dados dos hospitais...</h3>
                <p>Conectando com a API Google Apps Script...</p>
                <button onclick="window.loadHospitalData().then(() => window.renderDashboardExecutivo())" 
                        style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🔄 Recarregar Dados
                </button>
            </div>
        `;
        // Tentar carregar automaticamente
        if (window.loadHospitalData) {
            setTimeout(() => {
                window.loadHospitalData().then(() => {
                    setTimeout(() => window.renderDashboardExecutivo(), 1000);
                });
            }, 2000);
        }
        return;
    }
    
    // Calcular KPIs consolidados
    const kpis = calcularKPIsConsolidados();
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <!-- Título Principal -->
            <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
                Rede Hospitalar Externa
            </h2>
            
            <!-- KPIs Grid -->
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 30px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Box Principal com Gauge -->
                <div style="grid-column: span 2; grid-row: span 2; background: #1a1f2e; border-radius: 12px; padding: 20px; display: flex; align-items: center; color: white;">
                    <div style="position: relative; width: 200px; height: 100px;">
                        <canvas id="gaugeExecutivo" width="200" height="100"></canvas>
                        <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 24px; font-weight: 700; color: #60a5fa;">
                            ${kpis.ocupacaoGeral}%
                        </div>
                        <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); font-size: 10px; text-transform: uppercase; color: #e2e8f0; font-weight: 600;">
                            OCUPAÇÃO GERAL
                        </div>
                    </div>
                    <div style="flex: 1; padding-left: 20px; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
                        ${Object.entries(window.hospitalData).map(([id, hospital]) => {
                            const ocupados = hospital.leitos ? hospital.leitos.filter(l => l.status === 'ocupado').length : 0;
                            const total = hospital.leitos ? hospital.leitos.length : 0;
                            const perc = total > 0 ? Math.round((ocupados / total) * 100) : 0;
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                                    <span style="color: #e2e8f0; font-weight: 600;">${hospital.nome}</span>
                                    <span style="color: #60a5fa; font-weight: 700;">${perc}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- KPIs Linha 1 -->
                ${criarKPIBox(Object.keys(window.hospitalData).length, 'HOSPITAIS')}
                ${criarKPIBox(kpis.totalLeitos, 'TOTAL DE LEITOS')}
                ${criarKPIBox(kpis.leitosOcupados, 'LEITOS OCUPADOS')}
                ${criarKPIBox(kpis.leitosVagos, 'LEITOS VAGOS')}
                
                <!-- KPIs Linha 2 -->
                ${criarKPIBox(kpis.leitosEmAlta, 'LEITOS EM ALTA')}
                ${criarKPIBox('3.2d', 'TPH')}
                ${criarKPIBox(kpis.ppsMedia + '%', 'PPS MÉDIO')}
                ${criarKPIBox(kpis.spictPerc + '%', 'SPICT-BR ELEGÍVEL')}
            </div>
            
            <!-- Gráficos Executivos -->
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        📊 Análise Preditiva de Altas em ${new Date().toLocaleDateString('pt-BR')}
                    </h3>
                    <canvas id="graficoAltasExecutivo" height="300"></canvas>
                </div>
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        🏥 Análise Preditiva de Concessões em ${new Date().toLocaleDateString('pt-BR')}
                    </h3>
                    <canvas id="graficoConcessoesExecutivo" height="300"></canvas>
                </div>
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        🩺 Análise Preditiva de Linha de Cuidados em ${new Date().toLocaleDateString('pt-BR')}
                    </h3>
                    <canvas id="graficoLinhasExecutivo" height="300"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar gráficos com delay maior para garantir que o DOM está pronto
    setTimeout(() => {
        try {
            renderGaugeExecutivoCorreto(kpis.ocupacaoGeral);
            renderGraficoAltasExecutivoCorreto();
            renderGraficoConcessoesExecutivoCorreto();
            renderGraficoLinhasExecutivoCorreto();
            logSuccess('Gráficos executivos renderizados com sucesso');
        } catch (error) {
            logError('Erro ao renderizar gráficos executivos:', error);
        }
    }, 800);
    
    logSuccess('Dashboard Executivo renderizado');
};

// =================== DASHBOARD HOSPITALAR CORRIGIDO ===================
window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        // Criar container se não existir
        const section = document.getElementById('dash1');
        if (section) {
            const newContainer = document.createElement('div');
            newContainer.id = 'dashHospitalarContent';
            section.appendChild(newContainer);
            return window.renderDashboardHospitalar();
        }
        logError('Container dashHospitalarContent não encontrado');
        return;
    }
    
    // Verificar se há dados dos hospitais
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h3>⏳ Carregando dados dos hospitais...</h3>
                <p>Conectando com a API Google Apps Script...</p>
                <button onclick="window.loadHospitalData().then(() => window.renderDashboardHospitalar())" 
                        style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🔄 Recarregar Dados
                </button>
            </div>
        `;
        // Tentar carregar automaticamente
        if (window.loadHospitalData) {
            setTimeout(() => {
                window.loadHospitalData().then(() => {
                    setTimeout(() => window.renderDashboardHospitalar(), 1000);
                });
            }, 2000);
        }
        return;
    }
    
    let html = '<div style="padding: 20px;">';
    html += `<h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
                🏥 Dashboard Hospitalar
             </h2>`;
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(600px, 1fr)); gap: 20px;">';
    
    Object.entries(window.hospitalData).forEach(([hospitalId, hospital]) => {
        if (!hospital.leitos) return;
        
        const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
        const vagos = hospital.leitos.length - ocupados;
        const emAlta = hospital.leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente &&
            l.paciente.previsaoAlta && 
            l.paciente.previsaoAlta.includes('Hoje')
        ).length;
        const ocupacao = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
        
        html += `
            <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; text-transform: uppercase; color: #60a5fa; text-align: center;">
                    ${hospital.nome}
                </h3>
                
                <!-- KPIs do Hospital -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <div style="flex-shrink: 0; text-align: center; position: relative; width: 120px; height: 60px;">
                        <canvas id="gauge${hospitalId}" width="120" height="60"></canvas>
                        <div style="position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); font-size: 14px; font-weight: 700; color: #60a5fa;">
                            ${ocupacao}%
                        </div>
                    </div>
                    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                        ${criarKPIMini(hospital.leitos.length, 'TOTAL')}
                        ${criarKPIMini(ocupados, 'OCUPADOS')}
                        ${criarKPIMini(vagos, 'VAGOS')}
                        ${criarKPIMini(emAlta, 'EM ALTA')}
                    </div>
                </div>
                
                <!-- *** GRÁFICOS EM LAYOUT VERTICAL FORÇADO *** -->
                <div style="display: grid !important; grid-template-columns: 1fr !important; gap: 20px !important; margin-top: 20px;">
                    <!-- Gráfico de Altas -->
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
                        <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                            📈 Projeção de Altas em ${new Date().toLocaleDateString('pt-BR')}
                        </h4>
                        <canvas id="graficoAltas${hospitalId}" height="200"></canvas>
                    </div>
                    
                    <!-- Gráfico de Concessões -->
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
                        <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                            🏥 Projeção de Concessões
                        </h4>
                        <canvas id="graficoConcessoes${hospitalId}" height="200"></canvas>
                    </div>
                    
                    <!-- Gráfico de Linhas -->
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
                        <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                            🩺 Projeção de Linhas de Cuidado
                        </h4>
                        <canvas id="graficoLinhas${hospitalId}" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // Renderizar gráficos com delay para garantir DOM pronto
    setTimeout(() => {
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospitalData = window.hospitalData[hospitalId];
            if (hospitalData && hospitalData.leitos) {
                try {
                    renderGaugeHospitalCorreto(hospitalId);
                    renderGraficoAltasHospitalCorreto(hospitalId, hospitalData);
                    renderGraficoConcessoesHospitalCorreto(hospitalId, hospitalData);
                    renderGraficoLinhasHospitalCorreto(hospitalId, hospitalData);
                    logSuccess(`Gráficos do ${hospitalData.nome} renderizados`);
                } catch (error) {
                    logError(`Erro nos gráficos do ${hospitalData.nome}:`, error);
                }
            }
        });
        logSuccess('Todos os gráficos hospitalares renderizados');
    }, 800);
    
    logSuccess('Dashboard Hospitalar renderizado com layout vertical');
};

// =================== FUNÇÕES AUXILIARES ===================
function criarKPIBox(valor, label) {
    return `
        <div style="background: #1a1f2e; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white; padding: 15px;">
            <div style="font-size: 28px; font-weight: 700; color: #60a5fa; margin-bottom: 4px;">
                ${valor}
            </div>
            <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">
                ${label}
            </div>
        </div>
    `;
}

function criarKPIMini(valor, label) {
    return `
        <div style="text-align: center; background: rgba(255, 255, 255, 0.03); border-radius: 6px; padding: 8px;">
            <div style="font-size: 20px; font-weight: 700; color: #60a5fa; margin-bottom: 2px;">
                ${valor}
            </div>
            <div style="font-size: 9px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">
                ${label}
            </div>
        </div>
    `;
}

// =================== CALCULAR KPIs CONSOLIDADOS ===================
function calcularKPIsConsolidados() {
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let ppsTotal = 0;
    let ppsCont = 0;
    let spictElegiveis = 0;
    let spictTotal = 0;
    
    Object.values(window.hospitalData).forEach(hospital => {
        if (!hospital.leitos) return;
        
        totalLeitos += hospital.leitos.length;
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                leitosOcupados++;
                
                if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.includes('Hoje')) {
                    leitosEmAlta++;
                }
                
                if (leito.paciente.pps) {
                    const ppsNum = parseInt(leito.paciente.pps);
                    if (!isNaN(ppsNum)) {
                        ppsTotal += ppsNum;
                        ppsCont++;
                    }
                }
                
                if (leito.paciente.spictBr === 'Elegível') {
                    spictElegiveis++;
                }
                spictTotal++;
            }
        });
    });
    
    return {
        totalLeitos,
        leitosOcupados,
        leitosVagos: totalLeitos - leitosOcupados,
        leitosEmAlta,
        ocupacaoGeral: totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0,
        ppsMedia: ppsCont > 0 ? Math.round(ppsTotal / ppsCont) : 0,
        spictPerc: spictTotal > 0 ? Math.round((spictElegiveis / spictTotal) * 100) : 0
    };
}

// =================== RENDERIZAÇÃO DE GRÁFICOS ===================

// Gauge Executivo
function renderGaugeExecutivoCorreto(ocupacao) {
    const canvas = document.getElementById('gaugeExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Destruir gráfico anterior
    if (window.chartInstances && window.chartInstances.gaugeExecutivo) {
        window.chartInstances.gaugeExecutivo.destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances.gaugeExecutivo = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [ocupacao, 100 - ocupacao],
                    backgroundColor: [
                        ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f59e0b' : '#16a34a',
                        '#e5e7eb'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: false,
                cutout: '70%',
                circumference: 180,
                rotation: 270,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
        logInfo('Gauge executivo renderizado');
    } catch (error) {
        logError('Erro no gauge executivo:', error);
    }
}

// Gráfico de Altas Executivo
function renderGraficoAltasExecutivoCorreto() {
    const canvas = document.getElementById('graficoAltasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const dadosConsolidados = consolidarDadosParaGrafico();
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h', 'SP'];
    
    const dados = categorias.map(cat => {
        return dadosConsolidados.filter(l => 
            l.status === 'ocupado' && 
            l.paciente && 
            l.paciente.previsaoAlta === cat
        ).length;
    });
    
    const cores = categorias.map(cat => {
        if (cat.includes('Ouro')) return '#fbbf24';
        if (cat.includes('2R')) return '#3b82f6';
        if (cat.includes('3R')) return '#8b5cf6';
        if (cat === 'SP') return '#6b7280';
        if (cat === '48h') return '#10b981';
        if (cat === '72h') return '#f59e0b';
        if (cat === '96h') return '#ef4444';
        return '#10b981';
    });
    
    const ctx = canvas.getContext('2d');
    if (window.chartInstances && window.chartInstances.graficoAltasExecutivo) {
        window.chartInstances.graficoAltasExecutivo.destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances.graficoAltasExecutivo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: [{
                    label: 'Altas Previstas',
                    data: dados,
                    backgroundColor: cores,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#e2e8f0',
                            callback: function(value) {
                                return Number.isInteger(value) ? value : null;
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#e2e8f0', maxRotation: 0 },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
        logInfo('Gráfico altas executivo renderizado');
    } catch (error) {
        logError('Erro no gráfico altas executivo:', error);
    }
}

// Gráfico de Concessões Executivo
function renderGraficoConcessoesExecutivoCorreto() {
    const canvas = document.getElementById('graficoConcessoesExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const dadosConsolidados = consolidarDadosParaGrafico();
    const dadosConcessoes = calcularDadosConcessoesConsolidados(dadosConsolidados);
    
    const ctx = canvas.getContext('2d');
    if (window.chartInstances && window.chartInstances.graficoConcessoesExecutivo) {
        window.chartInstances.graficoConcessoesExecutivo.destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances.graficoConcessoesExecutivo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosConcessoes.periodos,
                datasets: dadosConcessoes.concessoes.map(item => ({
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
                        display: true,
                        position: 'left',
                        labels: { color: '#ffffff', font: { size: 10 } }
                    }
                },
                scales: {
                    x: { stacked: true, ticks: { color: '#e2e8f0' } },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, color: '#e2e8f0' } }
                }
            }
        });
        logInfo('Gráfico concessões executivo renderizado');
    } catch (error) {
        logError('Erro no gráfico concessões executivo:', error);
    }
}

// Gráfico de Linhas Executivo
function renderGraficoLinhasExecutivoCorreto() {
    const canvas = document.getElementById('graficoLinhasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const dadosConsolidados = consolidarDadosParaGrafico();
    const dadosLinhas = calcularDadosLinhasConsolidadas(dadosConsolidados);
    
    const ctx = canvas.getContext('2d');
    if (window.chartInstances && window.chartInstances.graficoLinhasExecutivo) {
        window.chartInstances.graficoLinhasExecutivo.destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances.graficoLinhasExecutivo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosLinhas.periodos,
                datasets: dadosLinhas.linhas.map(item => ({
                    label: item.nome,
                    data: item.dados,
                    backgroundColor: getCorLinha(item.nome)
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'left',
                        labels: { color: '#ffffff', font: { size: 10 } }
                    }
                },
                scales: {
                    x: { stacked: true, ticks: { color: '#e2e8f0' } },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, color: '#e2e8f0' } }
                }
            }
        });
        logInfo('Gráfico linhas executivo renderizado');
    } catch (error) {
        logError('Erro no gráfico linhas executivo:', error);
    }
}

// =================== GRÁFICOS HOSPITALARES ===================
function renderGaugeHospitalCorreto(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospitalData = window.hospitalData[hospitalId];
    if (!hospitalData || !hospitalData.leitos) return;
    
    const ocupados = hospitalData.leitos.filter(l => l.status === 'ocupado').length;
    const total = hospitalData.leitos.length;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    const ctx = canvas.getContext('2d');
    const chartKey = `gauge${hospitalId}`;
    
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [ocupacao, 100 - ocupacao],
                    backgroundColor: [
                        ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f59e0b' : '#16a34a',
                        'rgba(255, 255, 255, 0.1)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                circumference: Math.PI,
                rotation: Math.PI,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    } catch (error) {
        logError(`Erro gauge ${hospitalId}:`, error);
    }
}

function renderGraficoAltasHospitalCorreto(hospitalId, hospitalData) {
    const canvas = document.getElementById(`graficoAltas${hospitalId}`);
    if (!canvas || !hospitalData.leitos || typeof Chart === 'undefined') return;
    
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h', 'SP'];
    const dados = categorias.map(cat => {
        return hospitalData.leitos.filter(l => 
            l.status === 'ocupado' && l.paciente && l.paciente.previsaoAlta === cat
        ).length;
    });
    
    const cores = categorias.map(cat => {
        if (cat.includes('Ouro')) return '#fbbf24';
        if (cat.includes('2R')) return '#3b82f6';
        if (cat.includes('3R')) return '#8b5cf6';
        if (cat === 'SP') return '#6b7280';
        return '#10b981';
    });
    
    const ctx = canvas.getContext('2d');
    const chartKey = `graficoAltas${hospitalId}`;
    
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: [{ data: dados, backgroundColor: cores }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#e2e8f0' } },
                    x: { ticks: { color: '#e2e8f0', maxRotation: 45 } }
                }
            }
        });
    } catch (error) {
        logError(`Erro gráfico altas ${hospitalId}:`, error);
    }
}

function renderGraficoConcessoesHospitalCorreto(hospitalId, hospitalData) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || !hospitalData.leitos || typeof Chart === 'undefined') return;
    
    const dados = calcularDadosConcessoesConsolidados(hospitalData.leitos);
    
    const ctx = canvas.getContext('2d');
    const chartKey = `graficoConcessoes${hospitalId}`;
    
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.periodos,
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
                    legend: { display: true, position: 'left', labels: { color: '#ffffff', font: { size: 9 } } }
                },
                scales: {
                    x: { stacked: true, ticks: { color: '#e2e8f0' } },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, color: '#e2e8f0' } }
                }
            }
        });
    } catch (error) {
        logError(`Erro gráfico concessões ${hospitalId}:`, error);
    }
}

function renderGraficoLinhasHospitalCorreto(hospitalId, hospitalData) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || !hospitalData.leitos || typeof Chart === 'undefined') return;
    
    const dados = calcularDadosLinhasConsolidadas(hospitalData.leitos);
    
    const ctx = canvas.getContext('2d');
    const chartKey = `graficoLinhas${hospitalId}`;
    
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    try {
        window.chartInstances = window.chartInstances || {};
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.periodos,
                datasets: dados.linhas.map(item => ({
                    label: item.nome,
                    data: item.dados,
                    backgroundColor: getCorLinha(item.nome)
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'left', labels: { color: '#ffffff', font: { size: 9 } } }
                },
                scales: {
                    x: { stacked: true, ticks: { color: '#e2e8f0' } },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, color: '#e2e8f0' } }
                }
            }
        });
    } catch (error) {
        logError(`Erro gráfico linhas ${hospitalId}:`, error);
    }
}

// =================== FUNÇÕES AUXILIARES DE DADOS ===================
function consolidarDadosParaGrafico() {
    const leitosConsolidados = [];
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital.leitos) {
            leitosConsolidados.push(...hospital.leitos);
        }
    });
    return leitosConsolidados;
}

function calcularDadosConcessoesConsolidados(leitos) {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const concessoesMap = new Map();
    
    const concessoesList = window.CONCESSOES_LIST || [
        'Transição Domiciliar', 'Fisioterapia', 'Fonoaudiologia', 
        'Curativos', 'Oxigenoterapia', 'Banho'
    ];
    
    concessoesList.forEach(conc => {
        concessoesMap.set(conc, periodos.map(() => 0));
    });
    
    leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && 
            leito.paciente.previsaoAlta && leito.paciente.concessoes) {
            
            let periodoIndex = -1;
            if (leito.paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (leito.paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
            else if (leito.paciente.previsaoAlta === '48h') periodoIndex = 2;
            else if (leito.paciente.previsaoAlta === '72h') periodoIndex = 3;
            else if (leito.paciente.previsaoAlta === '96h') periodoIndex = 4;
            
            if (periodoIndex >= 0 && Array.isArray(leito.paciente.concessoes)) {
                leito.paciente.concessoes.forEach(concessao => {
                    if (concessoesMap.has(concessao)) {
                        concessoesMap.get(concessao)[periodoIndex]++;
                    }
                });
            }
        }
    });
    
    const concessoes = [];
    concessoesMap.forEach((dados, nome) => {
        if (dados.some(d => d > 0)) {
            concessoes.push({ nome, dados });
        }
    });
    
    return { periodos, concessoes };
}

function calcularDadosLinhasConsolidadas(leitos) {
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const linhasMap = new Map();
    
    const linhasList = window.LINHAS_CUIDADO_LIST || [
        'APS', 'Cuidados Paliativos', 'Oncologia', 'Pediatria'
    ];
    
    linhasList.forEach(linha => {
        linhasMap.set(linha, periodos.map(() => 0));
    });
    
    leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && 
            leito.paciente.previsaoAlta && leito.paciente.linhasCuidado) {
            
            let periodoIndex = -1;
            if (leito.paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (leito.paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
            else if (leito.paciente.previsaoAlta === '48h') periodoIndex = 2;
            else if (leito.paciente.previsaoAlta === '72h') periodoIndex = 3;
            else if (leito.paciente.previsaoAlta === '96h') periodoIndex = 4;
            
            if (periodoIndex >= 0 && Array.isArray(leito.paciente.linhasCuidado)) {
                leito.paciente.linhasCuidado.forEach(linha => {
                    if (linhasMap.has(linha)) {
                        linhasMap.get(linha)[periodoIndex]++;
                    }
                });
            }
        }
    });
    
    const linhas = [];
    linhasMap.forEach((dados, nome) => {
        if (dados.some(d => d > 0)) {
            linhas.push({ nome, dados });
        }
    });
    
    return { periodos, linhas };
}

// =================== CORES DOS GRÁFICOS ===================
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
        'Recarga de O2': '#00AEEF',
        'Orientação Nutricional - com dispositivo': '#FFC72C',
        'Orientação Nutricional - sem dispositivo': '#F4E285',
        'Clister': '#E8927C',
        'PICC': '#E03C31'
    };
    return cores[nome] || '#6b7280';
}

function getCorLinha(nome) {
    const cores = {
        'Assiste': '#ED0A72',
        'APS': '#007A33',
        'Cuidados Paliativos': '#00B5A2',
        'ICO (Insuficiência Coronariana)': '#A6192E',
        'Oncologia': '#6A1B9A',
        'Pediatria': '#5A646B',
        'Programa Autoimune - Gastroenterologia': '#5C5EBE',
        'Programa Autoimune - Neuro-desmielinizante': '#00AEEF',
        'Programa Autoimune - Neuro-muscular': '#00263A',
        'Programa Autoimune - Reumatologia': '#582D40',
        'Vida Mais Leve Care': '#FFB81C',
        'Crônicos - Cardiologia': '#C8102E',
        'Crônicos - Endocrinologia': '#582C83',
        'Crônicos - Geriatria': '#FF6F1D',
        'Crônicos - Melhor Cuidado': '#556F44',
        'Crônicos - Neurologia': '#0072CE',
        'Crônicos - Pneumologia': '#E35205',
        'Crônicos - Pós-bariátrica': '#003C57',
        'Crônicos - Reumatologia': '#5A0020'
    };
    return cores[nome] || '#6b7280';
}

console.log('🔧 Dashboard.js corrigido carregado - Gráficos funcionais com dados da API');

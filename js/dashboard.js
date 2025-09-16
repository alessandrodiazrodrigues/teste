// =================== DASHBOARD EXECUTIVO ===================
window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo');
    
    // Buscar container, criando se necessário
    let container = document.getElementById('dashExecutivoContent');
    if (!container) {
        const dash2Section = document.getElementById('dash2');
        if (dash2Section) {
            container = document.createElement('div');
            container.id = 'dashExecutivoContent';
            dash2Section.appendChild(container);
        }
    }
    
    if (!container) {
        logError('Container dashExecutivoContent não encontrado');
        return;
    }
    
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
                <h2 style="color: #1a1f2e; margin-bottom: 20px;">🏥 Rede Hospitalar Externa</h2>
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
    
    // Calcular KPIs consolidados APENAS dos hospitais com dados reais
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let ppsTotal = 0;
    let ppsCont = 0;
    let spictElegiveis = 0;
    let spictTotal = 0;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        totalLeitos += hospital.leitos.length;
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                leitosOcupados++;
                
                if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.startsWith('Hoje')) {
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
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const ppsMedia = ppsCont > 0 ? Math.round(ppsTotal / ppsCont) : 0;
    const spictPerc = spictTotal > 0 ? Math.round((spictElegiveis / spictTotal) * 100) : 0;
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                🏥 Rede Hospitalar Externa
            </h2>
            
            <!-- Aviso sobre dados reais -->
            <div style="background: #e6f3ff; border: 2px solid #0066cc; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                <p style="margin: 0; color: #0066cc; font-weight: 600;">
                    📊 <strong>Dados reais da planilha Google</strong> • ${hospitaisComDados.length} hospitais ativos • ${leitosOcupados} pacientes internados
                </p>
            </div>
            
            <!-- KPIs Grid com Gauge Principal -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; grid-template-rows: auto auto; gap: 16px; margin-bottom: 30px;">
                <!-- Gauge Principal (ocupa 2 colunas e 2 linhas) -->
                <div style="grid-column: 1; grid-row: 1 / 3; background: #1a1f2e; color: white; padding: 20px; border-radius: 12px; display: flex; align-items: center;">
                    <div style="flex: 1;">
                        <div style="width: 200px; height: 100px; position: relative; margin: 0 auto;">
                            <canvas id="gaugeOcupacaoExecutivo" width="200" height="100"></canvas>
                            <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 24px; font-weight: 700; color: #60a5fa;">${ocupacaoGeral}%</div>
                            <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); font-size: 10px; text-transform: uppercase; color: #e2e8f0; font-weight: 600;">OCUPAÇÃO GERAL</div>
                        </div>
                    </div>
                    <div style="flex: 1; padding-left: 20px;">
                        <h4 style="color: #60a5fa; margin-bottom: 12px; font-size: 14px;">Hospitais Ativos:</h4>
                        ${hospitaisComDados.map(hospitalId => {
                            const hospital = window.hospitalData[hospitalId];
                            const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
                            const perc = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
                            return `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
                                    <span style="color: #e2e8f0;">${CONFIG.HOSPITAIS[hospitalId].nome}</span>
                                    <span style="color: #60a5fa; font-weight: 700;">${perc}%</span>
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
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${totalLeitos}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">TOTAL DE LEITOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${leitosOcupados}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS OCUPADOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${leitosVagos}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS VAGOS</div>
                </div>
                
                <!-- KPIs linha 2 -->
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${leitosEmAlta}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS EM ALTA</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">3.2d</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">TPH</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${ppsMedia}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">PPS MÉDIO</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${spictPerc}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">SPICT-BR ELEGÍVEL</div>
                </div>
            </div>
            
            <!-- GRÁFICOS EXECUTIVOS -->
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <!-- Gráfico de Altas -->
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        📊 Análise Preditiva de Altas em ${hoje}
                    </h3>
                    <div style="height: 300px;">
                        <canvas id="graficoAltasExecutivo" style="max-height: 300px;"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Concessões -->
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        🎯 Análise Preditiva de Concessões em ${hoje}
                    </h3>
                    <div style="height: 300px;">
                        <canvas id="graficoConcessoesExecutivo" style="max-height: 300px;"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Linhas de Cuidado -->
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        🏥 Análise Preditiva de Linha de Cuidados em ${hoje}
                    </h3>
                    <div style="height: 300px;">
                        <canvas id="graficoLinhasExecutivo" style="max-height: 300px;"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar gráficos após DOM estar pronto
    setTimeout(() => {
        renderGaugeExecutivo(ocupacaoGeral);
        renderGraficosExecutivos(hospitaisComDados);
        logSuccess('Dashboard Executivo com todos os gráficos renderizado');
    }, 100);
};

// =================== DASHBOARD HOSPITALAR (LAYOUT VERTICAL CORRIGIDO) ===================
window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar...');
    
    // Buscar container, criando se necessário
    let container = document.getElementById('dashHospitalarContent');
    if (!container) {
        const dash1Section = document.getElementById('dash1');
        if (dash1Section) {
            container = document.createElement('div');
            container.id = 'dashHospitalarContent';
            dash1Section.appendChild(container);
        }
    }
    
    if (!container) {
        logError('Container dashHospitalarContent não encontrado');
        return;
    }
    
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
                <h3>📋 Aguardando Dados da Planilha</h3>
                <p>Nenhum hospital possui dados de pacientes na planilha Google.</p>
                <p><strong>Hospitais configurados:</strong> ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="dashboard-hospitalar">';
    html += `<h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
                Dashboard Hospitalar
             </h2>`;
    
    // Aviso sobre dados reais
    html += `
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">
                📊 <strong>Mostrando apenas hospitais com dados reais:</strong> ${hospitaisComDados.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')}
            </p>
        </div>
    `;
    
    html += '<div class="hospitalar-grid">';
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
        const vagos = hospital.leitos.length - ocupados;
        const emAlta = hospital.leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente &&
            l.paciente.previsaoAlta && 
            l.paciente.previsaoAlta.startsWith('Hoje')
        ).length;
        const ocupacao = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
        
        html += `
            <div class="hospital-section" data-hospital="${hospitalId}">
                <h3 class="hospital-title">${CONFIG.HOSPITAIS[hospitalId].nome}</h3>
                
                <!-- KPIs do Hospital -->
                <div class="hospital-kpis">
                    <div class="hospital-gauge">
                        <canvas id="gauge${hospitalId}" width="120" height="60"></canvas>
                        <div class="gauge-label">${ocupacao}%</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${hospital.leitos.length}</div>
                        <div class="kpi-label">TOTAL</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${ocupados}</div>
                        <div class="kpi-label">OCUPADOS</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${vagos}</div>
                        <div class="kpi-label">VAGOS</div>
                    </div>
                    <div class="kpi-mini">
                        <div class="kpi-value">${emAlta}</div>
                        <div class="kpi-label">EM ALTA</div>
                    </div>
                </div>
                
                <!-- *** CORREÇÃO CRÍTICA: GRÁFICOS EM LAYOUT VERTICAL *** -->
                <div class="hospital-graficos">
                    <!-- Gráfico 1: Projeção de Altas -->
                    <div class="chart-container">
                        <h4>Projeção de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <canvas id="graficoAltas${hospitalId}" height="200"></canvas>
                    </div>
                    
                    <!-- Gráfico 2: Projeção de Concessões -->
                    <div class="chart-container">
                        <h4>Projeção de Concessões em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-type-selector">
                            <button class="chart-type-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar">Barras</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="scatter">Bolinhas</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="line">Linha</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="area">Área</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="radar">Radar</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="polar">Polar</button>
                        </div>
                        <canvas id="graficoConcessoes${hospitalId}" height="200"></canvas>
                    </div>
                    
                    <!-- Gráfico 3: Projeção de Linhas de Cuidado -->
                    <div class="chart-container">
                        <h4>Projeção de Linha de Cuidados em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-type-selector">
                            <button class="chart-type-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="scatter">Bolinhas</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="line">Linha</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="area">Área</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="radar">Radar</button>
                            <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="polar">Polar</button>
                        </div>
                        <canvas id="graficoLinhas${hospitalId}" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // *** ADICIONAR EVENT LISTENERS PARA OS 7 TIPOS DE GRÁFICO ***
    setTimeout(() => {
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hospital = e.target.dataset.hospital;
                const chart = e.target.dataset.chart;
                const type = e.target.dataset.type;
                
                // Atualizar botões visuais
                const selector = e.target.closest('.chart-type-selector');
                selector.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Re-renderizar gráfico com novo tipo
                if (chart === 'concessoes') {
                    const hospitalData = window.hospitalData[hospital];
                    if (hospitalData) {
                        window.renderGraficoConcessoes(`graficoConcessoes${hospital}`, hospitalData, type);
                    }
                } else if (chart === 'linhas') {
                    const hospitalData = window.hospitalData[hospital];
                    if (hospitalData) {
                        window.renderGraficoLinhas(`graficoLinhas${hospital}`, hospitalData, type);
                    }
                }
                
                logInfo(`Gráfico alterado: ${hospital} - ${chart} - ${type}`);
            });
        });
        
        // Renderizar todos os gráficos iniciais APENAS para hospitais com dados
        hospitaisComDados.forEach(hospitalId => {
            renderGaugeHospital(hospitalId);
            
            const hospitalData = window.hospitalData[hospitalId];
            if (hospitalData) {
                window.renderGraficoAltas(`graficoAltas${hospitalId}`, hospitalData);
                window.renderGraficoConcessoes(`graficoConcessoes${hospitalId}`, hospitalData, 'bar');
                window.renderGraficoLinhas(`graficoLinhas${hospitalId}`, hospitalData, 'bar');
            }
        });
    }, 100);
    
    logSuccess('Dashboard Hospitalar renderizado com layout vertical');
};

// =================== FUNÇÕES DE GRÁFICOS ===================

// Renderizar Gauge Executivo
function renderGaugeExecutivo(ocupacao) {
    const canvas = document.getElementById('gaugeOcupacaoExecutivo');
    if (!canvas) return;
    
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
                    ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f59e0b' : '#3b82f6',
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
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// Renderizar todos os gráficos executivos
function renderGraficosExecutivos(hospitaisComDados) {
    // Consolidar dados apenas de hospitais com dados reais
    const dadosConsolidados = {
        leitos: []
    };
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            dadosConsolidados.leitos.push(...hospital.leitos);
        }
    });
    
    // Gráfico de Altas
    renderGraficoAltasExecutivo(dadosConsolidados);
    
    // Gráfico de Concessões  
    renderGraficoConcessoesExecutivo(dadosConsolidados);
    
    // Gráfico de Linhas
    renderGraficoLinhasExecutivo(dadosConsolidados);
}

// Gráfico de Altas Executivo
function renderGraficoAltasExecutivo(dados) {
    const canvas = document.getElementById('graficoAltasExecutivo');
    if (!canvas) return;
    
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h', 'SP'];
    
    const valores = categorias.map(cat => {
        return dados.leitos.filter(l => 
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
    
    if (window.chartInstances && window.chartInstances.altasExecutivo) {
        window.chartInstances.altasExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    window.chartInstances.altasExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Altas Previstas',
                data: valores,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'left',
                    labels: {
                        color: '#ffffff',
                        padding: 8,
                        font: { size: 11, weight: 600 }
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
                    ticks: {
                        stepSize: 1,
                        color: '#e2e8f0',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#e2e8f0',
                        font: { size: 11 },
                        maxRotation: 0
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// Gráfico de Concessões Executivo
function renderGraficoConcessoesExecutivo(dados) {
    const canvas = document.getElementById('graficoConcessoesExecutivo');
    if (!canvas) return;
    
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const concessoesMap = new Map();
    
    const CONCESSOES_DISPONIVEIS = [
        "Transição Domiciliar", "Aplicação domiciliar de medicamentos", "Fisioterapia",
        "Fonoaudiologia", "Aspiração", "Banho", "Curativos", "Oxigenoterapia",
        "Recarga de O2", "Orientação Nutricional - com dispositivo", 
        "Orientação Nutricional - sem dispositivo", "Clister", "PICC"
    ];
    
    CONCESSOES_DISPONIVEIS.forEach(conc => {
        concessoesMap.set(conc, periodos.map(() => 0));
    });
    
    // Processar dados reais
    dados.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
            let periodoIndex = -1;
            
            if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
            else if (leito.paciente.previsaoAlta === '48h') periodoIndex = 2;
            else if (leito.paciente.previsaoAlta === '72h') periodoIndex = 3;
            else if (leito.paciente.previsaoAlta === '96h') periodoIndex = 4;
            
            if (periodoIndex >= 0) {
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
    
    const cores = {
        "Transição Domiciliar": "#007A53",
        "Aplicação domiciliar de medicamentos": "#582C83",
        "Fisioterapia": "#009639",
        "Fonoaudiologia": "#FF671F",
        "Aspiração": "#2E1A47",
        "Banho": "#8FD3F4",
        "Curativos": "#00BFB3",
        "Oxigenoterapia": "#64A70B"
    };
    
    if (window.chartInstances && window.chartInstances.concessoesExecutivo) {
        window.chartInstances.concessoesExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    window.chartInstances.concessoesExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: periodos,
            datasets: concessoes.map(item => ({
                label: item.nome,
                data: item.dados,
                backgroundColor: cores[item.nome] || '#6b7280'
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'left',
                    labels: {
                        color: '#ffffff',
                        padding: 8,
                        font: { size: 11, weight: 600 }
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
                        color: '#e2e8f0',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    stacked: true,
                    ticks: {
                        color: '#e2e8f0',
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

// Gráfico de Linhas Executivo
function renderGraficoLinhasExecutivo(dados) {
    const canvas = document.getElementById('graficoLinhasExecutivo');
    if (!canvas) return;
    
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const linhasMap = new Map();
    
    const LINHAS_DISPONIVEIS = [
        "Assiste", "APS", "Cuidados Paliativos", "ICO (Insuficiência Coronariana)",
        "Oncologia", "Pediatria", "Programa Autoimune - Gastroenterologia",
        "Programa Autoimune - Neuro-desmielinizante", "Vida Mais Leve Care",
        "Crônicos - Cardiologia", "Crônicos - Endocrinologia", "Crônicos - Geriatria"
    ];
    
    LINHAS_DISPONIVEIS.forEach(linha => {
        linhasMap.set(linha, periodos.map(() => 0));
    });
    
    dados.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhasCuidado) {
            let periodoIndex = -1;
            
            if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (leito.paciente.previsaoAlta && leito.paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
            else if (leito.paciente.previsaoAlta === '48h') periodoIndex = 2;
            else if (leito.paciente.previsaoAlta === '72h') periodoIndex = 3;
            else if (leito.paciente.previsaoAlta === '96h') periodoIndex = 4;
            
            if (periodoIndex >= 0) {
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
    
    const cores = {
        "Assiste": "#ED0A72",
        "APS": "#007A33",
        "Cuidados Paliativos": "#00B5A2",
        "ICO (Insuficiência Coronariana)": "#A6192E",
        "Oncologia": "#6A1B9A",
        "Pediatria": "#5A646B"
    };
    
    if (window.chartInstances && window.chartInstances.linhasExecutivo) {
        window.chartInstances.linhasExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    window.chartInstances.linhasExecutivo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: periodos,
            datasets: linhas.map(item => ({
                label: item.nome,
                data: item.dados,
                backgroundColor: cores[item.nome] || '#6b7280'
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'left',
                    labels: {
                        color: '#ffffff',
                        padding: 8,
                        font: { size: 11, weight: 600 }
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
                        color: '#e2e8f0',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    stacked: true,
                    ticks: {
                        color: '#e2e8f0',
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

// =================== RENDERIZAR GAUGE DO HOSPITAL ===================
function renderGaugeHospital(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas) return;
    
    const hospitalData = window.hospitalData[hospitalId];
    if (!hospitalData) return;
    
    const ocupados = hospitalData.leitos.filter(l => l.status === 'ocupado').length;
    const total = hospitalData.leitos.length;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    const chartKey = `gauge${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
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
}

// =================== ESTILOS ADICIONAIS PARA DASHBOARDS ===================
const dashboardStyles = `
<style>
.dashboard-executivo {
    padding: 20px;
}

.dashboard-hospitalar {
    padding: 20px;
}

/* *** GARANTIR LAYOUT VERTICAL DOS GRÁFICOS HOSPITALARES *** */
.hospital-graficos {
    display: grid !important;
    grid-template-columns: 1fr !important;
    grid-template-rows: auto auto auto !important;
    gap: 20px !important;
    margin-top: 20px;
}

.hospital-section .chart-container {
    width: 100% !important;
    margin-bottom: 0 !important;
    background: #1a1f2e;
    border-radius: 12px;
    padding: 20px;
    color: white;
}

.hospital-section .chart-container h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: #60a5fa;
}

.hospitalar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 20px;
}

.hospital-section {
    background: #1a1f2e;
    border-radius: 12px;
    padding: 20px;
    color: white;
}

.hospital-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    color: #60a5fa;
    text-align: center;
}

.hospital-kpis {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.hospital-gauge {
    flex-shrink: 0;
    text-align: center;
    position: relative;
    width: 120px;
    height: 60px;
}

.hospital-gauge .gauge-label {
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 14px;
    font-weight: 700;
    color: #60a5fa;
}

.kpi-mini {
    flex: 1;
    text-align: center;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    padding: 8px;
}

.kpi-mini .kpi-value {
    font-size: 20px;
    margin-bottom: 2px;
    font-weight: 700;
    color: #60a5fa;
}

.kpi-mini .kpi-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    color: #e2e8f0;
}

.chart-type-selector {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.chart-type-btn {
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
}

.chart-type-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.chart-type-btn.active {
    background: #60a5fa;
    color: white;
    border-color: #60a5fa;
}

/* Responsive para gráficos hospitalares */
@media (max-width: 768px) {
    .hospital-kpis {
        flex-direction: column;
        gap: 10px;
    }
    
    .chart-type-selector {
        flex-wrap: wrap;
        justify-content: center;
        gap: 4px;
    }
    
    .chart-type-btn {
        font-size: 10px;
        padding: 4px 8px;
        min-width: 60px;
    }
    
    /* GARANTIR QUE GRÁFICOS FIQUEM UM EMBAIXO DO OUTRO NO MOBILE */
    .hospital-graficos {
        grid-template-columns: 1fr !important;
        gap: 15px !important;
    }
    
    .hospitalar-grid {
        grid-template-columns: 1fr;
    }
}

/* Cores específicas para cada tipo de gráfico */
.chart-type-btn[data-type="bar"] { border-left: 3px solid #3b82f6; }
.chart-type-btn[data-type="scatter"] { border-left: 3px solid #10b981; }
.chart-type-btn[data-type="line"] { border-left: 3px solid #8b5cf6; }
.chart-type-btn[data-type="area"] { border-left: 3px solid #f59e0b; }
.chart-type-btn[data-type="radar"] { border-left: 3px solid #ef4444; }
.chart-type-btn[data-type="polar"] { border-left: 3px solid #14b8a6; }

.chart-type-btn.active[data-type="bar"] { background: #3b82f6; }
.chart-type-btn.active[data-type="scatter"] { background: #10b981; }
.chart-type-btn.active[data-type="line"] { background: #8b5cf6; }
.chart-type-btn.active[data-type="area"] { background: #f59e0b; }
.chart-type-btn.active[data-type="radar"] { background: #ef4444; }
.chart-type-btn.active[data-type="polar"] { background: #14b8a6; }
</style>
`;

// Adicionar estilos ao documento apenas uma vez
if (!document.getElementById('dashboardStyles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'dashboardStyles';
    styleElement.innerHTML = dashboardStyles;
    document.head.appendChild(styleElement);
}

logSuccess('Dashboard.js carregado - VERSÃO FINAL COMPLETA com todos os gráficos funcionais');

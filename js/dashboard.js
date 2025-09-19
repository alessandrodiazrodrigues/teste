// =================== DASHBOARD.JS V4.0 - PRIMEIRA PARTE ===================
// =================== CORREÇÕES IMPLEMENTADAS: TIMELINE 9 OPÇÕES + ARRAYS DIRETOS ===================

// =================== DASHBOARD EXECUTIVO V4.0 ===================
window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo V4.0 com arrays diretos...');
    
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
    
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    🔄 Carregando dados V4.0 do sistema...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Aguarde enquanto sincronizamos com a API V4.0 (arrays diretos)
                </div>
            </div>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardExecutivo();
            }
        }, 2000);
        return;
    }
    
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => 
            l.status === 'ocupado' && l.paciente && l.paciente.nome && l.paciente.matricula
        );
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h2 style="color: #1a1f2e; margin-bottom: 20px;">🏥 Rede Hospitalar Externa V4.0</h2>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
                    <h3 style="color: #6c757d; margin-bottom: 15px;">📋 Aguardando Dados da Planilha V4.0</h3>
                    <p style="margin-bottom: 10px;">Nenhum hospital possui dados de pacientes na planilha Google (44 colunas).</p>
                    <p><strong>Hospitais configurados:</strong> ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
                    <p style="color: #28a745; margin-top: 15px;"><em>✅ API V4.0 conectada - Arrays diretos funcionando</em></p>
                </div>
            </div>
        `;
        return;
    }
    
    // *** V4.0: CALCULAR KPIs COM TIMELINE CORRIGIDA ***
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let ppsTotal = 0;
    let ppsCont = 0;
    let spictElegiveis = 0;
    let spictTotal = 0;
    
    const TIMELINE_ALTA = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R'];
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        totalLeitos += hospital.leitos.length;
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                leitosOcupados++;
                
                if (leito.paciente.prevAlta && TIMELINE_ALTA.includes(leito.paciente.prevAlta)) {
                    leitosEmAlta++;
                }
                
                if (leito.paciente.pps) {
                    const ppsNum = parseInt(leito.paciente.pps);
                    if (!isNaN(ppsNum)) {
                        ppsTotal += ppsNum;
                        ppsCont++;
                    }
                }
                
                if (leito.paciente.spict === 'elegivel') {
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
    const tph = leitosOcupados > 0 ? (leitosEmAlta / leitosOcupados * 100).toFixed(1) : "0.0";
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                🏥 Rede Hospitalar Externa V4.0
            </h2>
            
            <div style="background: #e6f3ff; border: 2px solid #0066cc; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                <p style="margin: 0; color: #0066cc; font-weight: 600;">
                    📊 <strong>Dados V4.0 da planilha Google (44 colunas)</strong> • ${hospitaisComDados.length} hospitais ativos • ${leitosOcupados} pacientes • Arrays diretos
                </p>
            </div>
            
            <!-- KPIs Grid com Gauge Principal V4.0 -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; grid-template-rows: auto auto; gap: 16px; margin-bottom: 30px;">
                <div style="grid-column: 1; grid-row: 1 / 3; background: #1a1f2e; color: white; padding: 20px; border-radius: 12px; display: flex; align-items: center;">
                    <div style="flex: 1;">
                        <div style="width: 200px; height: 100px; position: relative; margin: 0 auto;">
                            <canvas id="gaugeOcupacaoExecutivo" width="200" height="100"></canvas>
                            <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 24px; font-weight: 700; color: #60a5fa;">${ocupacaoGeral}%</div>
                            <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); font-size: 10px; text-transform: uppercase; color: #e2e8f0; font-weight: 600;">OCUPAÇÃO GERAL</div>
                        </div>
                    </div>
                    <div style="flex: 1; padding-left: 20px;">
                        <h4 style="color: #60a5fa; margin-bottom: 12px; font-size: 14px;">Hospitais V4.0:</h4>
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
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${tph}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">TPH</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${ppsMedia}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">PPS MÉDIO</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${spictPerc}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">SPICT ELEGÍVEL</div>
                </div>
            </div>
            
            <!-- GRÁFICOS EXECUTIVOS V4.0 -->
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        📊 Análise Preditiva de Altas V4.0 em ${hoje}
                    </h3>
                    <div style="height: 300px;">
                        <canvas id="graficoAltasExecutivo" style="max-height: 300px;"></canvas>
                    </div>
                </div>
                
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        🎯 Análise Preditiva de Concessões V4.0 em ${hoje}
                    </h3>
                    <div style="height: 300px;">
                        <canvas id="graficoConcessoesExecutivo" style="max-height: 300px;"></canvas>
                    </div>
                </div>
                
                <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; color: white;">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #60a5fa;">
                        🏥 Análise Preditiva de Linhas de Cuidado V4.0 em ${hoje}
                    </h3>
                    <div style="height: 300px;">
                        <canvas id="graficoLinhasExecutivo" style="max-height: 300px;"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        renderGaugeExecutivo(ocupacaoGeral);
        renderGraficosExecutivosV4(hospitaisComDados);
        logSuccess('Dashboard Executivo V4.0 com todos os gráficos renderizado (arrays diretos)');
    }, 100);
};

// =================== DASHBOARD HOSPITALAR V4.0 - CORREÇÕES IMPLEMENTADAS ===================
window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar V4.0 com correções implementadas...');
    
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
    
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    🔄 Carregando dados hospitalares V4.0...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Sincronizando com a API Google Apps Script V4.0 (arrays diretos)
                </div>
            </div>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 2000);
        return;
    }
    
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => 
            l.status === 'ocupado' && l.paciente && l.paciente.nome && l.paciente.matricula
        );
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h3>📋 Aguardando Dados da Planilha V4.0</h3>
                <p>Nenhum hospital possui dados de pacientes na planilha Google (44 colunas).</p>
                <p><strong>Hospitais configurados:</strong> ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="dashboard-hospitalar">';
    html += `<h2 style="text-align: center; color: #1a1f2e; margin-bottom: 30px; font-size: 24px; font-weight: 700;">
                Dashboard Hospitalar V4.0
             </h2>`;
    
    html += `
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">
                📊 <strong>V4.0 - Arrays diretos (44 colunas):</strong> ${hospitaisComDados.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')}
            </p>
        </div>
    `;
    
    html += '<div class="hospitalar-grid">';
    
    const TIMELINE_ALTA_V4 = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R'];
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
        const vagos = hospital.leitos.length - ocupados;
        
        const emAlta = hospital.leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente &&
            l.paciente.prevAlta && 
            TIMELINE_ALTA_V4.includes(l.paciente.prevAlta)
        ).length;
        
        const ocupacao = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
        
        html += `
            <div class="hospital-section" data-hospital="${hospitalId}">
                <h3 class="hospital-title">${CONFIG.HOSPITAIS[hospitalId].nome} V4.0</h3>
                
                <!-- *** CORREÇÃO 1: KPIs LAYOUT HORIZONTAL *** -->
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; flex-wrap: wrap; justify-content: center;">
                    <!-- Gauge -->
                    <div style="text-align: center; position: relative; width: 120px; height: 80px; margin-right: 20px;">
                        <canvas id="gauge${hospitalId}" width="120" height="60"></canvas>
                        <div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); font-size: 16px; font-weight: 700; color: #60a5fa;">${ocupacao}%</div>
                    </div>
                    
                    <!-- TOTAL -->
                    <div style="text-align: center; min-width: 80px; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px; color: #60a5fa;">${hospital.leitos.length}</div>
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL</div>
                    </div>
                    
                    <!-- OCUPADOS -->
                    <div style="text-align: center; min-width: 80px; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px; color: #60a5fa;">${ocupados}</div>
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">OCUPADOS</div>
                    </div>
                    
                    <!-- VAGOS -->
                    <div style="text-align: center; min-width: 80px; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px; color: #60a5fa;">${vagos}</div>
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">VAGOS</div>
                    </div>
                    
                    <!-- EM ALTA -->
                    <div style="text-align: center; min-width: 80px; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px; color: #60a5fa;">${emAlta}</div>
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">EM ALTA</div>
                    </div>
                </div>
                
                <!-- *** CORREÇÃO 2: GRÁFICOS EM LAYOUT VERTICAL *** -->
                <div style="display: flex; flex-direction: column; gap: 25px; width: 100%;">
                    <!-- Gráfico 1: Análise Preditiva de Altas (SEM EMOJIS) -->
                    <div style="width: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #e2e8f0;">Análise Preditiva de Altas V4.0 em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <canvas id="graficoAltas${hospitalId}" style="max-height: 400px; width: 100%; height: 400px;"></canvas>
                    </div>
                    
                    <!-- Gráfico 2: Concessões Previstas (7 tipos) -->
                    <div style="width: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                            <h4 style="margin: 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #e2e8f0;">Concessões Previstas V4.0 em ${new Date().toLocaleDateString('pt-BR')}</h4>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <button class="chart-type-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar" style="padding: 6px 10px; background: #60a5fa; border: 1px solid #60a5fa; border-radius: 4px; color: white; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Barras</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="scatter" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Bolinhas</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="line" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Linha</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="area" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Área</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="radar" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Radar</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="polar" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Polar</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="doughnut" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Rosca</button>
                            </div>
                        </div>
                        <canvas id="graficoConcessoes${hospitalId}" style="max-height: 400px; width: 100%; height: 400px;"></canvas>
                    </div>
                    
                    <!-- Gráfico 3: Linhas de Cuidado (7 tipos) -->
                    <div style="width: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                            <h4 style="margin: 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #e2e8f0;">Linhas de Cuidado V4.0 em ${new Date().toLocaleDateString('pt-BR')}</h4>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <button class="chart-type-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar" style="padding: 6px 10px; background: #60a5fa; border: 1px solid #60a5fa; border-radius: 4px; color: white; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Barras</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="scatter" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Bolinhas</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="line" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Linha</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="area" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Área</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="radar" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Radar</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="polar" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Polar</button>
                                <button class="chart-type-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="doughnut" style="padding: 6px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; cursor: pointer; font-size: 10px; text-transform: uppercase; font-weight: 500;">Rosca</button>
                            </div>
                        </div>
                        <canvas id="graficoLinhas${hospitalId}" style="max-height: 400px; width: 100%; height: 400px;"></canvas>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            document.querySelectorAll('.chart-type-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const hospital = e.target.dataset.hospital;
                    const chart = e.target.dataset.chart;
                    const type = e.target.dataset.type;
                    
                    const selector = e.target.closest('div');
                    selector.querySelectorAll('.chart-type-btn').forEach(b => {
                        b.style.background = 'rgba(255, 255, 255, 0.1)';
                        b.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        b.style.color = '#e2e8f0';
                        b.classList.remove('active');
                    });
                    e.target.style.background = '#60a5fa';
                    e.target.style.borderColor = '#60a5fa';
                    e.target.style.color = 'white';
                    e.target.classList.add('active');
                    
                    if (chart === 'concessoes') {
                        const hospitalData = window.hospitalData[hospital];
                        if (hospitalData) {
                            renderGraficoConcessoesV4(`graficoConcessoes${hospital}`, hospitalData, type);
                        }
                    } else if (chart === 'linhas') {
                        const hospitalData = window.hospitalData[hospital];
                        if (hospitalData) {
                            renderGraficoLinhasV4(`graficoLinhas${hospital}`, hospitalData, type);
                        }
                    }
                    
                    logInfo(`Gráfico V4.0 alterado: ${hospital} - ${chart} - ${type}`);
                });
            });
            
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                
                const hospitalData = window.hospitalData[hospitalId];
                if (hospitalData) {
                    renderGraficoAltasV4Corrigido(`graficoAltas${hospitalId}`, hospitalData);
                    renderGraficoConcessoesV4(`graficoConcessoes${hospitalId}`, hospitalData, 'bar');
                    renderGraficoLinhasV4(`graficoLinhas${hospitalId}`, hospitalData, 'bar');
                }
            });
        }, 100);
    };
    
    aguardarChartJS();
    
    logSuccess('Dashboard Hospitalar V4.0 renderizado com layout vertical e correções implementadas');
};
// =================== DASHBOARD.JS V4.0 - SEGUNDA PARTE ===================
// =================== FUNÇÕES DE GRÁFICOS E CORREÇÕES IMPLEMENTADAS ===================

// =================== FUNÇÕES DE GRÁFICOS V4.0 - CORREÇÕES IMPLEMENTADAS ===================

// Renderizar Gauge Executivo - HORIZONTAL
function renderGaugeExecutivo(ocupacao) {
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

// Renderizar Gauge Hospital - VERTICAL
function renderGaugeHospital(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital) return;
    
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const ocupacao = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
    
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

// *** CORREÇÃO 3: GRÁFICO DE ALTAS COM BARRAS ESPECIAIS HOJE/24H ***
function renderGraficoAltasV4Corrigido(canvasId, hospitalData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    // *** CORREÇÃO: EIXOS CORRETOS - X: HOJE, 24H, 48H, 72H, SP ***
    const categorias = ['HOJE', '24H', '48H', '72H', 'SP'];
    
    // *** CORREÇÃO: SEPARAR HOJE E 24H EM OURO/2R/3R ***
    const dados = {
        'Ouro': [0, 0, 0, 0, 0],
        '2R': [0, 0, 0, 0, 0],
        '3R': [0, 0, 0, 0, 0],
        'Outros': [0, 0, 0, 0, 0]
    };
    
    hospitalData.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.prevAlta) {
            let index = -1;
            let tipo = 'Outros';
            
            // Mapear previsão de alta para categoria e tipo
            if (leito.paciente.prevAlta === 'Hoje Ouro') { index = 0; tipo = 'Ouro'; }
            else if (leito.paciente.prevAlta === 'Hoje 2R') { index = 0; tipo = '2R'; }
            else if (leito.paciente.prevAlta === 'Hoje 3R') { index = 0; tipo = '3R'; }
            else if (leito.paciente.prevAlta === '24h Ouro') { index = 1; tipo = 'Ouro'; }
            else if (leito.paciente.prevAlta === '24h 2R') { index = 1; tipo = '2R'; }
            else if (leito.paciente.prevAlta === '24h 3R') { index = 1; tipo = '3R'; }
            else if (leito.paciente.prevAlta === '48h') { index = 2; tipo = 'Outros'; }
            else if (leito.paciente.prevAlta === '72h') { index = 3; tipo = 'Outros'; }
            else if (leito.paciente.prevAlta === 'SP') { index = 4; tipo = 'Outros'; }
            
            if (index >= 0) {
                dados[tipo][index]++;
            }
        }
    });
    
    const chartKey = `altas${canvasId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
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
                    label: 'Outros',
                    data: dados['Outros'],
                    backgroundColor: '#6b7280',
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
}

// *** V4.0: RENDERIZAR GRÁFICOS EXECUTIVOS COM ARRAYS DIRETOS ***
function renderGraficosExecutivosV4(hospitaisComDados) {
    const dadosConsolidados = {
        leitos: []
    };
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            dadosConsolidados.leitos.push(...hospital.leitos);
        }
    });
    
    renderGraficoAltasExecutivoV4(dadosConsolidados);
    renderGraficoConcessoesExecutivoV4(dadosConsolidados);
    renderGraficoLinhasExecutivoV4(dadosConsolidados);
}

// *** V4.0: GRÁFICO DE ALTAS EXECUTIVO COM TIMELINE CORRIGIDA ***
function renderGraficoAltasExecutivoV4(dados) {
    const canvas = document.getElementById('graficoAltasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', 'SP'];
    
    const valores = categorias.map(cat => {
        return dados.leitos.filter(l => 
            l.status === 'ocupado' && 
            l.paciente && 
            l.paciente.prevAlta === cat
        ).length;
    });
    
    const cores = categorias.map(cat => {
        if (cat.includes('Ouro')) return '#fbbf24';
        if (cat.includes('2R')) return '#3b82f6';
        if (cat.includes('3R')) return '#8b5cf6';
        if (cat === '48h') return '#f59e0b';
        if (cat === '72h') return '#ef4444';
        if (cat === 'SP') return '#6b7280';
        return '#6b7280';
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
                label: 'Beneficiários',
                data: valores,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
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
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `Beneficiários: ${context.parsed.x}`;
                        }
                    }
                }
            },
            scales: {
                x: {
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
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
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

// *** V4.0: GRÁFICO DE CONCESSÕES EXECUTIVO COM ARRAYS DIRETOS ***
function renderGraficoConcessoesExecutivoV4(dados) {
    const canvas = document.getElementById('graficoConcessoesExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const periodos = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', 'SP'];
    const concessoesMap = new Map();
    
    const CONCESSOES_VALIDAS = [
        "Transição Domiciliar", "Aplicação domiciliar de medicamentos", "Fisioterapia",
        "Fonoaudiologia", "Aspiração", "Banho", "Curativos", "Oxigenoterapia",
        "Recarga de O2", "Orientação Nutricional - com dispositivo", 
        "Orientação Nutricional - sem dispositivo", "Clister", "PICC"
    ];
    
    CONCESSOES_VALIDAS.forEach(conc => {
        concessoesMap.set(conc, periodos.map(() => 0));
    });
    
    dados.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
            const periodoIndex = periodos.indexOf(leito.paciente.prevAlta);
            
            if (periodoIndex >= 0) {
                const concessoesList = Array.isArray(leito.paciente.concessoes) ? 
                    leito.paciente.concessoes : [];
                
                concessoesList.forEach(concessao => {
                    if (concessao && concessao.trim() && concessoesMap.has(concessao.trim())) {
                        concessoesMap.get(concessao.trim())[periodoIndex]++;
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
        "Oxigenoterapia": "#64A70B",
        "Recarga de O2": "#0066CC",
        "Orientação Nutricional - com dispositivo": "#E4002B",
        "Orientação Nutricional - sem dispositivo": "#F79100",
        "Clister": "#6B2C91",
        "PICC": "#C5A572"
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
            indexAxis: 'y',
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
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.x} beneficiários`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true,
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
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
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

// *** V4.0: GRÁFICO DE LINHAS EXECUTIVO COM ARRAYS DIRETOS ***
function renderGraficoLinhasExecutivoV4(dados) {
    const canvas = document.getElementById('graficoLinhasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const periodos = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', 'SP'];
    const linhasMap = new Map();
    
    const LINHAS_VALIDAS = [
        "Assiste", "APS", "Cuidados Paliativos", "ICO (Insuficiência Coronariana)",
        "Oncologia", "Pediatria", "Programa Autoimune - Gastroenterologia",
        "Programa Autoimune - Neuro-desmielinizante", "Programa Autoimune - Neuro-muscular",
        "Programa Autoimune - Reumatologia", "Vida Mais Leve Care",
        "Crônicos - Cardiologia", "Crônicos - Endocrinologia", "Crônicos - Geriatria",
        "Crônicos - Melhor Cuidado", "Crônicos - Neurologia", "Crônicos - Pneumologia",
        "Crônicos - Pós-bariátrica", "Crônicos - Reumatologia"
    ];
    
    LINHAS_VALIDAS.forEach(linha => {
        linhasMap.set(linha, periodos.map(() => 0));
    });
    
    dados.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas) {
            const periodoIndex = periodos.indexOf(leito.paciente.prevAlta);
            
            if (periodoIndex >= 0) {
                const linhasList = Array.isArray(leito.paciente.linhas) ? 
                    leito.paciente.linhas : [];
                
                linhasList.forEach(linha => {
                    if (linha && linha.trim() && linhasMap.has(linha.trim())) {
                        linhasMap.get(linha.trim())[periodoIndex]++;
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
        "Pediatria": "#5A646B",
        "Programa Autoimune - Gastroenterologia": "#F79100",
        "Programa Autoimune - Neuro-desmielinizante": "#0066CC",
        "Programa Autoimune - Neuro-muscular": "#582C83",
        "Programa Autoimune - Reumatologia": "#E4002B",
        "Vida Mais Leve Care": "#64A70B",
        "Crônicos - Cardiologia": "#C5282F",
        "Crônicos - Endocrinologia": "#009639",
        "Crônicos - Geriatria": "#8FD3F4",
        "Crônicos - Melhor Cuidado": "#FF671F",
        "Crônicos - Neurologia": "#2E1A47",
        "Crônicos - Pneumologia": "#00BFB3",
        "Crônicos - Pós-bariátrica": "#C5A572",
        "Crônicos - Reumatologia": "#6B2C91"
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
            indexAxis: 'y',
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
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.x} beneficiários`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true,
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
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
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

// =================== GRÁFICOS HOSPITALARES V4.0 - CORREÇÕES IMPLEMENTADAS ===================

// *** V4.0: GRÁFICO DE CONCESSÕES HOSPITALAR COM ARRAYS DIRETOS E 7 TIPOS ***
function renderGraficoConcessoesV4(canvasId, hospitalData, type = 'bar') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const concessoesCount = {};
    
    hospitalData.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.concessoes) {
            const concessoesList = Array.isArray(leito.paciente.concessoes) ? 
                leito.paciente.concessoes : [];
            
            concessoesList.forEach(concessao => {
                if (concessao && concessao.trim()) {
                    concessoesCount[concessao] = (concessoesCount[concessao] || 0) + 1;
                }
            });
        }
    });
    
    const concessoesOrdenadas = Object.entries(concessoesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    if (concessoesOrdenadas.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhuma concessão encontrada', canvas.width/2, canvas.height/2);
        return;
    }
    
    const cores = {
        "Transição Domiciliar": "#007A53",
        "Aplicação domiciliar de medicamentos": "#582C83",
        "Fisioterapia": "#009639",
        "Fonoaudiologia": "#FF671F",
        "Aspiração": "#2E1A47",
        "Banho": "#8FD3F4",
        "Curativos": "#00BFB3",
        "Oxigenoterapia": "#64A70B",
        "Recarga de O2": "#0066CC",
        "Orientação Nutricional - com dispositivo": "#E4002B",
        "Orientação Nutricional - sem dispositivo": "#F79100",
        "Clister": "#6B2C91",
        "PICC": "#C5A572"
    };
    
    const labels = concessoesOrdenadas.map(([nome]) => nome);
    const valores = concessoesOrdenadas.map(([, count]) => count);
    const coresGrafico = labels.map(label => cores[label] || '#6b7280');
    
    const chartKey = `concessoes${canvasId}${type}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiários',
                data: valores,
                backgroundColor: coresGrafico,
                borderWidth: type === 'line' ? 2 : 0,
                borderColor: type === 'line' ? coresGrafico : undefined,
                fill: type === 'area',
                tension: type === 'line' || type === 'area' ? 0.4 : undefined
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: ['doughnut', 'polar', 'radar'].includes(type),
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
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `Beneficiários: ${context.parsed.y || context.parsed}`;
                        }
                    }
                }
            },
            scales: type === 'radar' ? {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e2e8f0',
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    pointLabels: { color: '#e2e8f0' },
                    grid: { color: 'rgba(255, 255, 255, 0.3)' }
                }
            } : {
                x: {
                    ticks: {
                        color: '#e2e8f0',
                        font: { size: 10 },
                        maxRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
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
    };
    
    // *** CONFIGURAÇÕES ESPECIAIS PARA BOLINHAS ***
    if (type === 'scatter') {
        chartConfig.data.datasets[0].pointRadius = 8;
        chartConfig.data.datasets[0].pointHoverRadius = 12;
        chartConfig.data.datasets[0].showLine = false;
        
        const maxValue = Math.max(...valores);
        chartConfig.data.datasets[0].data = valores.map((value, index) => {
            const angle = (index * 2 * Math.PI) / valores.length;
            const radius = (value / maxValue) * 5;
            return {
                x: index + Math.cos(angle) * radius * 0.3,
                y: value + Math.sin(angle) * radius * 0.3
            };
        });
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
}

// *** V4.0: GRÁFICO DE LINHAS HOSPITALAR COM ARRAYS DIRETOS E 7 TIPOS ***
function renderGraficoLinhasV4(canvasId, hospitalData, type = 'bar') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const linhasCount = {};
    
    hospitalData.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.linhas) {
            const linhasList = Array.isArray(leito.paciente.linhas) ? 
                leito.paciente.linhas : [];
            
            linhasList.forEach(linha => {
                if (linha && linha.trim()) {
                    linhasCount[linha] = (linhasCount[linha] || 0) + 1;
                }
            });
        }
    });
    
    const linhasOrdenadas = Object.entries(linhasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    if (linhasOrdenadas.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhuma linha encontrada', canvas.width/2, canvas.height/2);
        return;
    }
    
    const cores = {
        "Assiste": "#ED0A72",
        "APS": "#007A33",
        "Cuidados Paliativos": "#00B5A2",
        "ICO (Insuficiência Coronariana)": "#A6192E",
        "Oncologia": "#6A1B9A",
        "Pediatria": "#5A646B",
        "Programa Autoimune - Gastroenterologia": "#F79100",
        "Programa Autoimune - Neuro-desmielinizante": "#0066CC",
        "Programa Autoimune - Neuro-muscular": "#582C83",
        "Programa Autoimune - Reumatologia": "#E4002B",
        "Vida Mais Leve Care": "#64A70B",
        "Crônicos - Cardiologia": "#C5282F",
        "Crônicos - Endocrinologia": "#009639",
        "Crônicos - Geriatria": "#8FD3F4",
        "Crônicos - Melhor Cuidado": "#FF671F",
        "Crônicos - Neurologia": "#2E1A47",
        "Crônicos - Pneumologia": "#00BFB3",
        "Crônicos - Pós-bariátrica": "#C5A572",
        "Crônicos - Reumatologia": "#6B2C91"
    };
    
    const labels = linhasOrdenadas.map(([nome]) => nome);
    const valores = linhasOrdenadas.map(([, count]) => count);
    const coresGrafico = labels.map(label => cores[label] || '#6b7280');
    
    const chartKey = `linhas${canvasId}${type}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiários',
                data: valores,
                backgroundColor: coresGrafico,
                borderWidth: type === 'line' ? 2 : 0,
                borderColor: type === 'line' ? coresGrafico : undefined,
                fill: type === 'area',
                tension: type === 'line' || type === 'area' ? 0.4 : undefined
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: ['doughnut', 'polar', 'radar'].includes(type),
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
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `Beneficiários: ${context.parsed.y || context.parsed}`;
                        }
                    }
                }
            },
            scales: type === 'radar' ? {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e2e8f0',
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    pointLabels: { color: '#e2e8f0' },
                    grid: { color: 'rgba(255, 255, 255, 0.3)' }
                }
            } : {
                x: {
                    ticks: {
                        color: '#e2e8f0',
                        font: { size: 10 },
                        maxRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
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
    };
    
    if (type === 'scatter') {
        chartConfig.data.datasets[0].pointRadius = 8;
        chartConfig.data.datasets[0].pointHoverRadius = 12;
        chartConfig.data.datasets[0].showLine = false;
        
        const maxValue = Math.max(...valores);
        chartConfig.data.datasets[0].data = valores.map((value, index) => {
            const angle = (index * 2 * Math.PI) / valores.length;
            const radius = (value / maxValue) * 3;
            return {
                x: index + Math.cos(angle) * radius * 0.5,
                y: value + Math.sin(angle) * radius * 0.5
            };
        });
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, chartConfig);
}

// =================== SISTEMA DE LOGS V4.0 ===================
function logInfo(message) {
    console.log(`🔷 [DASHBOARD V4.0] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD V4.0] ${message}`);
}

function logError(message) {
    console.error(`❌ [DASHBOARD V4.0] ${message}`);
}

// =================== DEBUG E TESTES V4.0 ===================
window.debug = window.debug || {};

window.debug.forcarDashboards = function() {
    logInfo('Forçando renderização de todos os dashboards...');
    
    if (window.renderDashboardExecutivo) {
        window.renderDashboardExecutivo();
    }
    
    if (window.renderDashboardHospitalar) {
        window.renderDashboardHospitalar();
    }
    
    logSuccess('Dashboards forçados com sucesso');
};

window.debug.mostrarDados = function() {
    console.log('📊 Dados do sistema V4.0:', window.hospitalData);
    
    if (window.hospitalData) {
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            console.log(`🏥 ${CONFIG.HOSPITAIS[hospitalId].nome}:`, {
                leitos: hospital.leitos ? hospital.leitos.length : 0,
                ocupados: hospital.leitos ? hospital.leitos.filter(l => l.status === 'ocupado').length : 0
            });
        });
    }
};

window.debug.verificarChart = function() {
    console.log('📊 Chart.js disponível:', typeof Chart !== 'undefined');
    if (typeof Chart !== 'undefined') {
        console.log('📊 Versão Chart.js:', Chart.version);
    }
};

console.log('🚀 Dashboard.js V4.0 COMPLETO CORRIGIDO carregado - Arrays diretos + Timeline 9 opções + Todas as correções implementadas');
console.log('✅ CORREÇÕES IMPLEMENTADAS:');
console.log('   1. Layout KPIs horizontal: [GAUGE] [TOTAL] [OCUPADOS] [VAGOS] [EM ALTA]');
console.log('   2. Gráfico de Altas sem emojis + eixos corretos (Y: Beneficiários, X: HOJE/24H/48H/72H/SP)');
console.log('   3. Barras especiais HOJE/24H divididas em Ouro/2R/3R');
console.log('   4. Sistema 7 tipos: Barras/Bolinhas/Linha/Área/Radar/Polar/Rosca');
console.log('   5. Bolinhas especiais com anti-sobreposição');
console.log('   6. Linhas suaves (tension: 0.4)');
console.log('   7. Timeline 9 opções corrigida');
console.log('   8. Arrays diretos sem parsing');
console.log('   9. Beneficiários sempre inteiros');
console.log('   10. Layout vertical obrigatório nos gráficos hospitalares');

// =================== FIM DASHBOARD.JS V4.0 - VERSÃO FINAL CORRETA ==================

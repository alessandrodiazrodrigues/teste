// =================== DASHBOARD EXECUTIVO - VERSÃO FINAL CORRIGIDA ===================

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo');
    
    const container = document.getElementById('dashboardContainer');
    if (!container) {
        // Tentar encontrar container alternativo
        const altContainer = document.getElementById('dashExecutivoContent') || 
                           document.getElementById('dash2');
        if (altContainer) {
            const newContainer = document.createElement('div');
            newContainer.id = 'dashboardContainer';
            altContainer.appendChild(newContainer);
            return window.renderDashboardExecutivo(); // Chamar novamente
        }
        logError('Nenhum container disponível para Dashboard Executivo');
        return;
    }
    
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
        <div style="margin-bottom: 25px; padding: 15px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; color: white; text-align: center;">
            <strong>✅ Dados Reais da Rede</strong> | 
            ${hospitaisComDados.length} hospital${hospitaisComDados.length > 1 ? 'is' : ''} com dados: 
            ${hospitaisComDados.map(id => CONFIG.HOSPITAIS[id].nome).join(', ')}
        </div>
        
        <!-- KPIs Grid -->
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 30px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <!-- Box Principal com Gauge HORIZONTAL -->
            <div style="grid-column: span 2; grid-row: span 2; background: linear-gradient(135deg, #1a1f2e 0%, #374151 100%); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;">
                <h4 style="margin: 0 0 15px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #60a5fa; text-align: center;">
                    OCUPAÇÃO GERAL DA REDE
                </h4>
                <div style="position: relative; width: 200px; height: 100px;">
                    <canvas id="gaugeOcupacaoExecutivo" width="200" height="100"></canvas>
                    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: #60a5fa;">${kpis.ocupacaoGeral}%</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 2px;">${kpis.leitosOcupados}/${kpis.totalLeitos} LEITOS</div>
                    </div>
                </div>
            </div>
            
            <!-- KPIs Grid 2x2 móveis -->
            <div class="kpi-box-mobile" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #cbd5e1;">
                <div style="font-size: 32px; font-weight: 700; color: #dc2626; margin-bottom: 4px;">${kpis.tph}%</div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">TPH</div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">(Taxa Prev. Hoje)</div>
            </div>
            
            <div class="kpi-box-mobile" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #cbd5e1;">
                <div style="font-size: 32px; font-weight: 700; color: #1a1f2e; margin-bottom: 4px;">${kpis.ppsMedia}</div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">PPS MÉDIO</div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">(Performance Scale)</div>
            </div>
            
            <div class="kpi-box-mobile" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #cbd5e1;">
                <div style="font-size: 32px; font-weight: 700; color: #059669; margin-bottom: 4px;">${kpis.leitosEmAlta}</div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">EM ALTA</div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">(Ouro+2R+3R)</div>
            </div>
            
            <div class="kpi-box-mobile" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #cbd5e1;">
                <div style="font-size: 32px; font-weight: 700; color: #7c3aed; margin-bottom: 4px;">${kpis.spictPercent}%</div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">SPICT+</div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">(Cuid. Paliativos)</div>
            </div>
        </div>
        
        <!-- Gráficos Preditivos -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%;">
            <!-- Gráfico de Altas -->
            <div style="background: linear-gradient(135deg, #1a1f2e 0%, #374151 100%); border-radius: 12px; padding: 20px; color: white;">
                <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #60a5fa; letter-spacing: 1px;">
                    📈 ALTAS PREVISTAS EM ${hoje}
                </h3>
                <div style="height: 300px; width: 100%;">
                    <canvas id="graficoAltasExecutivo" style="max-height: 300px; max-width: 100%;"></canvas>
                </div>
            </div>
            
            <!-- Gráfico de Concessões -->
            <div style="background: linear-gradient(135deg, #1a1f2e 0%, #374151 100%); border-radius: 12px; padding: 20px; color: white;">
                <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #60a5fa; letter-spacing: 1px;">
                    🎯 CONCESSÕES SOLICITADAS
                </h3>
                <div style="height: 300px; width: 100%;">
                    <canvas id="graficoConcessoesExecutivo" style="max-height: 300px; max-width: 100%;"></canvas>
                </div>
            </div>
            
            <!-- Gráfico de Linhas de Cuidado -->
            <div style="background: linear-gradient(135deg, #1a1f2e 0%, #374151 100%); border-radius: 12px; padding: 20px; color: white;">
                <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #60a5fa; letter-spacing: 1px;">
                    🏥 LINHAS DE CUIDADO
                </h3>
                <div style="height: 300px; width: 100%;">
                    <canvas id="graficoLinhasExecutivo" style="max-height: 300px; max-width: 100%;"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // *** AGUARDAR CHART.JS E RENDERIZAR GRÁFICOS ***
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            renderGaugeExecutivo(kpis.ocupacaoGeral);
            renderGraficosExecutivos(hospitaisComDados);
            logSuccess('✅ Dashboard Executivo renderizado com gauge horizontal + TPH + KPIs mobile + gráficos corrigidos');
        }, 200);
    };
    
    aguardarChartJS();
};

// =================== CALCULAR KPIs EXECUTIVOS ===================
function calcularKPIsExecutivos(hospitaisComDados) {
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let ppsTotal = 0;
    let ppsCont = 0;
    let spictElegivel = 0;
    let spictTotal = 0;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            hospital.leitos.forEach(leito => {
                totalLeitos++;
                if (leito.status === 'ocupado') {
                    leitosOcupados++;
                    if (leito.paciente) {
                        // Contar previsões de alta
                        if (leito.paciente.prevAlta && 
                            ['Hoje Ouro', '24h 2R', '48h 3R'].includes(leito.paciente.prevAlta)) {
                            leitosEmAlta++;
                        }
                        
                        // PPS médio
                        if (leito.paciente.pps && !isNaN(leito.paciente.pps)) {
                            ppsTotal += parseInt(leito.paciente.pps);
                            ppsCont++;
                        }
                        
                        // SPICT
                        if (leito.paciente.spict) {
                            spictTotal++;
                            if (leito.paciente.spict === 'Sim') {
                                spictElegivel++;
                            }
                        }
                    }
                }
            });
        }
    });
    
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const ppsMedia = ppsCont > 0 ? Math.round(ppsTotal / ppsCont) : 0;
    const tph = leitosOcupados > 0 ? (leitosEmAlta / leitosOcupados * 100).toFixed(1) : "0.0";
    const spictPercent = spictTotal > 0 ? Math.round((spictElegivel / spictTotal) * 100) : 0;
    
    return {
        totalLeitos,
        leitosOcupados,
        leitosEmAlta,
        ocupacaoGeral,
        ppsMedia,
        tph: parseFloat(tph),
        spictPercent
    };
}

// =================== RENDERIZAR GAUGE EXECUTIVO HORIZONTAL ===================
function renderGaugeExecutivo(ocupacao) {
    const canvas = document.getElementById('gaugeOcupacaoExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    // Destruir gráfico anterior se existir
    if (window.chartInstances && window.chartInstances.gaugeExecutivo) {
        window.chartInstances.gaugeExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    try {
        const ctx = canvas.getContext('2d');
        window.chartInstances.gaugeExecutivo = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [ocupacao, 100 - ocupacao],
                    backgroundColor: [
                        ocupacao >= 85 ? '#ef4444' : 
                        ocupacao >= 70 ? '#f59e0b' : 
                        ocupacao >= 50 ? '#10b981' : '#6b7280',
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
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function() {
                                return `Taxa de Ocupação: ${ocupacao}%`;
                            }
                        }
                    }
                },
                rotation: -90,     // *** HORIZONTAL: meia rosca ***
                circumference: 180 // *** HORIZONTAL: 180 graus ***
            }
        });
    } catch (error) {
        console.warn('Erro ao renderizar gauge executivo:', error);
    }
}

// =================== RENDERIZAR GRÁFICOS EXECUTIVOS ===================
function renderGraficosExecutivos(hospitaisComDados) {
    const dadosConsolidados = consolidarDadosRede(hospitaisComDados);
    
    // Renderizar os 3 gráficos preditivos
    renderGraficoExecutivo('graficoAltasExecutivo', dadosConsolidados.altas, 'Altas Previstas', '#60a5fa');
    renderGraficoExecutivo('graficoConcessoesExecutivo', dadosConsolidados.concessoes, 'Concessões', '#34d399');
    renderGraficoExecutivo('graficoLinhasExecutivo', dadosConsolidados.linhas, 'Linhas de Cuidado', '#fbbf24');
}

// =================== CONSOLIDAR DADOS DA REDE ===================
function consolidarDadosRede(hospitaisComDados) {
    const dados = {
        altas: {},
        concessoes: {},
        linhas: {}
    };
    
    // Agregar dados de todos os hospitais
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado' && leito.paciente) {
                    // *** ALTAS PREVISTAS ***
                    const prevAlta = leito.paciente.prevAlta;
                    if (prevAlta) {
                        dados.altas[prevAlta] = (dados.altas[prevAlta] || 0) + 1;
                    }
                    
                    // *** CONCESSÕES SOLICITADAS ***
                    if (leito.paciente.concessoes) {
                        const concessoesList = typeof leito.paciente.concessoes === 'string' ? 
                            leito.paciente.concessoes.split('|') : 
                            Array.isArray(leito.paciente.concessoes) ? leito.paciente.concessoes : [];
                        
                        concessoesList.forEach(concessao => {
                            if (concessao && concessao.trim()) {
                                const key = concessao.trim();
                                dados.concessoes[key] = (dados.concessoes[key] || 0) + 1;
                            }
                        });
                    }
                    
                    // *** LINHAS DE CUIDADO ***
                    if (leito.paciente.linhas) {
                        const linhasList = typeof leito.paciente.linhas === 'string' ? 
                            leito.paciente.linhas.split('|') : 
                            Array.isArray(leito.paciente.linhas) ? leito.paciente.linhas : [];
                        
                        linhasList.forEach(linha => {
                            if (linha && linha.trim()) {
                                const key = linha.trim();
                                dados.linhas[key] = (dados.linhas[key] || 0) + 1;
                            }
                        });
                    }
                }
            });
        }
    });
    
    return dados;
}

// =================== RENDERIZAR GRÁFICO EXECUTIVO INDIVIDUAL ===================
function renderGraficoExecutivo(canvasId, dados, titulo, corPrincipal) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    // Destruir gráfico anterior se existir
    if (window.chartInstances && window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const labels = Object.keys(dados);
    const values = Object.values(dados);
    
    // Se não há dados, mostrar mensagem
    if (labels.length === 0 || values.every(v => v === 0)) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados disponíveis', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Pegar apenas os top 10 itens para não sobrecarregar o gráfico
    const dadosOrdenados = labels
        .map((label, index) => ({ label, value: values[index] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    
    const labelsTop = dadosOrdenados.map(d => d.label);
    const valuesTop = dadosOrdenados.map(d => d.value);
    
    try {
        const ctx = canvas.getContext('2d');
        window.chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labelsTop,
                datasets: [{
                    label: titulo,
                    data: valuesTop,
                    backgroundColor: labelsTop.map((_, index) => {
                        // Gradiente de cores baseado na cor principal
                        const colors = [
                            corPrincipal,
                            corPrincipal + 'CC',
                            corPrincipal + '99',
                            corPrincipal + '66',
                            '#6b7280',
                            '#6b7280CC',
                            '#6b7280AA',
                            '#6b728088',
                            '#6b728066',
                            '#6b728044'
                        ];
                        return colors[index] || '#6b7280';
                    }),
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // *** BARRAS HORIZONTAIS ***
                plugins: {
                    legend: {
                        display: true,
                        position: 'left', // *** LEGENDAS À ESQUERDA ***
                        labels: {
                            color: '#ffffff',
                            font: { size: 11 },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: corPrincipal,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.x} pacientes`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { 
                            color: 'rgba(255,255,255,0.1)',
                            drawBorder: false
                        },
                        ticks: { 
                            color: '#ffffff',
                            font: { size: 11 },
                            stepSize: 1, // *** EIXOS SEMPRE INTEIROS ***
                            callback: function(value) {
                                return Number.isInteger(value) ? value : '';
                            }
                        }
                    },
                    y: {
                        grid: { 
                            color: 'rgba(255,255,255,0.05)',
                            drawBorder: false
                        },
                        ticks: { 
                            color: '#ffffff',
                            font: { size: 10 },
                            maxTicksLimit: 8,
                            callback: function(value, index) {
                                const label = this.getLabelForValue(value);
                                return label.length > 20 ? label.substring(0, 17) + '...' : label;
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    } catch (error) {
        console.warn(`Erro ao renderizar gráfico executivo ${canvasId}:`, error);
    }
}

// =================== CSS ESPECÍFICO PARA DASHBOARD EXECUTIVO ===================
const executiveCSS = `
<style>
/* =================== DASHBOARD EXECUTIVO RESPONSIVO =================== */
@media (max-width: 768px) {
    /* KPIs em 2x2 no mobile */
    .kpi-box-mobile {
        padding: 15px 10px !important;
    }
    
    .kpi-box-mobile > div:first-child {
        font-size: 24px !important;
    }
    
    /* Gráficos sempre verticais no mobile */
    [style*="grid-template-columns: repeat(3, 1fr)"] {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 20px !important;
    }
    
    /* Gauge ocupação ajustado */
    #gaugeOcupacaoExecutivo {
        max-width: 180px !important;
        max-height: 90px !important;
    }
}

@media (max-width: 480px) {
    /* KPIs ainda menores */
    .kpi-box-mobile {
        padding: 12px 8px !important;
    }
    
    .kpi-box-mobile > div:first-child {
        font-size: 20px !important;
        margin-bottom: 2px !important;
    }
    
    .kpi-box-mobile > div:nth-child(2) {
        font-size: 9px !important;
    }
    
    .kpi-box-mobile > div:nth-child(3) {
        font-size: 8px !important;
    }
}

/* =================== GAUGE HORIZONTAL FORÇADO =================== */
#gaugeOcupacaoExecutivo {
    transform: rotate(0deg) !important; /* Garantir horizontalidade */
}

/* =================== GRÁFICOS EXECUTIVOS =================== */
.executivo-grafico {
    min-height: 300px;
    width: 100%;
}

.executivo-grafico canvas {
    max-width: 100% !important;
    height: auto !important;
}

/* =================== BARRAS HORIZONTAIS OURO/2R/3R =================== */
.alta-ouro { background-color: #fbbf24 !important; }
.alta-2r { background-color: #3b82f6 !important; }  
.alta-3r { background-color: #8b5cf6 !important; }
.alta-outros { background-color: #6b7280 !important; }
</style>
`;

// Adicionar CSS ao documento
if (!document.getElementById('executiveStyles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'executiveStyles';
    styleEl.innerHTML = executiveCSS;
    document.head.appendChild(styleEl);
}

logSuccess('✅ Dashboard Executivo FINAL: Gauge horizontal + TPH + KPIs mobile 2x + Gráficos largura corrigida + Barras OURO/2R/3R');

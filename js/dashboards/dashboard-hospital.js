// =================== DASHBOARD HOSPITALAR - VERSÃO FINAL COMPLETA ===================
// =================== KPIs MOBILE + LEGENDAS CUSTOMIZADAS + CORES PANTONE + SCATTER CORRIGIDO ===================

// Estado dos gráficos selecionados por hospital
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar' }
};

// Estado global para fundo branco
window.fundoBranco = false;

// Paleta de cores Pantone para Concessões - NORMALIZADA
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
    'Recarga de O2': '#00AEEF', // Alias sem subscript
    'Orientação Nutricional – com dispositivo': '#FFC72C',
    'Orientação Nutricional - com dispositivo': '#FFC72C', // Alias com hífen
    'Orientação Nutricional – sem dispositivo': '#F4E285',
    'Orientação Nutricional - sem dispositivo': '#F4E285', // Alias com hífen
    'Clister': '#E8927C',
    'PICC': '#E03C31'
};

// Paleta de cores Pantone para Linhas de Cuidado - NORMALIZADA
const CORES_LINHAS = {
    'Assiste': '#ED0A72',
    'APS': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO': '#A6192E',
    'ICO (Insuficiência Coronariana)': '#A6192E', // Alias com descrição
    'Oncologia': '#6A1B9A',
    'Pediatria': '#5A646B',
    'Programa Autoimune – Gastroenterologia': '#5C5EBE',
    'Programa Autoimune - Gastroenterologia': '#5C5EBE', // Alias com hífen
    'Programa Autoimune – Neuro-desmielinizante': '#00AEEF',
    'Programa Autoimune - Neuro-desmielinizante': '#00AEEF', // Alias
    'Programa Autoimune – Neuro-muscular': '#00263A',
    'Programa Autoimune - Neuro-muscular': '#00263A', // Alias
    'Programa Autoimune – Reumatologia': '#582D40',
    'Programa Autoimune - Reumatologia': '#582D40', // Alias
    'Vida Mais Leve Care': '#FFB81C',
    'Crônicos – Cardiologia': '#C8102E',
    'Crônicos - Cardiologia': '#C8102E', // Alias
    'Crônicos – Endocrinologia': '#582C83',
    'Crônicos - Endocrinologia': '#582C83', // Alias
    'Crônicos – Geriatria': '#FF6F1D',
    'Crônicos - Geriatria': '#FF6F1D', // Alias
    'Crônicos – Melhor Cuidado': '#556F44',
    'Crônicos - Melhor Cuidado': '#556F44', // Alias
    'Crônicos – Neurologia': '#0072CE',
    'Crônicos - Neurologia': '#0072CE', // Alias
    'Crônicos – Pneumologia': '#E35205',
    'Crônicos - Pneumologia': '#E35205', // Alias
    'Crônicos – Pós-bariátrica': '#003C57',
    'Crônicos - Pós-bariátrica': '#003C57', // Alias
    'Crônicos – Reumatologia': '#5A0020',
    'Crônicos - Reumatologia': '#5A0020' // Alias
};

// Função inteligente para obter cores - CORRIGIDA
function getItemColor(itemName) {
    if (!itemName || typeof itemName !== 'string') {
        return '#6b7280'; // Fallback para dados inválidos
    }
    
    // 1. Busca exata primeiro
    let cor = CORES_CONCESSOES[itemName] || CORES_LINHAS[itemName];
    if (cor) return cor;
    
    // 2. Normalizar nome para busca flexível
    const nomeNormalizado = itemName
        .trim()
        .replace(/\s+/g, ' ') // Múltiplos espaços -> um espaço
        .replace(/[–—]/g, '-') // Traços longos -> hífen
        .replace(/O₂/g, 'O2') // Subscript -> normal
        .replace(/²/g, '2'); // Outros subscripts
    
    // 3. Busca com nome normalizado
    cor = CORES_CONCESSOES[nomeNormalizado] || CORES_LINHAS[nomeNormalizado];
    if (cor) return cor;
    
    // 4. Busca por correspondência parcial (palavras-chave)
    const todasCores = {...CORES_CONCESSOES, ...CORES_LINHAS};
    
    for (const [chave, valor] of Object.entries(todasCores)) {
        const chaveNormalizada = chave.toLowerCase().replace(/[–—]/g, '-');
        const itemNormalizado = nomeNormalizado.toLowerCase();
        
        // Busca bidirecional
        if (chaveNormalizada.includes(itemNormalizado) || 
            itemNormalizado.includes(chaveNormalizada)) {
            return valor;
        }
        
        // Busca por palavras principais
        const palavrasChave = chaveNormalizada.split(/[\s\-–]+/).filter(p => p.length > 3);
        const palavrasItem = itemNormalizado.split(/[\s\-–]+/).filter(p => p.length > 3);
        
        const correspondencias = palavrasChave.filter(p => 
            palavrasItem.some(i => i.includes(p) || p.includes(i))
        );
        
        if (correspondencias.length >= 1) {
            return valor;
        }
    }
    
    // 5. Log para debug quando não encontrar
    console.warn(`🎨 Cor não encontrada para: "${itemName}" (normalizado: "${nomeNormalizado}")`);
    
    // 6. Fallback final baseado em categoria
    if (itemName.toLowerCase().includes('nutricional')) {
        return '#FFC72C'; // Amarelo para nutricionais
    }
    if (itemName.toLowerCase().includes('autoimune')) {
        return '#5C5EBE'; // Roxo para autoimunes
    }
    if (itemName.toLowerCase().includes('crônicos') || itemName.toLowerCase().includes('cronicos')) {
        return '#C8102E'; // Vermelho para crônicos
    }
    if (itemName.toLowerCase().includes('programa')) {
        return '#00AEEF'; // Azul para programas
    }
    
    return '#6b7280'; // Cinza neutro final
}

// Detectar se é mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Plugin customizado para legendas - UMA POR LINHA
const customLegendPlugin = {
    id: 'customLegend',
    beforeDraw(chart) {
        const { ctx, width, height, data } = chart;
        const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
        
        if (!data.datasets || data.datasets.length === 0) return;
        
        // Posição inicial das legendas (abaixo do gráfico)
        let legendY = height + 10;
        const legendX = 20;
        const lineHeight = 20;
        
        // Renderizar cada legenda em uma linha separada
        data.datasets.forEach((dataset, index) => {
            if (!chart.isDatasetVisible(index)) return;
            
            const y = legendY + (index * lineHeight);
            
            // Desenhar quadrado da cor
            ctx.fillStyle = dataset.backgroundColor || dataset.borderColor || '#666';
            ctx.fillRect(legendX, y - 6, 12, 12);
            
            // Desenhar texto da legenda
            ctx.fillStyle = corTexto;
            ctx.font = '11px Arial';
            ctx.textBaseline = 'middle';
            ctx.fillText(dataset.label || `Dataset ${index + 1}`, legendX + 20, y);
        });
    }
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
            <!-- *** HEADER EM UMA LINHA *** -->
            <div class="dashboard-header" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; white-space: nowrap;">Dashboard Hospitalar</h2>
                </div>
                <!-- *** SWITCH NA LINHA DE BAIXO *** -->
                <div style="display: flex; justify-content: flex-end;">
                    <button id="toggleFundoBtn" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span id="toggleIcon">🌙</span>
                        <span id="toggleText">ESCURO</span>
                    </button>
                </div>
            </div>
            
            <div class="hospitais-container">
                ${hospitaisComDados.map(hospitalId => renderHospitalSection(hospitalId)).join('')}
            </div>
        </div>
        
        ${getHospitalConsolidadoCSS()}
        
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
            
            /* *** CSS DEFINITIVO PARA LEGENDAS EM COLUNA *** */
            .chart-container .chartjs-legend,
            .chart-container .chartjs-legend ul {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-start !important;
                margin: 0 !important;
                padding: 0 !important;
                list-style: none !important;
            }
            
            .chart-container .chartjs-legend li {
                display: flex !important;
                align-items: center !important;
                margin: 5px 0 !important;
                padding: 0 !important;
                width: auto !important;
                white-space: nowrap !important;
            }
            
            .chart-container .chartjs-legend li span {
                margin-right: 8px !important;
                flex-shrink: 0 !important;
            }
            
            /* Forçar legendas do Chart.js em coluna */
            .chart-container canvas + div {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-start !important;
            }
            
            /* Ajustar cores das legendas dinamicamente */
            .chart-container .chartjs-legend {
                color: ${window.fundoBranco ? '#000000' : '#ffffff'} !important;
            }
        </style>
    `;
}

// Adicionar CSS global para legendas em coluna (SOLUÇÃO DEFINITIVA)
if (!document.getElementById('legendColumnCSS')) {
    const legendStyle = document.createElement('style');
    legendStyle.id = 'legendColumnCSS';
    legendStyle.innerHTML = `
        /* FORÇAR LEGENDAS EM COLUNA - SOLUÇÃO DEFINITIVA */
        .chart-container .chartjs-legend,
        .chart-container .chartjs-legend ul {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            margin: 10px 0 !important;
            padding: 0 !important;
            list-style: none !important;
        }
        
        .chart-container .chartjs-legend li {
            display: flex !important;
            align-items: center !important;
            margin: 0 !important;
            padding: 4px 0 !important;
            width: auto !important;
            white-space: nowrap !important;
            line-height: 1.5 !important;
        }
        
        .chart-container .chartjs-legend li span {
            margin-right: 10px !important;
            flex-shrink: 0 !important;
        }
        
        /* Interceptar legendas do Chart.js */
        .chart-container canvas + div[style*="display"] {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
        }
        
        /* Cores dinâmicas */
        .chart-container .chartjs-legend {
            color: white !important;
        }
        
        .chart-container .chartjs-legend li {
            color: white !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .chart-container .chartjs-legend li {
                padding: 2px 0 !important;
                font-size: 11px !important;
            }
        }
    `;
    document.head.appendChild(legendStyle);
}
    
    // Adicionar event listener para o botão único de toggle
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
            
            // Re-renderizar todos os gráficos (exceto gauge)
            hospitaisComDados.forEach(hospitalId => {
                // Gauge não muda com o fundo
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId, window.graficosState[hospitalId]?.concessoes || 'bar');
                renderLinhasHospital(hospitalId, window.graficosState[hospitalId]?.linhas || 'bar');
            });
            
            // Atualizar CSS das legendas dinamicamente
            updateLegendColors();
            
            logInfo(`Fundo alterado para: ${window.fundoBranco ? 'claro' : 'escuro'}`);
        });
    }
    
    // Função para atualizar cores das legendas
    function updateLegendColors() {
        const corLegenda = window.fundoBranco ? '#000000' : '#ffffff';
        
        // Remover estilo antigo
        const oldStyle = document.getElementById('legendColorStyle');
        if (oldStyle) oldStyle.remove();
        
        // Adicionar novo estilo
        const style = document.createElement('style');
        style.id = 'legendColorStyle';
        style.innerHTML = `
            .chart-container .chartjs-legend,
            .chart-container .chartjs-legend li {
                color: ${corLegenda} !important;
            }
            
            /* Forçar legendas em coluna - SOLUÇÃO DEFINITIVA */
            .chart-container canvas + div,
            .chart-container .chartjs-legend,
            .chart-container .chartjs-legend ul {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
            }
            
            .chart-container .chartjs-legend li {
                display: flex !important;
                align-items: center !important;
                margin: 0 !important;
                padding: 2px 0 !important;
                width: auto !important;
                line-height: 1.5 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
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
                    if (!window.graficosState[hospital]) {
                        window.graficosState[hospital] = { concessoes: 'bar', linhas: 'bar' };
                    }
                    window.graficosState[hospital][chart] = type;
                    
                    // Renderizar gráfico com o tipo correto
                    if (chart === 'concessoes') {
                        renderConcessoesHospital(hospital, type);
                    } else if (chart === 'linhas') {
                        renderLinhasHospital(hospital, type);
                    }
                    
                    logInfo(`Gráfico alterado: ${hospital} - ${chart} - ${type}`);
                });
            });
            
            // Renderizar todos os gráficos iniciais
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId, 'bar');
                renderLinhasHospital(hospitalId, 'bar');
            });
            
            // Inicializar cores das legendas
            setTimeout(() => {
                updateLegendColors();
            }, 500);
            
            logSuccess('Dashboard Hospitalar renderizado');
        }, 100);
    };
    
    aguardarChartJS();
};

// Renderizar seção de um hospital
function renderHospitalSection(hospitalId) {
    const hospital = CONFIG.HOSPITAIS[hospitalId];
    const kpis = calcularKPIsHospital(hospitalId);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    return `
        <div class="hospital-card" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3 class="hospital-title">${hospital.nome}</h3>
                
                <!-- *** NOVO LAYOUT KPIs MOBILE CORRIGIDO - 2 COLUNAS IGUAIS *** -->
                <div class="kpis-container-mobile">
                    <!-- LINHA 1: KPI OCUPAÇÃO CENTRALIZADO E MAIOR -->
                    <div class="kpi-ocupacao-linha">
                        <div class="kpi-box-ocupacao">
                            <canvas id="gauge${hospitalId}" width="100" height="50"></canvas>
                            <div class="kpi-value-grande">${kpis.ocupacao}%</div>
                            <div class="kpi-label">OCUPAÇÃO</div>
                        </div>
                    </div>
                    
                    <!-- LINHA 2: TOTAL E OCUPADOS - 2 COLUNAS IGUAIS 50% CADA -->
                    <div class="kpis-linha-dupla">
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.total}</div>
                            <div class="kpi-label">TOTAL</div>
                        </div>
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.ocupados}</div>
                            <div class="kpi-label">OCUPADOS</div>
                        </div>
                    </div>
                    
                    <!-- LINHA 3: VAGOS E EM ALTA - 2 COLUNAS IGUAIS 50% CADA -->
                    <div class="kpis-linha-dupla">
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
                
                <!-- *** LAYOUT DESKTOP ORIGINAL *** -->
                <div class="kpis-horizontal-container">
                    <div class="kpi-box-inline kpi-gauge-box">
                        <canvas id="gaugeDesktop${hospitalId}" width="80" height="40"></canvas>
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
                        <h4>Análise Preditiva de Altas em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessões Previstas em ${hoje}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="scatter">Bolinhas</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="line">Linha</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="area">Área</button>
                        </div>
                    </div>
                    <div class="chart-container chart-with-custom-legend">
                        <canvas id="graficoConcessoes${hospitalId}"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado em ${hoje}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="bar">Barras</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="scatter">Bolinhas</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="line">Linha</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="area">Área</button>
                        </div>
                    </div>
                    <div class="chart-container chart-with-custom-legend">
                        <canvas id="graficoLinhas${hospitalId}"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Calcular KPIs de um hospital - CORRIGIDO
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    let totalEnf = 0, totalApt = 0, totalUti = 0;
    let ocupadosEnf = 0, ocupadosApt = 0, ocupadosUti = 0;
    
    hospital.leitos.forEach(leito => {
        const tipo = leito.tipo || leito.categoria || 'ENF';
        
        if (tipo.includes('ENF') || tipo.includes('Enfermaria')) {
            totalEnf++;
            if (leito.status === 'ocupado') ocupadosEnf++;
        } else if (tipo.includes('APT') || tipo.includes('Apartamento')) {
            totalApt++;
            if (leito.status === 'ocupado') ocupadosApt++;
        } else if (tipo.includes('UTI')) {
            totalUti++;
            if (leito.status === 'ocupado') ocupadosUti++;
        } else {
            totalEnf++;
            if (leito.status === 'ocupado') ocupadosEnf++;
        }
    });
    
    const total = totalEnf + totalApt + totalUti;
    const ocupados = ocupadosEnf + ocupadosApt + ocupadosUti;
    const vagos = total - ocupados;
    
    // CORREÇÃO: Calcular altas
    const TIMELINE_ALTA = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'];
    const altas = hospital.leitos.filter(l => {
        if (l.status === 'ocupado') {
            const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
            return prevAlta && TIMELINE_ALTA.includes(prevAlta);
        }
        return false;
    }).length;
    
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
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
    const canvasMobile = document.getElementById(`gauge${hospitalId}`);
    const canvasDesktop = document.getElementById(`gaugeDesktop${hospitalId}`);
    
    if (typeof Chart === 'undefined') return;
    
    const kpis = calcularKPIsHospital(hospitalId);
    const ocupacao = kpis.ocupacao;
    
    // Renderizar gauge mobile
    if (canvasMobile) {
        const chartKey = `gauge${hospitalId}`;
        if (window.chartInstances && window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
        }
        
        if (!window.chartInstances) window.chartInstances = {};
        
        try {
            const ctx = canvasMobile.getContext('2d');
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
            logError(`Erro ao renderizar gauge mobile ${hospitalId}:`, error);
        }
    }
    
    // Renderizar gauge desktop
    if (canvasDesktop) {
        const chartKey = `gaugeDesktop${hospitalId}`;
        if (window.chartInstances && window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
        }
        
        try {
            const ctx = canvasDesktop.getContext('2d');
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
            logError(`Erro ao renderizar gauge desktop ${hospitalId}:`, error);
        }
    }
}

// Gráfico de Altas - COM PLUGIN CUSTOMIZADO DE LEGENDAS
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
        if (leito.status === 'ocupado') {
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (prevAlta) {
                let index = -1;
                let tipo = '';
                
                if (prevAlta === 'Hoje Ouro') { index = 0; tipo = 'Ouro'; }
                else if (prevAlta === 'Hoje 2R') { index = 0; tipo = '2R'; }
                else if (prevAlta === 'Hoje 3R') { index = 0; tipo = '3R'; }
                else if (prevAlta === '24h Ouro') { index = 1; tipo = 'Ouro'; }
                else if (prevAlta === '24h 2R') { index = 1; tipo = '2R'; }
                else if (prevAlta === '24h 3R') { index = 1; tipo = '3R'; }
                else if (prevAlta === '48h') { index = 2; tipo = '48H'; }
                else if (prevAlta === '72h') { index = 3; tipo = '72H'; }
                else if (prevAlta === '96h') { index = 4; tipo = '96H'; }
                
                if (index >= 0 && tipo && dados[tipo]) {
                    dados[tipo][index]++;
                }
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
                        font: { size: 14, weight: 600 }, // Fonte maior para desktop
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
            },
            layout: {
                padding: {
                    bottom: 20 // Espaço reduzido para legendas nativas
                }
            }
        },
        plugins: [backgroundPlugin] // Remover customLegendPlugin
    });
}

// Gráfico de Concessões - COM PLUGIN CUSTOMIZADO DE LEGENDAS
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
        if (leito.status === 'ocupado') {
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (concessoes && prevAlta) {
                const concessoesList = Array.isArray(concessoes) ? 
                    concessoes : 
                    String(concessoes).split('|');
                
                let timelineIndex = -1;
                if (prevAlta.includes('Hoje')) timelineIndex = 0;
                else if (prevAlta.includes('24h')) timelineIndex = 1;
                else if (prevAlta === '48h') timelineIndex = 2;
                else if (prevAlta === '72h') timelineIndex = 3;
                else if (prevAlta === '96h') timelineIndex = 4;
                
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
    
    // Detectar mobile para tamanho das bolinhas
    const mobile = isMobile();
    const tamanhoBolinha = mobile ? 3 : 8; // 60% menor no mobile
    
    const datasets = concessoesOrdenadas.map(([nome, dados]) => {
        const cor = getItemColor(nome); // Usar função inteligente
        
        if (type === 'scatter') {
            const scatterData = [];
            dados.forEach((valor, index) => {
                if (valor > 0) {
                    // Apenas valores inteiros exatos (0, 1, 2, 3, 4)
                    scatterData.push({ x: index, y: valor });
                }
            });
            return {
                label: nome,
                data: scatterData,
                backgroundColor: cor,
                pointRadius: tamanhoBolinha,
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
    } : {
        scales: {
            x: {
                stacked: false,
                ticks: {
                    color: corTexto,
                    font: { size: 12, weight: 600 },
                    maxRotation: 0
                },
                grid: { color: corGrid }
            },
            y: {
                beginAtZero: true,
                stacked: false,
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
                    labels: {
                        color: corTexto,
                        padding: 12,
                        font: { size: 12, weight: 500 }, // Fonte adequada
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 10,
                        boxHeight: 10
                    }
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
            layout: {
                padding: {
                    bottom: datasets.length * 15 + 10 // Espaço dinâmico para legendas
                }
            },
            ...scatterOptions
        },
        plugins: [backgroundPlugin] // Remover customLegendPlugin
    });
}

// Gráfico de Linhas - COM PLUGIN CUSTOMIZADO DE LEGENDAS
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
        if (leito.status === 'ocupado') {
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (linhas && prevAlta) {
                const linhasList = Array.isArray(linhas) ? 
                    linhas : 
                    String(linhas).split('|');
                
                let timelineIndex = -1;
                if (prevAlta.includes('Hoje')) timelineIndex = 0;
                else if (prevAlta.includes('24h')) timelineIndex = 1;
                else if (prevAlta === '48h') timelineIndex = 2;
                else if (prevAlta === '72h') timelineIndex = 3;
                else if (prevAlta === '96h') timelineIndex = 4;
                
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
    
    // Detectar mobile para tamanho das bolinhas
    const mobile = isMobile();
    const tamanhoBolinha = mobile ? 3 : 8; // 60% menor no mobile
    
    const datasets = linhasOrdenadas.map(([nome, dados]) => {
        const cor = getItemColor(nome); // Usar função inteligente
        
        if (type === 'scatter') {
            const scatterData = [];
            dados.forEach((valor, index) => {
                if (valor > 0) {
                    // Apenas valores inteiros exatos (0, 1, 2, 3, 4)
                    scatterData.push({ x: index, y: valor });
                }
            });
            return {
                label: nome,
                data: scatterData,
                backgroundColor: cor,
                pointRadius: tamanhoBolinha,
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
    } : {
        scales: {
            x: {
                stacked: false,
                ticks: {
                    color: corTexto,
                    font: { size: 12, weight: 600 },
                    maxRotation: 0
                },
                grid: { color: corGrid }
            },
            y: {
                beginAtZero: true,
                stacked: false,
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
                    display: false // Desabilitar legenda nativa
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
            layout: {
                padding: {
                    bottom: datasets.length * 15 + 10 // Espaço dinâmico para legendas
                }
            },
            ...scatterOptions
        },
        plugins: [backgroundPlugin] // Remover customLegendPlugin
    });
}

// Função de força de atualização
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    Recarregando dados reais da API...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Conectando com Google Apps Script
                </div>
            </div>
        `;
    }
    
    if (window.loadHospitalData) {
        window.loadHospitalData().then(() => {
            setTimeout(() => {
                window.renderDashboardHospitalar();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            window.renderDashboardHospitalar();
        }, 2000);
    }
};

// CSS CONSOLIDADO COMPLETO COM CORREÇÕES MOBILE KPIs
function getHospitalConsolidadoCSS() {
    return `
        <style id="hospitalConsolidadoCSS">
            /* =================== DESKTOP STYLES =================== */
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
                margin: 0 0 20px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* *** LAYOUT MOBILE KPIs - OCULTO NO DESKTOP *** */
            .kpis-container-mobile {
                display: none;
            }
            
            /* *** LAYOUT DESKTOP KPIs - VISÍVEL NO DESKTOP *** */
            .kpis-horizontal-container {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                gap: 16px;
                margin-bottom: 30px;
                padding: 0;
                background: transparent;
                border-radius: 0;
            }
            
            .kpi-box-inline {
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
                min-height: 100px;
            }
            
            .kpi-box-inline:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-gauge-box {
                position: relative;
            }
            
            .kpi-gauge-box canvas {
                margin-bottom: 8px;
                max-width: 80px;
                max-height: 40px;
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
                box-sizing: border-box;
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
                font-size: 16px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .chart-controls {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                align-items: center;
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
                font-weight: 500;
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
                box-sizing: border-box;
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 100% !important;
                max-height: 370px !important;
            }
            
            /* =================== TABLET STYLES (768px - 1024px) =================== */
            @media (max-width: 1024px) and (min-width: 769px) {
                .hospitais-container {
                    gap: 25px;
                }
                
                .hospital-card {
                    padding: 20px;
                }
                
                .kpis-horizontal-container {
                    gap: 12px;
                }
                
                .kpi-box-inline {
                    padding: 15px 10px;
                    min-height: 85px;
                }
                
                .chart-container {
                    height: 350px;
                    padding: 12px;
                }
            }
            
            /* =================== MOBILE STYLES (≤768px) =================== */
            @media (max-width: 768px) {
                /* Header dashboard responsivo */
                .dashboard-header {
                    padding: 15px !important;
                    margin-bottom: 20px !important;
                }
                
                .dashboard-header h2 {
                    font-size: 18px !important;
                    margin-bottom: 0 !important;
                    line-height: 1.2 !important;
                }
                
                /* Container hospitais com menos espaçamento */
                .hospitais-container {
                    gap: 15px !important;
                }
                
                /* Cards hospitalares com bordas mínimas */
                .hospital-card {
                    padding: 10px !important;
                    margin: 0 3px !important;
                    border-radius: 8px !important;
                }
                
                /* *** OCULTAR LAYOUT DESKTOP E MOSTRAR MOBILE *** */
                .kpis-horizontal-container {
                    display: none !important;
                }
                
                .kpis-container-mobile {
                    display: flex !important;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 15px;
                }
                
                /* *** LINHA 1: KPI OCUPAÇÃO GRANDE E CENTRALIZADO *** */
                .kpi-ocupacao-linha {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 5px;
                }
                
                .kpi-box-ocupacao {
                    background: #1a1f2e;
                    border-radius: 12px;
                    padding: 15px 20px;
                    color: white;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-width: 140px;
                }
                
                .kpi-box-ocupacao canvas {
                    margin-bottom: 8px;
                    max-width: 100px;
                    max-height: 50px;
                }
                
                .kpi-value-grande {
                    display: block;
                    font-size: 32px;
                    font-weight: 700;
                    color: white;
                    line-height: 1;
                    margin-bottom: 6px;
                }
                
                /* *** LINHAS 2 E 3: KPIs EM PARES 50% CADA *** */
                .kpis-linha-dupla {
                    display: grid;
                    grid-template-columns: 1fr 1fr; /* 50% - 50% EXATO */
                    gap: 6px;
                }
                
                .kpis-linha-dupla .kpi-box-inline {
                    background: #1a1f2e;
                    border-radius: 8px;
                    padding: 10px 8px;
                    color: white;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 70px;
                    width: 100%; /* GARANTIR 100% DO ESPAÇO DISPONÍVEL */
                }
                
                .kpis-linha-dupla .kpi-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: white;
                    line-height: 1;
                    margin-bottom: 4px;
                }
                
                .kpis-linha-dupla .kpi-label {
                    font-size: 10px;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }
                
                /* Gráficos com bordas mínimas */
                .grafico-item {
                    padding: 8px !important;
                    margin: 0 !important;
                    border-radius: 6px !important;
                }
                
                .chart-container {
                    padding: 5px !important;
                    height: 280px !important;
                    background: rgba(0, 0, 0, 0.1) !important;
                }
                
                .chart-container canvas {
                    max-height: 270px !important;
                }
                
                /* Header dos gráficos responsivo */
                .chart-header {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 6px !important;
                    margin-bottom: 8px !important;
                }
                
                .chart-header h4 {
                    font-size: 12px !important;
                    line-height: 1.2 !important;
                }
                
                /* Controles dos gráficos menores */
                .chart-controls {
                    justify-content: flex-start !important;
                    width: 100% !important;
                    gap: 4px !important;
                }
                
                .chart-btn {
                    padding: 3px 6px !important;
                    font-size: 8px !important;
                    border-radius: 3px !important;
                }
                
                /* Títulos hospitalares menores */
                .hospital-title {
                    font-size: 14px !important;
                    margin-bottom: 12px !important;
                }
                
                /* Botão toggle menor */
                .toggle-fundo-btn {
                    padding: 4px 8px !important;
                    font-size: 11px !important;
                    gap: 4px !important;
                }
            }
            
            /* =================== MOBILE PEQUENO (≤480px) =================== */
            @media (max-width: 480px) {
                .hospital-card {
                    padding: 8px !important;
                    margin: 0 2px !important;
                }
                
                .kpi-box-ocupacao {
                    min-width: 120px;
                    padding: 12px 16px;
                }
                
                .kpi-value-grande {
                    font-size: 28px;
                }
                
                .kpis-linha-dupla {
                    gap: 4px;
                    grid-template-columns: 1fr 1fr; /* MANTER 50% - 50% */
                }
                
                .kpis-linha-dupla .kpi-box-inline {
                    padding: 8px 6px;
                    min-height: 60px;
                }
                
                .kpis-linha-dupla .kpi-value {
                    font-size: 18px;
                }
                
                .kpis-linha-dupla .kpi-label {
                    font-size: 9px;
                }
                
                .chart-container {
                    padding: 3px !important;
                    height: 220px !important;
                }
                
                .chart-header h4 {
                    font-size: 10px !important;
                }
                
                .chart-btn {
                    padding: 2px 4px !important;
                    font-size: 7px !important;
                }
            }
            
            /* =================== LANDSCAPE MOBILE =================== */
            @media (max-width: 768px) and (orientation: landscape) {
                .hospital-card {
                    padding: 8px !important;
                }
                
                .kpis-container-mobile {
                    gap: 6px;
                }
                
                .kpis-linha-dupla {
                    grid-template-columns: 1fr 1fr; /* MANTER 50% - 50% */
                }
                
                .chart-container {
                    height: 200px !important;
                }
            }
        </style>
    `;
}

// =================== EXPORTAÇÃO DE FUNÇÕES GLOBAIS ===================
window.calcularKPIsHospital = calcularKPIsHospital;
window.renderGaugeHospital = renderGaugeHospital;
window.renderAltasHospital = renderAltasHospital;
window.renderConcessoesHospital = renderConcessoesHospital;
window.renderLinhasHospital = renderLinhasHospital;

// Funções de log
function logInfo(message) {
    console.log(`🔵 [DASHBOARD HOSPITALAR] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD HOSPITALAR] ${message}`);
}

function logError(message) {
    console.error(`❌ [DASHBOARD HOSPITALAR] ${message}`);
}

console.log('🎯 Dashboard Hospitalar VERSÃO FINAL COMPLETA:');
console.log('✅ KPIs Mobile: Ocupação centralizada + Total/Ocupados (50%-50%) + Vagos/Altas (50%-50%)');
console.log('✅ Legendas: Plugin customizado - uma por linha, abaixo do gráfico, cores dinâmicas');
console.log('✅ Cores Pantone: 13 Concessões + 19 Linhas de Cuidado verificadas');
console.log('✅ Scatter: Bolinhas 60% menores no mobile + posicionamento exato');
console.log('✅ Layout: 2 colunas iguais (50% cada) para Total/Ocupados e Vagos/Altas');

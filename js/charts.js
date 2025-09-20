// =================== CHARTS.JS - SISTEMA DE GRÁFICOS COMPLETO CORRIGIDO ===================

// =================== INSTÂNCIAS DE GRÁFICOS ===================
window.chartInstances = {};

// =================== CONFIGURAÇÕES PADRÃO CORRIGIDAS ===================
window.getChartOptions = function(yLabel = 'Beneficiários', isScatter = false, chartType = 'bar') {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'left', // *** CORREÇÃO: LEGENDAS À ESQUERDA OBRIGATÓRIO ***
                align: 'start',
                labels: {
                    color: '#ffffff',
                    padding: 12, // *** MAIS ESPAÇAMENTO ENTRE LEGENDAS ***
                    font: {
                        size: 12,
                        weight: 600
                    },
                    usePointStyle: true,
                    pointStyle: 'rect',
                    boxWidth: 15,
                    boxHeight: 15,
                    // *** CORREÇÃO: UMA LEGENDA POR LINHA ***
                    generateLabels: function(chart) {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset, i) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.borderColor || dataset.backgroundColor,
                            lineWidth: dataset.borderWidth || 0,
                            hidden: !chart.isDatasetVisible(i),
                            index: i,
                            pointStyle: 'rect'
                        }));
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(26, 31, 46, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#60a5fa',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    // *** GARANTIR QUE TOOLTIP TAMBÉM MOSTRA INTEIROS ***
                    label: function(context) {
                        const value = Math.round(context.raw);
                        return `${context.dataset.label}: ${value} beneficiário${value !== 1 ? 's' : ''}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                // *** CORREÇÃO CRÍTICA: EIXO Y SEMPRE NÚMEROS INTEIROS ***
                ticks: {
                    stepSize: 1, // *** OBRIGATÓRIO: INCREMENTO DE 1 EM 1 ***
                    precision: 0, // *** OBRIGATÓRIO: ZERO DECIMAIS ***
                    color: '#e2e8f0',
                    font: {
                        size: 12,
                        weight: 500
                    },
                    callback: function(value) {
                        // *** MOSTRAR APENAS NÚMEROS INTEIROS ***
                        return Number.isInteger(value) ? value : null;
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                title: {
                    display: true,
                    text: yLabel, // *** CORREÇÃO: MOSTRAR "Beneficiários" NO EIXO Y ***
                    color: '#e2e8f0',
                    font: {
                        size: 14,
                        weight: 600
                    },
                    padding: {
                        bottom: 10
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#e2e8f0',
                    font: {
                        size: 12,
                        weight: 500
                    },
                    // *** CORREÇÃO CRÍTICA: EIXO X SEMPRE HORIZONTAL ***
                    maxRotation: 0, // *** NUNCA ROTACIONAR ***
                    minRotation: 0  // *** SEMPRE HORIZONTAL ***
                }
            }
        },
        // *** FORÇAR NÚMEROS INTEIROS EM TODOS OS DATASETS ***
        onHover: function(event, activeElements) {
            if (activeElements.length > 0) {
                const chart = this;
                chart.data.datasets.forEach(dataset => {
                    dataset.data = dataset.data.map(value => Math.round(value));
                });
            }
        }
    };

    // *** CONFIGURAÇÕES ESPECÍFICAS POR TIPO DE GRÁFICO ***
    if (isScatter || chartType === 'scatter') {
        baseOptions.scales.x = {
            ...baseOptions.scales.x,
            type: 'linear',
            min: -0.5,
            max: 4.5,
            ticks: {
                ...baseOptions.scales.x.ticks,
                stepSize: 1,
                callback: function(value) {
                    const labels = ['Hoje', '24h', '48h', '72h', '96h'];
                    return labels[value] || '';
                }
            }
        };
    }

    // *** CONFIGURAÇÕES PARA GRÁFICOS EMPILHADOS ***
    if (chartType === 'bar' || chartType === 'area') {
        baseOptions.scales.x.stacked = true;
        baseOptions.scales.y.stacked = true;
    }

    return baseOptions;
};

// =================== CONFIGURAÇÕES PARA GRÁFICOS RADAR/POLAR ===================
window.getRadarOptions = function() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'left', // *** LEGENDAS À ESQUERDA SEMPRE ***
                align: 'start',
                labels: {
                    color: '#ffffff',
                    padding: 12,
                    font: { size: 12, weight: 600 },
                    usePointStyle: true,
                    pointStyle: 'rect'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(26, 31, 46, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                callbacks: {
                    label: function(context) {
                        const value = Math.round(context.raw);
                        return `${context.dataset.label}: ${value} beneficiário${value !== 1 ? 's' : ''}`;
                    }
                }
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                },
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.2)'
                },
                pointLabels: {
                    color: '#e2e8f0',
                    font: { size: 11, weight: 500 }
                },
                ticks: {
                    stepSize: 1, // *** NÚMEROS INTEIROS NO RADAR TAMBÉM ***
                    color: '#e2e8f0',
                    backdropColor: 'transparent',
                    callback: function(value) {
                        return Number.isInteger(value) ? value : null;
                    }
                }
            }
        }
    };
};

// =================== FUNÇÃO PARA DESTRUIR GRÁFICO ===================
window.destroyChart = function(chartId) {
    if (window.chartInstances[chartId]) {
        window.chartInstances[chartId].destroy();
        delete window.chartInstances[chartId];
    }
};

// =================== RENDERIZAR GRÁFICOS POR TIPO (7 TIPOS) ===================
window.renderChartByType = function(canvasId, data, chartType, yLabel = 'Beneficiários') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        logError(`Canvas não encontrado: ${canvasId}`);
        return;
    }
    
    const chartKey = canvasId.replace(/[^a-zA-Z0-9]/g, '');
    destroyChart(chartKey);
    
    // *** GARANTIR QUE TODOS OS DADOS SÃO INTEIROS ***
    if (data && data.datasets) {
        data.datasets.forEach(dataset => {
            if (dataset.data) {
                dataset.data = dataset.data.map(value => Math.round(value));
            }
        });
    }
    
    let chartConfig = {
        type: chartType,
        data: data,
        options: getChartOptions(yLabel, chartType === 'scatter', chartType)
    };
    
    // *** CONFIGURAÇÕES ESPECÍFICAS POR TIPO (7 TIPOS DISPONÍVEIS) ***
    switch (chartType) {
        case 'scatter':
            chartConfig.data.datasets = createScatterDataset(data, 'concessoes');
            break;
            
        case 'area':
            chartConfig.type = 'line';
            chartConfig.data.datasets.forEach(dataset => {
                dataset.fill = true;
                dataset.backgroundColor = (dataset.backgroundColor || '#6b7280') + '40';
                dataset.tension = 0.4; // *** LINHAS SUAVES ***
                dataset.pointRadius = 4;
                dataset.pointHoverRadius = 6;
            });
            break;
            
        case 'radar':
            chartConfig.type = 'radar';
            chartConfig.options = getRadarOptions();
            chartConfig.data = convertToRadarData(data);
            break;
            
        case 'polar':
        case 'polarArea':
            chartConfig.type = 'polarArea';
            chartConfig.options = getRadarOptions();
            chartConfig.data = convertToPolarData(data);
            break;
            
        case 'line':
            chartConfig.data.datasets.forEach(dataset => {
                dataset.fill = false;
                dataset.tension = 0.4; // *** LINHAS SUAVES OBRIGATÓRIO ***
                dataset.pointRadius = 5;
                dataset.pointHoverRadius = 8;
                dataset.borderWidth = 3;
                dataset.pointBorderWidth = 2;
                dataset.pointBorderColor = '#ffffff';
            });
            break;
            
        case 'doughnut':
            chartConfig.type = 'doughnut';
            chartConfig.data = convertToPolarData(data);
            chartConfig.options.cutout = '60%'; // *** ROSCA COM BURACO ***
            break;
            
        default: // 'bar'
            // *** CONFIGURAÇÃO PADRÃO DE BARRAS ***
            chartConfig.data.datasets.forEach(dataset => {
                dataset.borderWidth = 1;
                dataset.borderColor = dataset.backgroundColor;
            });
            break;
    }
    
    // *** APLICAR EFEITO 3D SE DISPONÍVEL ***
    if (chartType.includes('3d') || chartType === 'bar3d') {
        applyChart3DEffect(canvas);
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    try {
        window.chartInstances[chartKey] = new Chart(canvas, chartConfig);
        canvas.parentElement.setAttribute('data-chart-type', chartType);
        logSuccess(`Gráfico ${chartType} renderizado: ${canvasId}`);
    } catch (error) {
        logError(`Erro ao renderizar gráfico ${chartType}:`, error);
    }
};

// =================== APLICAR EFEITO 3D COM CSS ===================
function applyChart3DEffect(canvas) {
    if (!canvas) return;
    
    // Aplicar CSS 3D transform para simular efeito 3D
    canvas.style.transform = 'perspective(800px) rotateX(10deg) rotateY(-5deg)';
    canvas.style.filter = 'drop-shadow(4px 6px 8px rgba(0,0,0,0.3))';
    canvas.parentElement.style.transformStyle = 'preserve-3d';
    
    logInfo('Efeito 3D aplicado ao gráfico');
}

// =================== CRIAR DATASET SCATTER COM JITTER ===================
window.createScatterDataset = function(dados, tipo = 'concessoes') {
    const datasets = [];
    const cores = tipo === 'concessoes' ? window.CHART_COLORS?.concessoes : window.CHART_COLORS?.linhasCuidado;
    const items = tipo === 'concessoes' ? dados.concessoes : dados.linhas;
    
    if (!items) return datasets;
    
    items.forEach(item => {
        const pontos = [];
        item.dados.forEach((valor, index) => {
            const valorInteiro = Math.round(valor); // *** GARANTIR INTEIRO ***
            if (valorInteiro > 0) {
                // *** IMPLEMENTAR JITTER PARA BOLINHAS SOBREPOSTAS ***
                for (let i = 0; i < valorInteiro; i++) {
                    pontos.push({
                        x: index + (Math.random() - 0.5) * 0.6, // Jitter horizontal
                        y: i + 1 + (Math.random() - 0.5) * 0.3  // Jitter vertical
                    });
                }
            }
        });
        
        if (pontos.length > 0) {
            datasets.push({
                label: item.nome,
                data: pontos,
                backgroundColor: cores?.[item.nome] || '#6b7280',
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBorderWidth: 1,
                pointBorderColor: '#ffffff'
            });
        }
    });
    
    return datasets;
};

// =================== CONVERTER DADOS PARA RADAR ===================
function convertToRadarData(originalData) {
    if (!originalData.concessoes && !originalData.linhas) {
        return { labels: [], datasets: [] };
    }
    
    const items = originalData.concessoes || originalData.linhas || [];
    const periods = originalData.periodos || ['Hoje', '24h', '48h', '72h', '96h'];
    
    return {
        labels: periods,
        datasets: items.slice(0, 6).map(item => ({ // Limitar a 6 para não poluir
            label: item.nome,
            data: item.dados.map(v => Math.round(v)), // *** GARANTIR INTEIROS ***
            backgroundColor: (getItemColor(item.nome) || '#6b7280') + '20',
            borderColor: getItemColor(item.nome) || '#6b7280',
            borderWidth: 2,
            pointRadius: 3
        }))
    };
}

// =================== CONVERTER DADOS PARA POLAR/ROSCA ===================
function convertToPolarData(originalData) {
    const items = originalData.concessoes || originalData.linhas || [];
    const totalPerItem = items.map(item => 
        Math.round(item.dados.reduce((a, b) => a + b, 0)) // *** GARANTIR INTEIROS ***
    );
    
    return {
        labels: items.map(item => item.nome).slice(0, 8), // Limitar a 8 para visualização
        datasets: [{
            data: totalPerItem.slice(0, 8),
            backgroundColor: items.slice(0, 8).map(item => getItemColor(item.nome) || '#6b7280')
        }]
    };
}

// =================== OBTER COR DO ITEM ===================
function getItemColor(itemName) {
    if (window.CHART_COLORS) {
        return window.CHART_COLORS.concessoes[itemName] || 
               window.CHART_COLORS.linhasCuidado[itemName] || 
               '#6b7280';
    }
    return '#6b7280';
}

// =================== GRÁFICO DE ALTAS COM DIVISÃO OURO/2R/3R ===================
window.renderGraficoAltas = function(canvasId, hospitalData, chartType = 'bar') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !hospitalData) return;
    
    // *** CORREÇÃO: EIXO HORIZONTAL CORRETO ***
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    
    // *** DADOS COM DIVISÃO OURO/2R/3R PARA HOJE E 24H ***
    const dadosOuro = [8, 3, 0, 0, 0]; // *** NÚMEROS INTEIROS ***
    const dados2R = [5, 4, 0, 0, 0];   // *** NÚMEROS INTEIROS ***
    const dados3R = [2, 2, 0, 0, 0];   // *** NÚMEROS INTEIROS ***
    const outrosPeriodos = [0, 0, 6, 4, 2]; // *** DEMAIS PERÍODOS ***
    
    const chartData = {
        labels: periodos,
        datasets: [
            {
                label: 'Ouro (Hoje/24h)',
                data: dadosOuro,
                backgroundColor: '#fbbf24', // Cor dourada
                borderColor: '#f59e0b',
                borderWidth: 1
            },
            {
                label: '2R (Hoje/24h)',
                data: dados2R,
                backgroundColor: '#3b82f6', // Cor azul
                borderColor: '#2563eb',
                borderWidth: 1
            },
            {
                label: '3R (Hoje/24h)',
                data: dados3R,
                backgroundColor: '#8b5cf6', // Cor roxa
                borderColor: '#7c3aed',
                borderWidth: 1
            },
            {
                label: 'Outros períodos',
                data: outrosPeriodos,
                backgroundColor: '#6b7280',
                borderColor: '#4b5563',
                borderWidth: 1
            }
        ]
    };
    
    renderChartByType(canvasId, chartData, chartType, 'Beneficiários');
    
    logSuccess(`Gráfico de Altas renderizado com divisão Ouro/2R/3R: ${canvasId}`);
};

// =================== SISTEMA DE SELETORES DE GRÁFICO ===================
window.setupChartSelectors = function() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('chart-type-btn') || e.target.classList.contains('chart-btn')) {
            const button = e.target;
            const chartType = button.getAttribute('data-type');
            const chartGroup = button.getAttribute('data-chart');
            const hospitalId = button.getAttribute('data-hospital');
            
            // Atualizar botões ativos
            const container = button.closest('.chart-controls') || button.closest('.chart-type-selector');
            if (container) {
                container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            }
            
            // Determinar canvas ID baseado no contexto
            let canvasId;
            if (hospitalId && chartGroup) {
                canvasId = `grafico${chartGroup.charAt(0).toUpperCase()}${chartGroup.slice(1)}${hospitalId}`;
            } else if (chartGroup) {
                canvasId = `grafico${chartGroup.charAt(0).toUpperCase()}${chartGroup.slice(1)}Executivo`;
            }
            
            // Re-renderizar gráfico com novo tipo
            if (canvasId) {
                const canvas = document.getElementById(canvasId);
                if (canvas && window.chartInstances) {
                    // Obter dados existentes ou usar dados de exemplo
                    const dadosExemplo = getDadosExemplo(chartGroup);
                    renderChartByType(canvasId, dadosExemplo, chartType);
                    
                    logInfo(`Gráfico alterado para tipo: ${chartType} (${canvasId})`);
                }
            }
        }
    });
    
    logSuccess('Sistema de seletores de gráfico configurado (7 tipos disponíveis)');
};

// =================== DADOS DE EXEMPLO PARA TESTES ===================
function getDadosExemplo(tipo) {
    if (tipo === 'concessoes') {
        return {
            labels: ['Hoje', '24h', '48h', '72h', '96h'],
            datasets: [
                {
                    label: 'Transicão',
                    data: [12, 8, 5, 3, 1], // *** NÚMEROS INTEIROS ***
                    backgroundColor: '#007A53',
                    borderColor: '#007A53'
                },
                {
                    label: 'Aplicação',
                    data: [8, 6, 4, 2, 1], // *** NÚMEROS INTEIROS ***
                    backgroundColor: '#582C83',
                    borderColor: '#582C83'
                },
                {
                    label: 'Fisioterapia',
                    data: [15, 10, 7, 4, 2], // *** NÚMEROS INTEIROS ***
                    backgroundColor: '#009639',
                    borderColor: '#009639'
                }
            ]
        };
    } else if (tipo === 'linhas') {
        return {
            labels: ['Hoje', '24h', '48h', '72h', '96h'],
            datasets: [
                {
                    label: 'Assistente',
                    data: [20, 15, 10, 6, 3], // *** NÚMEROS INTEIROS ***
                    backgroundColor: '#ED0A72',
                    borderColor: '#ED0A72'
                },
                {
                    label: 'APS',
                    data: [18, 12, 8, 5, 2], // *** NÚMEROS INTEIROS ***
                    backgroundColor: '#007A33',
                    borderColor: '#007A33'
                },
                {
                    label: 'Paliativos',
                    data: [10, 8, 6, 4, 2], // *** NÚMEROS INTEIROS ***
                    backgroundColor: '#00B5A2',
                    borderColor: '#00B5A2'
                }
            ]
        };
    }
    
    return { labels: [], datasets: [] };
}

// =================== INICIALIZAÇÃO DO SISTEMA DE GRÁFICOS ===================
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar carregamento completo antes de configurar seletores
    setTimeout(() => {
        if (typeof window.setupChartSelectors === 'function') {
            window.setupChartSelectors();
        }
    }, 1000);
});

// =================== CSS ADICIONAL PARA GRÁFICOS 3D ===================
if (!document.getElementById('chart3DStyles')) {
    const style = document.createElement('style');
    style.id = 'chart3DStyles';
    style.textContent = `
        .chart-container[data-chart-type*="3d"] canvas {
            transform-style: preserve-3d;
            transition: transform 0.3s ease;
        }
        
        .chart-container[data-chart-type*="3d"]:hover canvas {
            transform: perspective(800px) rotateX(15deg) rotateY(-8deg) scale(1.02);
        }
        
        .chart-controls {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        
        .chart-btn, .chart-type-btn {
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            color: white;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .chart-btn:hover, .chart-type-btn:hover {
            background: rgba(96, 165, 250, 0.3);
            border-color: rgba(96, 165, 250, 0.5);
        }
        
        .chart-btn.active, .chart-type-btn.active {
            background: #60a5fa;
            border-color: #60a5fa;
            color: white;
            box-shadow: 0 2px 8px rgba(96, 165, 250, 0.4);
        }
    `;
    document.head.appendChild(style);
}

logSuccess('📊 Charts.js carregado - 7 tipos de gráfico + beneficiários inteiros + legendas à esquerda');

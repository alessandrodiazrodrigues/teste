// =================== CONFIGURAÇÃO DOS GRÁFICOS CORRIGIDA ===================
window.chartInstances = {};

// =================== CONFIGURAÇÕES PADRÃO CORRIGIDAS ===================
window.getChartOptions = function(yLabel = 'Quantidade de Beneficiários', isScatter = false, chartType = 'bar') {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'left', // *** CORREÇÃO: LEGENDAS À ESQUERDA ***
                align: 'start',
                labels: {
                    color: '#ffffff',
                    padding: 8,
                    font: {
                        size: 11,
                        weight: 600
                    },
                    usePointStyle: true,
                    generateLabels: function(chart) {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset, i) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.borderColor || dataset.backgroundColor,
                            lineWidth: dataset.borderWidth || 0,
                            hidden: !chart.isDatasetVisible(i),
                            index: i,
                            // *** CORREÇÃO: UMA LEGENDA POR LINHA ***
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
                displayColors: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                // *** CORREÇÃO CRÍTICA: EIXO Y SEMPRE INTEIRO (1, 2, 3...) ***
                ticks: {
                    stepSize: 1, // Força incremento de 1 em 1
                    precision: 0, // Sem decimais
                    color: '#e2e8f0',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        return Number.isInteger(value) ? value : null;
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                title: {
                    display: true,
                    text: yLabel,
                    color: '#e2e8f0',
                    font: {
                        size: 12,
                        weight: 600
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
                        size: 11
                    },
                    // *** CORREÇÃO CRÍTICA: EIXO X SEMPRE HORIZONTAL ***
                    maxRotation: 0, // Nunca rotacionar
                    minRotation: 0  // Sempre horizontal
                }
            }
        }
    };

    // Configurações específicas por tipo de gráfico
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

    // Configurações para gráficos empilhados
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
                position: 'left',
                align: 'start',
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
                    font: { size: 10 }
                },
                ticks: {
                    stepSize: 1,
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

// =================== CRIAR DATASET SCATTER COM JITTER ===================
window.createScatterDataset = function(dados, tipo = 'concessoes') {
    const datasets = [];
    const cores = tipo === 'concessoes' ? window.CHART_COLORS.concessoes : window.CHART_COLORS.linhasCuidado;
    const items = tipo === 'concessoes' ? dados.concessoes : dados.linhas;
    
    items.forEach(item => {
        const pontos = [];
        item.dados.forEach((valor, index) => {
            if (valor > 0) {
                // *** IMPLEMENTAR JITTER PARA BOLINHAS SOBREPOSTAS ***
                for (let i = 0; i < valor; i++) {
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
                backgroundColor: cores[item.nome] || '#6b7280',
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBorderWidth: 1,
                pointBorderColor: '#ffffff'
            });
        }
    });
    
    return datasets;
};

// =================== RENDERIZAR GRÁFICOS POR TIPO ===================
window.renderChartByType = function(canvasId, data, chartType, yLabel = 'Quantidade de Beneficiários') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const chartKey = canvasId.replace(/[^a-zA-Z0-9]/g, '');
    destroyChart(chartKey);
    
    let chartConfig = {
        type: chartType,
        data: data,
        options: getChartOptions(yLabel, chartType === 'scatter', chartType)
    };
    
    // Configurações específicas por tipo
    switch (chartType) {
        case 'scatter':
            chartConfig.data.datasets = createScatterDataset(data, 'concessoes');
            break;
            
        case 'area':
            chartConfig.type = 'line';
            chartConfig.data.datasets.forEach(dataset => {
                dataset.fill = true;
                dataset.backgroundColor = (dataset.backgroundColor || '#6b7280') + '40';
                dataset.tension = 0.4;
            });
            break;
            
        case 'radar':
            chartConfig.type = 'radar';
            chartConfig.options = getRadarOptions();
            // Converter dados para formato radar
            chartConfig.data = convertToRadarData(data);
            break;
            
        case 'polar':
            chartConfig.type = 'polarArea';
            chartConfig.options = getRadarOptions();
            // Converter dados para formato polar
            chartConfig.data = convertToPolarData(data);
            break;
            
        case 'line':
            chartConfig.data.datasets.forEach(dataset => {
                dataset.fill = false;
                dataset.tension = 0.4;
                dataset.pointRadius = 4;
                dataset.pointHoverRadius = 6;
            });
            break;
            
        default: // 'bar'
            // Manter configuração padrão de barras
            break;
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, chartConfig);
    canvas.parentElement.setAttribute('data-chart-type', chartType);
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
            data: item.dados,
            backgroundColor: (getItemColor(item.nome) || '#6b7280') + '20',
            borderColor: getItemColor(item.nome) || '#6b7280',
            borderWidth: 2,
            pointRadius: 3
        }))
    };
}

// =================== CONVERTER DADOS PARA POLAR ===================
function convertToPolarData(originalData) {
    const items = originalData.concessoes || originalData.linhas || [];
    const totalPerItem = items.map(item => item.dados.reduce((a, b) => a + b, 0));
    
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

// =================== GRÁFICO DE ALTAS (CORRIGIDO COM DIVISÃO OURO/2R/3R) ===================
window.renderGraficoAltas = function(canvasId, hospitalData, chartType = 'bar') {
    if (!hospitalData || !hospitalData.leitos) return;
    
    // *** CORREÇÃO: CRIAR DIVISÕES OURO/2R/3R PARA HOJE E 24H ***
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h', 'SP'];
    const dados = categorias.map(cat => {
        return hospitalData.leitos.filter(l => 
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
    
    const chartData = {
        labels: categorias,
        datasets: [{
            label: 'Altas Previstas',
            data: dados,
            backgroundColor: cores,
            borderWidth: 0
        }]
    };
    
    renderChartByType(canvasId, chartData, chartType);
};

// =================== GRÁFICO DE CONCESSÕES (CORRIGIDO) ===================
window.renderGraficoConcessoes = function(canvasId, hospitalData, chartType = 'bar') {
    if (!hospitalData || !hospitalData.leitos) return;
    
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const concessoesMap = new Map();
    
    // Inicializar todas as concessões
    window.CONCESSOES_LIST.forEach(conc => {
        concessoesMap.set(conc, periodos.map(() => 0));
    });
    
    // Contar concessões por período
    hospitalData.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.previsaoAlta && leito.paciente.concessoes) {
            let periodoIndex = -1;
            
            // *** CORREÇÃO: MAPEAR CORRETAMENTE HOJE/24H COM DIVISÕES ***
            if (leito.paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (leito.paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
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
    
    const chartData = {
        periodos: periodos,
        concessoes: concessoes.map(item => ({
            ...item,
            backgroundColor: getItemColor(item.nome)
        })),
        datasets: concessoes.map(item => ({
            label: item.nome,
            data: item.dados,
            backgroundColor: getItemColor(item.nome)
        }))
    };
    
    renderChartByType(canvasId, chartData, chartType);
};

// =================== GRÁFICO DE LINHAS DE CUIDADO (CORRIGIDO) ===================
window.renderGraficoLinhas = function(canvasId, hospitalData, chartType = 'bar') {
    if (!hospitalData || !hospitalData.leitos) return;
    
    const periodos = ['Hoje', '24h', '48h', '72h', '96h'];
    const linhasMap = new Map();
    
    // Inicializar todas as linhas
    window.LINHAS_CUIDADO_LIST.forEach(linha => {
        linhasMap.set(linha, periodos.map(() => 0));
    });
    
    // Contar linhas por período
    hospitalData.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente && leito.paciente.previsaoAlta && leito.paciente.linhasCuidado) {
            let periodoIndex = -1;
            
            if (leito.paciente.previsaoAlta.includes('Hoje')) periodoIndex = 0;
            else if (leito.paciente.previsaoAlta.includes('24h')) periodoIndex = 1;
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
    
    const chartData = {
        periodos: periodos,
        linhas: linhas.map(item => ({
            ...item,
            backgroundColor: getItemColor(item.nome)
        })),
        datasets: linhas.map(item => ({
            label: item.nome,
            data: item.dados,
            backgroundColor: getItemColor(item.nome)
        }))
    };
    
    renderChartByType(canvasId, chartData, chartType);
};

// =================== GAUGE EXECUTIVO ===================
window.renderGaugeExecutivo = function(ocupacao) {
    const canvas = document.getElementById('gaugeExecutivo');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    destroyChart('gaugeExecutivo');
    
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
};

logSuccess('Charts.js carregado - Todas as correções implementadas: eixos inteiros, horizontal, legendas à esquerda, 7 tipos de gráfico');

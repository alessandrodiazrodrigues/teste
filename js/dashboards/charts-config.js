// =================== CONFIGURAÇÕES GLOBAIS DOS GRÁFICOS ===================

// Mapeamento de cores Pantone por categoria
window.CHART_COLORS = {
    // Cores das Concessões (13 cores Pantone)
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
    
    // Cores das Linhas de Cuidado (19 cores Pantone)
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
    },
    
    // Cores dos Hospitais
    hospitais: {
        "Neomater": "#ffffff",
        "Cruz Azul": "#60a5fa",
        "Santa Marcelina": "#8b5cf6",
        "Santa Clara": "#f59e0b"
    },
    
    // Cores da Timeline/Previsão de Alta
    timeline: {
        "Ouro": "#fbbf24",
        "2R": "#3b82f6",
        "3R": "#8b5cf6",
        "SP": "#6b7280",
        "48h": "#10b981",
        "72h": "#f59e0b",
        "96h": "#ef4444"
    }
};

// Instâncias dos gráficos para controle
window.chartInstances = {};

// Configuração padrão para todos os gráficos
window.defaultChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 8,
                usePointStyle: true,
                font: {
                    size: 11
                },
                generateLabels: function(chart) {
                    const datasets = chart.data.datasets;
                    return datasets.map((dataset, i) => ({
                        text: dataset.label,
                        fillStyle: dataset.backgroundColor,
                        strokeStyle: dataset.borderColor || dataset.backgroundColor,
                        lineWidth: dataset.borderWidth || 0,
                        hidden: !chart.isDatasetVisible(i),
                        index: i
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
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    label += context.parsed.y || context.parsed;
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
                color: '#e2e8f0',
                font: {
                    size: 11
                }
            },
            title: {
                display: true,
                text: 'Quantidade de Beneficiários',
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
                }
            }
        }
    }
};

// Função para destruir gráfico existente
window.destroyChart = function(chartId) {
    if (window.chartInstances[chartId]) {
        window.chartInstances[chartId].destroy();
        delete window.chartInstances[chartId];
    }
};

// Função para criar dataset do tipo Scatter (Bolinhas)
window.createScatterDataset = function(dados, tipo = 'concessoes') {
    const datasets = [];
    const cores = tipo === 'concessoes' ? CHART_COLORS.concessoes : CHART_COLORS.linhasCuidado;
    const items = tipo === 'concessoes' ? dados.concessoes : dados.linhas;
    
    items.forEach(item => {
        const pontos = [];
        item.dados.forEach((valor, index) => {
            if (valor > 0) {
                for (let i = 0; i < valor; i++) {
                    pontos.push({
                        x: index,
                        y: i + Math.random() * 0.8
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
                pointHoverRadius: 8
            });
        }
    });
    
    return datasets;
};

// Função para criar dataset do tipo Bubble (Bolinhas Agrupadas)
window.createBubbleDataset = function(dados, tipo = 'concessoes') {
    const datasets = [];
    const cores = tipo === 'concessoes' ? CHART_COLORS.concessoes : CHART_COLORS.linhasCuidado;
    const items = tipo === 'concessoes' ? dados.concessoes : dados.linhas;
    
    items.forEach(item => {
        item.dados.forEach((valor, index) => {
            if (valor > 0) {
                datasets.push({
                    label: item.nome,
                    data: [{
                        x: index,
                        y: valor / 2,
                        r: Math.max(8, valor * 4)
                    }],
                    backgroundColor: (cores[item.nome] || '#6b7280') + '80',
                    borderColor: cores[item.nome] || '#6b7280',
                    borderWidth: 2
                });
            }
        });
    });
    
    return datasets;
};

// Função auxiliar para calcular tempo de internação
window.calcularDiasInternacao = function(dataAdmissao) {
    if (!dataAdmissao) return 0;
    const admissao = new Date(dataAdmissao);
    const hoje = new Date();
    const diff = hoje - admissao;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Função para formatar data
window.formatarData = function(data) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
};

logSuccess('Charts Config carregado - 55 cores Pantone configuradas');

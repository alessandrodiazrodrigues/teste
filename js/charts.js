// =================== CONFIGURAÇÃO DOS GRÁFICOS ===================
window.chartInstances = {};

// =================== GAUGE EXECUTIVO ===================
window.renderGaugeExecutivo = function(ocupacao) {
    const canvas = document.getElementById('gaugeExecutivo');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
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

// =================== GRÁFICOS EXECUTIVOS ===================
window.renderGraficosExecutivos = function() {
    // Coletar dados para os gráficos
    const dadosAltas = calcularDadosAltas();
    const dadosConcessoes = calcularDadosConcessoes();
    const dadosLinhas = calcularDadosLinhas();
    
    // Gráfico de Altas
    const ctxAltas = document.getElementById('graficoAltasExecutivo');
    if (ctxAltas) {
        new Chart(ctxAltas, {
            type: 'bar',
            data: dadosAltas,
            options: getChartOptions('Quantidade de Beneficiários')
        });
    }
    
    // Gráfico de Concessões (empilhado por hospital)
    const ctxConcessoes = document.getElementById('graficoConcessoesExecutivo');
    if (ctxConcessoes) {
        new Chart(ctxConcessoes, {
            type: 'bar',
            data: dadosConcessoes,
            options: getStackedChartOptions('Quantidade de Beneficiários')
        });
    }
    
    // Gráfico de Linhas de Cuidado (empilhado por hospital)
    const ctxLinhas = document.getElementById('graficoLinhasExecutivo');
    if (ctxLinhas) {
        new Chart(ctxLinhas, {
            type: 'bar',
            data: dadosLinhas,
            options: getStackedChartOptions('Quantidade de Beneficiários')
        });
    }
};

// =================== GRÁFICOS HOSPITALARES ===================
window.renderHospitalCharts = function(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital) return;
    
    // Gauge do hospital
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const ocupacao = Math.round((ocupados / hospital.leitos.length) * 100);
    
    const gaugeCanvas = document.getElementById(`gauge${hospitalId}`);
    if (gaugeCanvas) {
        const ctx = gaugeCanvas.getContext('2d');
        new Chart(ctx, {
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
    }
    
    // Gráficos específicos do hospital
    renderHospitalAltasChart(hospitalId);
    renderHospitalConcessoesChart(hospitalId, 'bar');
    renderHospitalLinhasChart(hospitalId, 'bar');
};

// =================== MUDANÇA DE TIPO DE GRÁFICO ===================
window.changeChartType = function(hospitalId, chartType, newType) {
    logInfo(`Mudando tipo de gráfico: ${hospitalId} - ${chartType} - ${newType}`);
    
    // Atualizar botões
    const buttons = document.querySelectorAll(`#grafico${chartType === 'concessoes' ? 'Concessoes' : 'Linhas'}${hospitalId}`).
        closest('.grafico-box-small').querySelectorAll('.chart-selector button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Re-renderizar gráfico
    if (chartType === 'concessoes') {
        renderHospitalConcessoesChart(hospitalId, newType);
    } else {
        renderHospitalLinhasChart(hospitalId, newType);
    }
};

// =================== FUNÇÕES AUXILIARES DE GRÁFICOS ===================
function calcularDadosAltas() {
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h'];
    const datasets = [];
    
    Object.entries(window.hospitalData).forEach(([hospitalId, hospital]) => {
        const dados = categorias.map(cat => {
            return hospital.leitos.filter(l => 
                l.status === 'ocupado' && l.paciente.previsaoAlta === cat
            ).length;
        });
        
        datasets.push({
            label: hospital.nome,
            data: dados,
            backgroundColor: getHospitalColor(hospitalId)
        });
    });
    
    return {
        labels: categorias,
        datasets: datasets
    };
}

function calcularDadosConcessoes() {
    const categorias = ['Hoje', '24h', '48h', '72h', '96h'];
    const concessoesMap = {};
    
    // Coletar todas as concessões únicas
    const todasConcessoes = new Set();
    Object.values(window.hospitalData).forEach(hospital => {
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente.concessoes) {
                leito.paciente.concessoes.forEach(c => todasConcessoes.add(c));
            }
        });
    });
    
    // Criar datasets por concessão
    const datasets = Array.from(todasConcessoes).map(concessao => {
        const dados = categorias.map(cat => {
            let total = 0;
            Object.values(window.hospitalData).forEach(hospital => {
                hospital.leitos.forEach(leito => {
                    if (leito.status === 'ocupado' && 
                        leito.paciente.previsaoAlta && 
                        getCategoriaBase(leito.paciente.previsaoAlta) === cat &&
                        leito.paciente.concessoes.includes(concessao)) {
                        total++;
                    }
                });
            });
            return total;
        });
        
        return {
            label: concessao,
            data: dados,
            backgroundColor: getConcessaoColor(concessao)
        };
    });
    
    return {
        labels: categorias,
        datasets: datasets
    };
}

function calcularDadosLinhas() {
    const categorias = ['Hoje', '24h', '48h', '72h', '96h'];
    
    // Coletar todas as linhas únicas
    const todasLinhas = new Set();
    Object.values(window.hospitalData).forEach(hospital => {
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente.linhasCuidado) {
                leito.paciente.linhasCuidado.forEach(l => todasLinhas.add(l));
            }
        });
    });
    
    // Criar datasets por linha
    const datasets = Array.from(todasLinhas).map(linha => {
        const dados = categorias.map(cat => {
            let total = 0;
            Object.values(window.hospitalData).forEach(hospital => {
                hospital.leitos.forEach(leito => {
                    if (leito.status === 'ocupado' && 
                        leito.paciente.previsaoAlta && 
                        getCategoriaBase(leito.paciente.previsaoAlta) === cat &&
                        leito.paciente.linhasCuidado.includes(linha)) {
                        total++;
                    }
                });
            });
            return total;
        });
        
        return {
            label: linha,
            data: dados,
            backgroundColor: getLinhaColor(linha)
        };
    });
    
    return {
        labels: categorias,
        datasets: datasets
    };
}

function renderHospitalAltasChart(hospitalId) {
    const canvas = document.getElementById(`graficoAltas${hospitalId}`);
    if (!canvas) return;
    
    const hospital = window.hospitalData[hospitalId];
    const categorias = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R', '48h', '72h', '96h', 'SP'];
    
    const dados = categorias.map(cat => {
        return hospital.leitos.filter(l => 
            l.status === 'ocupado' && l.paciente.previsaoAlta === cat
        ).length;
    });
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Altas Previstas',
                data: dados,
                backgroundColor: categorias.map(cat => getTimelineColor(cat))
            }]
        },
        options: getChartOptions('Quantidade de Beneficiários')
    });
}

function renderHospitalConcessoesChart(hospitalId, chartType) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas) return;
    
    // Destruir gráfico anterior se existir
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    const hospital = window.hospitalData[hospitalId];
    const categorias = ['Hoje', '24h', '48h', '72h', '96h'];
    
    // Coletar concessões do hospital
    const concessoesMap = {};
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente.previsaoAlta !== 'SP') {
            const cat = getCategoriaBase(leito.paciente.previsaoAlta);
            if (categorias.includes(cat)) {
                if (!concessoesMap[cat]) concessoesMap[cat] = {};
                leito.paciente.concessoes.forEach(c => {
                    if (!concessoesMap[cat][c]) concessoesMap[cat][c] = 0;
                    concessoesMap[cat][c]++;
                });
            }
        }
    });
    
    // Criar datasets
    const todasConcessoes = new Set();
    Object.values(concessoesMap).forEach(catData => {
        Object.keys(catData).forEach(c => todasConcessoes.add(c));
    });
    
    const datasets = Array.from(todasConcessoes).map(concessao => {
        const dados = categorias.map(cat => {
            return concessoesMap[cat] && concessoesMap[cat][concessao] ? concessoesMap[cat][concessao] : 0;
        });
        
        return {
            label: concessao,
            data: dados,
            backgroundColor: getConcessaoColor(concessao),
            borderColor: getConcessaoColor(concessao),
            fill: chartType === 'line' ? false : true,
            tension: chartType === 'line' ? 0.4 : 0,
            pointRadius: chartType.includes('scatter') ? 8 : 3
        };
    });
    
    // Criar gráfico baseado no tipo
    let type = chartType;
    if (chartType === 'scatter' || chartType === 'scatter-grouped') {
        type = 'scatter';
        // Converter dados para formato scatter
        datasets.forEach(dataset => {
            dataset.data = dataset.data.map((value, index) => ({
                x: index,
                y: value
            }));
        });
    } else if (chartType === '3d') {
        type = 'bar'; // Chart.js não tem 3D nativo, usar bar
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, {
        type: type,
        data: {
            labels: type === 'scatter' ? undefined : categorias,
            datasets: datasets
        },
        options: chartType === 'bar' ? getStackedChartOptions('Quantidade de Beneficiários') : 
                 getChartOptions('Quantidade de Beneficiários', type === 'scatter')
    });
}

function renderHospitalLinhasChart(hospitalId, chartType) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas) return;
    
    // Destruir gráfico anterior se existir
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    const hospital = window.hospitalData[hospitalId];
    const categorias = ['Hoje', '24h', '48h', '72h', '96h'];
    
    // Coletar linhas do hospital
    const linhasMap = {};
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.paciente.previsaoAlta !== 'SP') {
            const cat = getCategoriaBase(leito.paciente.previsaoAlta);
            if (categorias.includes(cat)) {
                if (!linhasMap[cat]) linhasMap[cat] = {};
                leito.paciente.linhasCuidado.forEach(l => {
                    if (!linhasMap[cat][l]) linhasMap[cat][l] = 0;
                    linhasMap[cat][l]++;
                });
            }
        }
    });
    
    // Criar datasets
    const todasLinhas = new Set();
    Object.values(linhasMap).forEach(catData => {
        Object.keys(catData).forEach(l => todasLinhas.add(l));
    });
    
    const datasets = Array.from(todasLinhas).map(linha => {
        const dados = categorias.map(cat => {
            return linhasMap[cat] && linhasMap[cat][linha] ? linhasMap[cat][linha] : 0;
        });
        
        return {
            label: linha,
            data: dados,
            backgroundColor: getLinhaColor(linha),
            borderColor: getLinhaColor(linha),
            fill: chartType === 'line' ? false : true,
            tension: chartType === 'line' ? 0.4 : 0,
            pointRadius: chartType.includes('scatter') ? 8 : 3
        };
    });
    
    // Criar gráfico baseado no tipo
    let type = chartType;
    if (chartType === 'scatter' || chartType === 'scatter-grouped') {
        type = 'scatter';
        // Converter dados para formato scatter
        datasets.forEach(dataset => {
            dataset.data = dataset.data.map((value, index) => ({
                x: index,
                y: value
            }));
        });
    } else if (chartType === '3d') {
        type = 'bar'; // Chart.js não tem 3D nativo, usar bar
    }
    
    window.chartInstances[chartKey] = new Chart(canvas, {
        type: type,
        data: {
            labels: type === 'scatter' ? undefined : categorias,
            datasets: datasets
        },
        options: chartType === 'bar' ? getStackedChartOptions('Quantidade de Beneficiários') : 
                 getChartOptions('Quantidade de Beneficiários', type === 'scatter')
    });
}

// =================== FUNÇÕES AUXILIARES ===================
function getCategoriaBase(previsao) {
    if (previsao.startsWith('Hoje')) return 'Hoje';
    if (previsao.startsWith('24h')) return '24h';
    if (previsao === '48h') return '48h';
    if (previsao === '72h') return '72h';
    if (previsao === '96h') return '96h';
    return 'SP';
}

function getHospitalColor(hospitalId) {
    const colors = {
        'H1': '#ffffff',
        'H2': '#60a5fa',
        'H3': '#8b5cf6',
        'H4': '#f59e0b'
    };
    return colors[hospitalId] || '#6b7280';
}

function getTimelineColor(categoria) {
    const colors = {
        'Hoje Ouro': '#fbbf24',
        'Hoje 2R': '#3b82f6',
        'Hoje 3R': '#8b5cf6',
        '24h Ouro': '#fbbf24',
        '24h 2R': '#3b82f6',
        '24h 3R': '#8b5cf6',
        '48h': '#10b981',
        '72h': '#f59e0b',
        '96h': '#ef4444',
        'SP': '#6b7280'
    };
    return colors[categoria] || '#6b7280';
}

function getConcessaoColor(concessao) {
    const colors = {
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
    };
    return colors[concessao] || '#6b7280';
}

function getLinhaColor(linha) {
    const colors = {
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
    };
    return colors[linha] || '#6b7280';
}

function getChartOptions(yLabel, isScatter = false) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: yLabel,
                    color: '#ffffff'
                },
                ticks: { color: '#ffffff' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            x: isScatter ? {
                type: 'category',
                labels: ['Hoje', '24h', '48h', '72h', '96h'],
                ticks: { color: '#ffffff' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            } : {
                ticks: { 
                    color: '#ffffff',
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: '#ffffff',
                    padding: 10,
                    generateLabels: function(chart) {
                        const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                        // Uma legenda por linha
                        return labels;
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff'
            }
        }
    };
}

function getStackedChartOptions(yLabel) {
    const options = getChartOptions(yLabel);
    options.scales.x.stacked = true;
    options.scales.y.stacked = true;
    return options;
}

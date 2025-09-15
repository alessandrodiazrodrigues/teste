'Hoje 3R': 'hoje-3r',
        '24h': 'h24',
        '48h': 'h48',
        '72h': 'h72',
        '>72h': 'mais72'
    };
    
    const previsaoClass = previsaoClassMap[paciente.previsaoAlta] || '';
    
    card.innerHTML = `
        <div class="card-header ${leito.status}">
            <div class="card-title">Leito ${leito.numero}</div>
            <div class="card-status">${leito.status.toUpperCase()}</div>
        </div>
        <div class="card-body">
            <div class="card-grid">
                <div class="card-field">
                    <div class="card-label">HOSPITAL</div>
                    <div class="card-value">${leito.hospital}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">LEITO</div>
                    <div class="card-value">${leito.numero}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">TIPO</div>
                    <div class="card-value">${leito.tipo}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">PACIENTE</div>
                    <div class="card-value">${isOcupado ? paciente.nome : '-'}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">IDADE</div>
                    <div class="card-value">${isOcupado ? paciente.idade + ' anos' : '-'}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">REGISTRO</div>
                    <div class="card-value">${isOcupado ? paciente.registro : '-'}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">ENTRADA</div>
                    <div class="card-value">${isOcupado ? formatDate(paciente.dataEntrada) : '-'}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">PPS</div>
                    <div class="card-value">${isOcupado ? paciente.pps + '%' : '-'}</div>
                </div>
                <div class="card-field">
                    <div class="card-label">PREV. ALTA</div>
                    <div class="card-value">
                        ${isOcupado && paciente.previsaoAlta ? 
                            `<span class="prev-alta-badge ${previsaoClass}">${paciente.previsaoAlta}</span>` : 
                            '-'}
                    </div>
                </div>
            </div>
            
            ${isOcupado && paciente.concessoes && paciente.concessoes.length > 0 ? `
                <div class="card-section">
                    <div class="section-title">CONCESSÕES PREVISTAS NA ALTA</div>
                    <div class="tags-container">
                        ${paciente.concessoes.map(c => `<span class="tag concessao">${c}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${isOcupado && paciente.linhaCuidado && paciente.linhaCuidado.length > 0 ? `
                <div class="card-section">
                    <div class="section-title">LINHA DE CUIDADOS PROPOSTA NA ALTA</div>
                    <div class="tags-container">
                        ${paciente.linhaCuidado.map(l => `<span class="tag linha-cuidado">${l}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="card-actions">
            ${isOcupado ? `
                <button class="btn-card btn-atualizar" onclick="openAtualizacao(${leito.id})">Atualizar</button>
                <button class="btn-card btn-alta" onclick="openAlta(${leito.id})">Dar Alta</button>
            ` : `
                <button class="btn-card btn-admitir" onclick="openAdmissao(${leito.id})">Admitir Paciente</button>
            `}
        </div>
    `;
    
    return card;
}

// ================================================
// MODAIS
// ================================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Limpar formulários se existirem
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
}

function openAdmissao(leitoId) {
    appState.currentLeitoId = leitoId;
    openModal('modalAdmissao');
}

function openAtualizacao(leitoId) {
    appState.currentLeitoId = leitoId;
    const leito = appState.leitos.find(l => l.id === leitoId);
    
    if (leito && leito.paciente) {
        // Preencher formulário com dados atuais
        const form = document.getElementById('formAtualizacao');
        if (form) {
            // Copiar estrutura do formulário de admissão
            form.innerHTML = document.getElementById('formAdmissao').innerHTML;
            
            // Preencher campos
            setTimeout(() => {
                form.nome.value = leito.paciente.nome || '';
                form.idade.value = leito.paciente.idade || '';
                form.registro.value = leito.paciente.registro || '';
                form.dataEntrada.value = leito.paciente.dataEntrada || '';
                form.medico.value = leito.paciente.medico || '';
                form.pps.value = leito.paciente.pps || '';
                form.diagnostico.value = leito.paciente.diagnostico || '';
                form.convenio.value = leito.paciente.convenio || '';
                form.previsaoAlta.value = leito.paciente.previsaoAlta || '';
                form.observacoes.value = leito.paciente.observacoes || '';
                
                // Marcar checkboxes
                if (leito.paciente.concessoes) {
                    leito.paciente.concessoes.forEach(c => {
                        const checkbox = form.querySelector(`input[name="concessoes"][value="${c}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
                
                if (leito.paciente.linhaCuidado) {
                    leito.paciente.linhaCuidado.forEach(l => {
                        const checkbox = form.querySelector(`input[name="linhaCuidado"][value="${l}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            }, 100);
        }
    }
    
    openModal('modalAtualizacao');
}

function openAlta(leitoId) {
    appState.currentLeitoId = leitoId;
    const leito = appState.leitos.find(l => l.id === leitoId);
    
    if (leito && leito.paciente) {
        document.getElementById('altaPacienteNome').textContent = leito.paciente.nome;
        document.getElementById('dataAlta').value = new Date().toISOString().slice(0, 16);
    }
    
    openModal('modalAlta');
}

function confirmarAlta() {
    const leito = appState.leitos.find(l => l.id === appState.currentLeitoId);
    if (leito) {
        leito.status = 'vago';
        leito.paciente = null;
        renderCards();
        closeModal('modalAlta');
        showNotification('Alta registrada com sucesso!', 'success');
    }
}

// ================================================
// FORMULÁRIOS
// ================================================
document.getElementById('formAdmissao')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const leito = appState.leitos.find(l => l.id === appState.currentLeitoId);
    
    if (leito) {
        const concessoes = Array.from(formData.getAll('concessoes'));
        const linhaCuidado = Array.from(formData.getAll('linhaCuidado'));
        
        leito.status = 'ocupado';
        leito.paciente = {
            nome: formData.get('nome'),
            idade: formData.get('idade'),
            registro: formData.get('registro'),
            dataEntrada: formData.get('dataEntrada'),
            medico: formData.get('medico'),
            pps: formData.get('pps'),
            diagnostico: formData.get('diagnostico'),
            convenio: formData.get('convenio'),
            previsaoAlta: formData.get('previsaoAlta'),
            concessoes: concessoes,
            linhaCuidado: linhaCuidado,
            observacoes: formData.get('observacoes')
        };
        
        renderCards();
        closeModal('modalAdmissao');
        showNotification('Paciente admitido com sucesso!', 'success');
    }
});

document.getElementById('formAtualizacao')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const leito = appState.leitos.find(l => l.id === appState.currentLeitoId);
    
    if (leito && leito.paciente) {
        const concessoes = Array.from(formData.getAll('concessoes'));
        const linhaCuidado = Array.from(formData.getAll('linhaCuidado'));
        
        leito.paciente = {
            ...leito.paciente,
            nome: formData.get('nome'),
            idade: formData.get('idade'),
            registro: formData.get('registro'),
            dataEntrada: formData.get('dataEntrada'),
            medico: formData.get('medico'),
            pps: formData.get('pps'),
            diagnostico: formData.get('diagnostico'),
            convenio: formData.get('convenio'),
            previsaoAlta: formData.get('previsaoAlta'),
            concessoes: concessoes,
            linhaCuidado: linhaCuidado,
            observacoes: formData.get('observacoes')
        };
        
        renderCards();
        closeModal('modalAtualizacao');
        showNotification('Dados atualizados com sucesso!', 'success');
    }
});

// ================================================
// DASHBOARD EXECUTIVO
// ================================================
function loadDashboardExecutivo() {
    // Calcular KPIs
    const ocupados = appState.leitos.filter(l => l.status === 'ocupado').length;
    const total = appState.leitos.length;
    const taxaOcupacao = Math.round((ocupados / total) * 100);
    
    // Calcular média PPS
    const pacientesComPPS = appState.leitos
        .filter(l => l.paciente && l.paciente.pps)
        .map(l => parseInt(l.paciente.pps));
    const mediaPPS = pacientesComPPS.length > 0 ? 
        Math.round(pacientesComPPS.reduce((a, b) => a + b, 0) / pacientesComPPS.length) : 0;
    
    // Contar altas hoje
    const altasHoje = appState.leitos
        .filter(l => l.paciente && l.paciente.previsaoAlta && 
                l.paciente.previsaoAlta.includes('Hoje')).length;
    
    // Atualizar KPIs
    document.getElementById('kpiOcupacao').textContent = taxaOcupacao + '%';
    document.getElementById('kpiPPS').textContent = mediaPPS + '%';
    document.getElementById('kpiAltasHoje').textContent = altasHoje;
    document.getElementById('kpiTempoMedio').textContent = '5.2d';
    
    // Criar gráficos
    createGaugeChart(taxaOcupacao);
    createOcupacaoHospitalChart();
    createConcessoesChart();
    createLinhasCuidadoChart();
}

function createGaugeChart(value) {
    const ctx = document.getElementById('gaugeChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (appState.charts.gauge) {
        appState.charts.gauge.destroy();
    }
    
    appState.charts.gauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [
                    value > 80 ? '#ef4444' : value > 60 ? '#fbbf24' : '#22c55e',
                    '#e5e7eb'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180,
            rotation: 270,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

function createOcupacaoHospitalChart() {
    const ctx = document.getElementById('ocupacaoHospitalChart').getContext('2d');
    
    if (appState.charts.ocupacaoHospital) {
        appState.charts.ocupacaoHospital.destroy();
    }
    
    const dados = CONFIG.HOSPITALS.map(hospital => {
        const leitosHospital = appState.leitos.filter(l => l.hospitalId === hospital.id);
        const ocupados = leitosHospital.filter(l => l.status === 'ocupado').length;
        return {
            nome: hospital.nome,
            ocupacao: Math.round((ocupados / hospital.totalLeitos) * 100)
        };
    });
    
    appState.charts.ocupacaoHospital = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.map(d => d.nome),
            datasets: [{
                label: 'Taxa de Ocupação (%)',
                data: dados.map(d => d.ocupacao),
                backgroundColor: '#3b82f6',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function createConcessoesChart() {
    const ctx = document.getElementById('concessoesChart').getContext('2d');
    
    if (appState.charts.concessoes) {
        appState.charts.concessoes.destroy();
    }
    
    const tiposConcessoes = [
        'Órtese/Prótese',
        'Equipamento',
        'Dieta',
        'Medicamento Alto Custo',
        'Transporte',
        'Outros'
    ];
    
    const datasets = tiposConcessoes.map((tipo, index) => {
        const data = CONFIG.HOSPITALS.map(hospital => {
            const leitosHospital = appState.leitos.filter(l => l.hospitalId === hospital.id);
            const count = leitosHospital.filter(l => 
                l.paciente && l.paciente.concessoes && l.paciente.concessoes.includes(tipo)
            ).length;
            return count;
        });
        
        return {
            label: tipo,
            data: data,
            backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.8)`
        };
    });
    
    appState.charts.concessoes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: CONFIG.HOSPITALS.map(h => h.nome),
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}

function createLinhasCuidadoChart() {
    const ctx = document.getElementById('linhasCuidadoChart').getContext('2d');
    
    if (appState.charts.linhasCuidado) {
        appState.charts.linhasCuidado.destroy();
    }
    
    const tiposLinhas = [
        'Unidade Básica',
        'Ambulatório de Egressos',
        'CAPS',
        'Residência Terapêutica',
        'Hospital Dia',
        'Outros'
    ];
    
    const datasets = tiposLinhas.map((tipo, index) => {
        const data = CONFIG.HOSPITALS.map(hospital => {
            const leitosHospital = appState.leitos.filter(l => l.hospitalId === hospital.id);
            const count = leitosHospital.filter(l => 
                l.paciente && l.paciente.linhaCuidado && l.paciente.linhaCuidado.includes(tipo)
            ).length;
            return count;
        });
        
        return {
            label: tipo,
            data: data,
            backgroundColor: `hsla(${210 + index * 30}, 70%, 50%, 0.8)`
        };
    });
    
    appState.charts.linhasCuidado = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: CONFIG.HOSPITALS.map(h => h.nome),
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}

// ================================================
// DASHBOARD HOSPITALAR
// ================================================
function loadDashboardHospitalar() {
    const container = document.getElementById('hospitalDashboards');
    container.innerHTML = '';
    
    CONFIG.HOSPITALS.forEach(hospital => {
        const dashboard = createHospitalDashboard(hospital);
        container.appendChild(dashboard);
    });
}

function createHospitalDashboard(hospital) {
    const div = document.createElement('div');
    div.className = 'hospital-dashboard';
    
    const leitosHospital = appState.leitos.filter(l => l.hospitalId === hospital.id);
    const ocupados = leitosHospital.filter(l => l.status === 'ocupado').length;
    const taxaOcupacao = Math.round((ocupados / hospital.totalLeitos) * 100);
    
    div.innerHTML = `
        <div class="hospital-header">
            <h3 class="hospital-title">${hospital.nome}</h3>
            <div class="hospital-stats">
                <div class="hospital-stat">
                    <span class="hospital-stat-label">Ocupação</span>
                    <span class="hospital-stat-value">${taxaOcupacao}%</span>
                </div>
                <div class="hospital-stat">
                    <span class="hospital-stat-label">Ocupados</span>
                    <span class="hospital-stat-value">${ocupados}/${hospital.totalLeitos}</span>
                </div>
            </div>
        </div>
        
        <div class="chart-types">
            <button class="chart-type-btn active" onclick="alterarTipoGrafico(${hospital.id}, 'scatter')">Bolinhas</button>
            <button class="chart-type-btn" onclick="alterarTipoGrafico(${hospital.id}, 'bubble')">Bolinhas 2</button>
            <button class="chart-type-btn" onclick="alterarTipoGrafico(${hospital.id}, 'bar')">Barras</button>
            <button class="chart-type-btn" onclick="alterarTipoGrafico(${hospital.id}, 'line')">Linha</button>
            <button class="chart-type-btn" onclick="alterarTipoGrafico(${hospital.id}, 'radar')">Área</button>
        </div>
        
        <div class="hospital-charts">
            <div class="chart-container">
                <h4>Distribuição PPS</h4>
                <canvas id="ppsChart${hospital.id}"></canvas>
            </div>
            <div class="chart-container">
                <h4>Tempo de Permanência</h4>
                <canvas id="tempoChart${hospital.id}"></canvas>
            </div>
        </div>
    `;
    
    // Criar gráficos após adicionar ao DOM
    setTimeout(() => {
        createPPSChart(hospital.id, 'scatter');
        createTempoChart(hospital.id);
    }, 100);
    
    return div;
}

function alterarTipoGrafico(hospitalId, tipo) {
    // Atualizar botões
    const container = document.querySelector(`#hospitalDashboards`);
    const buttons = container.querySelectorAll(`.chart-type-btn`);
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(tipo) || 
            (tipo === 'scatter' && btn.textContent === 'Bolinhas') ||
            (tipo === 'bubble' && btn.textContent === 'Bolinhas 2') ||
            (tipo === 'bar' && btn.textContent === 'Barras') ||
            (tipo === 'line' && btn.textContent === 'Linha') ||
            (tipo === 'radar' && btn.textContent === 'Área')) {
            btn.classList.add('active');
        }
    });
    
    // Recriar gráfico
    createPPSChart(hospitalId, tipo);
}

function createPPSChart(hospitalId, tipo = 'scatter') {
    const ctx = document.getElementById(`ppsChart${hospitalId}`);
    if (!ctx) return;
    
    const chartKey = `pps${hospitalId}`;
    
    // Destruir gráfico anterior
    if (appState.charts[chartKey]) {
        appState.charts[chartKey].destroy();
    }
    
    const leitosHospital = appState.leitos
        .filter(l => l.hospitalId === hospitalId && l.paciente && l.paciente.pps);
    
    let config;
    
    if (tipo === 'scatter' || tipo === 'bubble') {
        // Dados para scatter/bubble
        const data = leitosHospital.map((l, index) => ({
            x: index + 1,
            y: parseInt(l.paciente.pps),
            r: tipo === 'bubble' ? Math.random() * 15 + 5 : 5
        }));
        
        config = {
            type: tipo,
            data: {
                datasets: [{
                    label: 'PPS por Paciente',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'PPS (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Pacientes'
                        }
                    }
                }
            }
        };
    } else if (tipo === 'bar') {
        // Dados agrupados para barras (10-100%)
        const grupos = {};
        for (let i = 10; i <= 100; i += 10) {
            grupos[i] = 0;
        }
        
        leitosHospital.forEach(l => {
            const pps = parseInt(l.paciente.pps);
            const grupo = Math.ceil(pps / 10) * 10;
            grupos[grupo]++;
        });
        
        config = {
            type: 'bar',
            data: {
                labels: Object.keys(grupos).map(k => k + '%'),
                datasets: [{
                    label: 'Quantidade de Pacientes',
                    data: Object.values(grupos),
                    backgroundColor: '#3b82f6',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        };
    } else if (tipo === 'line') {
        // Linha temporal
        const data = leitosHospital.map((l, index) => ({
            x: index + 1,
            y: parseInt(l.paciente.pps)
        }));
        
        config = {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Evolução PPS',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        };
    } else if (tipo === 'radar') {
        // Radar/Área
        const labels = ['10-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
        const data = [0, 0, 0, 0, 0];
        
        leitosHospital.forEach(l => {
            const pps = parseInt(l.paciente.pps);
            if (pps <= 20) data[0]++;
            else if (pps <= 40) data[1]++;
            else if (pps <= 60) data[2]++;
            else if (pps <= 80) data[3]++;
            else data[4]++;
        });
        
        config = {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distribuição PPS',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        };
    }
    
    appState.charts[chartKey] = new Chart(ctx.getContext('2d'), config);
}

function createTempoChart(hospitalId) {
    const ctx = document.getElementById(`tempoChart${hospitalId}`);
    if (!ctx) return;
    
    const chartKey = `tempo${hospitalId}`;
    
    if (appState.charts[chartKey]) {
        appState.charts[chartKey].destroy();
    }
    
    appState.charts[chartKey] = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['< 24h', '1-3 dias', '4-7 dias', '> 7 dias'],
            datasets: [{
                label: 'Pacientes',
                data: [2, 5, 3, 1],
                backgroundColor: ['#22c55e', '#fbbf24', '#fb923c', '#ef4444'],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ================================================
// QR CODE
// ================================================
function initQRScanner() {
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };
    
    if (!appState.qrScanner) {
        appState.qrScanner = new Html5QrcodeScanner("qr-reader", config);
        appState.qrScanner.render(onScanSuccess, onScanError);
    }
}

function onScanSuccess(decodedText) {
    const result = document.getElementById('qr-result');
    result.classList.add('active');
    
    try {
        const data = JSON.parse(decodedText);
        if (data.leitoId) {
            const leito = appState.leitos.find(l => l.id === data.leitoId);
            if (leito) {
                result.innerHTML = `
                    <h3>Leito Identificado</h3>
                    <p><strong>Hospital:</strong> ${leito.hospital}</p>
                    <p><strong>Número:</strong> ${leito.numero}</p>
                    <p><strong>Status:</strong> ${leito.status}</p>
                    ${leito.paciente ? `
                        <p><strong>Paciente:</strong> ${leito.paciente.nome}</p>
                    ` : ''}
                    <button onclick="switchView('cards')" class="btn-primary">Ver Detalhes</button>
                `;
            }
        }
    } catch (e) {
        result.innerHTML = `<p>QR Code lido: ${decodedText}</p>`;
    }
    
    // Retornar ao scanner após 5 segundos
    setTimeout(() => {
        result.classList.remove('active');
        appState.qrScanner.resume();
    }, 5000);
}

function onScanError(error) {
    // Silenciar erros comuns de scan
    console.log('QR Scan:', error);
}

function gerarQRCodes() {
    const modal = document.getElementById('modalQRCodes');
    const grid = document.getElementById('qrCodesGrid');
    
    grid.innerHTML = '';
    
    appState.leitos.forEach(leito => {
        const div = document.createElement('div');
        div.className = 'qr-code-item';
        div.innerHTML = `
            <h4>${leito.hospital} - Leito ${leito.numero}</h4>
            <div id="qr-${leito.id}"></div>
        `;
        grid.appendChild(div);
        
        // Gerar QR Code
        setTimeout(() => {
            new QRCode(document.getElementById(`qr-${leito.id}`), {
                text: JSON.stringify({
                    leitoId: leito.id,
                    hospital: leito.hospital,
                    numero: leito.numero
                }),
                width: 150,
                height: 150
            });
        }, 100);
    });
    
    openModal('modalQRCodes');
}

// ================================================
// CONFIGURAÇÕES
// ================================================
function aplicarCores() {
    const corHeader = document.getElementById('corHeader').value;
    const corSidebar = document.getElementById('corSidebar').value;
    const corDestaque = document.getElementById('corDestaque').value;
    
    document.documentElement.style.setProperty('--primary-color', corHeader);
    document.documentElement.style.setProperty('--secondary-color', corSidebar);
    document.documentElement.style.setProperty('--success-color', corDestaque);
    
    // Salvar preferências
    localStorage.setItem('archipelago_colors', JSON.stringify({
        header: corHeader,
        sidebar: corSidebar,
        destaque: corDestaque
    }));
    
    showNotification('Cores aplicadas com sucesso!', 'success');
}

function restaurarCores() {
    document.documentElement.style.setProperty('--primary-color', '#3b82f6');
    document.documentElement.style.setProperty('--secondary-color', '#60a5fa');
    document.documentElement.style.setProperty('--success-color', '#10b981');
    
    document.getElementById('corHeader').value = '#3b82f6';
    document.getElementById('corSidebar').value = '#60a5fa';
    document.getElementById('corDestaque').value = '#10b981';
    
    localStorage.removeItem('archipelago_colors');
    
    showNotification('Cores restauradas para o padrão!', 'success');
}

// ================================================
// ADM
// ================================================
function openADM() {
    openModal('modalADM');
}

function loginADM() {
    const email = document.getElementById('admEmail').value;
    const password = document.getElementById('admPassword').value;
    
    if (email === CONFIG.ADM_EMAIL && password === CONFIG.ADM_PASSWORD) {
        document.getElementById('admLogin').style.display = 'none';
        document.getElementById('admPanel').style.display = 'block';
        loadADMPanel();
    } else {
        showNotification('Credenciais inválidas!', 'error');
    }
}

function loadADMPanel() {
    const content = document.getElementById('admContent');
    
    content.innerHTML = `
        <div class="adm-sections">
            <div class="adm-section">
                <h4>Gestão de Hospitais</h4>
                <table class="adm-table">
                    <thead>
                        <tr>
                            <th>Hospital</th>
                            <th>Total Leitos</th>
                            <th>Ocupados</th>
                            <th>Taxa</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${CONFIG.HOSPITALS.map(h => {
                            const ocupados = appState.leitos.filter(l => 
                                l.hospitalId === h.id && l.status === 'ocupado'
                            ).length;
                            const taxa = Math.round((ocupados / h.totalLeitos) * 100);
                            return `
                                <tr>
                                    <td>${h.nome}</td>
                                    <td>${h.totalLeitos}</td>
                                    <td>${ocupados}</td>
                                    <td>${taxa}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="adm-section">
                <h4>Configurações do Sistema</h4>
                <button onclick="exportarDados()" class="btn-primary">Exportar Dados</button>
                <button onclick="limparDados()" class="btn-secondary">Limpar Dados</button>
            </div>
        </div>
    `;
}

// ================================================
// UTILIDADES
// ================================================
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function updateDateTime() {
    const now = new Date();
    const dateTime = now.toLocaleDateString('pt-BR') + ' ' + 
                    now.toLocaleTimeString('pt-BR');
    document.getElementById('currentDateTime').textContent = dateTime;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : 
                      type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function exportarDados() {
    const dados = {
        exportDate: new Date().toISOString(),
        hospitals: CONFIG.HOSPITALS,
        leitos: appState.leitos,
        statistics: {
            totalLeitos: appState.leitos.length,
            ocupados: appState.leitos.filter(l => l.status === 'ocupado').length,
            vagos: appState.leitos.filter(l => l.status === 'vago').length
        }
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], 
                         { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archipelago_export_${new Date().getTime()}.json`;
    a.click();
    
    showNotification('Dados exportados com sucesso!', 'success');
}

function limparDados() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        appState.leitos.forEach(leito => {
            leito.status = 'vago';
            leito.paciente = null;
        });
        renderCards();
        showNotification('Dados limpos com sucesso!', 'success');
    }
}

// ================================================
// EVENT LISTENERS
// ================================================
function initializeEventListeners() {
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Carregar cores salvas
    const savedColors = localStorage.getItem('archipelago_colors');
    if (savedColors) {
        const colors = JSON.parse(savedColors);
        document.documentElement.style.setProperty('--primary-color', colors.header);
        document.documentElement.style.setProperty('--secondary-color', colors.sidebar);
        document.documentElement.style.setProperty('--success-color', colors.destaque);
        
        document.getElementById('corHeader').value = colors.header;
        document.getElementById('corSidebar').value = colors.sidebar;
        document.getElementById('corDestaque').value = colors.destaque;
    }
}

// ================================================
// ANIMAÇÕES CSS ADICIONAIS
// ================================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .adm-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    
    .adm-table th,
    .adm-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .adm-table th {
        background: #f3f4f6;
        font-weight: 600;
        color: #4b5563;
    }
    
    .adm-sections {
        display: grid;
        gap: 2rem;
    }
    
    .adm-section h4 {
        margin-bottom: 1rem;
        color: #1f2937;
    }
`;
document.head.appendChild(style);

console.log('🚀 Archipelago Dashboard carregado com sucesso!');

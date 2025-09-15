// =================== SISTEMA QR CODE ===================
window.qrScannerActive = false;
window.qrTimeoutTimer = null;
window.currentQRLeito = null;

// =================== GERAR QR CODES ===================
window.openQRCodes = function() {
    logInfo('Abrindo gerador de QR Codes...');
    
    // Criar modal de QR Codes
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>QR Codes dos Leitos</h2>
                <button onclick="closeQRModal()" class="close-btn">✕</button>
            </div>
            <div class="qr-modal-body">
                <div class="qr-hospital-selector">
                    <select id="qrHospitalSelect" onchange="generateQRCodes()">
                        <option value="H1">Neomater</option>
                        <option value="H2">Cruz Azul</option>
                        <option value="H3">Santa Marcelina</option>
                        <option value="H4">Santa Clara</option>
                    </select>
                </div>
                <div id="qrCodesGrid" class="qr-codes-grid"></div>
                <div class="qr-actions">
                    <button onclick="printQRCodes()" class="btn-print">Imprimir QR Codes</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Gerar QR codes iniciais
    generateQRCodes();
};

// =================== GERAR QR CODES DO HOSPITAL ===================
window.generateQRCodes = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const hospital = window.hospitalData[hospitalId];
    const container = document.getElementById('qrCodesGrid');
    
    if (!hospital || !container) return;
    
    container.innerHTML = '';
    
    hospital.leitos.forEach(leito => {
        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-code-item';
        qrDiv.innerHTML = `
            <div class="qr-label">
                ${hospital.nome} - Leito ${leito.numero}
            </div>
            <div id="qr-${hospitalId}-${leito.numero}" class="qr-code"></div>
        `;
        container.appendChild(qrDiv);
        
        // Gerar QR Code
        new QRCode(document.getElementById(`qr-${hospitalId}-${leito.numero}`), {
            text: JSON.stringify({
                hospital: hospitalId,
                leito: leito.numero,
                timestamp: Date.now()
            }),
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    });
    
    logSuccess(`QR Codes gerados para ${hospital.nome}`);
};

// =================== FECHAR MODAL QR ===================
window.closeQRModal = function() {
    const modal = document.querySelector('.qr-modal');
    if (modal) {
        modal.remove();
    }
};

// =================== IMPRIMIR QR CODES ===================
window.printQRCodes = function() {
    window.print();
};

// =================== INICIAR SCANNER QR (MÉDICO) ===================
window.startQRScanner = function() {
    logInfo('Iniciando scanner QR para médico...');
    
    // Criar interface de scanner
    const scannerDiv = document.createElement('div');
    scannerDiv.id = 'qrScanner';
    scannerDiv.className = 'qr-scanner-container';
    scannerDiv.innerHTML = `
        <div class="qr-scanner-header">
            <h2>Escaneie o QR Code do Leito</h2>
            <div id="qrTimer" class="qr-timer">Tempo restante: 2:00</div>
            <button onclick="stopQRScanner()" class="close-scanner-btn">✕ Fechar</button>
        </div>
        <div id="qrReader" class="qr-reader"></div>
        <div id="qrResult" class="qr-result"></div>
    `;
    document.body.appendChild(scannerDiv);
    
    // Iniciar scanner HTML5
    const html5QrCode = new Html5Qrcode("qrReader");
    
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        try {
            const data = JSON.parse(decodedText);
            logSuccess(`QR Code lido: Hospital ${data.hospital}, Leito ${data.leito}`);
            
            // Parar scanner
            html5QrCode.stop();
            
            // Abrir formulário do leito específico
            openMedicoForm(data.hospital, data.leito);
            
        } catch (error) {
            logError('QR Code inválido', error);
            document.getElementById('qrResult').innerHTML = 
                '<p style="color: red;">QR Code inválido. Tente novamente.</p>';
        }
    };
    
    // Configurar e iniciar câmera
    html5QrCode.start(
        { facingMode: "environment" }, // Câmera traseira
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        qrCodeSuccessCallback
    ).catch(err => {
        logError('Erro ao iniciar câmera:', err);
        document.getElementById('qrResult').innerHTML = 
            '<p style="color: red;">Erro ao acessar câmera. Verifique as permissões.</p>';
    });
    
    // Iniciar timer de 2 minutos
    startQRTimeout();
    
    window.qrScannerActive = true;
};

// =================== PARAR SCANNER QR ===================
window.stopQRScanner = function() {
    logInfo('Parando scanner QR...');
    
    const scannerDiv = document.getElementById('qrScanner');
    if (scannerDiv) {
        scannerDiv.remove();
    }
    
    // Limpar timer
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
        window.qrTimeoutTimer = null;
    }
    
    window.qrScannerActive = false;
};

// =================== TIMER DE TIMEOUT QR (2 MINUTOS) ===================
function startQRTimeout() {
    let timeLeft = 120; // 2 minutos em segundos
    
    window.qrTimeoutTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        const timerDiv = document.getElementById('qrTimer');
        if (timerDiv) {
            timerDiv.textContent = `Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            logInfo('Timeout do QR Scanner - voltando à câmera');
            stopQRScanner();
            // Reiniciar scanner automaticamente
            setTimeout(() => startQRScanner(), 1000);
        }
    }, 1000);
}

// =================== FORMULÁRIO DO MÉDICO (RESTRITO) ===================
window.openMedicoForm = function(hospitalId, leitoNumero) {
    logInfo(`Abrindo formulário médico: ${hospitalId} - Leito ${leitoNumero}`);
    
    const hospital = window.hospitalData[hospitalId];
    const leito = hospital.leitos.find(l => l.numero === leitoNumero);
    
    if (!leito) {
        logError('Leito não encontrado');
        return;
    }
    
    window.currentQRLeito = { hospitalId, leitoNumero };
    
    // Criar formulário restrito
    const formDiv = document.createElement('div');
    formDiv.id = 'medicoForm';
    formDiv.className = 'medico-form-container';
    
    const isVago = leito.status === 'vago';
    
    formDiv.innerHTML = `
        <div class="medico-form">
            <div class="medico-form-header">
                <h2>${hospital.nome} - Leito ${leitoNumero}</h2>
                <div class="qr-timer">Tempo restante: 2:00</div>
            </div>
            
            <div class="medico-form-body">
                ${isVago ? renderAdmissaoForm() : renderAtualizacaoForm(leito)}
            </div>
            
            <div class="medico-form-actions">
                <button onclick="saveMedicoForm()" class="btn-save">
                    ${isVago ? 'Admitir Paciente' : 'Atualizar Dados'}
                </button>
                ${!isVago ? '<button onclick="darAlta()" class="btn-alta">Dar Alta</button>' : ''}
                <button onclick="closeMedicoForm()" class="btn-cancel">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(formDiv);
    
    // Reiniciar timer de 2 minutos
    startMedicoFormTimeout();
};

// =================== RENDERIZAR FORMULÁRIO DE ADMISSÃO ===================
function renderAdmissaoForm() {
    return `
        <div class="form-grid">
            <div class="form-group">
                <label>Nome do Paciente *</label>
                <input type="text" id="formNome" required>
            </div>
            <div class="form-group">
                <label>Matrícula *</label>
                <input type="text" id="formMatricula" required>
            </div>
            <div class="form-group">
                <label>Idade *</label>
                <input type="number" id="formIdade" min="0" max="120" required>
            </div>
            
            <div class="form-group">
                <label>PPS *</label>
                <select id="formPPS" required>
                    <option value="">Selecione...</option>
                    ${[10,20,30,40,50,60,70,80,90,100].map(v => 
                        `<option value="${v}%">${v}%</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>SPICT-BR *</label>
                <select id="formSPICT" required>
                    <option value="">Selecione...</option>
                    <option value="Elegível">Elegível</option>
                    <option value="Não elegível">Não elegível</option>
                </select>
            </div>
            <div class="form-group">
                <label>Previsão de Alta *</label>
                <select id="formPrevisao" required>
                    <option value="">Selecione...</option>
                    ${PREVISAO_ALTA_OPTIONS.map(opt => 
                        `<option value="${opt}">${opt}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        
        <div class="form-section">
            <h3>CONCESSÕES PREVISTAS NA ALTA</h3>
            <div class="checkbox-grid">
                ${CONCESSOES_LIST.map((c, i) => `
                    <label class="checkbox-item">
                        <input type="checkbox" id="conc${i}" value="${c}">
                        <span>${c}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        
        <div class="form-section">
            <h3>LINHA DE CUIDADOS PROPOSTA NA ALTA</h3>
            <div class="checkbox-grid">
                ${LINHAS_CUIDADO_LIST.map((l, i) => `
                    <label class="checkbox-item">
                        <input type="checkbox" id="linha${i}" value="${l}">
                        <span>${l}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

// =================== RENDERIZAR FORMULÁRIO DE ATUALIZAÇÃO ===================
function renderAtualizacaoForm(leito) {
    return `
        <div class="form-grid">
            <div class="form-group">
                <label>Nome do Paciente</label>
                <input type="text" id="formNome" value="${leito.paciente.nome}" readonly>
            </div>
            <div class="form-group">
                <label>Matrícula</label>
                <input type="text" id="formMatricula" value="${leito.paciente.matricula}" readonly>
            </div>
            <div class="form-group">
                <label>Idade</label>
                <input type="number" id="formIdade" value="${leito.paciente.idade}" readonly>
            </div>
            
            <div class="form-group">
                <label>PPS *</label>
                <select id="formPPS" required>
                    ${[10,20,30,40,50,60,70,80,90,100].map(v => 
                        `<option value="${v}%" ${leito.paciente.pps === v+'%' ? 'selected' : ''}>${v}%</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>SPICT-BR *</label>
                <select id="formSPICT" required>
                    <option value="Elegível" ${leito.paciente.spictBr === 'Elegível' ? 'selected' : ''}>Elegível</option>
                    <option value="Não elegível" ${leito.paciente.spictBr === 'Não elegível' ? 'selected' : ''}>Não elegível</option>
                </select>
            </div>
            <div class="form-group">
                <label>Previsão de Alta *</label>
                <select id="formPrevisao" required>
                    ${PREVISAO_ALTA_OPTIONS.map(opt => 
                        `<option value="${opt}" ${leito.paciente.previsaoAlta === opt ? 'selected' : ''}>${opt}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        
        <div class="form-section">
            <h3>CONCESSÕES PREVISTAS NA ALTA</h3>
            <div class="checkbox-grid">
                ${CONCESSOES_LIST.map((c, i) => `
                    <label class="checkbox-item">
                        <input type="checkbox" id="conc${i}" value="${c}" 
                            ${leito.paciente.concessoes.includes(c) ? 'checked' : ''}>
                        <span>${c}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        
        <div class="form-section">
            <h3>LINHA DE CUIDADOS PROPOSTA NA ALTA</h3>
            <div class="checkbox-grid">
                ${LINHAS_CUIDADO_LIST.map((l, i) => `
                    <label class="checkbox-item">
                        <input type="checkbox" id="linha${i}" value="${l}"
                            ${leito.paciente.linhasCuidado.includes(l) ? 'checked' : ''}>
                        <span>${l}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

// =================== TIMER DO FORMULÁRIO MÉDICO ===================
function startMedicoFormTimeout() {
    let timeLeft = 120; // 2 minutos
    
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
    }
    
    window.qrTimeoutTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        const timerDivs = document.querySelectorAll('.qr-timer');
        timerDivs.forEach(div => {
            div.textContent = `Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        });
        
        timeLeft--;
        
        if (timeLeft < 0) {
            logInfo('Timeout do formulário médico');
            closeMedicoForm();
            // Voltar ao scanner
            setTimeout(() => startQRScanner(), 500);
        }
    }, 1000);
}

// =================== SALVAR FORMULÁRIO MÉDICO ===================
window.saveMedicoForm = function() {
    logInfo('Salvando dados do formulário médico...');
    
    // Coletar dados do formulário
    const dados = {
        nome: document.getElementById('formNome').value,
        matricula: document.getElementById('formMatricula').value,
        idade: document.getElementById('formIdade').value,
        pps: document.getElementById('formPPS').value,
        spictBr: document.getElementById('formSPICT').value,
        previsaoAlta: document.getElementById('formPrevisao').value,
        concessoes: [],
        linhasCuidado: []
    };
    
    // Coletar concessões marcadas
    CONCESSOES_LIST.forEach((c, i) => {
        if (document.getElementById(`conc${i}`).checked) {
            dados.concessoes.push(c);
        }
    });
    
    // Coletar linhas marcadas
    LINHAS_CUIDADO_LIST.forEach((l, i) => {
        if (document.getElementById(`linha${i}`).checked) {
            dados.linhasCuidado.push(l);
        }
    });
    
    // Validar dados obrigatórios
    if (!dados.nome || !dados.matricula || !dados.idade || !dados.pps || !dados.spictBr || !dados.previsaoAlta) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Atualizar dados no sistema
    const hospital = window.hospitalData[window.currentQRLeito.hospitalId];
    const leito = hospital.leitos.find(l => l.numero === window.currentQRLeito.leitoNumero);
    
    leito.status = 'ocupado';
    leito.paciente = {
        ...dados,
        admissao: new Date().toLocaleString('pt-BR')
    };
    
    logSuccess('Dados salvos com sucesso');
    alert('Dados salvos com sucesso!');
    
    closeMedicoForm();
    // Voltar ao scanner
    setTimeout(() => startQRScanner(), 500);
};

// =================== DAR ALTA ===================
window.darAlta = function() {
    if (confirm('Confirma a alta do paciente?')) {
        const hospital = window.hospitalData[window.currentQRLeito.hospitalId];
        const leito = hospital.leitos.find(l => l.numero === window.currentQRLeito.leitoNumero);
        
        leito.status = 'vago';
        delete leito.paciente;
        
        logSuccess('Alta registrada com sucesso');
        alert('Alta registrada com sucesso!');
        
        closeMedicoForm();
        // Voltar ao scanner
        setTimeout(() => startQRScanner(), 500);
    }
};

// =================== FECHAR FORMULÁRIO MÉDICO ===================
window.closeMedicoForm = function() {
    const formDiv = document.getElementById('medicoForm');
    if (formDiv) {
        formDiv.remove();
    }
    
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
        window.qrTimeoutTimer = null;
    }
    
    window.currentQRLeito = null;
};

// =================== ESTILOS DO QR CODE ===================
const qrStyles = `
<style>
.qr-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.qr-modal-content {
    background: white;
    border-radius: 12px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
    padding: 20px;
}

.qr-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.qr-codes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.qr-code-item {
    text-align: center;
    padding: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.qr-label {
    margin-bottom: 10px;
    font-weight: 600;
    font-size: 14px;
}

.qr-scanner-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 9999;
}

.qr-scanner-header {
    background: var(--nav-header);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qr-reader {
    width: 100%;
    max-width: 500px;
    margin: 20px auto;
}

.qr-timer {
    background: #ef4444;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: 600;
}

.medico-form-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    overflow: auto;
}

.medico-form {
    background: white;
    border-radius: 12px;
    max-width: 900px;
    width: 90%;
    max-height: 90%;
    overflow: auto;
}

.medico-form-header {
    background: var(--nav-header);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.medico-form-body {
    padding: 20px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 30px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 5px;
    text-transform: uppercase;
    color: #374151;
}

.form-group input,
.form-group select {
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.form-section {
    margin-bottom: 25px;
}

.form-section h3 {
    background: #60a5fa;
    color: white;
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 15px;
}

.checkbox-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    padding: 8px;
    background: #f9fafb;
    border-radius: 4px;
    cursor: pointer;
}

.checkbox-item input {
    margin-right: 10px;
}

.medico-form-actions {
    padding: 20px;
    background: #f9fafb;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn-save {
    padding: 12px 24px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
}

.btn-alta {
    padding: 12px 24px;
    background: #f59e0b;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
}

.btn-cancel {
    padding: 12px 24px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
}

@media print {
    body * {
        visibility: hidden;
    }
    .qr-modal-content,
    .qr-modal-content * {
        visibility: visible;
    }
    .qr-modal-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
    .qr-modal-header,
    .qr-actions,
    .qr-hospital-selector {
        display: none !important;
    }
}
</style>
`;

// Adicionar estilos ao documento
if (!document.getElementById('qrStyles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'qrStyles';
    styleElement.innerHTML = qrStyles;
    document.head.appendChild(styleElement);
}

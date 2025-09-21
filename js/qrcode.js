// =================== QRCODE.JS V5.0 - CORREÇÃO COMPLETA ===================
// SISTEMA QR CODE PARA MÉDICOS - DADOS REAIS SOMENTE

// =================== VARIÁVEIS GLOBAIS ===================
window.qrScannerActive = false;
window.qrTimeoutTimer = null;
window.currentQRLeito = null;
window.html5QrCodeScanner = null;

// =================== CONSTANTES REAIS DA PLANILHA ===================
const CONCESSOES_LIST_QR = [
    "Transição Domiciliar",
    "Aplicação domiciliar de medicamentos", 
    "Fisioterapia",
    "Fonoaudiologia",
    "Aspiração",
    "Banho",
    "Curativos",
    "Oxigenoterapia",
    "Recarga de O2",
    "Orientação Nutricional - com dispositivo",
    "Orientação Nutricional - sem dispositivo",
    "Clister",
    "PICC"
];

const LINHAS_CUIDADO_LIST_QR = [
    "Assiste",
    "APS", 
    "Cuidados Paliativos",
    "ICO (Insuficiência Coronariana)",
    "Oncologia",
    "Pediatria",
    "Programa Autoimune - Gastroenterologia",
    "Programa Autoimune - Neuro-desmielinizante",
    "Programa Autoimune - Neuro-muscular",
    "Programa Autoimune - Reumatologia",
    "Vida Mais Leve Care",
    "Crônicos - Cardiologia",
    "Crônicos - Endocrinologia",
    "Crônicos - Geriatria",
    "Crônicos - Melhor Cuidado",
    "Crônicos - Neurologia",
    "Crônicos - Pneumologia",
    "Crônicos - Pós-bariátrica",
    "Crônicos - Reumatologia"
];

const PREVISAO_ALTA_OPTIONS_QR = [
    'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
    '24h Ouro', '24h 2R', '24h 3R',
    '48h', '72h', '96h', 'SP'
];

const PPS_OPTIONS_QR = ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

// =================== GERAR QR CODES FIXOS (PARA IMPRESSÃO EM ACRÍLICO) ===================
window.openQRCodes = function() {
    console.log('🔵 Abrindo gerador de QR Codes para impressão em acrílico...');
    
    // Verificar se hospitalData existe
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        alert('Aguarde o carregamento dos dados da planilha para gerar os QR Codes.');
        return;
    }
    
    // Criar modal de QR Codes
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>QR Codes dos Leitos - Para Impressão em Acrílico</h2>
                <button onclick="closeQRModal()" class="close-btn">✕</button>
            </div>
            <div class="qr-modal-body">
                <div class="qr-hospital-selector">
                    <label>Selecionar Hospital:</label>
                    <select id="qrHospitalSelect" onchange="generateQRCodes()">
                        <option value="H1">Neomater</option>
                        <option value="H2">Cruz Azul</option>
                        <option value="H3">Santa Marcelina</option>
                        <option value="H4">Santa Clara</option>
                    </select>
                </div>
                <div id="qrCodesGrid" class="qr-codes-grid"></div>
                <div class="qr-actions">
                    <button onclick="printQRCodes()" class="btn-print">🖨️ Imprimir QR Codes</button>
                    <p style="color: #666; font-size: 12px; margin-top: 10px;">
                        ⚠️ QR Codes são fixos - ideais para impressão em acrílico
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Gerar QR codes iniciais
    generateQRCodes();
};

// =================== GERAR QR CODES DO HOSPITAL (CORRIGIDO) ===================
window.generateQRCodes = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const hospital = window.hospitalData[hospitalId];
    const container = document.getElementById('qrCodesGrid');
    
    if (!hospital || !container) {
        console.error('❌ Hospital ou container não encontrado');
        return;
    }
    
    if (!hospital.leitos || hospital.leitos.length === 0) {
        container.innerHTML = '<p>Nenhum leito encontrado para este hospital.</p>';
        return;
    }
    
    // LIMPAR CONTAINER COMPLETAMENTE
    container.innerHTML = '';
    
    hospital.leitos.forEach(leito => {
        const leitoNumero = leito.leito || leito.numero || 'N/A';
        
        // Criar div do QR code
        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-code-item';
        qrDiv.innerHTML = `
            <div class="qr-label">
                ${hospital.nome} - Leito ${leitoNumero}
            </div>
            <div id="qr-${hospitalId}-${leitoNumero}" class="qr-code-container"></div>
        `;
        container.appendChild(qrDiv);
        
        // GERAR URL FIXA PARA O QR CODE
        const BASE_URL = 'https://teste-rho-gray.vercel.app';
        const qrURL = `${BASE_URL}/?qr=true&h=${hospitalId}&l=${leitoNumero}`;
        
        // Aguardar o DOM antes de gerar QR
        setTimeout(() => {
            const qrContainer = document.getElementById(`qr-${hospitalId}-${leitoNumero}`);
            if (qrContainer) {
                // LIMPAR QUALQUER QR ANTERIOR
                qrContainer.innerHTML = '';
                
                // Gerar novo QR Code
                try {
                    new QRCode(qrContainer, {
                        text: qrURL,
                        width: 150,
                        height: 150,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.M
                    });
                    console.log(`✅ QR gerado: ${qrURL}`);
                } catch (error) {
                    console.error(`❌ Erro ao gerar QR para leito ${leitoNumero}:`, error);
                    qrContainer.innerHTML = '<p style="color: red;">Erro ao gerar QR</p>';
                }
            }
        }, 100);
    });
    
    console.log(`✅ ${hospital.leitos.length} QR Codes gerados para ${hospital.nome}`);
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
    console.log('🖨️ Preparando impressão dos QR Codes...');
    window.print();
};

// =================== INICIAR SCANNER QR (MÉDICO) ===================
window.startQRScanner = function() {
    console.log('📱 Iniciando scanner QR para médico...');
    
    // Parar scanner anterior se existir
    if (window.html5QrCodeScanner) {
        try {
            window.html5QrCodeScanner.stop();
        } catch (e) {
            console.error('Erro ao parar scanner anterior:', e);
        }
    }
    
    // Criar interface de scanner
    const scannerDiv = document.createElement('div');
    scannerDiv.id = 'qrScanner';
    scannerDiv.className = 'qr-scanner-container';
    scannerDiv.innerHTML = `
        <div class="qr-scanner-header">
            <h2>📱 Escaneie o QR Code do Leito</h2>
            <div id="qrTimer" class="qr-timer">Tempo restante: 2:00</div>
            <button onclick="stopQRScanner()" class="close-scanner-btn">✕ Fechar</button>
        </div>
        <div id="qrReader" class="qr-reader"></div>
        <div id="qrResult" class="qr-result"></div>
        <div class="qr-instructions">
            <p>📋 Escaneie o QR Code fixo impresso no acrílico do leito</p>
            <p>⏰ Você tem 2 minutos para escanear e preencher os dados</p>
        </div>
    `;
    document.body.appendChild(scannerDiv);
    
    // Configurar scanner HTML5
    window.html5QrCodeScanner = new Html5Qrcode("qrReader");
    
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        try {
            console.log('📷 QR Code lido:', decodedText);
            
            // Verificar se é uma URL
            if (decodedText.includes('http')) {
                // Extrair parâmetros da URL
                const url = new URL(decodedText);
                const params = url.searchParams;
                const hospital = params.get('h');
                const leito = params.get('l');
                
                if (hospital && leito) {
                    console.log(`✅ QR válido: Hospital ${hospital}, Leito ${leito}`);
                    
                    // Parar scanner
                    window.html5QrCodeScanner.stop().then(() => {
                        console.log('Scanner parado');
                        // Abrir formulário
                        openMedicoForm(hospital, leito);
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erro ao processar QR:', error);
            document.getElementById('qrResult').innerHTML = 
                '<p style="color: #ef4444;">❌ QR Code inválido. Tente novamente.</p>';
        }
    };
    
    // Configurar e iniciar câmera
    const qrConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };
    
    window.html5QrCodeScanner.start(
        { facingMode: "environment" },
        qrConfig,
        qrCodeSuccessCallback
    ).catch(err => {
        console.error('❌ Erro ao iniciar câmera:', err);
        document.getElementById('qrResult').innerHTML = 
            '<p style="color: #ef4444;">❌ Erro ao acessar câmera. Verifique as permissões.</p>';
    });
    
    // Iniciar timer de 2 minutos
    startQRTimeout();
    window.qrScannerActive = true;
};

// =================== PARAR SCANNER QR ===================
window.stopQRScanner = function() {
    console.log('Parando scanner QR...');
    
    if (window.html5QrCodeScanner) {
        window.html5QrCodeScanner.stop().catch(err => {
            console.error('Erro ao parar scanner:', err);
        });
        window.html5QrCodeScanner = null;
    }
    
    const scannerDiv = document.getElementById('qrScanner');
    if (scannerDiv) {
        scannerDiv.remove();
    }
    
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
        window.qrTimeoutTimer = null;
    }
    
    window.qrScannerActive = false;
};

// =================== TIMER DE 2 MINUTOS ===================
function startQRTimeout() {
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
            
            if (timeLeft <= 30) {
                div.style.background = '#ef4444';
                div.style.animation = 'pulse 1s infinite';
            } else if (timeLeft <= 60) {
                div.style.background = '#f59e0b';
            }
        });
        
        timeLeft--;
        
        if (timeLeft < 0) {
            console.log('⏰ Timeout de 2 minutos expirado');
            closeMedicoForm();
            stopQRScanner();
            setTimeout(() => startQRScanner(), 1000);
        }
    }, 1000);
}

// =================== FORMULÁRIO MÉDICO ===================
window.openMedicoForm = function(hospitalId, leitoNumero) {
    console.log(`📝 Abrindo formulário: ${hospitalId} - Leito ${leitoNumero}`);
    
    // Validar dados
    if (!window.hospitalData || !window.hospitalData[hospitalId]) {
        alert('Hospital não encontrado. Tente novamente.');
        return;
    }
    
    const hospital = window.hospitalData[hospitalId];
    const leito = hospital.leitos.find(l => 
        (l.leito || l.numero || l.id) == leitoNumero
    );
    
    if (!leito) {
        alert('Leito não encontrado. Verifique o QR Code.');
        return;
    }
    
    window.currentQRLeito = { hospitalId, leitoNumero };
    
    // Fechar scanner
    stopQRScanner();
    
    // Determinar se leito está vago
    const isVago = !leito.status || leito.status === 'vago' || leito.status === 'Vago';
    
    // Criar formulário
    const formDiv = document.createElement('div');
    formDiv.id = 'medicoForm';
    formDiv.className = 'medico-form-container';
    
    formDiv.innerHTML = `
        <div class="medico-form">
            <div class="medico-form-header">
                <h2>🏥 ${hospital.nome} - Leito ${leitoNumero}</h2>
                <div class="qr-timer">Tempo restante: 2:00</div>
            </div>
            
            <div class="medico-form-body">
                <h3>${isVago ? 'ADMISSÃO DE PACIENTE' : 'ATUALIZAÇÃO DE DADOS'}</h3>
                
                ${isVago ? `
                    <!-- ADMISSÃO -->
                    <div class="form-grid">
                        <div>
                            <label>Nome Completo *</label>
                            <input id="qrNome" type="text" required>
                        </div>
                        <div>
                            <label>Matrícula *</label>
                            <input id="qrMatricula" type="text" required>
                        </div>
                        <div>
                            <label>Idade *</label>
                            <input id="qrIdade" type="number" min="0" max="120" required>
                        </div>
                    </div>
                ` : `
                    <!-- ATUALIZAÇÃO -->
                    <div class="form-grid">
                        <div>
                            <label>Paciente</label>
                            <input value="${leito.nome || ''}" readonly>
                        </div>
                        <div>
                            <label>Matrícula</label>
                            <input value="${leito.matricula || ''}" readonly>
                        </div>
                        <div>
                            <label>Idade *</label>
                            <input id="qrIdade" type="number" value="${leito.idade || ''}" min="0" max="120" required>
                        </div>
                    </div>
                `}
                
                <div class="form-grid">
                    <div>
                        <label>PPS % *</label>
                        <select id="qrPPS" required>
                            <option value="">Selecionar...</option>
                            ${PPS_OPTIONS_QR.map(pps => 
                                `<option value="${pps}" ${leito.pps == pps.replace('%','') ? 'selected' : ''}>${pps}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label>SPICT-BR *</label>
                        <select id="qrSPICT" required>
                            <option value="nao_elegivel" ${leito.spict === 'nao_elegivel' ? 'selected' : ''}>Não elegível</option>
                            <option value="elegivel" ${leito.spict === 'elegivel' ? 'selected' : ''}>Elegível</option>
                        </select>
                    </div>
                    <div>
                        <label>Previsão Alta *</label>
                        <select id="qrPrevAlta" required>
                            ${PREVISAO_ALTA_OPTIONS_QR.map(opt => 
                                `<option value="${opt}" ${leito.prevAlta === opt ? 'selected' : ''}>${opt}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Concessões Previstas</h4>
                    <div id="qrConcessoes" class="checkbox-grid">
                        ${CONCESSOES_LIST_QR.map((c, i) => `
                            <label>
                                <input type="checkbox" id="conc${i}" value="${c}" 
                                    ${(leito.concessoes || []).includes(c) ? 'checked' : ''}>
                                <span>${c}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Linhas de Cuidado</h4>
                    <div id="qrLinhas" class="checkbox-grid">
                        ${LINHAS_CUIDADO_LIST_QR.map((l, i) => `
                            <label>
                                <input type="checkbox" id="linha${i}" value="${l}"
                                    ${(leito.linhas || []).includes(l) ? 'checked' : ''}>
                                <span>${l}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="medico-form-actions">
                <button onclick="saveMedicoForm()" class="btn-save">
                    ${isVago ? '✅ ADMITIR PACIENTE' : '💾 ATUALIZAR DADOS'}
                </button>
                ${!isVago ? '<button onclick="darAltaQR()" class="btn-alta">🏠 DAR ALTA</button>' : ''}
                <button onclick="closeMedicoForm()" class="btn-cancel">❌ CANCELAR</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(formDiv);
    
    // Reiniciar timer
    startQRTimeout();
};

// =================== SALVAR FORMULÁRIO ===================
window.saveMedicoForm = async function() {
    console.log('💾 Salvando dados...');
    
    try {
        const dados = coletarDadosFormulario();
        
        if (!validarCampos(dados)) {
            return;
        }
        
        // Determinar ação
        const hospital = window.hospitalData[window.currentQRLeito.hospitalId];
        const leito = hospital.leitos.find(l => 
            (l.leito || l.numero || l.id) == window.currentQRLeito.leitoNumero
        );
        const isVago = !leito.status || leito.status === 'vago' || leito.status === 'Vago';
        
        // Chamar API
        if (isVago) {
            await window.admitirPaciente(dados.hospital, dados.leito, dados);
            alert('✅ Paciente admitido com sucesso!');
        } else {
            await window.atualizarPaciente(dados.hospital, dados.leito, dados);
            alert('✅ Dados atualizados com sucesso!');
        }
        
        closeMedicoForm();
        setTimeout(() => startQRScanner(), 500);
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro ao salvar: ' + error.message);
    }
};

// =================== DAR ALTA VIA QR ===================
window.darAltaQR = async function() {
    if (!confirm('⚠️ Confirma a ALTA deste paciente?')) return;
    
    try {
        await window.darAltaPaciente(
            window.currentQRLeito.hospitalId, 
            window.currentQRLeito.leitoNumero
        );
        alert('✅ Alta processada com sucesso!');
        closeMedicoForm();
        setTimeout(() => startQRScanner(), 500);
    } catch (error) {
        alert('❌ Erro ao processar alta: ' + error.message);
    }
};

// =================== FUNÇÕES AUXILIARES ===================
function coletarDadosFormulario() {
    const dados = {
        hospital: window.currentQRLeito.hospitalId,
        leito: window.currentQRLeito.leitoNumero
    };
    
    // Campos básicos
    const nomeEl = document.getElementById('qrNome');
    if (nomeEl) dados.nome = nomeEl.value.trim();
    
    const matriculaEl = document.getElementById('qrMatricula');
    if (matriculaEl) dados.matricula = matriculaEl.value.trim();
    
    const idadeEl = document.getElementById('qrIdade');
    if (idadeEl) dados.idade = parseInt(idadeEl.value);
    
    const ppsEl = document.getElementById('qrPPS');
    if (ppsEl) dados.pps = ppsEl.value.replace('%', '');
    
    dados.spict = document.getElementById('qrSPICT')?.value || 'nao_elegivel';
    dados.prevAlta = document.getElementById('qrPrevAlta')?.value || 'SP';
    dados.complexidade = 'I';
    
    // Concessões
    dados.concessoes = [];
    document.querySelectorAll('#qrConcessoes input:checked').forEach(cb => {
        dados.concessoes.push(cb.value);
    });
    
    // Linhas
    dados.linhas = [];
    document.querySelectorAll('#qrLinhas input:checked').forEach(cb => {
        dados.linhas.push(cb.value);
    });
    
    return dados;
}

function validarCampos(dados) {
    const erros = [];
    
    if (dados.nome !== undefined && !dados.nome) {
        erros.push('Nome é obrigatório');
    }
    
    if (dados.matricula !== undefined && !dados.matricula) {
        erros.push('Matrícula é obrigatória');
    }
    
    if (!dados.idade || dados.idade < 0 || dados.idade > 120) {
        erros.push('Idade inválida');
    }
    
    if (!dados.pps) {
        erros.push('PPS é obrigatório');
    }
    
    if (!dados.prevAlta) {
        erros.push('Previsão de Alta é obrigatória');
    }
    
    if (erros.length > 0) {
        alert('❌ Campos obrigatórios:\n\n• ' + erros.join('\n• '));
        return false;
    }
    
    return true;
}

window.closeMedicoForm = function() {
    const formDiv = document.getElementById('medicoForm');
    if (formDiv) formDiv.remove();
    window.currentQRLeito = null;
};

// =================== DETECÇÃO DE ACESSO VIA QR CODE ===================
function detectarAcessoQR() {
    const urlParams = new URLSearchParams(window.location.search);
    const isQR = urlParams.get('qr') === 'true';
    const hospitalId = urlParams.get('h');
    const leitoNumero = urlParams.get('l');
    
    if (isQR && hospitalId && leitoNumero) {
        console.log(`🔍 Acesso via QR detectado: ${hospitalId} - Leito ${leitoNumero}`);
        
        // BYPASS DE AUTENTICAÇÃO
        window.isAuthenticated = true;
        
        // Esconder modal de auth se existir
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.style.display = 'none';
        
        // Aguardar dados carregarem
        const checkData = setInterval(() => {
            if (window.hospitalData && window.hospitalData[hospitalId]) {
                clearInterval(checkData);
                
                // Verificar se leito existe
                const hospital = window.hospitalData[hospitalId];
                const leito = hospital.leitos.find(l => 
                    (l.leito || l.numero || l.id) == leitoNumero
                );
                
                if (leito) {
                    console.log('✅ Leito encontrado, abrindo formulário...');
                    openMedicoForm(hospitalId, leitoNumero);
                } else {
                    alert(`Leito ${leitoNumero} não encontrado no ${hospital.nome}`);
                    window.location.href = window.location.origin;
                }
            }
        }, 500);
        
        // Timeout de segurança
        setTimeout(() => {
            clearInterval(checkData);
            if (!window.hospitalData) {
                alert('Erro ao carregar dados. Tente novamente.');
                window.location.href = window.location.origin;
            }
        }, 10000);
    }
}

// =================== CSS DO SISTEMA QR ===================
const qrStyles = `
<style>
/* Modal de QR Codes */
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
    padding-bottom: 15px;
    border-bottom: 2px solid #e5e7eb;
}

.qr-modal-header h2 {
    color: #1a1f2e;
    margin: 0;
}

.close-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 15px;
    cursor: pointer;
    font-weight: bold;
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
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
}

.qr-label {
    font-weight: 700;
    margin-bottom: 10px;
    color: #1a1f2e;
}

.qr-code-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
}

.btn-print {
    padding: 12px 24px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

/* Scanner QR */
.qr-scanner-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #1a1f2e;
    z-index: 9999;
    overflow: auto;
}

.qr-scanner-header {
    background: #1e293b;
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qr-timer {
    background: #22c55e;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
}

.close-scanner-btn {
    background: rgba(255,255,255,0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
}

.qr-reader {
    max-width: 500px;
    margin: 20px auto;
}

/* Formulário Médico */
.medico-form-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    overflow: auto;
}

.medico-form {
    background: white;
    border-radius: 12px;
    max-width: 800px;
    width: 95%;
    max-height: 95vh;
    overflow: auto;
}

.medico-form-header {
    background: #1e293b;
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.medico-form-body {
    padding: 25px;
}

.medico-form-body h3 {
    color: #1a1f2e;
    margin-bottom: 20px;
    text-align: center;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
}

.form-grid label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 5px;
    color: #374151;
}

.form-grid input,
.form-grid select {
    width: 100%;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.form-grid input[readonly] {
    background: #f3f4f6;
    color: #6b7280;
}

.form-section {
    margin: 25px 0;
}

.form-section h4 {
    background: #3b82f6;
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 14px;
}

.checkbox-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
    background: #f9fafb;
    border-radius: 6px;
}

.checkbox-grid label {
    display: flex;
    align-items: center;
    padding: 8px;
    background: white;
    border-radius: 4px;
    cursor: pointer;
}

.checkbox-grid input {
    margin-right: 8px;
}

.medico-form-actions {
    padding: 20px;
    background: #f3f4f6;
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn-save,
.btn-alta,
.btn-cancel {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
}

.btn-save {
    background: #10b981;
    color: white;
}

.btn-alta {
    background: #ef4444;
    color: white;
}

.btn-cancel {
    background: #6b7280;
    color: white;
}

/* Animação pulse */
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
}

/* Mobile */
@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    .checkbox-grid {
        grid-template-columns: 1fr;
    }
    
    .qr-codes-grid {
        grid-template-columns: 1fr;
    }
}

/* Impressão */
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
    
    .qr-codes-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
    }
    
    .qr-code-item {
        page-break-inside: avoid;
    }
}
</style>
`;

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema QR Code V5.0 Inicializado');
    
    // Adicionar estilos
    if (!document.getElementById('qrStyles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'qrStyles';
        styleElement.innerHTML = qrStyles;
        document.head.appendChild(styleElement);
    }
    
    // Detectar acesso via QR
    detectarAcessoQR();
    
    // Verificar dependências
    if (typeof Html5Qrcode === 'undefined') {
        console.warn('⚠️ Biblioteca HTML5-QRCode não carregada');
    }
    
    if (typeof QRCode === 'undefined') {
        console.warn('⚠️ Biblioteca QRCode.js não carregada');
    }
    
    // Inicializar hospitalData se não existir
    if (!window.hospitalData) {
        window.hospitalData = {};
    }
    
    console.log('🔷 Sistema QR Code Pronto:');
    console.log('  • QR Codes fixos para impressão');
    console.log('  • URL única por leito');
    console.log('  • Acesso direto ao formulário do leito');
    console.log('  • Timer de 2 minutos');
    console.log('  • Bypass de autenticação para QR');
});

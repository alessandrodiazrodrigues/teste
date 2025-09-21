// =================== QRCODE.JS V7.0 - SISTEMA COMPLETO ===================
// SISTEMA QR CODE PARA IMPRESSÃO EM ACRÍLICO - 12 QR CODES POR A4

/* ===========================================================================
   IMPORTANTE - BIBLIOTECA QR CODE:
   
   Este arquivo REQUER a biblioteca QRCode.js carregada no HTML principal:
   <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
   
   URLs FIXAS DOS QR CODES:
   - Base URL: https://qrcode-seven-gamma.vercel.app
   - Formato: https://qrcode-seven-gamma.vercel.app/?h={HOSPITAL_ID}&l={LEITO_NUMERO}
   - Exemplo: https://qrcode-seven-gamma.vercel.app/?h=H1&l=1
   
   HOSPITAIS:
   - H1: Neomater
   - H2: Cruz Azul  
   - H3: Santa Marcelina
   - H4: Santa Clara
   
   IMPRESSÃO:
   - Layout: 3x4 (12 QR codes por página A4)
   - Tamanho QR: 150x150 pixels
   - Alta correção de erro para impressão em acrílico
=========================================================================== */

// =================== CONFIGURAÇÃO ===================
const QR_CONFIG = {
    BASE_URL: 'https://qrcode-seven-gamma.vercel.app',  // URL FIXA DA VERCEL
    QR_SIZE: 150,  // Tamanho do QR Code em pixels
    CORRECTION_LEVEL: 'H',  // Alta correção de erro (30%)
    HOSPITAIS: {
        H1: { nome: 'Neomater', ativo: true },
        H2: { nome: 'Cruz Azul', ativo: true },
        H3: { nome: 'Santa Marcelina', ativo: true },
        H4: { nome: 'Santa Clara', ativo: true }
    }
};

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = window.hospitalData || {};
window.qrCodeInstances = [];  // Armazenar instâncias para limpeza

// =================== VERIFICAR BIBLIOTECA ===================
function checkQRLibrary() {
    if (typeof QRCode === 'undefined') {
        console.error('❌ Biblioteca QRCode.js não encontrada!');
        console.error('Adicione no HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>');
        
        // Tentar carregar dinamicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => {
            console.log('✅ QRCode.js carregada dinamicamente');
        };
        document.head.appendChild(script);
        return false;
    }
    return true;
}

// =================== GERAR QR CODES PARA IMPRESSÃO ===================
window.openQRCodes = function() {
    console.log('🔵 Abrindo gerador de QR Codes...');
    console.log(`📍 URL Base: ${QR_CONFIG.BASE_URL}`);
    
    // Verificar biblioteca
    if (!checkQRLibrary()) {
        alert('Biblioteca QR Code sendo carregada. Tente novamente em 2 segundos.');
        setTimeout(() => window.openQRCodes(), 2000);
        return;
    }
    
    // Verificar dados
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        alert('Aguarde o carregamento dos dados da planilha para gerar os QR Codes.');
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>📱 QR Codes dos Leitos - Impressão em Acrílico</h2>
                <button onclick="closeQRModal()" class="close-btn">✕</button>
            </div>
            <div class="qr-modal-body">
                <div class="qr-info-box">
                    <p><strong>ℹ️ Informações Importantes:</strong></p>
                    <ul>
                        <li>URL Base: <code>${QR_CONFIG.BASE_URL}</code></li>
                        <li>Formato: 12 QR Codes por página A4 (3x4)</li>
                        <li>Correção de Erro: Alta (30%) para impressão em acrílico</li>
                        <li>Cada QR aponta para um leito específico</li>
                    </ul>
                </div>
                <div class="qr-hospital-selector">
                    <label>Selecionar Hospital:</label>
                    <select id="qrHospitalSelect" onchange="generateQRCodes()">
                        <option value="H1">Neomater</option>
                        <option value="H2">Cruz Azul</option>
                        <option value="H3">Santa Marcelina</option>
                        <option value="H4">Santa Clara</option>
                    </select>
                    <button onclick="generateAllHospitals()" class="btn-generate-all">
                        🏥 Gerar Todos os Hospitais
                    </button>
                </div>
                <div id="qrCodesGrid" class="qr-codes-grid"></div>
                <div class="qr-actions">
                    <button onclick="printQRCodes()" class="btn-print">🖨️ Imprimir QR Codes (12 por A4)</button>
                    <p style="color: #666; font-size: 12px; margin-top: 10px;">
                        ✅ QR Codes prontos para impressão em acrílico
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Gerar QR codes iniciais
    setTimeout(() => generateQRCodes(), 100);
};

// =================== GERAR QR CODES DO HOSPITAL ===================
window.generateQRCodes = function() {
    const hospitalId = document.getElementById('qrHospitalSelect')?.value;
    if (!hospitalId) return;
    
    const hospital = window.hospitalData[hospitalId];
    const container = document.getElementById('qrCodesGrid');
    
    if (!hospital || !container) {
        console.error('❌ Hospital ou container não encontrado');
        return;
    }
    
    // Limpar QR codes anteriores
    clearQRCodes();
    container.innerHTML = '';
    
    // Verificar leitos
    if (!hospital.leitos || hospital.leitos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum leito encontrado para este hospital.</p>';
        return;
    }
    
    // Título
    const title = document.createElement('h3');
    title.className = 'qr-grid-title';
    title.textContent = `${QR_CONFIG.HOSPITAIS[hospitalId].nome} - ${hospital.leitos.length} leitos`;
    container.appendChild(title);
    
    // Gerar QR para cada leito
    hospital.leitos.forEach((leito, index) => {
        const leitoNumero = leito.leito || leito.numero || leito.id || (index + 1);
        
        // Container do QR
        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-code-item';
        qrDiv.innerHTML = `
            <div class="qr-label">
                <strong>${QR_CONFIG.HOSPITAIS[hospitalId].nome}</strong><br>
                Leito ${leitoNumero}
            </div>
            <div id="qr-${hospitalId}-${leitoNumero}" class="qr-code-container"></div>
            <div class="qr-url">h=${hospitalId}&l=${leitoNumero}</div>
        `;
        container.appendChild(qrDiv);
        
        // Gerar QR Code com delay para garantir DOM
        setTimeout(() => {
            generateSingleQR(hospitalId, leitoNumero);
        }, index * 50);  // Delay progressivo para não sobrecarregar
    });
    
    console.log(`✅ Gerando ${hospital.leitos.length} QR Codes para ${QR_CONFIG.HOSPITAIS[hospitalId].nome}`);
};

// =================== GERAR QR CODE INDIVIDUAL ===================
function generateSingleQR(hospitalId, leitoNumero) {
    const containerId = `qr-${hospitalId}-${leitoNumero}`;
    const qrContainer = document.getElementById(containerId);
    
    if (!qrContainer) {
        console.error(`Container ${containerId} não encontrado`);
        return;
    }
    
    // URL do QR Code
    const qrURL = `${QR_CONFIG.BASE_URL}/?h=${hospitalId}&l=${leitoNumero}`;
    
    try {
        // Limpar container
        qrContainer.innerHTML = '';
        
        // Criar QR Code
        const qr = new QRCode(qrContainer, {
            text: qrURL,
            width: QR_CONFIG.QR_SIZE,
            height: QR_CONFIG.QR_SIZE,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel[QR_CONFIG.CORRECTION_LEVEL]
        });
        
        // Armazenar instância
        window.qrCodeInstances.push(qr);
        
        console.log(`✅ QR gerado: ${qrURL}`);
    } catch (error) {
        console.error(`❌ Erro ao gerar QR para ${containerId}:`, error);
        qrContainer.innerHTML = '<p style="color: red; font-size: 10px;">Erro ao gerar QR</p>';
    }
}

// =================== GERAR TODOS OS HOSPITAIS ===================
window.generateAllHospitals = function() {
    const container = document.getElementById('qrCodesGrid');
    
    // Limpar
    clearQRCodes();
    container.innerHTML = '';
    
    let totalQRs = 0;
    
    // Gerar para cada hospital
    Object.keys(QR_CONFIG.HOSPITAIS).forEach((hospitalId, hIndex) => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos || !QR_CONFIG.HOSPITAIS[hospitalId].ativo) return;
        
        // Título do hospital
        const title = document.createElement('h3');
        title.className = 'qr-grid-title hospital-separator';
        title.textContent = `${QR_CONFIG.HOSPITAIS[hospitalId].nome} - ${hospital.leitos.length} leitos`;
        container.appendChild(title);
        
        // Gerar QR para cada leito
        hospital.leitos.forEach((leito, index) => {
            const leitoNumero = leito.leito || leito.numero || leito.id || (index + 1);
            
            const qrDiv = document.createElement('div');
            qrDiv.className = 'qr-code-item';
            qrDiv.innerHTML = `
                <div class="qr-label">
                    <strong>${QR_CONFIG.HOSPITAIS[hospitalId].nome}</strong><br>
                    Leito ${leitoNumero}
                </div>
                <div id="qr-${hospitalId}-${leitoNumero}" class="qr-code-container"></div>
                <div class="qr-url">h=${hospitalId}&l=${leitoNumero}</div>
            `;
            container.appendChild(qrDiv);
            
            // Gerar com delay progressivo
            setTimeout(() => {
                generateSingleQR(hospitalId, leitoNumero);
            }, (totalQRs++) * 30);
        });
    });
    
    console.log(`✅ Gerando ${totalQRs} QR Codes para TODOS os hospitais`);
};

// =================== LIMPAR QR CODES ===================
function clearQRCodes() {
    // Limpar instâncias anteriores
    window.qrCodeInstances = [];
}

// =================== FECHAR MODAL ===================
window.closeQRModal = function() {
    const modal = document.querySelector('.qr-modal');
    if (modal) {
        clearQRCodes();
        modal.remove();
    }
};

// =================== IMPRIMIR QR CODES ===================
window.printQRCodes = function() {
    console.log('🖨️ Iniciando impressão - Layout 3x4 (12 QR/A4)...');
    window.print();
};

// =================== CSS DO SISTEMA ===================
const qrStyles = `
<style>
/* Modal de QR Codes */
.qr-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.qr-modal-content {
    background: white;
    border-radius: 16px;
    max-width: 95%;
    max-height: 90%;
    overflow: auto;
    padding: 25px;
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
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
    font-size: 22px;
}

.close-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
    transition: all 0.3s;
}

.close-btn:hover {
    background: #dc2626;
    transform: scale(1.05);
}

/* Info Box */
.qr-info-box {
    background: #f0f9ff;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.qr-info-box p {
    margin: 0 0 10px 0;
    color: #1e40af;
    font-weight: 600;
}

.qr-info-box ul {
    margin: 0;
    padding-left: 20px;
    color: #475569;
}

.qr-info-box code {
    background: #e0e7ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
}

/* Seletor de Hospital */
.qr-hospital-selector {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
    justify-content: center;
}

.qr-hospital-selector label {
    font-weight: 600;
    color: #374151;
    font-size: 16px;
}

.qr-hospital-selector select {
    padding: 12px 20px;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #1a1f2e;
    font-size: 16px;
    min-width: 200px;
    cursor: pointer;
}

.btn-generate-all {
    padding: 12px 24px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-generate-all:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

/* Grid de QR Codes */
.qr-codes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
    margin: 25px 0;
    padding: 20px;
    background: #f9fafb;
    border-radius: 12px;
}

.qr-grid-title {
    grid-column: 1 / -1;
    text-align: center;
    color: #1a1f2e;
    margin: 15px 0;
    font-size: 18px;
    font-weight: 600;
}

.hospital-separator {
    padding-top: 25px;
    border-top: 3px solid #e5e7eb;
    margin-top: 25px;
}

.hospital-separator:first-child {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
}

/* Item QR Code */
.qr-code-item {
    text-align: center;
    padding: 15px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    transition: all 0.3s;
}

.qr-code-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    border-color: #3b82f6;
}

.qr-label {
    font-size: 13px;
    margin-bottom: 10px;
    color: #1a1f2e;
    line-height: 1.4;
    min-height: 35px;
}

.qr-label strong {
    color: #3b82f6;
    font-size: 14px;
}

.qr-code-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
    background: white;
    border-radius: 8px;
    padding: 5px;
}

.qr-code-container img {
    max-width: 100%;
    height: auto;
}

.qr-url {
    font-size: 9px;
    color: #9ca3af;
    margin-top: 5px;
    font-family: monospace;
}

/* Ações */
.qr-actions {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
}

.btn-print {
    padding: 15px 40px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s;
}

.btn-print:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}

/* Scrollbar */
.qr-modal-content::-webkit-scrollbar {
    width: 8px;
}

.qr-modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.qr-modal-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.qr-modal-content::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* =================== IMPRESSÃO A4 - 12 QR CODES (3x4) =================== */
@media print {
    body * {
        visibility: hidden !important;
    }
    
    .qr-modal-content,
    .qr-modal-content * {
        visibility: visible !important;
    }
    
    .qr-modal-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        max-width: none;
        background: white;
        box-shadow: none;
        padding: 10mm;
    }
    
    /* Esconder elementos da interface */
    .qr-modal-header,
    .qr-actions,
    .qr-hospital-selector,
    .qr-info-box,
    .qr-url {
        display: none !important;
    }
    
    /* Grid 3x4 para A4 */
    .qr-codes-grid {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 10mm !important;
        padding: 0 !important;
        background: none !important;
    }
    
    /* Título do hospital */
    .qr-grid-title {
        grid-column: 1 / -1 !important;
        page-break-before: always;
        margin: 0 0 10mm 0 !important;
        font-size: 16pt !important;
    }
    
    .qr-grid-title:first-child {
        page-break-before: auto;
    }
    
    /* QR Code item */
    .qr-code-item {
        page-break-inside: avoid;
        break-inside: avoid;
        border: 1px solid #000 !important;
        padding: 5mm !important;
        width: 60mm !important;
        height: 70mm !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
    }
    
    /* Ajustar para exatamente 12 por página */
    .qr-code-item:nth-child(13n+2) {
        page-break-before: always;
    }
    
    .qr-label {
        font-size: 11pt !important;
        font-weight: bold !important;
        margin-bottom: 5mm !important;
    }
    
    .qr-code-container {
        flex: 1 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    }
    
    .qr-code-container canvas,
    .qr-code-container img {
        width: 40mm !important;
        height: 40mm !important;
    }
}

/* Responsividade */
@media (max-width: 768px) {
    .qr-modal-content {
        max-width: 100%;
        margin: 10px;
        padding: 15px;
    }
    
    .qr-hospital-selector {
        flex-direction: column;
        gap: 10px;
    }
    
    .qr-codes-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
    }
}
</style>
`;

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Inicializando Sistema QR Code V7.0...');
    
    // Adicionar estilos
    if (!document.getElementById('qrStyles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'qrStyles';
        styleElement.innerHTML = qrStyles;
        document.head.appendChild(styleElement);
        console.log('✅ Estilos QR Code carregados');
    }
    
    // Verificar e carregar biblioteca QRCode.js
    if (!checkQRLibrary()) {
        console.warn('⚠️ QRCode.js não encontrada, carregando...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => {
            console.log('✅ QRCode.js carregada com sucesso');
        };
        script.onerror = () => {
            console.error('❌ Falha ao carregar QRCode.js');
        };
        document.head.appendChild(script);
    }
    
    // Inicializar hospitalData
    if (!window.hospitalData) {
        window.hospitalData = {};
    }
    
    console.log('✅ Sistema QR Code V7.0 Pronto');
    console.log(`📱 URL Base: ${QR_CONFIG.BASE_URL}`);
    console.log('🖨️ Layout de impressão: 3x4 (12 QR/A4)');
    console.log('📍 Para usar: window.openQRCodes()');
});

// =================== EXPORT PARA DEBUG ===================
window.QR_CONFIG = QR_CONFIG;
console.log('💡 Config disponível em window.QR_CONFIG');

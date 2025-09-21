// =================== QRCODE.JS V6.0 - COM URL DEDICADA ===================
// SISTEMA QR CODE PARA IMPRESSÃO EM ACRÍLICO

// =================== CONFIGURAÇÃO ===================
const QR_BASE_URL = 'https://qrcode-seven-gamma.vercel.app';  // NOVA URL DEDICADA

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = window.hospitalData || {};

// =================== GERAR QR CODES PARA IMPRESSÃO ===================
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
                <h2>📱 QR Codes dos Leitos - Para Impressão em Acrílico</h2>
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
                    <button onclick="generateAllHospitals()" class="btn-generate-all">
                        🏥 Gerar Todos os Hospitais
                    </button>
                </div>
                <div id="qrCodesGrid" class="qr-codes-grid"></div>
                <div class="qr-actions">
                    <button onclick="printQRCodes()" class="btn-print">🖨️ Imprimir QR Codes</button>
                    <p style="color: #666; font-size: 12px; margin-top: 10px;">
                        ✅ QR Codes fixos apontando para: ${QR_BASE_URL}
                    </p>
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
    
    if (!hospital || !container) {
        console.error('❌ Hospital ou container não encontrado');
        return;
    }
    
    if (!hospital.leitos || hospital.leitos.length === 0) {
        container.innerHTML = '<p>Nenhum leito encontrado para este hospital.</p>';
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Título do hospital
    const title = document.createElement('h3');
    title.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #1a1f2e; margin: 20px 0;';
    title.textContent = `${hospital.nome} - ${hospital.leitos.length} leitos`;
    container.appendChild(title);
    
    // Gerar QR para cada leito
    hospital.leitos.forEach(leito => {
        const leitoNumero = leito.leito || leito.numero || leito.id || 'N/A';
        
        // Container do QR
        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-code-item';
        qrDiv.innerHTML = `
            <div class="qr-label">
                <strong>${hospital.nome}</strong><br>
                Leito ${leitoNumero}
            </div>
            <div id="qr-${hospitalId}-${leitoNumero}" class="qr-code-container"></div>
        `;
        container.appendChild(qrDiv);
        
        // URL do QR Code - NOVA URL DEDICADA
        const qrURL = `${QR_BASE_URL}/?h=${hospitalId}&l=${leitoNumero}`;
        
        // Gerar QR Code após DOM estar pronto
        setTimeout(() => {
            const qrContainer = document.getElementById(`qr-${hospitalId}-${leitoNumero}`);
            if (qrContainer) {
                qrContainer.innerHTML = ''; // Limpar
                
                try {
                    new QRCode(qrContainer, {
                        text: qrURL,
                        width: 150,
                        height: 150,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H // Alta correção para impressão
                    });
                    console.log(`✅ QR gerado: ${qrURL}`);
                } catch (error) {
                    console.error(`❌ Erro ao gerar QR para leito ${leitoNumero}:`, error);
                    qrContainer.innerHTML = '<p style="color: red; font-size: 12px;">Erro ao gerar QR</p>';
                }
            }
        }, 100);
    });
    
    console.log(`✅ ${hospital.leitos.length} QR Codes gerados para ${hospital.nome}`);
};

// =================== GERAR TODOS OS HOSPITAIS ===================
window.generateAllHospitals = function() {
    const container = document.getElementById('qrCodesGrid');
    container.innerHTML = '';
    
    // Gerar QR codes para todos os hospitais
    ['H1', 'H2', 'H3', 'H4'].forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        // Título do hospital
        const title = document.createElement('h3');
        title.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #1a1f2e; margin: 30px 0 20px; padding-top: 30px; border-top: 2px solid #e5e7eb;';
        title.textContent = `${hospital.nome} - ${hospital.leitos.length} leitos`;
        container.appendChild(title);
        
        // Gerar QR para cada leito
        hospital.leitos.forEach(leito => {
            const leitoNumero = leito.leito || leito.numero || leito.id || 'N/A';
            
            const qrDiv = document.createElement('div');
            qrDiv.className = 'qr-code-item';
            qrDiv.innerHTML = `
                <div class="qr-label">
                    <strong>${hospital.nome}</strong><br>
                    Leito ${leitoNumero}
                </div>
                <div id="qr-${hospitalId}-${leitoNumero}" class="qr-code-container"></div>
            `;
            container.appendChild(qrDiv);
            
            const qrURL = `${QR_BASE_URL}/?h=${hospitalId}&l=${leitoNumero}`;
            
            setTimeout(() => {
                const qrContainer = document.getElementById(`qr-${hospitalId}-${leitoNumero}`);
                if (qrContainer) {
                    qrContainer.innerHTML = '';
                    try {
                        new QRCode(qrContainer, {
                            text: qrURL,
                            width: 150,
                            height: 150,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    } catch (error) {
                        console.error(`Erro ao gerar QR:`, error);
                    }
                }
            }, 100);
        });
    });
    
    console.log('✅ QR Codes gerados para TODOS os hospitais');
};

// =================== FECHAR MODAL ===================
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
    background: rgba(0,0,0,0.8);
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
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e5e7eb;
}

.qr-modal-header h2 {
    color: #1a1f2e;
    margin: 0;
    font-size: 24px;
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

.qr-codes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin: 25px 0;
}

.qr-code-item {
    text-align: center;
    padding: 20px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
    transition: all 0.3s;
}

.qr-code-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    border-color: #3b82f6;
}

.qr-label {
    font-size: 14px;
    margin-bottom: 15px;
    color: #1a1f2e;
    line-height: 1.4;
}

.qr-label strong {
    color: #3b82f6;
    font-size: 15px;
}

.qr-code-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
    background: white;
    border-radius: 8px;
    padding: 10px;
}

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

/* Scrollbar customizada */
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
        background: white;
        box-shadow: none;
    }
    
    .qr-modal-header,
    .qr-actions,
    .qr-hospital-selector {
        display: none !important;
    }
    
    .qr-codes-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin: 0;
    }
    
    .qr-code-item {
        border: 1px solid #000;
        page-break-inside: avoid;
        break-inside: avoid;
    }
    
    .qr-label {
        font-size: 11px;
        font-weight: bold;
    }
}
</style>
`;

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar estilos
    if (!document.getElementById('qrStyles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'qrStyles';
        styleElement.innerHTML = qrStyles;
        document.head.appendChild(styleElement);
    }
    
    // Verificar se hospitalData existe
    if (!window.hospitalData) {
        window.hospitalData = {};
    }
    
    console.log('✅ Sistema QR Code V6.0 Carregado');
    console.log(`📱 URL dos QR Codes: ${QR_BASE_URL}`);
    console.log('🎯 Características:');
    console.log('  • QR Codes fixos para impressão em acrílico');
    console.log('  • Sistema dedicado sem autenticação');
    console.log('  • URL única por leito');
    console.log('  • Alta correção de erro para impressão');
});

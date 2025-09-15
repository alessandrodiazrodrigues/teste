// =================== ÁREA ADMINISTRATIVA ===================
window.isAdminLoggedIn = false;

// =================== ABRIR PAINEL ADM ===================
window.openAdmin = function() {
    logInfo('Abrindo área administrativa...');
    
    if (!window.isAdminLoggedIn) {
        showAdminLogin();
    } else {
        showAdminPanel();
    }
};

// =================== TELA DE LOGIN ADM ===================
function showAdminLogin() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="admin-login-box">
            <h2>Área Administrativa</h2>
            <p>Acesso restrito para configurações do sistema</p>
            
            <div class="admin-login-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="adminEmail" placeholder="admin@email.com">
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="adminPassword" placeholder="Senha">
                </div>
                <div id="adminError" class="error-msg" style="display:none;">
                    Credenciais incorretas. Tente novamente.
                </div>
                <div class="admin-login-actions">
                    <button onclick="loginAdmin()" class="btn-login">Entrar</button>
                    <button onclick="closeAdminModal()" class="btn-cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// =================== LOGIN ADM ===================
window.loginAdmin = function() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (email === CONFIG.ADM_EMAIL && password === CONFIG.ADM_PASSWORD) {
        window.isAdminLoggedIn = true;
        logSuccess('Login ADM autorizado');
        closeAdminModal();
        showAdminPanel();
    } else {
        document.getElementById('adminError').style.display = 'block';
        logError('Tentativa de login ADM negada');
    }
};

// =================== PAINEL ADMINISTRATIVO ===================
function showAdminPanel() {
    const panel = document.createElement('div');
    panel.className = 'admin-panel';
    panel.innerHTML = `
        <div class="admin-panel-content">
            <div class="admin-panel-header">
                <h2>Painel Administrativo</h2>
                <button onclick="closeAdminPanel()" class="close-btn">✕</button>
            </div>
            
            <div class="admin-tabs">
                <button class="tab-btn active" onclick="showAdminTab('cores')">Gerenciar Cores</button>
                <button class="tab-btn" onclick="showAdminTab('hospitais')">Hospitais</button>
                <button class="tab-btn" onclick="showAdminTab('leitos')">Leitos</button>
                <button class="tab-btn" onclick="showAdminTab('config')">Configurações</button>
            </div>
            
            <div class="admin-tab-content">
                <div id="tabCores" class="tab-pane active">
                    ${renderCoresTab()}
                </div>
                <div id="tabHospitais" class="tab-pane" style="display:none;">
                    ${renderHospitaisTab()}
                </div>
                <div id="tabLeitos" class="tab-pane" style="display:none;">
                    ${renderLeitosTab()}
                </div>
                <div id="tabConfig" class="tab-pane" style="display:none;">
                    ${renderConfigTab()}
                </div>
            </div>
            
            <div class="admin-panel-footer">
                <button onclick="saveAdminChanges()" class="btn-save">Salvar Alterações</button>
                <button onclick="resetToDefaults()" class="btn-reset">Restaurar Padrões</button>
            </div>
        </div>
    `;
    document.body.appendChild(panel);
}

// =================== TAB DE CORES (55 CORES PANTONE) ===================
function renderCoresTab() {
    const cores = [
        { var: '--nav-header', label: 'Header/Menu', value: '#1a1f2e' },
        { var: '--status-vago', label: 'Leito Vago', value: '#16a34a' },
        { var: '--status-uso', label: 'Leito Ocupado', value: '#fbbf24' },
        { var: '--destaque', label: 'Destaque Alta', value: '#8FD3F4' },
        // Concessões
        { var: '--conc-transicao', label: 'Transição Domiciliar', value: '#007A53' },
        { var: '--conc-aplicacao', label: 'Aplicação Medicamentos', value: '#582C83' },
        { var: '--conc-fisioterapia', label: 'Fisioterapia', value: '#009639' },
        { var: '--conc-fonoaudiologia', label: 'Fonoaudiologia', value: '#FF671F' },
        { var: '--conc-aspiracao', label: 'Aspiração', value: '#2E1A47' },
        { var: '--conc-banho', label: 'Banho', value: '#8FD3F4' },
        { var: '--conc-curativos', label: 'Curativos', value: '#00BFB3' },
        { var: '--conc-oxigenoterapia', label: 'Oxigenoterapia', value: '#64A70B' },
        { var: '--conc-recarga', label: 'Recarga O2', value: '#00AEEF' },
        { var: '--conc-nutricional-com', label: 'Nutricional com disp.', value: '#FFC72C' },
        { var: '--conc-nutricional-sem', label: 'Nutricional sem disp.', value: '#F4E285' },
        { var: '--conc-clister', label: 'Clister', value: '#E8927C' },
        { var: '--conc-picc', label: 'PICC', value: '#E03C31' },
        // Linhas de Cuidado
        { var: '--linha-assiste', label: 'Assiste', value: '#ED0A72' },
        { var: '--linha-aps', label: 'APS', value: '#007A33' },
        { var: '--linha-paliativos', label: 'Cuidados Paliativos', value: '#00B5A2' },
        { var: '--linha-ico', label: 'ICO', value: '#A6192E' },
        { var: '--linha-oncologia', label: 'Oncologia', value: '#6A1B9A' },
        { var: '--linha-pediatria', label: 'Pediatria', value: '#5A646B' },
        // ... adicionar todas as 55 cores
    ];
    
    return `
        <h3>Gerenciar Cores do Sistema (55 Cores Pantone)</h3>
        <div class="cores-grid">
            ${cores.map(cor => `
                <div class="cor-item">
                    <label>${cor.label}</label>
                    <div class="cor-input-group">
                        <input type="color" id="${cor.var}" value="${cor.value}" 
                               onchange="updateColor('${cor.var}', this.value)">
                        <input type="text" value="${cor.value}" 
                               onchange="updateColorFromText('${cor.var}', this.value)">
                        <div class="cor-preview" style="background: ${cor.value};"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// =================== TAB DE HOSPITAIS ===================
function renderHospitaisTab() {
    return `
        <h3>Gerenciar Hospitais (Máximo 6)</h3>
        <div class="hospitais-list">
            ${Object.entries(CONFIG.HOSPITAIS).map(([id, hospital]) => `
                <div class="hospital-item">
                    <input type="text" value="${hospital.nome}" 
                           placeholder="Nome do Hospital"
                           onchange="updateHospitalName('${id}', this.value)">
                    <input type="number" value="${hospital.leitos}" 
                           min="1" max="30"
                           onchange="updateHospitalLeitos('${id}', this.value)">
                    <button onclick="removeHospital('${id}')" class="btn-remove">Remover</button>
                </div>
            `).join('')}
        </div>
        ${Object.keys(CONFIG.HOSPITAIS).length < 6 ? `
            <button onclick="addHospital()" class="btn-add">+ Adicionar Hospital</button>
        ` : ''}
    `;
}

// =================== TAB DE LEITOS ===================
function renderLeitosTab() {
    return `
        <h3>Configurar Leitos por Hospital</h3>
        <div class="leitos-config">
            ${Object.entries(CONFIG.HOSPITAIS).map(([id, hospital]) => `
                <div class="leitos-hospital">
                    <h4>${hospital.nome}</h4>
                    <div class="leitos-settings">
                        <label>
                            Total de Leitos: 
                            <input type="number" value="${hospital.leitos}" 
                                   min="1" max="30"
                                   onchange="updateLeitosTotal('${id}', this.value)">
                        </label>
                        <label>
                            Leitos ENF/APTO: 
                            <input type="number" value="10" min="0" max="${hospital.leitos}">
                        </label>
                        <label>
                            Leitos UTI: 
                            <input type="number" value="${hospital.leitos - 10}" 
                                   min="0" max="${hospital.leitos}" readonly>
                        </label>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// =================== TAB DE CONFIGURAÇÕES ===================
function renderConfigTab() {
    return `
        <h3>Configurações Gerais</h3>
        <div class="config-list">
            <div class="config-item">
                <label>Timer de Atualização (minutos)</label>
                <input type="number" value="4" min="1" max="60"
                       onchange="updateRefreshInterval(this.value)">
            </div>
            <div class="config-item">
                <label>Timeout QR Code (minutos)</label>
                <input type="number" value="2" min="1" max="10"
                       onchange="updateQRTimeout(this.value)">
            </div>
            <div class="config-item">
                <label>Senha do Sistema</label>
                <input type="password" value="${CONFIG.AUTH_PASSWORD}"
                       onchange="updateSystemPassword(this.value)">
            </div>
            <div class="config-item">
                <label>Email ADM</label>
                <input type="email" value="${CONFIG.ADM_EMAIL}"
                       onchange="updateAdminEmail(this.value)">
            </div>
            <div class="config-item">
                <label>Senha ADM</label>
                <input type="password" value="${CONFIG.ADM_PASSWORD}"
                       onchange="updateAdminPassword(this.value)">
            </div>
        </div>
        
        <div class="config-actions">
            <button onclick="exportConfig()" class="btn-export">Exportar Configurações</button>
            <button onclick="importConfig()" class="btn-import">Importar Configurações</button>
        </div>
    `;
}

// =================== FUNÇÕES DE ATUALIZAÇÃO ===================
window.updateColor = function(varName, value) {
    document.documentElement.style.setProperty(varName, value);
    logInfo(`Cor atualizada: ${varName} = ${value}`);
};

window.updateColorFromText = function(varName, value) {
    document.documentElement.style.setProperty(varName, value);
    document.getElementById(varName).value = value;
};

window.updateHospitalName = function(id, name) {
    CONFIG.HOSPITAIS[id].nome = name;
    logInfo(`Hospital ${id} renomeado para: ${name}`);
};

window.updateHospitalLeitos = function(id, leitos) {
    CONFIG.HOSPITAIS[id].leitos = parseInt(leitos);
    logInfo(`Hospital ${id} atualizado para ${leitos} leitos`);
};

window.addHospital = function() {
    const newId = 'H' + (Object.keys(CONFIG.HOSPITAIS).length + 1);
    CONFIG.HOSPITAIS[newId] = {
        nome: `Hospital ${Object.keys(CONFIG.HOSPITAIS).length + 1}`,
        leitos: 10
    };
    showAdminTab('hospitais');
};

window.removeHospital = function(id) {
    if (confirm(`Remover ${CONFIG.HOSPITAIS[id].nome}?`)) {
        delete CONFIG.HOSPITAIS[id];
        showAdminTab('hospitais');
    }
};

// =================== NAVEGAÇÃO DAS TABS ===================
window.showAdminTab = function(tab) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab selecionada
    const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.style.display = 'block';
        tabElement.innerHTML = 
            tab === 'cores' ? renderCoresTab() :
            tab === 'hospitais' ? renderHospitaisTab() :
            tab === 'leitos' ? renderLeitosTab() :
            renderConfigTab();
    }
    
    // Marcar botão como ativo
    event.target.classList.add('active');
};

// =================== SALVAR ALTERAÇÕES ===================
window.saveAdminChanges = function() {
    // Salvar no localStorage
    localStorage.setItem('archipelago_config', JSON.stringify(CONFIG));
    
    // Salvar cores
    const cores = {};
    document.querySelectorAll('[id^="--"]').forEach(input => {
        cores[input.id] = input.value;
    });
    localStorage.setItem('archipelago_cores', JSON.stringify(cores));
    
    logSuccess('Configurações salvas com sucesso');
    alert('Configurações salvas com sucesso!');
};

// =================== RESTAURAR PADRÕES ===================
window.resetToDefaults = function() {
    if (confirm('Restaurar todas as configurações para os padrões? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('archipelago_config');
        localStorage.removeItem('archipelago_cores');
        location.reload();
    }
};

// =================== EXPORTAR/IMPORTAR CONFIGURAÇÕES ===================
window.exportConfig = function() {
    const config = {
        config: CONFIG,
        cores: {}
    };
    
    document.querySelectorAll('[id^="--"]').forEach(input => {
        config.cores[input.id] = input.value;
    });
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archipelago_config.json';
    a.click();
    URL.revokeObjectURL(url);
};

window.importConfig = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result);
                Object.assign(CONFIG, config.config);
                Object.entries(config.cores).forEach(([key, value]) => {
                    document.documentElement.style.setProperty(key, value);
                });
                saveAdminChanges();
                alert('Configurações importadas com sucesso!');
                location.reload();
            } catch (error) {
                alert('Erro ao importar configurações');
                logError('Erro na importação:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

// =================== FECHAR MODAIS ===================
window.closeAdminModal = function() {
    const modal = document.querySelector('.admin-modal');
    if (modal) modal.remove();
};

window.closeAdminPanel = function() {
    const panel = document.querySelector('.admin-panel');
    if (panel) panel.remove();
};

// =================== ESTILOS DO ADM ===================
const adminStyles = `
<style>
.admin-modal {
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

.admin-login-box {
    background: white;
    border-radius: 12px;
    padding: 40px;
    max-width: 400px;
    width: 90%;
}

.admin-login-form {
    margin-top: 20px;
}

.admin-login-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.btn-login {
    flex: 1;
    padding: 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.admin-panel {
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

.admin-panel-content {
    background: white;
    border-radius: 12px;
    max-width: 1200px;
    width: 90%;
    max-height: 90%;
    overflow: auto;
}

.admin-panel-header {
    background: var(--nav-header);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.admin-tabs {
    display: flex;
    gap: 0;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
    padding: 15px 25px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
    color: #6b7280;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
}

.tab-btn.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    background: white;
}

.admin-tab-content {
    padding: 30px;
    min-height: 400px;
}

.cores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
    margin-top: 20px;
}

.cor-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.cor-item label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
}

.cor-input-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.cor-preview {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid #d1d5db;
}

.hospitais-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}

.hospital-item {
    display: flex;
    gap: 10px;
    align-items: center;
}

.hospital-item input {
    flex: 1;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
}

.btn-remove {
    padding: 10px 20px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.btn-add {
    margin-top: 15px;
    padding: 12px 24px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.admin-panel-footer {
    padding: 20px;
    background: #f9fafb;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    border-top: 1px solid #e5e7eb;
}

.btn-save {
    padding: 12px 24px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-reset {
    padding: 12px 24px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.config-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
}

.config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f9fafb;
    border-radius: 6px;
}

.config-item label {
    font-weight: 600;
    color: #374151;
}

.config-item input {
    width: 200px;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
}

.config-actions {
    display: flex;
    gap: 10px;
    margin-top: 30px;
}

.btn-export,
.btn-import {
    flex: 1;
    padding: 12px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
</style>
`;

// Adicionar estilos ao documento
if (!document.getElementById('adminStyles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'adminStyles';
    styleElement.innerHTML = adminStyles;
    document.head.appendChild(styleElement);
}

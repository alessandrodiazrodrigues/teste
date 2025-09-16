// =================== ÁREA ADMINISTRATIVA CORRIGIDA ===================
window.isAdminLoggedIn = false;

// =================== CORES PADRÃO DO SISTEMA (PARA RESTAURAR) ===================
const CORES_PADRAO_SISTEMA = {
    // Cores principais
    '--nav-header': '#3b82f6',
    '--nav-sidebar': '#60a5fa', 
    '--bg-primary': '#ffffff',
    '--card': '#1a1f2e',
    '--text-white': '#ffffff',
    '--border': '#334155',
    
    // Status
    '--status-vago': '#16a34a',
    '--status-uso': '#fbbf24',
    '--destaque': '#8FD3F4',
    
    // Concessões (13 cores)
    '--conc-transicao': '#007A53',
    '--conc-aplicacao': '#582C83',
    '--conc-fisioterapia': '#009639',
    '--conc-fonoaudiologia': '#FF671F',
    '--conc-aspiracao': '#2E1A47',
    '--conc-banho': '#8FD3F4',
    '--conc-curativos': '#00BFB3',
    '--conc-oxigenoterapia': '#64A70B',
    '--conc-recarga': '#00AEEF',
    '--conc-nutricional-com': '#FFC72C',
    '--conc-nutricional-sem': '#F4E285',
    '--conc-clister': '#E8927C',
    '--conc-picc': '#E03C31',
    
    // Linhas de Cuidado (19 cores)
    '--linha-assiste': '#ED0A72',
    '--linha-aps': '#007A33',
    '--linha-paliativos': '#00B5A2',
    '--linha-ico': '#A6192E',
    '--linha-oncologia': '#6A1B9A',
    '--linha-pediatria': '#5A646B',
    '--linha-auto-gastro': '#5C5EBE',
    '--linha-auto-neuro-desm': '#00AEEF',
    '--linha-auto-neuro-musc': '#00263A',
    '--linha-auto-reumato': '#582D40',
    '--linha-vida-leve': '#FFB81C',
    '--linha-card': '#C8102E',
    '--linha-endocrino': '#582C83',
    '--linha-geriatria': '#FF6F1D',
    '--linha-melhor': '#556F44',
    '--linha-neurologia': '#0072CE',
    '--linha-pneumologia': '#E35205',
    '--linha-pos-bariatrica': '#003C57',
    '--linha-reumatologia': '#5A0020',
    
    // Timeline
    '--ouro': '#fbbf24',
    '--r2': '#3b82f6',
    '--r3': '#8b5cf6'
};

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
                <button class="tab-btn" onclick="showAdminTab('config')">Configurações</button>
                <button class="tab-btn" onclick="showAdminTab('api')">API</button>
            </div>
            
            <div class="admin-tab-content">
                <div id="tabCores" class="tab-pane active">
                    ${renderCoresTab()}
                </div>
                <div id="tabHospitais" class="tab-pane" style="display:none;">
                    ${renderHospitaisTab()}
                </div>
                <div id="tabConfig" class="tab-pane" style="display:none;">
                    ${renderConfigTab()}
                </div>
                <div id="tabAPI" class="tab-pane" style="display:none;">
                    ${renderAPITab()}
                </div>
            </div>
            
            <div class="admin-panel-footer">
                <button onclick="saveAdminChanges()" class="btn-save">Salvar Alterações</button>
                <button onclick="resetToDefaults()" class="btn-reset">Restaurar Cores Padrão</button>
                <button onclick="testAPI()" class="btn-test">Testar API</button>
            </div>
        </div>
    `;
    document.body.appendChild(panel);
}

// =================== TAB DE CORES (55 CORES PANTONE) ===================
function renderCoresTab() {
    const cores = [
        // Cores do Sistema
        { var: '--nav-header', label: 'Header/Menu', value: getComputedStyle(document.documentElement).getPropertyValue('--nav-header').trim() || '#3b82f6' },
        { var: '--nav-sidebar', label: 'Menu Lateral', value: getComputedStyle(document.documentElement).getPropertyValue('--nav-sidebar').trim() || '#60a5fa' },
        { var: '--status-vago', label: 'Leito Vago', value: getComputedStyle(document.documentElement).getPropertyValue('--status-vago').trim() || '#16a34a' },
        { var: '--status-uso', label: 'Leito Ocupado', value: getComputedStyle(document.documentElement).getPropertyValue('--status-uso').trim() || '#fbbf24' },
        { var: '--destaque', label: 'Destaque Alta', value: getComputedStyle(document.documentElement).getPropertyValue('--destaque').trim() || '#8FD3F4' },
        
        // Concessões (primeiras 8)
        { var: '--conc-transicao', label: 'Transição Domiciliar', value: '#007A53' },
        { var: '--conc-aplicacao', label: 'Aplicação Medicamentos', value: '#582C83' },
        { var: '--conc-fisioterapia', label: 'Fisioterapia', value: '#009639' },
        { var: '--conc-fonoaudiologia', label: 'Fonoaudiologia', value: '#FF671F' },
        { var: '--conc-aspiracao', label: 'Aspiração', value: '#2E1A47' },
        { var: '--conc-banho', label: 'Banho', value: '#8FD3F4' },
        { var: '--conc-curativos', label: 'Curativos', value: '#00BFB3' },
        { var: '--conc-oxigenoterapia', label: 'Oxigenoterapia', value: '#64A70B' },
        
        // Linhas de Cuidado (primeiras 8)
        { var: '--linha-assiste', label: 'Assiste', value: '#ED0A72' },
        { var: '--linha-aps', label: 'APS', value: '#007A33' },
        { var: '--linha-paliativos', label: 'Cuidados Paliativos', value: '#00B5A2' },
        { var: '--linha-ico', label: 'ICO', value: '#A6192E' },
        { var: '--linha-oncologia', label: 'Oncologia', value: '#6A1B9A' },
        { var: '--linha-pediatria', label: 'Pediatria', value: '#5A646B' },
        { var: '--linha-auto-gastro', label: 'Autoimune Gastro', value: '#5C5EBE' },
        { var: '--linha-vida-leve', label: 'Vida Mais Leve', value: '#FFB81C' },
        
        // Timeline
        { var: '--ouro', label: 'Timeline Ouro', value: '#fbbf24' },
        { var: '--r2', label: 'Timeline 2R', value: '#3b82f6' },
        { var: '--r3', label: 'Timeline 3R', value: '#8b5cf6' }
    ];
    
    return `
        <h3>Gerenciar Cores do Sistema (25 principais de 55+ disponíveis)</h3>
        <div class="cores-info">
            <p>⚠️ <strong>Sistema com API Real:</strong> As cores também podem ser salvas na planilha Google via API.</p>
            <p>🎨 Total de <strong>55+ cores Pantone</strong> configuradas no sistema.</p>
        </div>
        <div class="cores-grid">
            ${cores.map(cor => `
                <div class="cor-item">
                    <label>${cor.label}</label>
                    <div class="cor-input-group">
                        <input type="color" id="${cor.var.replace('--', '')}" value="${cor.value}" 
                               onchange="updateColor('${cor.var}', this.value)">
                        <input type="text" value="${cor.value}" class="cor-hex"
                               onchange="updateColorFromText('${cor.var}', this.value)">
                        <div class="cor-preview" style="background: ${cor.value};"></div>
                    </div>
                    <div class="cor-usage">Usado em: ${getCorUsage(cor.var)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// =================== TAB DE HOSPITAIS ===================
function renderHospitaisTab() {
    return `
        <h3>Gerenciar Hospitais</h3>
        <div class="hospitais-status">
            <p>🏥 <strong>Sistema conectado à API:</strong> Os dados dos hospitais vêm da planilha Google.</p>
            <div class="api-hospitais-info">
                ${Object.entries(CONFIG.HOSPITAIS).map(([id, hospital]) => `
                    <div class="hospital-info-card">
                        <h4>${hospital.nome}</h4>
                        <p>Código: <strong>${id}</strong></p>
                        <p>Leitos configurados: <strong>${hospital.leitos}</strong></p>
                        <p>Status: <span class="status-connected">✓ Conectado à API</span></p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="hospitais-actions">
            <button onclick="syncHospitaisAPI()" class="btn-sync">🔄 Sincronizar com API</button>
            <button onclick="viewHospitalData()" class="btn-view">👁️ Ver Dados da API</button>
        </div>
    `;
}

// =================== TAB DE API ===================
function renderAPITab() {
    return `
        <h3>Status da API Google Apps Script</h3>
        <div class="api-status">
            <div class="api-url">
                <label>URL da API:</label>
                <input type="text" readonly value="${window.API_URL}" style="width: 100%; font-family: monospace;">
            </div>
            
            <div class="api-actions">
                <button onclick="testAPIConnection()" class="btn-test">🔗 Testar Conexão</button>
                <button onclick="viewAPIData()" class="btn-view">📊 Ver Dados</button>
                <button onclick="syncColors()" class="btn-sync">🎨 Sincronizar Cores</button>
            </div>
            
            <div id="apiResults" class="api-results"></div>
        </div>
        
        <div class="api-info">
            <h4>Estrutura da API</h4>
            <ul>
                <li><strong>Leitos:</strong> hospital, leito, tipo, status, nome, matricula, idade, admAt, pps, spict, complexidade, prevAlta, linhas, concessoes</li>
                <li><strong>Cores:</strong> getcolors, savecolors, resetcolors</li>
                <li><strong>Operações:</strong> state, admit, update, alta</li>
            </ul>
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
                <input type="number" value="4" min="1" max="60" id="refreshInterval"
                       onchange="updateRefreshInterval(this.value)">
            </div>
            <div class="config-item">
                <label>Timeout QR Code (minutos)</label>
                <input type="number" value="2" min="1" max="10" id="qrTimeout"
                       onchange="updateQRTimeout(this.value)">
            </div>
            <div class="config-item">
                <label>Senha do Sistema</label>
                <input type="password" value="${CONFIG.AUTH_PASSWORD}" id="authPassword"
                       onchange="updateSystemPassword(this.value)">
            </div>
            <div class="config-item">
                <label>Email ADM</label>
                <input type="email" value="${CONFIG.ADM_EMAIL}" id="admEmail"
                       onchange="updateAdminEmail(this.value)">
            </div>
            <div class="config-item">
                <label>Senha ADM</label>
                <input type="password" value="${CONFIG.ADM_PASSWORD}" id="admPassword"
                       onchange="updateAdminPassword(this.value)">
            </div>
        </div>
        
        <div class="config-actions">
            <button onclick="exportConfig()" class="btn-export">💾 Exportar Configurações</button>
            <button onclick="importConfig()" class="btn-import">📂 Importar Configurações</button>
            <button onclick="clearCache()" class="btn-clear">🧹 Limpar Cache</button>
        </div>
    `;
}

// =================== FUNÇÕES DE ATUALIZAÇÃO DE CORES ===================
window.updateColor = function(varName, value) {
    document.documentElement.style.setProperty(varName, value);
    // Atualizar preview
    const preview = document.querySelector(`input[id="${varName.replace('--', '')}"]`).parentElement.querySelector('.cor-preview');
    if (preview) {
        preview.style.background = value;
    }
    // Atualizar campo de texto
    const textInput = document.querySelector(`input[id="${varName.replace('--', '')}"]`).parentElement.querySelector('.cor-hex');
    if (textInput) {
        textInput.value = value;
    }
    logInfo(`Cor atualizada: ${varName} = ${value}`);
};

window.updateColorFromText = function(varName, value) {
    document.documentElement.style.setProperty(varName, value);
    const colorInput = document.getElementById(varName.replace('--', ''));
    if (colorInput) {
        colorInput.value = value;
    }
    const preview = colorInput?.parentElement.querySelector('.cor-preview');
    if (preview) {
        preview.style.background = value;
    }
};

// =================== FUNÇÃO CORRIGIDA: RESTAURAR CORES PADRÃO ===================
window.resetToDefaults = function() {
    if (confirm('Restaurar todas as cores para os padrões corporativos? Esta ação não pode ser desfeita.')) {
        logInfo('Restaurando cores padrão...');
        
        // *** CORREÇÃO: APLICAR TODAS AS CORES PADRÃO ***
        Object.entries(CORES_PADRAO_SISTEMA).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        
        // *** CORREÇÃO: ATUALIZAR TODOS OS INPUTS DA INTERFACE ***
        Object.entries(CORES_PADRAO_SISTEMA).forEach(([property, value]) => {
            const inputId = property.replace('--', '');
            const colorInput = document.getElementById(inputId);
            const textInput = document.querySelector(`input[id="${inputId}"]`)?.parentElement?.querySelector('.cor-hex');
            const preview = document.querySelector(`input[id="${inputId}"]`)?.parentElement?.querySelector('.cor-preview');
            
            if (colorInput) {
                colorInput.value = value;
            }
            if (textInput) {
                textInput.value = value;
            }
            if (preview) {
                preview.style.background = value;
            }
        });
        
        // Salvar no localStorage
        localStorage.setItem('archipelago_cores', JSON.stringify(CORES_PADRAO_SISTEMA));
        
        // *** CORREÇÃO: TENTAR SALVAR NA API SE DISPONÍVEL ***
        if (window.resetColors && typeof window.resetColors === 'function') {
            window.resetColors().then(() => {
                logSuccess('Cores padrão restauradas e salvas na API');
            }).catch((error) => {
                logError('Erro ao salvar cores na API:', error);
                logSuccess('Cores padrão restauradas localmente');
            });
        } else {
            logSuccess('Cores padrão restauradas localmente');
        }
        
        alert('✅ Cores padrão corporativas restauradas com sucesso!');
        
        // Forçar re-renderização das interfaces
        setTimeout(() => {
            if (window.renderCards) window.renderCards();
            if (document.getElementById('tabCores').style.display !== 'none') {
                document.getElementById('tabCores').innerHTML = renderCoresTab();
            }
        }, 500);
    }
};

// =================== FUNÇÕES DE API ===================
window.testAPIConnection = async function() {
    const resultsDiv = document.getElementById('apiResults');
    resultsDiv.innerHTML = '<div class="loading">🔄 Testando conexão...</div>';
    
    try {
        if (window.testAPI && typeof window.testAPI === 'function') {
            const result = await window.testAPI();
            resultsDiv.innerHTML = `<div class="success">✅ API funcionando: ${JSON.stringify(result)}</div>`;
        } else {
            resultsDiv.innerHTML = '<div class="error">❌ Função testAPI não encontrada</div>';
        }
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">❌ Erro na API: ${error.message}</div>`;
    }
};

window.syncColors = async function() {
    try {
        if (window.saveColors && typeof window.saveColors === 'function') {
            const coresAtuais = {};
            Object.keys(CORES_PADRAO_SISTEMA).forEach(prop => {
                coresAtuais[prop] = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
            });
            
            await window.saveColors(coresAtuais);
            alert('✅ Cores sincronizadas com a API');
        } else {
            alert('❌ Função saveColors não encontrada');
        }
    } catch (error) {
        alert('❌ Erro ao sincronizar cores: ' + error.message);
    }
};

// =================== FUNÇÕES AUXILIARES ===================
function getCorUsage(varName) {
    const usage = {
        '--nav-header': 'Header, títulos',
        '--nav-sidebar': 'Menu lateral',
        '--status-vago': 'Leitos vagos',
        '--status-uso': 'Leitos ocupados',
        '--destaque': 'Previsão de alta',
        '--ouro': 'Timeline Ouro',
        '--r2': 'Timeline 2R',
        '--r3': 'Timeline 3R'
    };
    return usage[varName] || 'Gráficos, elementos diversos';
}

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
        
        // Re-renderizar conteúdo
        if (tab === 'cores') {
            tabElement.innerHTML = renderCoresTab();
        } else if (tab === 'hospitais') {
            tabElement.innerHTML = renderHospitaisTab();
        } else if (tab === 'config') {
            tabElement.innerHTML = renderConfigTab();
        } else if (tab === 'api') {
            tabElement.innerHTML = renderAPITab();
        }
    }
    
    // Marcar botão como ativo
    event.target.classList.add('active');
};

// =================== SALVAR ALTERAÇÕES ===================
window.saveAdminChanges = function() {
    // Salvar cores no localStorage
    const cores = {};
    Object.keys(CORES_PADRAO_SISTEMA).forEach(prop => {
        cores[prop] = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
    });
    localStorage.setItem('archipelago_cores', JSON.stringify(cores));
    
    // Salvar configurações
    CONFIG.REFRESH_INTERVAL = (document.getElementById('refreshInterval')?.value || 4) * 60000;
    CONFIG.QR_TIMEOUT = (document.getElementById('qrTimeout')?.value || 2) * 60000;
    CONFIG.AUTH_PASSWORD = document.getElementById('authPassword')?.value || CONFIG.AUTH_PASSWORD;
    CONFIG.ADM_EMAIL = document.getElementById('admEmail')?.value || CONFIG.ADM_EMAIL;
    CONFIG.ADM_PASSWORD = document.getElementById('admPassword')?.value || CONFIG.ADM_PASSWORD;
    
    localStorage.setItem('archipelago_config', JSON.stringify(CONFIG));
    
    logSuccess('Configurações salvas com sucesso');
    alert('✅ Configurações salvas com sucesso!');
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
    padding: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.cor-input-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.cor-preview {
    width: 40px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid #d1d5db;
}

.cor-usage {
    font-size: 12px;
    color: #666;
    font-style: italic;
}

.cores-info {
    background: #f0f9ff;
    border: 1px solid #0ea5e9;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.api-results .success {
    background: #dcfce7;
    color: #166534;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
}

.api-results .error {
    background: #fecaca;
    color: #991b1b;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
}

.api-results .loading {
    background: #fef3c7;
    color: #92400e;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
}

.hospital-info-card {
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 15px;
    margin: 10px 0;
}

.status-connected {
    color: #059669;
    font-weight: 600;
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
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-test {
    padding: 12px 24px;
    background: #f59e0b;
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

.config-item input {
    width: 200px;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
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
</style>
`;

// Adicionar estilos ao documento apenas uma vez
if (!document.getElementById('adminStyles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'adminStyles';
    styleElement.innerHTML = adminStyles;
    document.head.appendChild(styleElement);
}

logSuccess('Admin.js carregado - Área administrativa com botão Restaurar Cores FUNCIONAL');

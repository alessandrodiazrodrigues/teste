// =================== ÁREA ADMINISTRATIVA COMPLETA ===================
window.isAdminLoggedIn = false;

// =================== CORES PADRÃO DO SISTEMA (PANTONE) ===================
const CORES_PADRAO_SISTEMA = {
    // Cores principais do sistema
    '--nav-header': '#3b82f6',
    '--nav-sidebar': '#60a5fa', 
    '--bg-primary': '#ffffff',
    '--card': '#1a1f2e',
    '--text-white': '#ffffff',
    '--border': '#334155',
    
    // Status dos leitos
    '--status-vago': '#16a34a',
    '--status-uso': '#fbbf24',
    '--destaque': '#8FD3F4',
    
    // Concessões (13 cores Pantone)
    '--conc-transicao': '#007A53',        // Pantone 7724 C
    '--conc-aplicacao': '#582C83',        // Pantone 266 C
    '--conc-fisioterapia': '#009639',     // Pantone 347 C
    '--conc-fonoaudiologia': '#FF671F',   // Pantone 165 C
    '--conc-aspiracao': '#2E1A47',        // Pantone 2685 C
    '--conc-banho': '#8FD3F4',            // Pantone 2905 C
    '--conc-curativos': '#00BFB3',        // Pantone 3252 C
    '--conc-oxigenoterapia': '#64A70B',   // Pantone 368 C
    '--conc-recarga': '#00AEEF',          // Pantone 299 C
    '--conc-nutricional-com': '#FFC72C',  // Pantone 123 C
    '--conc-nutricional-sem': '#F4E285',  // Pantone 1205 C
    '--conc-clister': '#E8927C',          // Pantone 7415 C
    '--conc-picc': '#E03C31',             // Pantone 199 C
    
    // Linhas de Cuidado (19 cores Pantone)
    '--linha-assiste': '#ED0A72',         // Pantone 219 C
    '--linha-aps': '#007A33',             // Pantone 7739 C
    '--linha-paliativos': '#00B5A2',      // Pantone 3262 C
    '--linha-ico': '#A6192E',             // Pantone 7621 C
    '--linha-oncologia': '#6A1B9A',       // Pantone 2597 C
    '--linha-pediatria': '#5A646B',       // Pantone 431 C
    '--linha-auto-gastro': '#5C5EBE',     // Pantone 2725 C
    '--linha-auto-neuro-desm': '#00AEEF', // Pantone 299 C
    '--linha-auto-neuro-musc': '#00263A', // Pantone 295 C
    '--linha-auto-reumato': '#582D40',    // Pantone 7650 C
    '--linha-vida-leve': '#FFB81C',       // Pantone 1235 C
    '--linha-card': '#C8102E',            // Pantone 186 C
    '--linha-endocrino': '#582C83',       // Pantone 268 C
    '--linha-geriatria': '#FF6F1D',       // Pantone 1505 C
    '--linha-melhor': '#556F44',          // Pantone 5757 C
    '--linha-neurologia': '#0072CE',      // Pantone 285 C
    '--linha-pneumologia': '#E35205',     // Pantone 7416 C
    '--linha-pos-bariatrica': '#003C57',  // Pantone 548 C
    '--linha-reumatologia': '#5A0020',    // Pantone 505 C
    
    // Timeline
    '--ouro': '#fbbf24',
    '--r2': '#3b82f6',
    '--r3': '#8b5cf6'
};

// =================== CONFIGURAÇÃO DE HOSPITAIS PARA TOGGLE ===================
const HOSPITAIS_CONFIG = {
    H1: { nome: 'Neomater', ativo: true, leitos: 13 },
    H2: { nome: 'Cruz Azul', ativo: true, leitos: 16 },
    H3: { nome: 'Santa Marcelina', ativo: false, leitos: 7 },
    H4: { nome: 'Santa Clara', ativo: false, leitos: 13 }
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
    // Verificar se já existe modal
    const existingModal = document.querySelector('.admin-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="admin-login-box">
            <h2>🔐 Área Administrativa</h2>
            <p>Acesso restrito para configurações do sistema</p>
            
            <div class="admin-login-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="adminEmail" placeholder="admin@email.com" value="${CONFIG.ADM_EMAIL}">
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="adminPassword" placeholder="Senha">
                </div>
                <div id="adminError" class="error-msg" style="display:none;">
                    ❌ Credenciais incorretas. Tente novamente.
                </div>
            </div>
            
            <div class="admin-login-actions">
                <button onclick="loginAdmin()" class="btn-login">Entrar</button>
                <button onclick="closeAdminModal()" class="btn-cancel">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar listener para Enter
    const passwordField = document.getElementById('adminPassword');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.loginAdmin();
            }
        });
        passwordField.focus();
    }
}

// =================== LOGIN ADM ===================
window.loginAdmin = function() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (email === CONFIG.ADM_EMAIL && password === CONFIG.ADM_PASSWORD) {
        window.isAdminLoggedIn = true;
        logSuccess('✅ Login ADM autorizado');
        closeAdminModal();
        showAdminPanel();
    } else {
        document.getElementById('adminError').style.display = 'block';
        logError('❌ Tentativa de login ADM negada');
        
        // Limpar campos
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
};

// =================== PAINEL ADMINISTRATIVO PRINCIPAL ===================
function showAdminPanel() {
    // Verificar se já existe painel
    const existingPanel = document.querySelector('.admin-panel');
    if (existingPanel) existingPanel.remove();
    
    const panel = document.createElement('div');
    panel.className = 'admin-panel';
    panel.innerHTML = `
        <div class="admin-panel-content">
            <div class="admin-panel-header">
                <h2>⚙️ Painel Administrativo</h2>
                <button onclick="closeAdminPanel()" class="close-btn">✕</button>
            </div>
            
            <div class="admin-tabs">
                <button class="tab-btn active" onclick="showAdminTab(event, 'cores')">🎨 Cores</button>
                <button class="tab-btn" onclick="showAdminTab(event, 'hospitais')">🏥 Hospitais</button>
                <button class="tab-btn" onclick="showAdminTab(event, 'config')">⚙️ Sistema</button>
                <button class="tab-btn" onclick="showAdminTab(event, 'api')">🔗 API</button>
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
                <button onclick="saveAdminChanges()" class="btn-save">💾 Salvar Alterações</button>
                <button onclick="resetToDefaults()" class="btn-reset">🔄 Restaurar Cores</button>
                <button onclick="testAPIConnection()" class="btn-test">🧪 Testar API</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    addAdminStyles();
}

// =================== TAB DE CORES (55 CORES PANTONE) ===================
function renderCoresTab() {
    const coresOrganizadas = [
        // Sistema
        { categoria: '🎯 Sistema', cores: [
            { var: '--nav-header', label: 'Header/Menu', valor: '#3b82f6' },
            { var: '--nav-sidebar', label: 'Menu Lateral', valor: '#60a5fa' },
            { var: '--status-vago', label: 'Leito Vago', valor: '#16a34a' },
            { var: '--status-uso', label: 'Leito Ocupado', valor: '#fbbf24' },
            { var: '--destaque', label: 'Previsão Alta', valor: '#8FD3F4' }
        ]},
        
        // Concessões (primeiras 8)
        { categoria: '🏠 Concessões', cores: [
            { var: '--conc-transicao', label: 'Transição Domiciliar', valor: '#007A53' },
            { var: '--conc-aplicacao', label: 'Aplicação Medicamentos', valor: '#582C83' },
            { var: '--conc-fisioterapia', label: 'Fisioterapia', valor: '#009639' },
            { var: '--conc-fonoaudiologia', label: 'Fonoaudiologia', valor: '#FF671F' },
            { var: '--conc-aspiracao', label: 'Aspiração', valor: '#2E1A47' },
            { var: '--conc-banho', label: 'Banho', valor: '#8FD3F4' },
            { var: '--conc-curativos', label: 'Curativos', valor: '#00BFB3' },
            { var: '--conc-oxigenoterapia', label: 'Oxigenoterapia', valor: '#64A70B' }
        ]},
        
        // Linhas de Cuidado (primeiras 10)
        { categoria: '🩺 Linhas de Cuidado', cores: [
            { var: '--linha-assiste', label: 'Assiste', valor: '#ED0A72' },
            { var: '--linha-aps', label: 'APS', valor: '#007A33' },
            { var: '--linha-paliativos', label: 'Cuidados Paliativos', valor: '#00B5A2' },
            { var: '--linha-ico', label: 'ICO (Coronariana)', valor: '#A6192E' },
            { var: '--linha-oncologia', label: 'Oncologia', valor: '#6A1B9A' },
            { var: '--linha-pediatria', label: 'Pediatria', valor: '#5A646B' },
            { var: '--linha-auto-gastro', label: 'Auto-Gastro', valor: '#5C5EBE' },
            { var: '--linha-auto-neuro-desm', label: 'Auto-Neuro-Desm', valor: '#00AEEF' },
            { var: '--linha-card', label: 'Cardiologia', valor: '#C8102E' },
            { var: '--linha-neurologia', label: 'Neurologia', valor: '#0072CE' }
        ]},
        
        // Timeline
        { categoria: '⏰ Timeline', cores: [
            { var: '--ouro', label: 'OURO', valor: '#fbbf24' },
            { var: '--r2', label: '2R', valor: '#3b82f6' },
            { var: '--r3', label: '3R', valor: '#8b5cf6' }
        ]}
    ];
    
    return `
        <h3>🎨 Gerenciar Cores do Sistema</h3>
        <p>Sistema com 55+ cores Pantone organizadas por categoria</p>
        
        ${coresOrganizadas.map(categoria => `
            <div class="cores-categoria">
                <h4>${categoria.categoria}</h4>
                <div class="cores-grid">
                    ${categoria.cores.map(cor => {
                        const valorAtual = getComputedStyle(document.documentElement)
                            .getPropertyValue(cor.var).trim() || cor.valor;
                        
                        return `
                            <div class="cor-item">
                                <label>${cor.label}</label>
                                <div class="cor-input-group">
                                    <input type="color" value="${valorAtual}" class="cor-picker"
                                           onchange="updateColor('${cor.var}', this.value)">
                                    <input type="text" value="${valorAtual}" class="cor-hex"
                                           onchange="updateColorFromText('${cor.var}', this.value)"
                                           placeholder="#000000">
                                    <div class="cor-preview" style="background: ${valorAtual};"></div>
                                </div>
                                <small>Pantone: ${getCorPantone(cor.var)}</small>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('')}
    `;
}

// =================== TAB DE HOSPITAIS ===================
function renderHospitaisTab() {
    return `
        <h3>🏥 Gerenciar Hospitais</h3>
        <p>Configure quais hospitais aparecem no sistema</p>
        
        <div class="hospitais-toggle-grid">
            ${Object.entries(HOSPITAIS_CONFIG).map(([id, hospital]) => `
                <div class="hospital-toggle-card">
                    <div class="hospital-info">
                        <h4>${hospital.nome}</h4>
                        <p>Código: <strong>${id}</strong> | Leitos: <strong>${hospital.leitos}</strong></p>
                    </div>
                    <div class="hospital-toggle">
                        <label class="switch">
                            <input type="checkbox" ${hospital.ativo ? 'checked' : ''} 
                                   onchange="toggleHospital('${id}', this.checked)">
                            <span class="slider"></span>
                        </label>
                        <span class="status-text">${hospital.ativo ? '✅ Ativo' : '❌ Inativo'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="hospitais-info">
            <h4>ℹ️ Informações</h4>
            <ul>
                <li>Hospitais <strong>inativos</strong> não aparecem nos botões do menu</li>
                <li>Por padrão, <strong>Neomater</strong> e <strong>Cruz Azul</strong> estão ativos</li>
                <li>Para demonstrações, todos os 4 hospitais podem ser ativados</li>
                <li>Os dados vêm da API Google Apps Script em tempo real</li>
            </ul>
        </div>
    `;
}

// =================== TAB DE CONFIGURAÇÕES ===================
function renderConfigTab() {
    return `
        <h3>⚙️ Configurações do Sistema</h3>
        
        <div class="config-list">
            <div class="config-item">
                <label>🔄 Intervalo de Atualização (minutos)</label>
                <input type="number" id="refreshInterval" value="${CONFIG.REFRESH_INTERVAL / 60000}" min="1" max="60">
            </div>
            
            <div class="config-item">
                <label>⏱️ Timeout QR Code (minutos)</label>
                <input type="number" id="qrTimeout" value="${CONFIG.QR_TIMEOUT / 60000}" min="1" max="10">
            </div>
            
            <div class="config-item">
                <label>🔑 Senha de Usuário</label>
                <input type="password" id="authPassword" value="${CONFIG.AUTH_PASSWORD}">
            </div>
            
            <div class="config-item">
                <label>📧 Email Administrador</label>
                <input type="email" id="admEmail" value="${CONFIG.ADM_EMAIL}">
            </div>
            
            <div class="config-item">
                <label>🔐 Senha Administrador</label>
                <input type="password" id="admPassword" value="${CONFIG.ADM_PASSWORD}">
            </div>
        </div>
    `;
}

// =================== TAB DE API ===================
function renderAPITab() {
    return `
        <h3>🔗 Status da API Google Apps Script</h3>
        
        <div class="api-status">
            <div class="api-url-section">
                <label>📡 URL da API:</label>
                <input type="text" readonly value="${window.API_URL || 'Não configurada'}" 
                       style="width: 100%; font-family: monospace; margin-top: 5px;">
            </div>
            
            <div class="api-actions">
                <button onclick="testAPIConnection()" class="btn-test">🧪 Testar Conexão</button>
                <button onclick="syncColorsWithAPI()" class="btn-sync">🎨 Sincronizar Cores</button>
                <button onclick="viewAPIData()" class="btn-view">👁️ Ver Dados</button>
            </div>
            
            <div id="apiResults" class="api-results">
                <p>ℹ️ Clique em "Testar Conexão" para verificar o status</p>
            </div>
        </div>
        
        <div class="api-info">
            <h4>📊 Dados da API</h4>
            <ul>
                <li><strong>Leitos:</strong> Matrícula, Hospital, Leito, Tipo, Status</li>
                <li><strong>Beneficiários:</strong> Iniciais, Linha de Cuidado, Concessões</li>
                <li><strong>Timeline:</strong> Previsões OURO, 2R, 3R</li>
                <li><strong>Cores:</strong> Paleta Pantone salva na planilha</li>
            </ul>
        </div>
    `;
}

// =================== FUNÇÕES DE ATUALIZAÇÃO DE CORES ===================
window.updateColor = function(variable, value) {
    document.documentElement.style.setProperty(variable, value);
    
    // Atualizar campo de texto correspondente
    const textInput = document.querySelector(`input[onchange*="${variable}"][type="text"]`);
    if (textInput) {
        textInput.value = value;
    }
    
    // Atualizar preview
    const preview = textInput?.parentElement?.querySelector('.cor-preview');
    if (preview) {
        preview.style.background = value;
    }
    
    logInfo(`Cor ${variable} atualizada para ${value}`);
};

window.updateColorFromText = function(variable, value) {
    // Validar formato hex
    if (!/^#[0-9A-F]{6}$/i.test(value)) {
        alert('❌ Formato inválido! Use #RRGGBB (ex: #FF5733)');
        return;
    }
    
    document.documentElement.style.setProperty(variable, value);
    
    // Atualizar color picker correspondente
    const colorInput = document.querySelector(`input[onchange*="${variable}"][type="color"]`);
    if (colorInput) {
        colorInput.value = value;
    }
    
    // Atualizar preview
    const preview = colorInput?.parentElement?.querySelector('.cor-preview');
    if (preview) {
        preview.style.background = value;
    }
    
    logInfo(`Cor ${variable} atualizada para ${value}`);
};

// =================== TOGGLE DE HOSPITAIS ===================
window.toggleHospital = function(hospitalId, ativo) {
    HOSPITAIS_CONFIG[hospitalId].ativo = ativo;
    
    // Atualizar CONFIG global se existir
    if (window.CONFIG && window.CONFIG.HOSPITAIS && window.CONFIG.HOSPITAIS[hospitalId]) {
        window.CONFIG.HOSPITAIS[hospitalId].ativo = ativo;
    }
    
    // Atualizar interface do hospital
    const btn = document.querySelector(`[data-hospital="${hospitalId}"]`);
    if (btn) {
        btn.style.display = ativo ? 'block' : 'none';
    }
    
    // Se hospital ativo foi desabilitado e está selecionado, mudar para H1
    if (!ativo && window.currentHospital === hospitalId) {
        window.selectHospital('H1');
    }
    
    // Atualizar texto do status na interface admin
    const statusText = document.querySelector(`input[onchange*="${hospitalId}"]`)
        ?.parentElement?.parentElement?.querySelector('.status-text');
    if (statusText) {
        statusText.textContent = ativo ? '✅ Ativo' : '❌ Inativo';
    }
    
    logInfo(`Hospital ${hospitalId} (${HOSPITAIS_CONFIG[hospitalId].nome}) ${ativo ? 'ativado' : 'desativado'}`);
};

// =================== SALVAR ALTERAÇÕES ===================
window.saveAdminChanges = function() {
    try {
        // Salvar cores no localStorage
        const cores = {};
        Object.keys(CORES_PADRAO_SISTEMA).forEach(prop => {
            const valor = getComputedStyle(document.documentElement)
                .getPropertyValue(prop).trim();
            if (valor) {
                cores[prop] = valor;
            }
        });
        localStorage.setItem('archipelago_cores', JSON.stringify(cores));
        
        // Salvar configurações
        const novaConfig = {
            ...CONFIG,
            REFRESH_INTERVAL: (parseInt(document.getElementById('refreshInterval')?.value) || 4) * 60000,
            QR_TIMEOUT: (parseInt(document.getElementById('qrTimeout')?.value) || 2) * 60000,
            AUTH_PASSWORD: document.getElementById('authPassword')?.value || CONFIG.AUTH_PASSWORD,
            ADM_EMAIL: document.getElementById('admEmail')?.value || CONFIG.ADM_EMAIL,
            ADM_PASSWORD: document.getElementById('admPassword')?.value || CONFIG.ADM_PASSWORD,
            HOSPITAIS: HOSPITAIS_CONFIG
        };
        
        // Atualizar CONFIG global
        Object.assign(CONFIG, novaConfig);
        localStorage.setItem('archipelago_config', JSON.stringify(novaConfig));
        
        // Sincronizar com API se disponível
        if (window.saveColors && typeof window.saveColors === 'function') {
            window.saveColors(cores);
        }
        
        logSuccess('✅ Configurações salvas com sucesso');
        alert('✅ Configurações salvas com sucesso!\n\n' + 
              '🎨 Cores atualizadas\n' + 
              '🏥 Status dos hospitais salvos\n' + 
              '⚙️ Configurações do sistema salvas');
        
    } catch (error) {
        logError('❌ Erro ao salvar configurações: ' + error.message);
        alert('❌ Erro ao salvar configurações: ' + error.message);
    }
};

// =================== RESTAURAR CORES PADRÃO ===================
window.resetToDefaults = function() {
    if (confirm('🔄 Restaurar todas as cores para os valores padrão?\n\nEsta ação não pode ser desfeita.')) {
        Object.entries(CORES_PADRAO_SISTEMA).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        
        // Atualizar interface se estiver na tab de cores
        const tabCores = document.getElementById('tabCores');
        if (tabCores && tabCores.style.display !== 'none') {
            tabCores.innerHTML = renderCoresTab();
        }
        
        logSuccess('✅ Cores padrão restauradas');
        alert('✅ Cores padrão restauradas com sucesso!');
    }
};

// =================== TESTE DE API ===================
window.testAPIConnection = async function() {
    const resultsDiv = document.getElementById('apiResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading">🔄 Testando conexão com a API...</div>';
    
    try {
        // Testar se a função de API existe
        if (!window.testAPI || typeof window.testAPI !== 'function') {
            throw new Error('Função testAPI não encontrada');
        }
        
        const startTime = Date.now();
        const result = await window.testAPI();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resultsDiv.innerHTML = `
            <div class="success">
                <h4>✅ API Funcionando</h4>
                <p><strong>Tempo de resposta:</strong> ${responseTime}ms</p>
                <p><strong>Status:</strong> Conectado</p>
                <pre>${JSON.stringify(result, null, 2)}</pre>
            </div>
        `;
        
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="error">
                <h4>❌ Erro na API</h4>
                <p><strong>Erro:</strong> ${error.message}</p>
                <p><strong>Possíveis causas:</strong></p>
                <ul>
                    <li>URL da API incorreta</li>
                    <li>Problema de conectividade</li>
                    <li>Script Google Apps não implantado</li>
                    <li>Permissões da planilha</li>
                </ul>
            </div>
        `;
    }
};

// =================== SINCRONIZAR CORES COM API ===================
window.syncColorsWithAPI = async function() {
    try {
        const coresAtuais = {};
        Object.keys(CORES_PADRAO_SISTEMA).forEach(prop => {
            const valor = getComputedStyle(document.documentElement)
                .getPropertyValue(prop).trim();
            if (valor) {
                coresAtuais[prop] = valor;
            }
        });
        
        if (window.saveColors && typeof window.saveColors === 'function') {
            await window.saveColors(coresAtuais);
            alert('✅ Cores sincronizadas com a API Google Apps Script');
        } else {
            alert('❌ Função saveColors não encontrada');
        }
    } catch (error) {
        alert('❌ Erro ao sincronizar cores: ' + error.message);
    }
};

// =================== VISUALIZAR DADOS DA API ===================
window.viewAPIData = async function() {
    try {
        if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
            const dados = JSON.stringify(window.hospitalData, null, 2);
            
            // Criar modal para mostrar dados
            const modal = document.createElement('div');
            modal.className = 'admin-modal';
            modal.innerHTML = `
                <div class="admin-data-box">
                    <h3>📊 Dados Atuais da API</h3>
                    <pre style="max-height: 400px; overflow: auto;">${dados}</pre>
                    <button onclick="this.parentElement.parentElement.remove()" class="btn-cancel">Fechar</button>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            alert('ℹ️ Nenhum dado encontrado. Execute uma sincronização primeiro.');
        }
    } catch (error) {
        alert('❌ Erro ao visualizar dados: ' + error.message);
    }
};

// =================== NAVEGAÇÃO ENTRE TABS ===================
window.showAdminTab = function(event, tab) {
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
        
        // Re-renderizar conteúdo para atualizar dados
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
    if (event && event.target) {
        event.target.classList.add('active');
    }
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

// =================== FUNÇÕES AUXILIARES ===================
function getCorPantone(varName) {
    const pantoneMap = {
        '--linha-assiste': '219 C',
        '--linha-aps': '7739 C',
        '--linha-paliativos': '3262 C',
        '--conc-transicao': '7724 C',
        '--conc-aplicacao': '266 C',
        '--conc-fisioterapia': '347 C'
        // ... adicionar mais conforme necessário
    };
    return pantoneMap[varName] || 'Custom';
}

// =================== ESTILOS DO PAINEL ADMINISTRATIVO ===================
function addAdminStyles() {
    // Verificar se estilos já foram adicionados
    if (document.getElementById('adminStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'adminStyles';
    styles.textContent = `
        /* =================== ADMIN MODAL =================== */
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
            backdrop-filter: blur(5px);
        }
        
        .admin-login-box, .admin-data-box {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .admin-data-box {
            max-width: 800px;
            max-height: 80vh;
            overflow: auto;
        }
        
        /* =================== ADMIN PANEL =================== */
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
            backdrop-filter: blur(5px);
        }
        
        .admin-panel-content {
            background: white;
            border-radius: 12px;
            max-width: 1200px;
            width: 95%;
            max-height: 95vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .admin-panel-header {
            padding: 20px 30px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f9fafb;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 5px;
            border-radius: 4px;
        }
        
        .close-btn:hover {
            background: #f3f4f6;
            color: #374151;
        }
        
        /* =================== TABS =================== */
        .admin-tabs {
            display: flex;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            overflow-x: auto;
        }
        
        .tab-btn {
            padding: 15px 25px;
            background: none;
            border: none;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            white-space: nowrap;
        }
        
        .tab-btn:hover {
            background: #f3f4f6;
        }
        
        .tab-btn.active {
            background: white;
            border-bottom-color: #3b82f6;
            color: #3b82f6;
            font-weight: 600;
        }
        
        .admin-tab-content {
            flex: 1;
            overflow: auto;
            padding: 30px;
        }
        
        /* =================== CORES =================== */
        .cores-categoria {
            margin-bottom: 30px;
        }
        
        .cores-categoria h4 {
            margin-bottom: 15px;
            color: #374151;
            font-size: 18px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        
        .cores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .cor-item {
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fafafa;
            transition: all 0.3s ease;
        }
        
        .cor-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .cor-input-group {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-top: 10px;
        }
        
        .cor-picker {
            width: 50px;
            height: 40px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
        
        .cor-hex {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-family: monospace;
        }
        
        .cor-preview {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            border: 2px solid #e5e7eb;
        }
        
        /* =================== HOSPITAIS =================== */
        .hospitais-toggle-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .hospital-toggle-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fafafa;
            transition: all 0.3s ease;
        }
        
        .hospital-toggle-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .hospital-toggle {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        /* Toggle Switch */
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #10b981;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        /* =================== CONFIGURAÇÕES =================== */
        .config-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .config-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .config-item input {
            width: 250px;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
        }
        
        /* =================== API =================== */
        .api-status {
            background: #fafafa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .api-actions {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .api-results {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin-top: 20px;
            min-height: 100px;
        }
        
        .api-results .success {
            color: #065f46;
            background: #d1fae5;
            padding: 15px;
            border-radius: 6px;
        }
        
        .api-results .error {
            color: #991b1b;
            background: #fee2e2;
            padding: 15px;
            border-radius: 6px;
        }
        
        .api-results .loading {
            color: #1f2937;
            text-align: center;
            padding: 20px;
        }
        
        /* =================== FOOTER =================== */
        .admin-panel-footer {
            padding: 20px 30px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            flex-wrap: wrap;
        }
        
        .btn-save, .btn-reset, .btn-test, .btn-sync, .btn-view, .btn-login, .btn-cancel {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-save {
            background: #10b981;
            color: white;
        }
        
        .btn-reset {
            background: #3b82f6;
            color: white;
        }
        
        .btn-test, .btn-sync, .btn-view {
            background: #f59e0b;
            color: white;
        }
        
        .btn-login {
            background: #3b82f6;
            color: white;
            flex: 1;
        }
        
        .btn-cancel {
            background: #6b7280;
            color: white;
            flex: 1;
        }
        
        .btn-save:hover, .btn-reset:hover, .btn-test:hover, .btn-sync:hover, 
        .btn-view:hover, .btn-login:hover, .btn-cancel:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* =================== FORM GROUPS =================== */
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #374151;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 16px;
        }
        
        .error-msg {
            color: #dc2626;
            background: #fee2e2;
            padding: 10px;
            border-radius: 6px;
            margin-top: 10px;
        }
        
        /* =================== RESPONSIVIDADE =================== */
        @media (max-width: 768px) {
            .admin-panel-content {
                width: 98%;
                height: 98vh;
            }
            
            .admin-tab-content {
                padding: 20px;
            }
            
            .cores-grid {
                grid-template-columns: 1fr;
            }
            
            .hospitais-toggle-grid {
                grid-template-columns: 1fr;
            }
            
            .config-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .config-item input {
                width: 100%;
            }
            
            .admin-panel-footer {
                flex-direction: column;
            }
            
            .api-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// =================== INICIALIZAÇÃO ===================
// Carregar configurações salvas ao inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Carregar cores salvas
    const coresSalvas = localStorage.getItem('archipelago_cores');
    if (coresSalvas) {
        try {
            const cores = JSON.parse(coresSalvas);
            Object.entries(cores).forEach(([prop, value]) => {
                document.documentElement.style.setProperty(prop, value);
            });
            logInfo('✅ Cores carregadas do localStorage');
        } catch (error) {
            logError('❌ Erro ao carregar cores: ' + error.message);
        }
    }
    
    // Carregar configurações salvas
    const configSalva = localStorage.getItem('archipelago_config');
    if (configSalva) {
        try {
            const config = JSON.parse(configSalva);
            if (config.HOSPITAIS) {
                Object.assign(HOSPITAIS_CONFIG, config.HOSPITAIS);
            }
            logInfo('✅ Configurações carregadas do localStorage');
        } catch (error) {
            logError('❌ Erro ao carregar configurações: ' + error.message);
        }
    }
});

logInfo('✅ Admin.js carregado com sucesso - Sistema administrativo pronto');

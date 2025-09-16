// =================== CONFIGURAÇÕES GLOBAIS ===================
window.CONFIG = {
    AUTH_PASSWORD: '170284',
    ADM_EMAIL: 'cvcalessandro@gmail.com',
    ADM_PASSWORD: '9446',
    REFRESH_INTERVAL: 240000, // 4 minutos
    QR_TIMEOUT: 120000, // 2 minutos
    HOSPITAIS: {
        H1: { nome: "Neomater", leitos: 13 },
        H2: { nome: "Cruz Azul", leitos: 16 },
        H3: { nome: "Santa Marcelina", leitos: 7 },
        H4: { nome: "Santa Clara", leitos: 13 }
    }
};

// =================== VARIÁVEIS GLOBAIS ===================
window.currentHospital = 'H1';
window.currentView = 'leitos';
window.isAuthenticated = false;
window.refreshTimer = null;
window.timerInterval = null;

// =================== FUNÇÕES DE LOG (GLOBAIS) ===================
window.logInfo = function(msg) {
    console.log(`ℹ️ [INFO] ${msg}`);
};

window.logSuccess = function(msg) {
    console.log(`✅ [SUCCESS] ${msg}`);
};

window.logError = function(msg, error = null) {
    console.error(`❌ [ERROR] ${msg}`, error || '');
};

// =================== VERIFICAÇÃO DE AUTENTICAÇÃO ===================
window.checkAuthentication = function() {
    // Verificar se já está autenticado (sessionStorage)
    const isAuth = sessionStorage.getItem('archipelago_authenticated');
    if (isAuth === 'true') {
        window.isAuthenticated = true;
        return true;
    }
    return false;
};

// =================== MOSTRAR MODAL DE AUTENTICAÇÃO ===================
window.showAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Focar no campo de senha
        setTimeout(() => {
            const passwordField = document.getElementById('authPassword');
            if (passwordField) {
                passwordField.focus();
            }
        }, 100);
    }
};

// =================== AUTENTICAÇÃO ===================
window.authenticate = function() {
    const password = document.getElementById('authPassword').value;
    const errorDiv = document.getElementById('authError');
    
    if (password === CONFIG.AUTH_PASSWORD) {
        window.isAuthenticated = true;
        
        // Salvar autenticação na sessão
        sessionStorage.setItem('archipelago_authenticated', 'true');
        
        // Esconder modal e mostrar sistema
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
        
        // Inicializar sistema
        window.initSystem();
        logSuccess('Autenticação bem-sucedida');
    } else {
        if (errorDiv) {
            errorDiv.textContent = 'Senha incorreta. Tente novamente.';
            errorDiv.classList.remove('hidden');
        }
        document.getElementById('authPassword').value = '';
        logError('Senha incorreta');
    }
};

// =================== INICIALIZAÇÃO DO SISTEMA ===================
window.initSystem = function() {
    logInfo('Inicializando sistema...');
    
    // Testar API
    if (window.testAPI) {
        window.testAPI();
    }
    
    // Carregar dados dos hospitais (API real)
    if (window.loadHospitalData) {
        window.loadHospitalData();
    }
    
    // Iniciar timer
    window.startTimer();
    
    // Renderizar view inicial
    window.setActiveTab('leitos');
    
    logSuccess('Sistema inicializado');
};

// =================== TIMER DE ATUALIZAÇÃO ===================
window.startTimer = function() {
    let timeLeft = CONFIG.REFRESH_INTERVAL / 1000; // converter para segundos
    
    // Limpar timer anterior se existir
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
    
    window.timerInterval = setInterval(function() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        const timerElement = document.getElementById('updateTimer');
        if (timerElement) {
            timerElement.textContent = 
                `Próxima atualização em: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            window.updateData();
            timeLeft = CONFIG.REFRESH_INTERVAL / 1000;
        }
    }, 1000);
};

// =================== REFRESH DE DADOS ===================
window.updateData = function() {
    logInfo('Atualizando dados...');
    
    // Recarregar dados dos hospitais (API real)
    if (window.loadHospitalData) {
        window.loadHospitalData();
    }
    
    // Re-renderizar view atual
    if (window.currentView === 'leitos' && window.renderCards) {
        window.renderCards();
    } else if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
        window.renderDashboardHospitalar();
    } else if (window.currentView === 'dash2' && window.renderDashboardExecutivo) {
        window.renderDashboardExecutivo();
    }
    
    logSuccess('Dados atualizados');
};

// =================== NAVEGAÇÃO ENTRE TABS (CORRIGIDO - MENU SE FECHA) ===================
window.setActiveTab = function(tab) {
    logInfo(`Mudando para tab: ${tab}`);
    
    window.currentView = tab;
    
    // Esconder todas as seções
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar seção ativa
    let activeSection;
    if (tab === 'leitos') {
        activeSection = document.getElementById('leitosView');
    } else if (tab === 'dash1') {
        activeSection = document.getElementById('dash1');
    } else if (tab === 'dash2') {
        activeSection = document.getElementById('dash2');
    }
    
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }
    
    // Atualizar menu lateral
    document.querySelectorAll('.side-menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        }
    });
    
    // *** CORREÇÃO: FECHAR MENU AUTOMATICAMENTE APÓS CLICAR ***
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.classList.remove('menu-open');
    }
    
    // Renderizar conteúdo específico da tab
    setTimeout(() => {
        if (tab === 'leitos' && window.renderCards) {
            window.renderCards();
        } else if (tab === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        } else if (tab === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        }
    }, 100);
};

// =================== MENU LATERAL ===================
window.toggleMenu = function() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.classList.remove('menu-open');
    } else {
        menu.classList.add('open');
        if (overlay) overlay.classList.add('show');
        document.body.classList.add('menu-open');
    }
};

// =================== SELEÇÃO DE HOSPITAL ===================
window.selectHospital = function(hospitalId) {
    window.currentHospital = hospitalId;
    
    // Atualizar botões
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-hospital="${hospitalId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Re-renderizar cards
    if (window.renderCards) {
        window.renderCards();
    }
    
    logInfo(`Hospital selecionado: ${CONFIG.HOSPITAIS[hospitalId].nome}`);
};

// =================== FILTRAR CARDS ===================
window.filterCards = function() {
    const hospitalFilter = document.getElementById('hospitalFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    if (window.renderCards) {
        window.renderCards(hospitalFilter, statusFilter);
    }
};

// =================== FUNÇÕES DE CONFIGURAÇÃO ===================
window.openConfig = function() {
    logInfo('Abrindo configurações');
    alert('Configurações em desenvolvimento');
};

window.openQRGenerator = function() {
    if (window.openQRCodes) {
        window.openQRCodes();
    } else {
        logError('Sistema QR Code não carregado');
        alert('Sistema QR Code não disponível');
    }
};

// =================== MODAL FUNCTIONS ===================
window.closeModal = function() {
    const modal = document.getElementById('patientModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.savePatient = function() {
    // Implementar salvamento de paciente
    logInfo('Salvando paciente...');
    alert('Funcionalidade em desenvolvimento');
};

window.darAlta = function() {
    if (confirm('Confirma a alta do paciente?')) {
        logInfo('Processando alta...');
        alert('Alta processada com sucesso!');
        window.closeModal();
    }
};

// =================== INICIALIZAÇÃO DO APP ===================
window.initApp = function() {
    logInfo('Archipelago Dashboard V3.0 - Iniciando...');
    
    // Verificar autenticação
    if (window.checkAuthentication()) {
        // Já autenticado, mostrar sistema
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
        
        // Inicializar sistema
        window.initSystem();
    } else {
        // Mostrar tela de autenticação
        window.showAuthModal();
        
        // Adicionar listener para Enter na senha
        const passwordField = document.getElementById('authPassword');
        if (passwordField) {
            passwordField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    window.authenticate();
                }
            });
        }
    }
    
    logSuccess('App inicializado');
};

// =================== GERENCIAR CORES (Para integração com Admin) ===================
window.restoreDefaultColors = function() {
    const defaultColors = {
        '--nav-header': '#3b82f6',
        '--nav-sidebar': '#60a5fa',
        '--status-vago': '#16a34a',
        '--status-uso': '#fbbf24',
        '--destaque': '#8FD3F4'
    };
    
    Object.entries(defaultColors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });
    
    logSuccess('Cores padrão restauradas');
};

logSuccess('App.js carregado - Sistema configurado');

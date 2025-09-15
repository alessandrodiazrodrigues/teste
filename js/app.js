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

window.logError = function(msg) {
    console.error(`❌ [ERROR] ${msg}`);
};

// =================== AUTENTICAÇÃO ===================
window.authenticate = function() {
    const password = document.getElementById('authPassword').value;
    const errorDiv = document.getElementById('authError');
    
    if (password === CONFIG.AUTH_PASSWORD) {
        window.isAuthenticated = true;
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainHeader').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('mainFooter').style.display = 'block';
        
        // Inicializar sistema
        window.initSystem();
        logSuccess('Autenticação bem-sucedida');
    } else {
        errorDiv.textContent = 'Senha incorreta. Tente novamente.';
        errorDiv.style.display = 'block';
        document.getElementById('authPassword').value = '';
        logError('Senha incorreta');
    }
};

// =================== INICIALIZAÇÃO DO SISTEMA ===================
window.initSystem = function() {
    logInfo('Inicializando sistema...');
    
    // Carregar dados
    if (window.loadHospitalData) {
        window.loadHospitalData();
    }
    
    // Iniciar timer
    window.startTimer();
    
    // Renderizar view inicial
    window.switchView('leitos');
    
    logSuccess('Sistema inicializado');
};

// =================== TIMER DE ATUALIZAÇÃO ===================
window.startTimer = function() {
    let timeLeft = CONFIG.REFRESH_INTERVAL / 1000; // converter para segundos
    
    window.timerInterval = setInterval(function() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = 
            `Próxima atualização em: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            window.refreshData();
            timeLeft = CONFIG.REFRESH_INTERVAL / 1000;
        }
    }, 1000);
};

// =================== REFRESH DE DADOS ===================
window.refreshData = function() {
    logInfo('Atualizando dados...');
    
    if (window.loadHospitalData) {
        window.loadHospitalData();
    }
    
    // Re-renderizar view atual
    window.switchView(window.currentView);
    
    logSuccess('Dados atualizados');
};

// =================== NAVEGAÇÃO ===================
window.switchView = function(view) {
    // Esconder todas as views
    document.querySelectorAll('.view').forEach(v => {
        v.style.display = 'none';
    });
    
    // Mostrar view selecionada
    const viewElement = document.getElementById('view' + view.charAt(0).toUpperCase() + view.slice(1).replace('-', ''));
    if (viewElement) {
        viewElement.style.display = 'block';
        window.currentView = view;
        
        // Renderizar conteúdo específico
        switch(view) {
            case 'leitos':
                if (window.renderCards) window.renderCards();
                break;
            case 'dash-hospitalar':
                if (window.renderDashboardHospitalar) window.renderDashboardHospitalar();
                break;
            case 'dash-executivo':
                if (window.renderDashboardExecutivo) window.renderDashboardExecutivo();
                break;
        }
    }
    
    // Fechar menu
    window.closeMenu();
    
    logInfo(`View alterada para: ${view}`);
};

// =================== MENU LATERAL ===================
window.toggleMenu = function() {
    const menu = document.getElementById('sideMenu');
    menu.classList.toggle('open');
};

window.closeMenu = function() {
    const menu = document.getElementById('sideMenu');
    menu.classList.remove('open');
};

// =================== SELEÇÃO DE HOSPITAL ===================
window.selectHospital = function(hospitalId) {
    window.currentHospital = hospitalId;
    
    // Atualizar botões
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-hospital="${hospitalId}"]`).classList.add('active');
    
    // Re-renderizar cards
    if (window.renderCards) {
        window.renderCards();
    }
    
    logInfo(`Hospital selecionado: ${CONFIG.HOSPITAIS[hospitalId].nome}`);
};

// =================== INICIALIZAÇÃO ===================
window.initApp = function() {
    logInfo('Archipelago Dashboard V3.0 - Iniciando...');
    
    // Adicionar listener para Enter na senha
    document.getElementById('authPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            window.authenticate();
        }
    });
    
    // Focar no campo de senha
    document.getElementById('authPassword').focus();
};

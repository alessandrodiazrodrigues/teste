// =================== CONFIGURAÇÕES GLOBAIS ===================
window.CONFIG = {
    AUTH_PASSWORD: '170284',
    ADM_EMAIL: 'cvcalessandro@gmail.com',
    ADM_PASSWORD: '9446',
    REFRESH_INTERVAL: 240000, // 4 minutos
    QR_TIMEOUT: 120000, // 2 minutos
    HOSPITAIS: {
        H1: { nome: "Neomater", leitos: 13, ativo: true },
        H2: { nome: "Cruz Azul", leitos: 16, ativo: true },
        H3: { nome: "Santa Marcelina", leitos: 7, ativo: true },
        H4: { nome: "Santa Clara", leitos: 13, ativo: true }
    }
};

// =================== VARIÁVEIS GLOBAIS ===================
window.currentHospital = 'H1'; // *** SEMPRE INICIA COM NEOMATER ***
window.currentView = 'leitos';
window.isAuthenticated = false;
window.refreshTimer = null;
window.timerInterval = null;
window.isLoading = false; // *** NOVO: CONTROLE DE LOADING ***

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

// =================== MOSTRAR/ESCONDER LOADING ===================
window.showLoading = function(container = null, message = 'Carregando dados...') {
    window.isLoading = true;
    
    const loadingHTML = `
        <div class="loading-container" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 50px;
            min-height: 300px;
            background: rgba(26, 31, 46, 0.95);
            border-radius: 12px;
            color: white;
            text-align: center;
        ">
            <div class="spinner" style="
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-left-color: #60a5fa;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #60a5fa;">${message}</h3>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                Por favor, aguarde...
            </p>
        </div>
    `;
    
    if (container) {
        container.innerHTML = loadingHTML;
    } else {
        // Aplicar em todos os containers principais
        const containers = [
            'cardsContainer',
            'dashExecutivoContent', 
            'dashHospitalarContent'
        ];
        
        containers.forEach(containerId => {
            const element = document.getElementById(containerId);
            if (element) {
                element.innerHTML = loadingHTML;
            }
        });
    }
    
    // Adicionar CSS da animação se não existir
    if (!document.getElementById('loadingStyles')) {
        const style = document.createElement('style');
        style.id = 'loadingStyles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .loading-container {
                animation: fadeIn 0.3s ease-in;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
};

window.hideLoading = function() {
    window.isLoading = false;
    // Loading será removido quando o conteúdo for renderizado
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

// =================== INICIALIZAÇÃO DO SISTEMA (CORRIGIDA) ===================
window.initSystem = async function() {
    logInfo('Inicializando sistema...');
    
    // *** MOSTRAR LOADING IMEDIATAMENTE ***
    showLoading(null, 'Inicializando sistema...');
    
    try {
        // Testar API
        if (window.testAPI) {
            await window.testAPI();
        }
        
        // *** CARREGAR DADOS DOS HOSPITAIS ANTES DE RENDERIZAR ***
        if (window.loadHospitalData) {
            showLoading(null, 'Carregando dados dos hospitais...');
            await window.loadHospitalData();
        }
        
        // Iniciar timer
        window.startTimer();
        
        // *** RENDERIZAR VIEW INICIAL COM NEOMATER AUTOMATICAMENTE ***
        window.setActiveTab('leitos');
        
        // *** AGUARDAR UM POUCO E FORÇAR RENDERIZAÇÃO DO NEOMATER ***
        setTimeout(() => {
            if (window.renderCards) {
                showLoading(document.getElementById('cardsContainer'), 'Carregando leitos do Neomater...');
                setTimeout(() => {
                    window.renderCards();
                    hideLoading();
                }, 500);
            }
        }, 1000);
        
        logSuccess('Sistema inicializado com Neomater carregado');
        
    } catch (error) {
        logError('Erro na inicialização:', error);
        hideLoading();
        alert('Erro ao inicializar o sistema. Tente recarregar a página.');
    }
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

// =================== REFRESH DE DADOS (CORRIGIDO) ===================
window.updateData = async function() {
    logInfo('Atualizando dados...');
    
    try {
        // *** MOSTRAR LOADING DURANTE ATUALIZAÇÃO ***
        if (window.currentView === 'leitos') {
            showLoading(document.getElementById('cardsContainer'), 'Atualizando dados...');
        } else if (window.currentView === 'dash1') {
            showLoading(document.getElementById('dashHospitalarContent'), 'Atualizando gráficos...');
        } else if (window.currentView === 'dash2') {
            showLoading(document.getElementById('dashExecutivoContent'), 'Atualizando análises...');
        }
        
        // Recarregar dados dos hospitais (API real)
        if (window.loadHospitalData) {
            await window.loadHospitalData();
        }
        
        // Re-renderizar view atual com delay para mostrar loading
        setTimeout(() => {
            if (window.currentView === 'leitos' && window.renderCards) {
                window.renderCards();
            } else if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
                window.renderDashboardHospitalar();
            } else if (window.currentView === 'dash2' && window.renderDashboardExecutivo) {
                window.renderDashboardExecutivo();
            }
            hideLoading();
        }, 800);
        
        logSuccess('Dados atualizados');
        
    } catch (error) {
        logError('Erro na atualização:', error);
        hideLoading();
    }
};

// =================== NAVEGAÇÃO ENTRE TABS (CORRIGIDO COM LOADING) ===================
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
    
    // *** FECHAR MENU AUTOMATICAMENTE APÓS CLICAR ***
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.classList.remove('menu-open');
    }
    
    // *** RENDERIZAR CONTEÚDO COM LOADING ***
    setTimeout(() => {
        if (tab === 'leitos' && window.renderCards) {
            // Se não há dados, mostrar loading e carregar
            if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
                showLoading(document.getElementById('cardsContainer'), 'Carregando dados dos hospitais...');
                if (window.loadHospitalData) {
                    window.loadHospitalData().then(() => {
                        setTimeout(() => {
                            window.renderCards();
                            hideLoading();
                        }, 500);
                    });
                }
            } else {
                window.renderCards();
            }
        } else if (tab === 'dash1' && window.renderDashboardHospitalar) {
            showLoading(document.getElementById('dash1'), 'Carregando Dashboard Hospitalar...');
            setTimeout(() => {
                window.renderDashboardHospitalar();
                hideLoading();
            }, 800);
        } else if (tab === 'dash2' && window.renderDashboardExecutivo) {
            showLoading(document.getElementById('dash2'), 'Carregando Dashboard Executivo...');
            setTimeout(() => {
                window.renderDashboardExecutivo();
                hideLoading();
            }, 800);
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

// =================== SELEÇÃO DE HOSPITAL (CORRIGIDO COM LOADING) ===================
window.selectHospital = function(hospitalId) {
    // *** VERIFICAR SE HOSPITAL ESTÁ ATIVO ***
    if (!CONFIG.HOSPITAIS[hospitalId] || !CONFIG.HOSPITAIS[hospitalId].ativo) {
        logInfo(`Hospital ${hospitalId} está desabilitado`);
        return;
    }
    
    window.currentHospital = hospitalId;
    
    // Atualizar botões
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-hospital="${hospitalId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // *** RE-RENDERIZAR CARDS COM LOADING ***
    if (window.renderCards) {
        showLoading(document.getElementById('cardsContainer'), `Carregando leitos do ${CONFIG.HOSPITAIS[hospitalId].nome}...`);
        setTimeout(() => {
            window.renderCards();
            hideLoading();
        }, 500);
    }
    
    logInfo(`Hospital selecionado: ${CONFIG.HOSPITAIS[hospitalId].nome}`);
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

// =================== INICIALIZAÇÃO DO APP (CORRIGIDA) ===================
window.initApp = async function() {
    logInfo('Archipelago Dashboard V3.0 - Iniciando...');
    
    // Verificar autenticação
    if (window.checkAuthentication()) {
        // Já autenticado, mostrar sistema
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
        
        // *** INICIALIZAR SISTEMA COM LOADING ***
        await window.initSystem();
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

// =================== FUNÇÃO PARA OBTER HOSPITAIS ATIVOS ===================
window.getActiveHospitals = function() {
    return Object.entries(CONFIG.HOSPITAIS)
        .filter(([id, hospital]) => hospital.ativo)
        .map(([id, hospital]) => ({ id, ...hospital }));
};

// =================== FUNÇÃO PARA TOGGLEAR HOSPITAL ===================
window.toggleHospital = function(hospitalId, ativo) {
    if (CONFIG.HOSPITAIS[hospitalId]) {
        CONFIG.HOSPITAIS[hospitalId].ativo = ativo;
        
        // Atualizar interface
        const btn = document.querySelector(`[data-hospital="${hospitalId}"]`);
        if (btn) {
            if (ativo) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
                // Se hospital ativo foi desabilitado, mudar para H1
                if (window.currentHospital === hospitalId) {
                    window.selectHospital('H1');
                }
            }
        }
        
        logInfo(`Hospital ${hospitalId} ${ativo ? 'ativado' : 'desativado'}`);
        return true;
    }
    return false;
};

logSuccess('App.js carregado - Sistema configurado com carregamento automático e loading');

// =================== MAIN.JS - SISTEMA PRINCIPAL ===================

// Variáveis globais
let timerInterval = null;
let timeRemaining = 240; // 4 minutos em segundos
let currentTab = 'leitos';

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    logInfo('Iniciando Archipelago Dashboard v3.0');
    
    // Verificar autenticação
    if (!checkAuthentication()) {
        showAuthModal();
        return;
    }
    
    // Inicializar sistema
    initializeSystem();
});

// Função de inicialização principal
function initializeSystem() {
    logInfo('Sistema inicializando...');
    
    // Preparar dados para dashboards
    prepareDataForDashboards();
    
    // Carregar dados iniciais
    loadInitialData();
    
    // Iniciar timer de atualização
    startUpdateTimer();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Renderizar cards iniciais
    if (window.renderCards) {
        window.renderCards();
    }
    
    logSuccess('Sistema inicializado com sucesso');
}

// Preparar dados para dashboards
function prepareDataForDashboards() {
    // Garantir que os dados estejam no formato correto
    if (!window.hospitalData) {
        window.hospitalData = {
            H1: { 
                nome: 'Neomater', 
                leitos: Array(13).fill(null).map((_, i) => ({
                    id: `H1-L${i+1}`,
                    numero: i + 1,
                    tipo: i < 10 ? 'ENF/APTO' : 'UTI',
                    status: 'vago',
                    paciente: null
                }))
            },
            H2: { 
                nome: 'Cruz Azul', 
                leitos: Array(16).fill(null).map((_, i) => ({
                    id: `H2-L${i+1}`,
                    numero: i + 1,
                    tipo: i < 12 ? 'ENF/APTO' : 'UTI',
                    status: 'vago',
                    paciente: null
                }))
            },
            H3: { 
                nome: 'Santa Marcelina', 
                leitos: Array(7).fill(null).map((_, i) => ({
                    id: `H3-L${i+1}`,
                    numero: i + 1,
                    tipo: i < 5 ? 'ENF/APTO' : 'UTI',
                    status: 'vago',
                    paciente: null
                }))
            },
            H4: { 
                nome: 'Santa Clara', 
                leitos: Array(13).fill(null).map((_, i) => ({
                    id: `H4-L${i+1}`,
                    numero: i + 1,
                    tipo: i < 10 ? 'ENF/APTO' : 'UTI',
                    status: 'vago',
                    paciente: null
                }))
            }
        };
    }
    
    // Garantir que as listas estejam disponíveis globalmente
    if (!window.CONCESSOES_LIST) {
        window.CONCESSOES_LIST = [
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
    }
    
    if (!window.LINHAS_CUIDADO_LIST) {
        window.LINHAS_CUIDADO_LIST = [
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
    }
}

// Carregar dados iniciais
function loadInitialData() {
    logInfo('Carregando dados iniciais...');
    
    // Verificar se há dados salvos no localStorage
    const savedData = localStorage.getItem('archipelagoData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            window.hospitalData = parsedData.hospitals || window.hospitalData;
            logSuccess('Dados carregados do localStorage');
        } catch (error) {
            logError('Erro ao carregar dados salvos:', error);
        }
    }
    
    // Carregar dados da API se configurado
    if (window.fetchDataFromAPI) {
        window.fetchDataFromAPI();
    }
}

// Timer de atualização
function startUpdateTimer() {
    clearInterval(timerInterval);
    timeRemaining = 240; // 4 minutos
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        
        if (timeRemaining <= 0) {
            timeRemaining = 240;
            updateData();
        }
        
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('updateTimer');
    if (timerElement) {
        timerElement.textContent = `Próxima atualização em: ${display}`;
    }
}

// Função de atualização de dados
window.updateData = function() {
    logInfo('Atualizando dados...');
    
    // Resetar timer
    timeRemaining = 240;
    
    // Atualizar dados da API
    if (window.fetchDataFromAPI) {
        window.fetchDataFromAPI();
    }
    
    // Re-renderizar view atual
    if (currentTab === 'leitos' && window.renderCards) {
        window.renderCards();
    } else if (currentTab === 'dash1' && window.renderDashboardHospitalar) {
        window.renderDashboardHospitalar();
    } else if (currentTab === 'dash2' && window.renderDashboardExecutivo) {
        window.renderDashboardExecutivo();
    }
    
    // Salvar dados no localStorage
    saveDataToLocalStorage();
    
    logSuccess('Dados atualizados');
};

// Salvar dados no localStorage
function saveDataToLocalStorage() {
    try {
        const dataToSave = {
            hospitals: window.hospitalData,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('archipelagoData', JSON.stringify(dataToSave));
        logInfo('Dados salvos no localStorage');
    } catch (error) {
        logError('Erro ao salvar dados:', error);
    }
}

// Navegação entre tabs
window.setActiveTab = function(tab) {
    logInfo(`Mudando para tab: ${tab}`);
    
    currentTab = tab;
    
    // Esconder todas as seções
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar seção ativa
    let activeSection;
    if (tab === 'leitos') {
        activeSection = document.getElementById('leitosView');
    } else {
        activeSection = document.getElementById(tab);
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
    
    // Renderizar conteúdo específico da tab
    if (tab === 'leitos' && window.renderCards) {
        window.renderCards();
    } else if (tab === 'dash1') {
        setTimeout(() => {
            if (window.renderDashboardHospitalar) {
                window.renderDashboardHospitalar();
            }
        }, 100);
    } else if (tab === 'dash2') {
        setTimeout(() => {
            if (window.renderDashboardExecutivo) {
                window.renderDashboardExecutivo();
            }
        }, 100);
    }
    
    // Fechar menu em mobile
    if (window.innerWidth <= 1024) {
        closeMenu();
    }
};

// Toggle Menu
window.toggleMenu = function() {
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (sideMenu.classList.contains('open')) {
        closeMenu();
    } else {
        openMenu();
    }
};

function openMenu() {
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    sideMenu.classList.add('open');
    menuOverlay.classList.add('show');
    document.body.classList.add('menu-open');
}

function closeMenu() {
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
    document.body.classList.remove('menu-open');
}

// Event Listeners
function setupEventListeners() {
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    // Menu items
    document.querySelectorAll('.side-menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            if (tab) {
                setActiveTab(tab);
            }
        });
    });
    
    // Filtros
    const hospitalFilter = document.getElementById('hospitalFilter');
    if (hospitalFilter) {
        hospitalFilter.addEventListener('change', filterCards);
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterCards);
    }
    
    // Responsividade
    window.addEventListener('resize', handleResize);
}

// Filtrar cards
window.filterCards = function() {
    const hospitalFilter = document.getElementById('hospitalFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    if (window.renderCards) {
        window.renderCards(hospitalFilter, statusFilter);
    }
};

// Handle resize
function handleResize() {
    if (window.innerWidth > 1024) {
        closeMenu();
    }
}

// Funções de configuração
window.openConfig = function() {
    logInfo('Abrindo configurações');
    alert('Configurações em desenvolvimento');
};

window.openQRGenerator = function() {
    logInfo('Abrindo gerador de QR Codes');
    alert('Gerador de QR Codes em desenvolvimento');
};

window.openAdmin = function() {
    logInfo('Abrindo área administrativa');
    alert('Área administrativa em desenvolvimento');
};

// Modal functions
window.closeModal = function() {
    const modal = document.getElementById('patientModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// Funções utilitárias
window.logInfo = function(message) {
    console.log(`%c[INFO] ${message}`, 'color: #3b82f6');
};

window.logSuccess = function(message) {
    console.log(`%c[SUCCESS] ${message}`, 'color: #10b981');
};

window.logWarning = function(message) {
    console.warn(`%c[WARNING] ${message}`, 'color: #f59e0b');
};

window.logError = function(message, error) {
    console.error(`%c[ERROR] ${message}`, 'color: #ef4444', error);
};

// Inicializar
logSuccess('Main.js carregado - Sistema pronto');

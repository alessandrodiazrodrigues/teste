// =================== MAIN.JS - CONTROLADOR PRINCIPAL ===================

// =================== INICIALIZAÇÃO GLOBAL ===================
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os módulos foram carregados
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            window.initApp();
        } else {
            console.error('initApp não encontrada - verificar carregamento dos módulos');
        }
    }, 100);
});

// =================== FUNÇÕES DE UTILIDADE ===================
window.formatarData = function(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
};

window.formatarHora = function(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

window.calcularIdade = function(dataNascimento) {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade;
};

// =================== GERENCIAMENTO DE ESTADO ===================
window.getSystemState = function() {
    return {
        authenticated: window.isAuthenticated,
        currentView: window.currentView,
        currentHospital: window.currentHospital,
        hospitalsData: window.hospitalData
    };
};

window.saveSystemState = function() {
    try {
        const state = window.getSystemState();
        localStorage.setItem('archipelago_state', JSON.stringify(state));
        logInfo('Estado do sistema salvo');
    } catch (error) {
        logError('Erro ao salvar estado do sistema', error);
    }
};

window.loadSystemState = function() {
    try {
        const savedState = localStorage.getItem('archipelago_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Restaurar apenas dados seguros (não autenticação)
            if (state.currentView) {
                window.currentView = state.currentView;
            }
            if (state.currentHospital) {
                window.currentHospital = state.currentHospital;
            }
            
            logInfo('Estado do sistema carregado');
            return state;
        }
    } catch (error) {
        logError('Erro ao carregar estado do sistema', error);
    }
    return null;
};

// =================== TRATAMENTO DE ERROS GLOBAIS ===================
window.addEventListener('error', function(event) {
    logError('Erro JavaScript:', event.error);
    
    // Mostrar erro para desenvolvimento (remover em produção)
    if (event.error && event.error.stack) {
        console.group('🔍 Detalhes do Erro:');
        console.error('Mensagem:', event.error.message);
        console.error('Arquivo:', event.filename);
        console.error('Linha:', event.lineno);
        console.error('Stack:', event.error.stack);
        console.groupEnd();
    }
});

window.addEventListener('unhandledrejection', function(event) {
    logError('Promise rejeitada:', event.reason);
    event.preventDefault(); // Previne que apareça no console como erro não tratado
});

// =================== RESPONSIVIDADE ===================
window.addEventListener('resize', function() {
    // Fechar menu em telas grandes
    if (window.innerWidth > 1024) {
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        
        if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.classList.remove('menu-open');
        }
    }
    
    // Re-renderizar gráficos se necessário
    if (window.chartInstances && Object.keys(window.chartInstances).length > 0) {
        setTimeout(() => {
            Object.values(window.chartInstances).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }, 100);
    }
});

// =================== ATALHOS DE TECLADO ===================
document.addEventListener('keydown', function(event) {
    // Alt + 1, 2, 3 para navegar entre tabs
    if (event.altKey && !event.ctrlKey && !event.shiftKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                if (window.setActiveTab) window.setActiveTab('leitos');
                break;
            case '2':
                event.preventDefault();
                if (window.setActiveTab) window.setActiveTab('dash1');
                break;
            case '3':
                event.preventDefault();
                if (window.setActiveTab) window.setActiveTab('dash2');
                break;
        }
    }
    
    // Esc para fechar modais
    if (event.key === 'Escape') {
        // Fechar menu lateral
        const menu = document.getElementById('sideMenu');
        if (menu && menu.classList.contains('open')) {
            window.toggleMenu();
        }
        
        // Fechar modais
        const modals = document.querySelectorAll('.modal:not(.hidden), .admin-modal, .qr-modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close-btn, .modal-close, [onclick*="close"]');
            if (closeBtn) closeBtn.click();
        });
    }
    
    // Ctrl + R para atualizar dados
    if (event.ctrlKey && event.key === 'r' && window.isAuthenticated) {
        event.preventDefault();
        if (window.updateData) window.updateData();
    }
});

// =================== LIFECYCLE HOOKS ===================
window.addEventListener('beforeunload', function(event) {
    // Salvar estado antes de sair
    window.saveSystemState();
    
    // Limpar timers
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
    
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
    }
});

// =================== DETECÇÃO DE CONECTIVIDADE ===================
window.addEventListener('online', function() {
    logSuccess('Conexão restaurada');
    
    // Atualizar dados quando voltar online
    if (window.isAuthenticated && window.updateData) {
        setTimeout(() => {
            window.updateData();
        }, 2000);
    }
});

window.addEventListener('offline', function() {
    logInfo('Sem conexão com internet');
});

// =================== PERFORMANCE MONITORING ===================
window.addEventListener('load', function() {
    // Medir performance de carregamento
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        logInfo(`Página carregada em ${loadTime}ms`);
    }
    
    // Verificar se todos os módulos críticos foram carregados
    const requiredModules = [
        'CONFIG', 'loadHospitalData', 'renderCards', 
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'authenticate', 'setActiveTab'
    ];
    
    const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');
    
    if (missingModules.length > 0) {
        logError('Módulos não carregados:', missingModules.join(', '));
    } else {
        logSuccess('Todos os módulos críticos carregados');
    }
});

// =================== DEBUG HELPERS (Remover em produção) ===================
window.debug = {
    getState: () => window.getSystemState(),
    getHospitalData: () => window.hospitalData,
    getConfig: () => window.CONFIG,
    reloadData: () => window.loadHospitalData && window.loadHospitalData(),
    testAuth: (password) => {
        document.getElementById('authPassword').value = password;
        window.authenticate();
    }
};

// =================== POLYFILLS PARA BROWSERS ANTIGOS ===================
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength) {
            return String(this);
        }
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length);
        }
        return padString.slice(0, targetLength) + String(this);
    };
}

// =================== INICIALIZAÇÃO FINAL ===================
logSuccess('Main.js carregado - Sistema pronto para inicialização');

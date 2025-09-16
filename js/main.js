// =================== MAIN.JS - CONTROLADOR PRINCIPAL ATUALIZADO ===================

// =================== INICIALIZAÇÃO GLOBAL ===================
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar carregamento de todos os módulos
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            window.initApp();
        } else {
            console.error('initApp não encontrada - verificar carregamento dos módulos');
            // Fallback: tentar inicializar manualmente
            setTimeout(() => {
                tryManualInit();
            }, 1000);
        }
    }, 100);
});

// =================== INICIALIZAÇÃO MANUAL (FALLBACK) ===================
function tryManualInit() {
    console.log('🔄 Tentando inicialização manual...');
    
    // Verificar se funções críticas existem
    const criticalFunctions = [
        'authenticate', 'logInfo', 'logSuccess', 'logError',
        'loadHospitalData', 'renderCards', 'CONFIG'
    ];
    
    const missing = criticalFunctions.filter(fn => typeof window[fn] === 'undefined');
    
    if (missing.length > 0) {
        console.error('❌ Funções críticas não encontradas:', missing);
        showInitError(missing);
        return;
    }
    
    // Se todas as funções existem, inicializar
    window.initApp();
}

// =================== MOSTRAR ERRO DE INICIALIZAÇÃO ===================
function showInitError(missingFunctions) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1f2e; color: white; font-family: Arial, sans-serif;">
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 12px; max-width: 500px;">
                <h1 style="color: #ef4444; margin-bottom: 20px;">❌ Erro de Carregamento</h1>
                <p style="margin-bottom: 20px;">Algumas funções críticas não foram carregadas:</p>
                <ul style="text-align: left; color: #fbbf24;">
                    ${missingFunctions.map(fn => `<li>${fn}</li>`).join('')}
                </ul>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🔄 Recarregar Página
                </button>
            </div>
        </div>
    `;
}

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
        authenticated: window.isAuthenticated || false,
        currentView: window.currentView || 'leitos',
        currentHospital: window.currentHospital || 'H1',
        hospitalsData: window.hospitalData || {},
        apiConnected: typeof window.API_URL !== 'undefined',
        timestamp: new Date().toISOString()
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
    if (typeof window.logError === 'function') {
        logError('Erro JavaScript:', event.error);
    } else {
        console.error('❌ Erro JavaScript:', event.error);
    }
    
    // Mostrar erro detalhado no console
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
    if (typeof window.logError === 'function') {
        logError('Promise rejeitada:', event.reason);
    } else {
        console.error('❌ Promise rejeitada:', event.reason);
    }
    event.preventDefault();
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
                    try {
                        chart.resize();
                    } catch (error) {
                        console.warn('Erro ao redimensionar gráfico:', error);
                    }
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
            if (window.toggleMenu) window.toggleMenu();
        }
        
        // Fechar modais administrativos
        const adminModal = document.querySelector('.admin-modal');
        const adminPanel = document.querySelector('.admin-panel');
        if (adminModal && window.closeAdminModal) {
            window.closeAdminModal();
        } else if (adminPanel && window.closeAdminPanel) {
            window.closeAdminPanel();
        }
        
        // Fechar outros modais
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close, [onclick*="close"]');
            if (closeBtn) closeBtn.click();
        });
    }
    
    // Ctrl + R para atualizar dados
    if (event.ctrlKey && event.key === 'r' && window.isAuthenticated) {
        event.preventDefault();
        if (window.updateData) {
            window.updateData();
        } else if (window.loadHospitalData) {
            window.loadHospitalData();
        }
    }
    
    // Ctrl + A para área administrativa
    if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        if (window.openAdmin) {
            window.openAdmin();
        }
    }
});

// =================== LIFECYCLE HOOKS ===================
window.addEventListener('beforeunload', function(event) {
    // Salvar estado antes de sair
    if (window.saveSystemState) {
        window.saveSystemState();
    }
    
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
    if (typeof window.logSuccess === 'function') {
        logSuccess('Conexão restaurada');
    }
    
    // Testar API quando voltar online
    if (window.isAuthenticated && window.testAPI) {
        setTimeout(() => {
            window.testAPI();
        }, 2000);
    }
    
    // Atualizar dados quando voltar online
    if (window.isAuthenticated && window.loadHospitalData) {
        setTimeout(() => {
            window.loadHospitalData();
        }, 3000);
    }
});

window.addEventListener('offline', function() {
    if (typeof window.logInfo === 'function') {
        logInfo('Sem conexão com internet - usando dados em cache');
    }
});

// =================== PERFORMANCE MONITORING ===================
window.addEventListener('load', function() {
    // Medir performance de carregamento
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 Página carregada em ${loadTime}ms`);
    }
    
    // Verificar se todos os módulos críticos foram carregados
    const requiredModules = [
        'CONFIG', 'loadHospitalData', 'renderCards', 
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'authenticate', 'setActiveTab', 'API_URL'
    ];
    
    const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');
    
    if (missingModules.length > 0) {
        console.error('❌ Módulos não carregados:', missingModules.join(', '));
        
        // Tentar carregar módulos faltantes após um tempo
        setTimeout(() => {
            const stillMissing = requiredModules.filter(module => typeof window[module] === 'undefined');
            if (stillMissing.length === 0) {
                console.log('✅ Todos os módulos carregados após retry');
            }
        }, 2000);
    } else {
        console.log('✅ Todos os módulos críticos carregados');
    }
    
    // Log da estrutura carregada
    console.log('📁 Estrutura do sistema:', {
        hospitais: window.CONFIG?.HOSPITAIS ? Object.keys(window.CONFIG.HOSPITAIS).length : 0,
        apiUrl: window.API_URL ? 'Configurada' : 'Não configurada',
        cores: window.CHART_COLORS ? Object.keys(window.CHART_COLORS).length : 0,
        funcoesCriticas: requiredModules.filter(module => typeof window[module] !== 'undefined').length
    });
});

// =================== MONITORAMENTO DA API ===================
window.monitorAPI = function() {
    if (!window.API_URL || !window.testAPI) return;
    
    const interval = 5 * 60 * 1000; // 5 minutos
    
    setInterval(async () => {
        try {
            await window.testAPI();
            // API funcionando
        } catch (error) {
            if (typeof window.logError === 'function') {
                logError('API não responsiva:', error);
            }
        }
    }, interval);
};

// =================== DEBUG HELPERS (Ambiente de desenvolvimento) ===================
window.debug = {
    getState: () => window.getSystemState(),
    getHospitalData: () => window.hospitalData,
    getConfig: () => window.CONFIG,
    getChartInstances: () => window.chartInstances,
    reloadData: () => {
        if (window.loadHospitalData) {
            return window.loadHospitalData();
        }
    },
    testAuth: (password) => {
        const input = document.getElementById('authPassword');
        if (input) {
            input.value = password;
            if (window.authenticate) window.authenticate();
        }
    },
    forceReload: () => {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    },
    testAPI: () => {
        if (window.testAPI) {
            return window.testAPI();
        }
        return 'testAPI não disponível';
    },
    colors: () => window.CHART_COLORS,
    resetColors: () => {
        if (window.resetToDefaults) {
            window.resetToDefaults();
        }
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

// =================== HEALTH CHECK SYSTEM ===================
window.systemHealthCheck = function() {
    const checks = {
        modules: typeof window.CONFIG !== 'undefined',
        api: typeof window.API_URL !== 'undefined',
        charts: typeof window.chartInstances !== 'undefined',
        colors: typeof window.CHART_COLORS !== 'undefined',
        authentication: typeof window.authenticate !== 'undefined',
        data: typeof window.hospitalData !== 'undefined'
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`🏥 System Health: ${passed}/${total} checks passed`, checks);
    return { passed, total, checks };
};

// =================== INICIALIZAÇÃO FINAL ===================
// Executar health check após carregamento
setTimeout(() => {
    if (typeof window.systemHealthCheck === 'function') {
        window.systemHealthCheck();
    }
    
    // Iniciar monitoramento da API se disponível
    if (window.monitorAPI) {
        window.monitorAPI();
    }
}, 3000);

console.log('🚀 Main.js carregado - Sistema Archipelago Dashboard V3.0');
console.log('📋 Correções implementadas:');
console.log('   ✅ Menu lateral sem emojis + fecha automaticamente');
console.log('   ✅ API real integrada com Google Apps Script');
console.log('   ✅ Dashboard hospitalar em layout vertical');
console.log('   ✅ Gráficos corrigidos: eixos inteiros, horizontais, legendas à esquerda');
console.log('   ✅ 7 tipos de gráfico: Barras, Bolinhas (jitter), Linha, Área, Radar, Polar');
console.log('   ✅ Divisões Ouro/2R/3R nas colunas Hoje e 24h');
console.log('   ✅ Botão Restaurar Cores funcionando');
console.log('   ✅ Campo Complexidade integrado');
console.log('   ✅ 55+ cores Pantone configuradas');

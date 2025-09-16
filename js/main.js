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


// =================== CORREÇÕES AUTOMÁTICAS - ADICIONAR AO FINAL DO MAIN.JS ===================

// =================== AUTO-CORREÇÃO DE CONTAINERS ===================
function verificarContainersDashboard() {
    const containers = [
        { id: 'dashExecutivoContent', section: 'dash2' },
        { id: 'dashHospitalarContent', section: 'dash1' }
    ];
    
    containers.forEach(({ id, section }) => {
        let container = document.getElementById(id);
        if (!container) {
            const section_element = document.getElementById(section);
            if (section_element) {
                container = document.createElement('div');
                container.id = id;
                section_element.appendChild(container);
                logInfo(`✅ Container ${id} criado automaticamente`);
            }
        }
    });
}

// =================== DIAGNÓSTICO AUTOMÁTICO ===================
window.diagnosticoSistema = function() {
    const diagnostico = {
        hospitalData: !!window.hospitalData,
        hospitalDataCount: window.hospitalData ? Object.keys(window.hospitalData).length : 0,
        chartJS: typeof Chart !== 'undefined',
        containers: {
            dashExecutivoContent: !!document.getElementById('dashExecutivoContent'),
            dashHospitalarContent: !!document.getElementById('dashHospitalarContent')
        },
        functions: {
            renderDashboardExecutivo: typeof window.renderDashboardExecutivo === 'function',
            renderDashboardHospitalar: typeof window.renderDashboardHospitalar === 'function',
            loadHospitalData: typeof window.loadHospitalData === 'function'
        },
        api: !!window.API_URL
    };
    
    console.log('🔍 DIAGNÓSTICO DO SISTEMA:', diagnostico);
    
    // Lista de problemas encontrados
    const problemas = [];
    const solucoes = [];
    
    if (!diagnostico.hospitalData) {
        problemas.push('❌ Dados dos hospitais não carregados');
        solucoes.push('window.loadHospitalData()');
    }
    
    if (!diagnostico.chartJS) {
        problemas.push('❌ Chart.js não disponível');
        solucoes.push('Será carregado automaticamente');
    }
    
    if (!diagnostico.containers.dashExecutivoContent || !diagnostico.containers.dashHospitalarContent) {
        problemas.push('❌ Containers dos dashboards faltando');
        solucoes.push('verificarContainersDashboard()');
    }
    
    if (problemas.length === 0) {
        console.log('✅ Sistema funcionando corretamente!');
    } else {
        console.log('⚠️ PROBLEMAS ENCONTRADOS:', problemas);
        console.log('🔧 SOLUÇÕES:', solucoes);
    }
    
    return { diagnostico, problemas, solucoes };
};

// =================== CARREGAR CHART.JS DINAMICAMENTE ===================
function garantirChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve(Chart);
            return;
        }
        
        logInfo('📊 Carregando Chart.js dinamicamente...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = () => {
            if (typeof Chart !== 'undefined') {
                logSuccess('✅ Chart.js carregado com sucesso');
                resolve(Chart);
            } else {
                reject(new Error('Falha ao carregar Chart.js'));
            }
        };
        script.onerror = () => reject(new Error('Erro no carregamento do Chart.js'));
        document.head.appendChild(script);
    });
}

// =================== FORÇAR RENDERIZAÇÃO DOS DASHBOARDS ===================
window.forcarRenderizacao = function() {
    logInfo('🔄 Forçando renderização dos dashboards...');
    
    // 1. Verificar containers
    verificarContainersDashboard();
    
    // 2. Renderizar dashboards
    setTimeout(() => {
        try {
            if (window.renderDashboardExecutivo) {
                window.renderDashboardExecutivo();
                logSuccess('✅ Dashboard Executivo forçado');
            }
        } catch (error) {
            logError('❌ Erro no Dashboard Executivo:', error);
        }
        
        try {
            if (window.renderDashboardHospitalar) {
                window.renderDashboardHospitalar();
                logSuccess('✅ Dashboard Hospitalar forçado');
            }
        } catch (error) {
            logError('❌ Erro no Dashboard Hospitalar:', error);
        }
    }, 500);
};

// =================== TESTE RÁPIDO ===================
window.testeRapido = function() {
    console.log('🧪 EXECUTANDO TESTE RÁPIDO...');
    
    const resultado = window.diagnosticoSistema();
    
    // Aplicar correções automáticas
    if (resultado.problemas.length > 0) {
        console.log('🔧 Aplicando correções automáticas...');
        
        // Carregar dados se necessário
        if (!window.hospitalData && window.loadHospitalData) {
            window.loadHospitalData().then(() => {
                logSuccess('✅ Dados carregados automaticamente');
                setTimeout(() => window.forcarRenderizacao(), 1000);
            });
        }
        
        // Garantir Chart.js
        garantirChartJS().then(() => {
            logSuccess('✅ Chart.js disponível');
        });
        
        // Verificar containers
        verificarContainersDashboard();
        
        // Forçar renderização
        setTimeout(() => window.forcarRenderizacao(), 2000);
    } else {
        window.forcarRenderizacao();
    }
    
    return resultado;
};

// =================== HOOK NO SISTEMA DE NAVEGAÇÃO ===================
const setActiveTabOriginal = window.setActiveTab;
window.setActiveTab = function(tab) {
    // Verificar containers antes de navegar
    verificarContainersDashboard();
    
    // Chamar função original
    if (setActiveTabOriginal) {
        setActiveTabOriginal(tab);
    }
    
    // Renderizar dashboards após mudança
    setTimeout(() => {
        if (tab === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        } else if (tab === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        }
    }, 300);
};

// =================== ADICIONAR BOTÃO DE DIAGNÓSTICO ===================
function adicionarBotaoDiagnostico() {
    const menuFooter = document.querySelector('.menu-footer');
    if (menuFooter && !document.getElementById('btn-diagnostico')) {
        const botao = document.createElement('button');
        botao.id = 'btn-diagnostico';
        botao.className = 'menu-config';
        botao.innerHTML = '<span>🔧</span> Diagnóstico & Correção';
        botao.style.cssText = `
            display: flex;
            align-items: center;
            width: 100%;
            padding: 12px 16px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s;
        `;
        
        botao.onclick = () => {
            const resultado = window.diagnosticoSistema();
            
            let mensagem = '🔍 DIAGNÓSTICO DO SISTEMA\n\n';
            
            if (resultado.problemas.length === 0) {
                mensagem += '✅ SISTEMA OK!\n';
                mensagem += `📊 Hospitais: ${resultado.diagnostico.hospitalDataCount}\n`;
                mensagem += `📈 Chart.js: ${resultado.diagnostico.chartJS ? 'OK' : 'Carregando...'}\n`;
                mensagem += `📦 Containers: OK\n\n`;
                mensagem += '🔄 Forçando renderização dos gráficos...';
            } else {
                mensagem += '⚠️ PROBLEMAS ENCONTRADOS:\n';
                resultado.problemas.forEach(p => mensagem += `${p}\n`);
                mensagem += '\n🔧 APLICANDO CORREÇÕES AUTOMÁTICAS...\n';
                resultado.solucoes.forEach(s => mensagem += `• ${s}\n`);
            }
            
            alert(mensagem);
            
            // Executar correções
            setTimeout(() => window.testeRapido(), 500);
        };
        
        botao.onmouseover = () => {
            botao.style.background = 'rgba(255, 255, 255, 0.2)';
            botao.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        };
        
        botao.onmouseout = () => {
            botao.style.background = 'rgba(255, 255, 255, 0.1)';
            botao.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        };
        
        menuFooter.appendChild(botao);
        logSuccess('✅ Botão de diagnóstico adicionado ao menu');
    }
}

// =================== COMANDOS DE CONSOLE ===================
window.debug = window.debug || {};
Object.assign(window.debug, {
    diagnostico: window.diagnosticoSistema,
    forcar: window.forcarRenderizacao,
    teste: window.testeRapido,
    dados: () => window.hospitalData,
    graficos: () => window.chartInstances,
    recarregar: async () => {
        if (window.loadHospitalData) {
            await window.loadHospitalData();
            setTimeout(() => window.forcarRenderizacao(), 1000);
            return window.hospitalData;
        }
    },
    limpar: () => {
        if (window.chartInstances) {
            Object.values(window.chartInstances).forEach(chart => {
                try { chart.destroy(); } catch (e) {}
            });
            window.chartInstances = {};
        }
    }
});

// =================== INICIALIZAÇÃO AUTOMÁTICA ===================
setTimeout(() => {
    logInfo('🚀 Iniciando correções automáticas...');
    
    // 1. Adicionar botão de diagnóstico
    adicionarBotaoDiagnostico();
    
    // 2. Garantir Chart.js
    garantirChartJS().catch(() => {
        logError('Erro ao carregar Chart.js - alguns gráficos podem não funcionar');
    });
    
    // 3. Verificar containers
    verificarContainersDashboard();
    
    // 4. Se não há dados, tentar carregar
    if (!window.hospitalData && window.loadHospitalData) {
        logInfo('📊 Carregando dados dos hospitais...');
        window.loadHospitalData().then(() => {
            logSuccess('✅ Dados carregados automaticamente');
            setTimeout(() => {
                // Renderizar dashboards baseado na view atual
                if (window.currentView === 'dash1') {
                    window.renderDashboardHospitalar();
                } else if (window.currentView === 'dash2') {
                    window.renderDashboardExecutivo();
                }
            }, 1000);
        }).catch(error => {
            logError('Erro ao carregar dados:', error);
        });
    }
    
    // 5. Executar teste após tudo
    setTimeout(() => {
        const resultado = window.diagnosticoSistema();
        if (resultado.problemas.length > 0) {
            console.log('🔧 Executando correções finais...');
            window.testeRapido();
        } else {
            logSuccess('✅ Sistema inicializado corretamente');
        }
    }, 3000);
    
}, 4000);

// =================== OBSERVER PARA MUDANÇAS DE TAB ===================
const observarMudancasTab = () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                if (target.id === 'dash1' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardHospitalar) {
                            window.renderDashboardHospitalar();
                        }
                    }, 200);
                } else if (target.id === 'dash2' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardExecutivo) {
                            window.renderDashboardExecutivo();
                        }
                    }, 200);
                }
            }
        });
    });
    
    const dash1 = document.getElementById('dash1');
    const dash2 = document.getElementById('dash2');
    
    if (dash1) observer.observe(dash1, { attributes: true });
    if (dash2) observer.observe(dash2, { attributes: true });
};

setTimeout(observarMudancasTab, 2000);

console.log(`
🔧 SISTEMA DE CORREÇÕES ATIVO

Comandos disponíveis:
• window.debug.teste() - Teste rápido + correções
• window.debug.diagnostico() - Diagnóstico completo  
• window.debug.forcar() - Forçar renderização
• window.debug.recarregar() - Recarregar dados da API
• window.debug.dados() - Ver dados carregados
• window.debug.limpar() - Limpar gráficos

🔧 Botão "Diagnóstico & Correção" adicionado ao menu lateral.
🤖 Correções automáticas ativas - gráficos serão carregados automaticamente.
`);

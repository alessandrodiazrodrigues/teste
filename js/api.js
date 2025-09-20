// =================== API.JS V4.0 - VERSÃO CORRIGIDA ===================
// =================== INTEGRAÇÃO COM GOOGLE APPS SCRIPT - 44 COLUNAS ===================

// =================== CONFIGURAÇÃO DA API ===================
const API_CONFIG = {
    // URL do Google Apps Script (substituir pela URL real do seu deployment)
    BASE_URL: 'https://script.google.com/macros/s/AKfycbwjS4n74PmLnX-moIaX-fAAmF3Mv5gNtrFNUwvKH4SHgQkdACtr5POYJoHZUSxnymLr/exec',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000
};

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = window.hospitalData || {};
window.isLoading = false;
window.lastUpdate = null;

// =================== SISTEMA DE LOGS ===================
function logInfo(message, data = null) {
    console.log(`🔵 [API V4.0] ${message}`, data || '');
}

function logSuccess(message, data = null) {
    console.log(`✅ [API V4.0] ${message}`, data || '');
}

function logError(message, error = null) {
    console.error(`❌ [API V4.0] ${message}`, error || '');
}

function logWarning(message, data = null) {
    console.warn(`⚠️ [API V4.0] ${message}`, data || '');
}

// =================== FUNÇÃO PRINCIPAL: CARREGAR DADOS ===================
window.loadHospitalData = async function() {
    if (window.isLoading) {
        logWarning('Já existe uma requisição em andamento');
        return;
    }
    
    window.isLoading = true;
    logInfo('Iniciando carregamento de dados V4.0...');
    
    try {
        const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}?action=all`);
        
        if (response.ok && response.data) {
            window.hospitalData = processHospitalData(response.data);
            window.lastUpdate = new Date();
            
            logSuccess(`Dados V4.0 carregados com sucesso!`, {
                hospitais: Object.keys(window.hospitalData).length,
                timestamp: window.lastUpdate.toLocaleString('pt-BR')
            });
            
            // Disparar evento customizado
            window.dispatchEvent(new CustomEvent('hospitalDataLoaded', {
                detail: { data: window.hospitalData, timestamp: window.lastUpdate }
            }));
            
            return window.hospitalData;
        } else {
            throw new Error(response.error || 'Resposta inválida da API');
        }
        
    } catch (error) {
        logError('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados. Verifique a conexão.', 'error');
        throw error;
    } finally {
        window.isLoading = false;
    }
};

// =================== PROCESSAR DADOS DO HOSPITAL ===================
function processHospitalData(rawData) {
    const processed = {};
    
    Object.keys(rawData).forEach(hospitalId => {
        const hospital = rawData[hospitalId];
        processed[hospitalId] = {
            nome: hospital.nome,
            leitos: hospital.leitos.map(leito => {
                // Padronizar estrutura do leito
                const leitoProcessado = {
                    numero: leito.leito,
                    leito: leito.leito,
                    tipo: leito.tipo || 'ENF',
                    status: leito.status === 'Em uso' ? 'ocupado' : leito.status.toLowerCase(),
                    nome: leito.nome || '',
                    matricula: leito.matricula || '',
                    idade: leito.idade || null,
                    admAt: leito.admAt || '',
                    pps: leito.pps || null,
                    spict: leito.spict || '',
                    complexidade: leito.complexidade || '',
                    prevAlta: leito.prevAlta || '',
                    // Arrays diretos - sem parsing!
                    concessoes: Array.isArray(leito.concessoes) ? leito.concessoes : [],
                    linhas: Array.isArray(leito.linhas) ? leito.linhas : []
                };
                
                // Adicionar objeto paciente se ocupado
                if (leitoProcessado.status === 'ocupado' && leitoProcessado.nome) {
                    leitoProcessado.paciente = {
                        nome: leitoProcessado.nome,
                        matricula: leitoProcessado.matricula,
                        idade: leitoProcessado.idade,
                        admAt: leitoProcessado.admAt,
                        pps: leitoProcessado.pps,
                        spict: leitoProcessado.spict,
                        complexidade: leitoProcessado.complexidade,
                        prevAlta: leitoProcessado.prevAlta,
                        concessoes: leitoProcessado.concessoes,
                        linhas: leitoProcessado.linhas
                    };
                }
                
                return leitoProcessado;
            })
        };
    });
    
    logInfo(`Dados processados V4.0:`, {
        hospitais: Object.keys(processed).length,
        totalLeitos: Object.values(processed).reduce((sum, h) => sum + h.leitos.length, 0)
    });
    
    return processed;
}

// =================== FETCH COM RETRY E JSONP ===================
async function fetchWithRetry(url, attempts = API_CONFIG.RETRY_ATTEMPTS) {
    for (let i = 0; i < attempts; i++) {
        try {
            logInfo(`Tentativa ${i + 1}/${attempts} para: ${url}`);
            
            return await new Promise((resolve, reject) => {
                const callbackName = 'jsonpCallback_' + Date.now();
                const timeout = setTimeout(() => {
                    cleanup();
                    reject(new Error('Timeout na requisição'));
                }, API_CONFIG.TIMEOUT);
                
                const cleanup = () => {
                    clearTimeout(timeout);
                    delete window[callbackName];
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                };
                
                window[callbackName] = (data) => {
                    cleanup();
                    resolve(data);
                };
                
                const script = document.createElement('script');
                script.src = `${url}&callback=${callbackName}`;
                script.onerror = () => {
                    cleanup();
                    reject(new Error('Erro ao carregar script'));
                };
                
                document.head.appendChild(script);
            });
            
        } catch (error) {
            logWarning(`Tentativa ${i + 1} falhou:`, error.message);
            
            if (i < attempts - 1) {
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
            } else {
                throw error;
            }
        }
    }
}

// =================== FUNÇÕES DE ADMISSÃO ===================
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    logInfo(`Admitindo paciente V4.0: ${hospital}-${leito}`, dadosPaciente);
    
    try {
        // Validar dados obrigatórios
        if (!dadosPaciente.nome || !dadosPaciente.matricula) {
            throw new Error('Nome e matrícula são obrigatórios');
        }
        
        // Preparar dados para envio
        const params = new URLSearchParams({
            action: 'admitir',
            hospital: hospital,
            leito: leito,
            nome: dadosPaciente.nome,
            matricula: dadosPaciente.matricula,
            idade: dadosPaciente.idade || '',
            pps: dadosPaciente.pps || '',
            spict: dadosPaciente.spict || 'nao_elegivel',
            complexidade: dadosPaciente.complexidade || 'I',
            prevAlta: validarTimeline(dadosPaciente.prevAlta),
            // Arrays diretos
            concessoes: Array.isArray(dadosPaciente.concessoes) ? 
                dadosPaciente.concessoes.join(',') : 
                (dadosPaciente.concessoes || ''),
            linhas: Array.isArray(dadosPaciente.linhas) ? 
                dadosPaciente.linhas.join(',') : 
                (dadosPaciente.linhas || '')
        });
        
        const url = `${API_CONFIG.BASE_URL}?${params.toString()}`;
        const response = await fetchWithRetry(url);
        
        if (response.ok) {
            logSuccess('Paciente admitido V4.0 com sucesso!', response.data);
            showNotification('✅ Paciente admitido com sucesso!', 'success');
            
            // Atualizar dados locais
            await window.loadHospitalData();
            
            return response.data;
        } else {
            throw new Error(response.error || 'Erro ao admitir paciente');
        }
        
    } catch (error) {
        logError('Erro ao admitir paciente:', error);
        showNotification('❌ Erro ao admitir paciente: ' + error.message, 'error');
        throw error;
    }
};

// =================== FUNÇÕES DE ATUALIZAÇÃO ===================
window.atualizarPaciente = async function(hospital, leito, dadosAtualizacao) {
    logInfo(`Atualizando paciente V4.0: ${hospital}-${leito}`, dadosAtualizacao);
    
    try {
        // Preparar dados para envio
        const params = new URLSearchParams({
            action: 'atualizar',
            hospital: hospital,
            leito: leito,
            idade: dadosAtualizacao.idade || '',
            pps: dadosAtualizacao.pps || '',
            spict: dadosAtualizacao.spict || '',
            complexidade: dadosAtualizacao.complexidade || '',
            prevAlta: validarTimeline(dadosAtualizacao.prevAlta),
            // Arrays diretos
            concessoes: Array.isArray(dadosAtualizacao.concessoes) ? 
                dadosAtualizacao.concessoes.join(',') : 
                (dadosAtualizacao.concessoes || ''),
            linhas: Array.isArray(dadosAtualizacao.linhas) ? 
                dadosAtualizacao.linhas.join(',') : 
                (dadosAtualizacao.linhas || '')
        });
        
        const url = `${API_CONFIG.BASE_URL}?${params.toString()}`;
        const response = await fetchWithRetry(url);
        
        if (response.ok) {
            logSuccess('Paciente atualizado V4.0 com sucesso!', response.data);
            showNotification('✅ Dados atualizados com sucesso!', 'success');
            
            // Atualizar dados locais
            await window.loadHospitalData();
            
            return response.data;
        } else {
            throw new Error(response.error || 'Erro ao atualizar paciente');
        }
        
    } catch (error) {
        logError('Erro ao atualizar paciente:', error);
        showNotification('❌ Erro ao atualizar: ' + error.message, 'error');
        throw error;
    }
};

// =================== FUNÇÕES DE ALTA ===================
window.darAltaPaciente = async function(hospital, leito) {
    logInfo(`Processando alta V4.0: ${hospital}-${leito}`);
    
    try {
        const params = new URLSearchParams({
            action: 'daralta',
            hospital: hospital,
            leito: leito
        });
        
        const url = `${API_CONFIG.BASE_URL}?${params.toString()}`;
        const response = await fetchWithRetry(url);
        
        if (response.ok) {
            logSuccess('Alta processada V4.0 com sucesso!', response.data);
            showNotification('✅ Alta processada com sucesso!', 'success');
            
            // Atualizar dados locais
            await window.loadHospitalData();
            
            return response.data;
        } else {
            throw new Error(response.error || 'Erro ao processar alta');
        }
        
    } catch (error) {
        logError('Erro ao processar alta:', error);
        showNotification('❌ Erro ao processar alta: ' + error.message, 'error');
        throw error;
    }
};

// =================== VALIDAÇÃO DE TIMELINE CORRIGIDA ===================
function validarTimeline(prevAlta) {
    if (!prevAlta) return 'SP';
    
    const TIMELINE_VALIDA = [
        'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
        '24h Ouro', '24h 2R', '24h 3R',
        '48h', '72h', '96h', 'SP'
    ];
    
    // CORREÇÃO: Manter o valor original se ele for válido
    if (TIMELINE_VALIDA.includes(prevAlta)) {
        return prevAlta;
    }
    
    // Só retorna SP se o valor realmente não for válido
    logWarning(`Timeline inválida recebida: "${prevAlta}", usando SP como fallback`);
    return 'SP';
}

// =================== SISTEMA DE NOTIFICAÇÕES ===================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 400px;
        word-wrap: break-word;
        ${type === 'success' ? 'background: #22c55e; color: white;' : ''}
        ${type === 'error' ? 'background: #ef4444; color: white;' : ''}
        ${type === 'info' ? 'background: #3b82f6; color: white;' : ''}
        ${type === 'warning' ? 'background: #f59e0b; color: white;' : ''}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// =================== AUTO-REFRESH ===================
window.startAutoRefresh = function(interval = 60000) {
    logInfo(`Auto-refresh V4.0 iniciado: ${interval/1000}s`);
    
    if (window.autoRefreshInterval) {
        clearInterval(window.autoRefreshInterval);
    }
    
    window.autoRefreshInterval = setInterval(async () => {
        if (!window.isLoading) {
            logInfo('Auto-refresh V4.0 executando...');
            try {
                await window.loadHospitalData();
            } catch (error) {
                logError('Erro no auto-refresh:', error);
            }
        }
    }, interval);
};

window.stopAutoRefresh = function() {
    if (window.autoRefreshInterval) {
        clearInterval(window.autoRefreshInterval);
        window.autoRefreshInterval = null;
        logInfo('Auto-refresh V4.0 parado');
    }
};

// =================== REFRESH APÓS AÇÃO ===================
window.refreshAfterAction = async function() {
    logInfo('Atualizando dados V4.0 após ação...');
    
    // Aguardar um pouco para garantir que o Google Sheets foi atualizado
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        await window.loadHospitalData();
        
        // Re-renderizar componentes se existirem
        if (window.renderCards) {
            window.renderCards();
        }
        if (window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        }
        if (window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        }
        
        logSuccess('Dados V4.0 atualizados após ação');
    } catch (error) {
        logError('Erro ao atualizar após ação:', error);
    }
};

// =================== BUSCAR DADOS DE UM LEITO ===================
window.getLeitoData = async function(hospital, leito) {
    try {
        const params = new URLSearchParams({
            action: 'one',
            hospital: hospital,
            leito: leito
        });
        
        const url = `${API_CONFIG.BASE_URL}?${params.toString()}`;
        const response = await fetchWithRetry(url);
        
        if (response.ok) {
            return response.data;
        } else {
            throw new Error(response.error || 'Erro ao buscar leito');
        }
        
    } catch (error) {
        logError('Erro ao buscar leito:', error);
        throw error;
    }
};

// =================== TESTE DE CONEXÃO ===================
window.testAPIConnection = async function() {
    logInfo('Testando conexão V4.0 com a API...');
    
    try {
        const url = `${API_CONFIG.BASE_URL}?action=test`;
        const response = await fetchWithRetry(url, 1);
        
        if (response.ok) {
            logSuccess('Conexão V4.0 OK!', response.data);
            showNotification('✅ API V4.0 conectada com sucesso!', 'success');
            return true;
        } else {
            throw new Error(response.error || 'Resposta inválida');
        }
        
    } catch (error) {
        logError('Erro ao testar conexão:', error);
        showNotification('❌ Erro de conexão com a API', 'error');
        return false;
    }
};

// =================== CSS PARA ANIMAÇÕES ===================
if (!document.getElementById('apiAnimationsV4')) {
    const style = document.createElement('style');
    style.id = 'apiAnimationsV4';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            transition: all 0.3s ease;
        }
        
        .notification:hover {
            transform: translateX(-5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
}

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', async function() {
    logSuccess('🚀 API V4.0 CORRIGIDA carregada com sucesso!');
    logInfo('📋 Correção aplicada: validarTimeline não transforma mais 96h em SP');
    
    // Testar conexão inicial
    const isConnected = await window.testAPIConnection();
    
    if (isConnected) {
        // Carregar dados iniciais
        try {
            await window.loadHospitalData();
            logSuccess('✅ Dados V4.0 iniciais carregados');
            
            // Iniciar auto-refresh (opcional)
            // window.startAutoRefresh(60000); // Atualizar a cada 60 segundos
            
        } catch (error) {
            logError('Erro ao carregar dados iniciais:', error);
        }
    } else {
        logError('⚠️ API não disponível - verificar URL e deployment');
    }
    
    // Event listener para mudanças de dados
    window.addEventListener('hospitalDataLoaded', (event) => {
        logInfo('Evento hospitalDataLoaded disparado', event.detail);
    });
});

// =================== EXPORT DE FUNÇÕES PÚBLICAS ===================
window.API_V4 = {
    loadData: window.loadHospitalData,
    admitir: window.admitirPaciente,
    atualizar: window.atualizarPaciente,
    darAlta: window.darAltaPaciente,
    getLeitoData: window.getLeitoData,
    testConnection: window.testAPIConnection,
    refresh: window.refreshAfterAction,
    startAutoRefresh: window.startAutoRefresh,
    stopAutoRefresh: window.stopAutoRefresh,
    config: API_CONFIG,
    version: '4.0-CORRECTED'
};

logSuccess('🏥 API.JS V4.0 CORRIGIDA - Timeline 96h preservada!');
logInfo('✅ Sistema pronto para uso com 44 colunas');
logInfo('✅ Arrays diretos sem parsing');
logInfo('✅ Validação de timeline corrigida - 96h não vira mais SP');

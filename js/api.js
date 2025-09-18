// =================== INTEGRAÇÃO API GOOGLE APPS SCRIPT - 100% FUNCIONAL COM CORS FIX ===================

// *** URL NOVA DA API CORRIGIDA ***
window.API_URL = 'https://script.google.com/macros/s/AKfycbwQ82QrnTM8H9ijXfV9ZwEYu114Fr2fSmNc6fkS8bk4BSQ8P9cZHcG0jHUZflIC-amk/exec';

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = {};
window.apiCache = {};
window.lastAPICall = 0;
window.API_TIMEOUT = 15000; // 15 segundos para CORS

// =================== FUNÇÕES AUXILIARES ===================
function logAPI(message, data = null) {
    console.log(`🔗 [API] ${message}`, data || '');
}

function logAPIError(message, error) {
    console.error(`❌ [API ERROR] ${message}`, error);
}

function logAPISuccess(message, data = null) {
    console.log(`✅ [API SUCCESS] ${message}`, data || '');
}

// =================== CORREÇÃO CRÍTICA PARA CORS - JSONP ===================

// Função auxiliar para requisições JSONP (bypass CORS)
function jsonpRequest(url, params = {}) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        // Criar URL com parâmetros
        const urlObj = new URL(url);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                urlObj.searchParams.append(key, String(params[key]));
            }
        });
        urlObj.searchParams.append('callback', callbackName);
        
        // Criar callback global
        window[callbackName] = function(data) {
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            resolve(data);
        };
        
        // Criar script tag
        const script = document.createElement('script');
        script.src = urlObj.toString();
        script.onerror = () => {
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            reject(new Error('JSONP request failed'));
        };
        
        // Timeout
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                if (script && script.parentNode) {
                    document.head.removeChild(script);
                }
                reject(new Error('JSONP request timeout'));
            }
        }, window.API_TIMEOUT);
        
        document.head.appendChild(script);
    });
}

// =================== CONFIGURAÇÃO DE REQUISIÇÕES COM CORS FIX ===================

// Fazer requisição com fallback JSONP
async function apiRequest(action, params = {}, method = 'GET') {
    try {
        logAPI(`Fazendo requisição ${method}: ${action}`, params);
        
        if (method === 'GET') {
            try {
                // TENTATIVA 1: Fetch normal
                let url = new URL(window.API_URL);
                url.searchParams.append('action', action);
                Object.keys(params).forEach(key => {
                    if (params[key] !== null && params[key] !== undefined) {
                        url.searchParams.append(key, String(params[key]));
                    }
                });
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!data.ok) {
                    throw new Error(data.error || data.message || 'Erro desconhecido da API');
                }
                
                logAPISuccess(`${method} ${action} concluído (Fetch)`, data.data ? `${Object.keys(data.data).length || 0} registros` : 'sem dados');
                return data.data;
                
            } catch (fetchError) {
                logAPI(`Fetch falhou (${fetchError.message}), tentando JSONP...`);
                
                // TENTATIVA 2: JSONP (bypass CORS)
                const data = await jsonpRequest(window.API_URL, { action, ...params });
                
                if (!data || !data.ok) {
                    throw new Error(data?.error || data?.message || 'Erro desconhecido da API via JSONP');
                }
                
                logAPISuccess(`${method} ${action} concluído (JSONP)`, data.data ? `${Object.keys(data.data).length || 0} registros` : 'sem dados');
                return data.data;
            }
            
        } else {
            // Para POST, tentar fetch primeiro, depois fallback para GET via JSONP
            try {
                const response = await fetch(window.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ action, ...params })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                if (!data.ok) throw new Error(data.error || 'Erro no POST');
                
                logAPISuccess(`${method} ${action} concluído (POST)`, 'dados salvos');
                return data.data;
                
            } catch (postError) {
                logAPI(`POST falhou (${postError.message}), tentando via GET com JSONP...`);
                
                // FALLBACK: Tentar POST via GET com JSONP
                const data = await jsonpRequest(window.API_URL, { action, ...params });
                if (!data || !data.ok) throw new Error(data?.error || 'Erro no POST via JSONP');
                
                logAPISuccess(`${method} ${action} concluído (POST via JSONP)`, 'dados salvos');
                return data.data;
            }
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            logAPIError(`Timeout na requisição ${method} ${action}`, 'Requisição cancelada por timeout');
            throw new Error('Timeout na API - verifique sua conexão');
        }
        
        logAPIError(`Erro na requisição ${method} ${action}`, error.message);
        throw error;
    }
}

// =================== FUNÇÃO PRINCIPAL DE CARREGAMENTO ===================
window.loadHospitalData = async function() {
    try {
        logAPI('🔄 Carregando dados reais da planilha...');
        
        // Mostrar loading global
        if (window.showLoading) {
            window.showLoading(null, 'Sincronizando com Google Apps Script...');
        }
        
        // Buscar dados da API
        const apiData = await apiRequest('all', {}, 'GET');
        
        if (!apiData || typeof apiData !== 'object') {
            throw new Error('API retornou dados inválidos');
        }
        
        // *** CORREÇÃO CRÍTICA: Processar estrutura correta ***
        window.hospitalData = {};
        
        // Se a API retorna formato agrupado: {H1: {leitos: [...]}, H2: {leitos: [...]}}
        if (apiData.H1 && apiData.H1.leitos) {
            logAPI('Dados recebidos em formato agrupado');
            window.hospitalData = apiData;
        } 
        // Se a API retorna array flat: [{hospital: 'H1', ...}, {hospital: 'H2', ...}]
        else if (Array.isArray(apiData)) {
            logAPI('Dados recebidos em formato flat - convertendo...');
            apiData.forEach(leito => {
                const hospitalId = leito.hospital;
                if (!window.hospitalData[hospitalId]) {
                    window.hospitalData[hospitalId] = { leitos: [] };
                }
                window.hospitalData[hospitalId].leitos.push(leito);
            });
        }
        else {
            throw new Error('Formato de dados da API não reconhecido');
        }
        
        // Verificar se temos dados
        const totalHospitais = Object.keys(window.hospitalData).length;
        if (totalHospitais === 0) {
            throw new Error('Nenhum hospital encontrado nos dados da API');
        }
        
        // Processar dados para compatibilidade
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            if (hospital && hospital.leitos) {
                hospital.leitos = hospital.leitos.map(leito => {
                    // Padronizar status
                    if (leito.status === 'Em uso') leito.status = 'ocupado';
                    if (leito.status === 'Vago') leito.status = 'vago';
                    
                    // Criar objeto paciente se leito ocupado
                    if (leito.status === 'ocupado' && leito.nome) {
                        leito.paciente = {
                            nome: leito.nome,
                            matricula: leito.matricula,
                            idade: leito.idade,
                            pps: leito.pps,
                            spict: leito.spict,
                            complexidade: leito.complexidade,
                            prevAlta: leito.prevAlta,
                            linhas: leito.linhas,
                            concessoes: leito.concessoes
                        };
                    }
                    
                    return leito;
                });
                
                // Ordenar leitos por número
                hospital.leitos.sort((a, b) => (a.leito || 0) - (b.leito || 0));
            }
        });
        
        // Estatísticas
        const totalLeitos = Object.values(window.hospitalData).reduce((acc, h) => acc + (h.leitos ? h.leitos.length : 0), 0);
        const leitosOcupados = Object.values(window.hospitalData).reduce((acc, h) => 
            acc + (h.leitos ? h.leitos.filter(l => l.status === 'ocupado').length : 0), 0);
        const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
        
        logAPISuccess(`Dados carregados da planilha real:`);
        logAPISuccess(`• ${totalHospitais} hospitais ativos`);
        logAPISuccess(`• ${totalLeitos} leitos totais`);
        logAPISuccess(`• ${leitosOcupados} leitos ocupados (${taxaOcupacao}%)`);
        
        // Atualizar timestamp
        window.lastAPICall = Date.now();
        
        // Esconder loading
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        return window.hospitalData;
        
    } catch (error) {
        logAPIError('❌ ERRO ao carregar dados reais:', error.message);
        
        // Esconder loading mesmo com erro
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        // Manter dados vazios - NÃO usar dados mock
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÕES DE SALVAMENTO CORRIGIDAS ===================

// Admitir paciente (salvar na planilha)
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logAPI(`Admitindo paciente no ${hospital}-${leito} NA PLANILHA REAL`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito),
            nome: dadosPaciente.nome || '',
            matricula: dadosPaciente.matricula || '',
            idade: dadosPaciente.idade || null,
            pps: dadosPaciente.pps || null,
            spict: dadosPaciente.spict || '',
            complexidade: dadosPaciente.complexidade || 'I',
            prevAlta: dadosPaciente.prevAlta || 'SP',
            linhas: Array.isArray(dadosPaciente.linhas) ? dadosPaciente.linhas : [],
            concessoes: Array.isArray(dadosPaciente.concessoes) ? dadosPaciente.concessoes : []
        };
        
        const result = await apiRequest('admitir', payload, 'POST');
        
        logAPISuccess('✅ Paciente admitido na planilha real!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao admitir paciente:', error.message);
        throw error;
    }
};

// Atualizar dados do paciente (salvar na planilha)  
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logAPI(`Atualizando paciente ${hospital}-${leito} NA PLANILHA REAL`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito),
            idade: dadosAtualizados.idade || null,
            pps: dadosAtualizados.pps || null,
            spict: dadosAtualizados.spict || '',
            complexidade: dadosAtualizados.complexidade || '',
            prevAlta: dadosAtualizados.prevAlta || '',
            linhas: Array.isArray(dadosAtualizados.linhas) ? dadosAtualizados.linhas : [],
            concessoes: Array.isArray(dadosAtualizados.concessoes) ? dadosAtualizados.concessoes : []
        };
        
        const result = await apiRequest('atualizar', payload, 'POST');
        
        logAPISuccess('✅ Dados atualizados na planilha real!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao atualizar paciente:', error.message);
        throw error;
    }
};

// Dar alta ao paciente (salvar na planilha)
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logAPI(`Dando alta ao paciente ${hospital}-${leito} NA PLANILHA REAL`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito)
        };
        
        const result = await apiRequest('daralta', payload, 'POST');
        
        logAPISuccess('✅ Alta processada na planilha real!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao processar alta:', error.message);
        throw error;
    }
};

// =================== REFRESH APÓS AÇÕES CORRIGIDO ===================
window.refreshAfterAction = async function() {
    try {
        logAPI('🔄 Recarregando dados da planilha após ação...');
        
        // Mostrar loading nos cards
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #1a1f2e; border-radius: 12px;">
                    <div style="color: #60a5fa; margin-bottom: 15px; font-size: 18px;">
                        🔄 Sincronizando com a planilha...
                    </div>
                    <div style="color: #9ca3af; font-size: 14px;">
                        Atualizando dados em tempo real
                    </div>
                </div>
            `;
        }
        
        // Aguardar um pouco (para garantir que a planilha foi atualizada)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Recarregar dados da API
        await window.loadHospitalData();
        
        // Re-renderizar cards após dados carregados
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
                logAPISuccess('✅ Interface atualizada com dados da planilha');
            }
        }, 500);
        
    } catch (error) {
        logAPIError('Erro ao refresh:', error.message);
        
        // Mesmo com erro, tentar re-renderizar cards
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 1000);
    }
};

// =================== FUNÇÕES DE TESTE E MONITORAMENTO ===================

// Testar conectividade da API
window.testAPI = async function() {
    try {
        logAPI('🔍 Testando conectividade com a planilha...');
        
        const result = await apiRequest('test', {}, 'GET');
        
        if (result) {
            logAPISuccess('✅ API funcionando corretamente!', result);
            return { status: 'ok', data: result };
        } else {
            throw new Error('API não retornou dados de teste válidos');
        }
        
    } catch (error) {
        logAPIError('❌ Erro na conectividade:', error.message);
        return { status: 'error', message: error.message };
    }
};

// Monitorar API em tempo real
window.monitorAPI = function() {
    if (window.apiMonitorInterval) {
        clearInterval(window.apiMonitorInterval);
    }
    
    window.apiMonitorInterval = setInterval(async () => {
        try {
            const timeSinceLastCall = Date.now() - window.lastAPICall;
            
            // Se passou mais de 4 minutos, fazer refresh automático
            if (timeSinceLastCall > 240000) { // 4 minutos
                logAPI('🔄 Refresh automático dos dados...');
                await window.loadHospitalData();
                
                // Re-renderizar interface se necessário
                if (window.currentView === 'leitos' && window.renderCards) {
                    setTimeout(() => window.renderCards(), 1000);
                }
            }
        } catch (error) {
            logAPIError('Erro no monitoramento automático:', error.message);
        }
    }, 60000); // Verificar a cada minuto
    
    logAPI('🔍 Monitoramento automático da API ativado');
};

// =================== FUNÇÕES DE CORES ===================
window.loadColors = async function() {
    try {
        const colors = await apiRequest('getcolors', {}, 'GET');
        if (colors && typeof colors === 'object') {
            // Aplicar cores ao sistema
            Object.entries(colors).forEach(([property, value]) => {
                if (property.startsWith('--') || property.startsWith('-')) {
                    document.documentElement.style.setProperty(property, value);
                }
            });
            logAPISuccess('✅ Cores carregadas da planilha');
            return colors;
        }
    } catch (error) {
        logAPIError('Erro ao carregar cores:', error.message);
    }
    return null;
};

window.saveColors = async function(colors) {
    try {
        const result = await apiRequest('savecolors', { colors: colors }, 'POST');
        logAPISuccess('✅ Cores salvas na planilha');
        return result;
    } catch (error) {
        logAPIError('Erro ao salvar cores:', error.message);
        throw error;
    }
};

// =================== COMPATIBILIDADE COM VERSÕES ANTERIORES ===================

// Alias para funções antigas
window.fetchHospitalData = async function(hospital) {
    logAPI(`Buscando dados do hospital: ${hospital}`);
    
    // Carregar todos os dados e filtrar
    await window.loadHospitalData();
    
    if (window.hospitalData[hospital] && window.hospitalData[hospital].leitos) {
        return window.hospitalData[hospital].leitos;
    }
    
    return [];
};

// Alias para função antiga
window.loadAllHospitalsData = window.loadHospitalData;

// Função para buscar dados de um leito específico
window.fetchLeitoData = async function(hospital, leito) {
    try {
        const data = await apiRequest('one', { hospital: hospital, leito: leito }, 'GET');
        return data;
    } catch (error) {
        logAPIError(`Erro ao buscar leito ${hospital}-${leito}:`, error.message);
        return null;
    }
};

// =================== INICIALIZAÇÃO ===================
window.addEventListener('load', () => {
    logAPI('API.js carregado - URL da API configurada');
    logAPI(`URL: ${window.API_URL}`);
    
    // Iniciar monitoramento após 10 segundos
    setTimeout(() => {
        if (window.monitorAPI) {
            window.monitorAPI();
        }
    }, 10000);
});

logAPISuccess('✅ API.js 100% FUNCIONAL - Integração Google Apps Script com CORS fix ativa');

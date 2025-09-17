// =================== INTEGRAÇÃO API GOOGLE APPS SCRIPT ===================

// URL da API no Google Apps Script - CORRIGIDA
window.API_URL = 'https://script.google.com/macros/s/AKfycbzbE4HGYpIWGMwt0foLSkPjesbYnfHpFvATFyfMtSgcvh8Fij-VElXVelEu8n_OU3UO/exec';

// =================== FUNÇÕES DE API ===================

// Fazer requisição GET para API
window.apiGet = async function(action, params = {}) {
    try {
        const url = new URL(window.API_URL);
        url.searchParams.append('action', action);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        logInfo(`API GET: ${action} - ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.ok) {
            throw new Error(data.error || 'Erro na API');
        }
        
        return data.data;
    } catch (error) {
        logError(`Erro na API GET ${action}:`, error);
        throw error;
    }
};

// Fazer requisição POST para API
window.apiPost = async function(action, payload) {
    try {
        logInfo(`API POST: ${action}`);
        
        const response = await fetch(window.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                ...payload
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.ok) {
            throw new Error(data.error || 'Erro na API');
        }
        
        return data.data;
    } catch (error) {
        logError(`Erro na API POST ${action}:`, error);
        throw error;
    }
};

// =================== FUNÇÕES ESPECÍFICAS DE LEITOS ===================

// Buscar leitos de um hospital específico
window.fetchHospitalData = async function(hospital) {
    try {
        logInfo(`Buscando dados do hospital: ${hospital}`);
        const data = await apiGet('state', { hospital: hospital });
        logSuccess(`Dados carregados para ${hospital}: ${data.length} leitos`);
        return data;
    } catch (error) {
        logError('Erro ao buscar dados do hospital:', error);
        throw error;
    }
};

// Buscar todos os hospitais de uma vez
window.fetchAllHospitalsData = async function() {
    try {
        logInfo('Buscando dados de todos os hospitais...');
        const data = await apiGet('all');
        logSuccess(`Dados carregados para ${Object.keys(data).length} hospitais`);
        return data;
    } catch (error) {
        logError('Erro ao buscar dados de todos os hospitais:', error);
        throw error;
    }
};

// Buscar um leito específico
window.fetchLeitoData = async function(hospital, leito) {
    try {
        logInfo(`Buscando dados do leito ${hospital}-${leito}`);
        const data = await apiGet('one', { hospital: hospital, leito: leito });
        logSuccess(`Dados do leito ${hospital}-${leito} carregados`);
        return data;
    } catch (error) {
        logError('Erro ao buscar dados do leito:', error);
        throw error;
    }
};

// =================== FUNÇÕES DE ADMISSÃO E ALTA ===================

// Admitir paciente
window.admitirPaciente = async function(payload) {
    try {
        logInfo(`Admitindo paciente no leito ${payload.hospital}-${payload.leito}...`);
        
        const apiPayload = {
            hospital: payload.hospital,
            leito: payload.leito,
            nome: payload.nome || '',
            matricula: payload.matricula || '',
            idade: payload.idade || null,
            pps: payload.pps || null,
            spict: payload.spict || '',
            complexidade: payload.complexidade || 'I',
            prevAlta: payload.prevAlta || '',
            linhas: Array.isArray(payload.linhas) ? 
                payload.linhas.join('|') : '',
            concessoes: Array.isArray(payload.concessoes) ? 
                payload.concessoes.join('|') : ''
        };
        
        const result = await apiGet('admit', apiPayload);
        logSuccess('Paciente admitido com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao admitir paciente:', error);
        throw error;
    }
};

// Atualizar dados do paciente
window.atualizarPaciente = async function(payload) {
    try {
        logInfo(`Atualizando paciente no leito ${payload.hospital}-${payload.leito}...`);
        
        const apiPayload = {
            hospital: payload.hospital,
            leito: payload.leito,
            idade: payload.idade || null,
            pps: payload.pps || null,
            spict: payload.spict || '',
            complexidade: payload.complexidade || '',
            prevAlta: payload.prevAlta || '',
            linhas: Array.isArray(payload.linhas) ? 
                payload.linhas.join('|') : '',
            concessoes: Array.isArray(payload.concessoes) ? 
                payload.concessoes.join('|') : ''
        };
        
        const result = await apiGet('update', apiPayload);
        logSuccess('Paciente atualizado com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao atualizar paciente:', error);
        throw error;
    }
};

// Dar alta a um paciente
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logInfo(`Dando alta no leito ${hospital}-${leito}...`);
        const result = await apiGet('discharge', { hospital: hospital, leito: leito });
        logSuccess('Alta realizada com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao dar alta:', error);
        throw error;
    }
};

// =================== FUNÇÕES DE CORES ===================

// Buscar cores personalizadas
window.getColors = async function() {
    try {
        logInfo('Buscando cores personalizadas...');
        const result = await apiGet('getcolors');
        logSuccess('Cores carregadas com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao buscar cores:', error);
        throw error;
    }
};

// Salvar cores personalizadas
window.saveColors = async function(colors) {
    try {
        logInfo('Salvando cores personalizadas...');
        const colorsJson = JSON.stringify(colors);
        const result = await apiGet('savecolors', { colors: colorsJson });
        logSuccess('Cores salvas com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao salvar cores:', error);
        throw error;
    }
};

// Resetar cores para padrão
window.resetColors = async function() {
    try {
        logInfo('Resetando cores para padrão...');
        const result = await apiGet('resetcolors');
        logSuccess('Cores resetadas com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao resetar cores:', error);
        throw error;
    }
};

// =================== FUNÇÃO PRINCIPAL DE CARREGAMENTO ===================

// Carregar dados dos hospitais (função principal)
window.loadHospitalData = async function() {
    try {
        logInfo('🔄 Iniciando carregamento de dados dos hospitais...');
        
        // Verificar se a URL da API está configurada
        if (!window.API_URL) {
            throw new Error('URL da API não configurada');
        }
        
        // Buscar dados de todos os hospitais
        const allHospitalsData = await fetchAllHospitalsData();
        
        if (!allHospitalsData || Object.keys(allHospitalsData).length === 0) {
            throw new Error('Nenhum dado retornado da API');
        }
        
        // Processar e estruturar dados
        const processedData = {};
        
        Object.entries(allHospitalsData).forEach(([hospitalId, leitosArray]) => {
            if (!Array.isArray(leitosArray)) {
                logWarn(`Dados inválidos para hospital ${hospitalId}`);
                return;
            }
            
            processedData[hospitalId] = {
                nome: CONFIG.HOSPITAIS[hospitalId]?.nome || hospitalId,
                leitos: leitosArray.map(leitoData => parseApiData(leitoData)).filter(Boolean)
            };
        });
        
        // Armazenar dados globalmente
        window.hospitalData = processedData;
        
        // Atualizar estatísticas
        let totalLeitos = 0;
        let totalOcupados = 0;
        
        Object.values(processedData).forEach(hospital => {
            totalLeitos += hospital.leitos.length;
            totalOcupados += hospital.leitos.filter(l => l.status === 'Em uso').length;
        });
        
        const taxaOcupacao = Math.round((totalOcupados / totalLeitos) * 100);
        
        logSuccess(`✅ Dados carregados: ${Object.keys(processedData).length} hospitais, ${totalLeitos} leitos, ${taxaOcupacao}% ocupação`);
        
        // Renderizar cards se estiver na view principal
        if (window.currentView === 'cards' && typeof window.renderCards === 'function') {
            window.renderCards();
        }
        
        // Renderizar dashboards se estiver numa view de dashboard
        if (window.currentView === 'dash1' && typeof window.renderDashboardHospitalar === 'function') {
            window.renderDashboardHospitalar();
        }
        
        if (window.currentView === 'dash2' && typeof window.renderDashboardExecutivo === 'function') {
            window.renderDashboardExecutivo();
        }
        
        return processedData;
        
    } catch (error) {
        logError('❌ Erro ao carregar dados dos hospitais:', error);
        
        // Fallback para dados mock se disponível
        if (typeof window.generateMockData === 'function') {
            logInfo('📋 Usando dados mock como fallback...');
            window.hospitalData = window.generateMockData();
            return window.hospitalData;
        }
        
        throw error;
    }
};

// =================== PARSEAR DADOS DA API ===================
window.parseApiData = function(apiData) {
    if (!apiData || !apiData.leito) return null;
    
    return {
        leito: parseInt(apiData.leito),
        tipo: apiData.tipo || 'ENF/APTO',
        status: apiData.status || 'Vago',
        nome: apiData.nome || '',
        matricula: apiData.matricula || '',
        idade: apiData.idade ? parseInt(apiData.idade) : null,
        pps: apiData.pps ? parseInt(apiData.pps) : null,
        spict: apiData.spict || '',
        complexidade: apiData.complexidade || 'I',
        previsaoAlta: apiData.prevAlta || '',
        admAt: apiData.admAt || '',
        linhasCuidado: apiData.linhas ? 
            (typeof apiData.linhas === 'string' ? apiData.linhas.split('|').filter(x => x) : apiData.linhas) : [],
        concessoes: apiData.concessoes ? 
            (typeof apiData.concessoes === 'string' ? apiData.concessoes.split('|').filter(x => x) : apiData.concessoes) : [],
        paciente: null // Será preenchido se status for 'Em uso'
    };
};

// =================== DADOS MOCK PARA FALLBACK ===================
window.generateMockData = function() {
    logInfo('Gerando dados mock para fallback...');
    
    const mockData = {};
    
    Object.entries(CONFIG.HOSPITAIS).forEach(([hospitalId, hospital]) => {
        const leitos = [];
        
        for (let i = 1; i <= hospital.leitos; i++) {
            const isOcupado = Math.random() > 0.4; // 60% ocupação
            
            leitos.push({
                leito: i,
                tipo: i > (hospital.leitos - (hospital.uti || 0)) ? 'UTI' : 'ENF/APTO',
                status: isOcupado ? 'Em uso' : 'Vago',
                nome: isOcupado ? `Paciente ${i}` : '',
                matricula: isOcupado ? `${hospitalId}${String(i).padStart(3, '0')}` : '',
                idade: isOcupado ? Math.floor(Math.random() * 80) + 20 : null,
                pps: isOcupado ? Math.floor(Math.random() * 100) : null,
                spict: isOcupado ? (Math.random() > 0.5 ? 'elegivel' : 'nao_elegivel') : '',
                complexidade: isOcupado ? ['I', 'II', 'III'][Math.floor(Math.random() * 3)] : '',
                previsaoAlta: isOcupado ? ['Hoje Ouro', '24h 2R', '48h 3R'][Math.floor(Math.random() * 3)] : '',
                admAt: isOcupado ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : '',
                linhasCuidado: isOcupado ? ['Cuidados Paliativos', 'APS'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
                concessoes: isOcupado ? ['Fisioterapia', 'Oxigenoterapia'].slice(0, Math.floor(Math.random() * 2) + 1) : []
            });
        }
        
        mockData[hospitalId] = {
            nome: hospital.nome,
            leitos: leitos
        };
    });
    
    logInfo('📋 Dados mock gerados para fallback');
    return mockData;
}

// =================== TESTES E MONITORAMENTO ===================

// Testar conectividade da API
window.testAPI = async function() {
    try {
        logInfo('🔍 Testando conectividade da API...');
        const result = await apiGet('test');
        
        if (result) {
            logSuccess('✅ API funcionando corretamente');
            return {
                status: 'success',
                message: 'API funcionando corretamente',
                response: result
            };
        } else {
            throw new Error('Resposta inválida da API');
        }
    } catch (error) {
        logError('❌ Erro na conectividade da API:', error);
        return {
            status: 'error',
            message: error.message,
            error: error
        };
    }
};

// Monitorar API (executar a cada 5 minutos)
window.monitorAPI = function() {
    // Teste inicial
    window.testAPI();
    
    // Monitoramento contínuo
    setInterval(async () => {
        const testResult = await window.testAPI();
        if (testResult.status === 'error') {
            logError('⚠️ API com problemas - tentando recarregar dados em 30 segundos...');
            setTimeout(() => {
                window.loadHospitalData().catch(error => {
                    logError('Falha no reload automático:', error);
                });
            }, 30000);
        }
    }, 5 * 60 * 1000); // 5 minutos
};

// =================== AUTO-ATUALIZAÇÃO DE DADOS ===================

// Iniciar timer de atualização automática
window.startAutoUpdate = function(intervalMinutes = 4) {
    if (window.autoUpdateInterval) {
        clearInterval(window.autoUpdateInterval);
    }
    
    window.autoUpdateInterval = setInterval(async () => {
        if (window.isAuthenticated) {
            try {
                logInfo('🔄 Atualização automática de dados...');
                await window.loadHospitalData();
                logSuccess('✅ Dados atualizados automaticamente');
            } catch (error) {
                logError('❌ Erro na atualização automática:', error);
            }
        }
    }, intervalMinutes * 60 * 1000);
    
    logInfo(`⏰ Auto-atualização configurada para ${intervalMinutes} minutos`);
};

// Parar auto-atualização
window.stopAutoUpdate = function() {
    if (window.autoUpdateInterval) {
        clearInterval(window.autoUpdateInterval);
        window.autoUpdateInterval = null;
        logInfo('⏹️ Auto-atualização parada');
    }
};

// =================== FUNÇÕES DE ATUALIZAÇÃO MANUAL ===================

// Atualizar dados manualmente (botão do header)
window.updateData = async function() {
    const updateButton = document.querySelector('header button');
    
    try {
        // Desabilitar botão e mostrar loading
        if (updateButton) {
            updateButton.disabled = true;
            updateButton.textContent = 'Atualizando...';
        }
        
        // Carregar dados
        await window.loadHospitalData();
        
        // Resetar timer de atualização
        if (window.timerInterval) {
            clearInterval(window.timerInterval);
            window.startUpdateTimer();
        }
        
        // Feedback visual
        if (updateButton) {
            updateButton.textContent = 'Atualizado!';
            setTimeout(() => {
                updateButton.textContent = 'Atualizar';
                updateButton.disabled = false;
            }, 2000);
        }
        
        logSuccess('✅ Dados atualizados manualmente');
        
    } catch (error) {
        logError('❌ Erro na atualização manual:', error);
        
        // Restaurar botão
        if (updateButton) {
            updateButton.textContent = 'Erro - Tentar novamente';
            updateButton.disabled = false;
        }
    }
};

// =================== INICIALIZAÇÃO ===================

// Log de inicialização
logInfo('✅ API.js carregado com URL corrigida');
logInfo(`📡 API URL: ${window.API_URL}`);

// Iniciar monitoramento se autenticado
if (window.isAuthenticated) {
    setTimeout(() => {
        window.monitorAPI();
        window.startAutoUpdate(4); // 4 minutos
    }, 2000);
}

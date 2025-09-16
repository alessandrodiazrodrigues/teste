// =================== INTEGRAÇÃO API GOOGLE APPS SCRIPT ===================

// URL da API no Google Apps Script
window.API_URL = 'https://script.google.com/macros/s/AKfycbwz2o5GRiQJjpTDwve8yQAWGAO-Bb4mI_pnG8kbB_6l4wSKpde8wzALQyRJ-Zqntdo-/exec';

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
        
        const response = await fetch(url);
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

// Buscar leitos de um hospital
window.fetchHospitalData = async function(hospital) {
    try {
        logInfo(`Buscando dados do hospital: ${hospital}`);
        const data = await apiGet('state', { hospital: hospital });
        return data || [];
    } catch (error) {
        logError(`Erro ao buscar dados do hospital ${hospital}:`, error);
        return [];
    }
};

// Buscar um leito específico
window.fetchLeitoData = async function(hospital, leito) {
    try {
        const data = await apiGet('one', { hospital: hospital, leito: leito });
        return data;
    } catch (error) {
        logError(`Erro ao buscar leito ${hospital}-${leito}:`, error);
        return null;
    }
};

// Admitir paciente
window.admitirPaciente = async function(payload) {
    try {
        logInfo('Admitindo paciente via API...');
        
        // Converter arrays para string (formato da API)
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
            linhas: Array.isArray(payload.linhas) ? payload.linhas.join('|') : '',
            concessoes: Array.isArray(payload.concessoes) ? payload.concessoes.join('|') : ''
        };
        
        const result = await apiGet('admit', apiPayload);
        logSuccess('Paciente admitido com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao admitir paciente:', error);
        throw error;
    }
};

// Atualizar paciente
window.atualizarPaciente = async function(payload) {
    try {
        logInfo('Atualizando paciente via API...');
        
        const apiPayload = {
            hospital: payload.hospital,
            leito: payload.leito,
            idade: payload.idade || null,
            pps: payload.pps || null,
            spict: payload.spict || '',
            complexidade: payload.complexidade || '',
            prevAlta: payload.prevAlta || '',
            linhas: Array.isArray(payload.linhas) ? payload.linhas.join('|') : '',
            concessoes: Array.isArray(payload.concessoes) ? payload.concessoes.join('|') : ''
        };
        
        const result = await apiGet('update', apiPayload);
        logSuccess('Paciente atualizado com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao atualizar paciente:', error);
        throw error;
    }
};

// Dar alta
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logInfo(`Dando alta: ${hospital}-${leito}`);
        
        const result = await apiGet('alta', {
            hospital: hospital,
            leito: leito
        });
        
        logSuccess('Alta processada com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao dar alta:', error);
        throw error;
    }
};

// =================== FUNÇÕES DE CORES ===================

// Buscar cores customizadas
window.fetchColors = async function() {
    try {
        const data = await apiGet('getcolors');
        return data || {};
    } catch (error) {
        logError('Erro ao buscar cores:', error);
        return {};
    }
};

// Salvar cores customizadas
window.saveColors = async function(colors) {
    try {
        logInfo('Salvando cores via API...');
        
        const result = await apiGet('savecolors', {
            colors: JSON.stringify(colors)
        });
        
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

// =================== FUNÇÕES AUXILIARES ===================

// Testar conectividade com a API
window.testAPI = async function() {
    try {
        logInfo('Testando conectividade da API...');
        const result = await apiGet('test');
        logSuccess('API funcionando corretamente');
        return result;
    } catch (error) {
        logError('Erro no teste da API:', error);
        return false;
    }
};

// Converter dados da API para formato interno
window.parseApiData = function(apiData) {
    if (!apiData) return null;
    
    return {
        hospital: apiData.hospital || '',
        leito: Number(apiData.leito) || 0,
        tipo: apiData.tipo || '',
        status: apiData.status || 'Vago',
        nome: apiData.nome || '',
        matricula: apiData.matricula || '',
        idade: apiData.idade || null,
        admAt: apiData.admAt || '',
        pps: apiData.pps || null,
        spict: apiData.spict || '',
        complexidade: apiData.complexidade || '',
        previsaoAlta: apiData.prevAlta || '',
        linhasCuidado: apiData.linhas ? (typeof apiData.linhas === 'string' ? apiData.linhas.split('|').filter(x => x) : apiData.linhas) : [],
        concessoes: apiData.concessoes ? (typeof apiData.concessoes === 'string' ? apiData.concessoes.split('|').filter(x => x) : apiData.concessoes) : []
    };
};

// Carregar dados de todos os hospitais
window.loadAllHospitalsData = async function() {
    try {
        logInfo('Carregando dados de todos os hospitais...');
        
        const hospitalsData = {};
        const hospitalIds = Object.keys(CONFIG.HOSPITAIS);
        
        // Buscar dados de cada hospital em paralelo
        const promises = hospitalIds.map(async (hospitalId) => {
            const data = await fetchHospitalData(hospitalId);
            const parsedData = data.map(parseApiData).filter(item => item !== null);
            
            // Organizar em formato de leitos
            const leitos = [];
            for (let i = 1; i <= CONFIG.HOSPITAIS[hospitalId].leitos; i++) {
                const leitoData = parsedData.find(l => l.leito === i);
                if (leitoData) {
                    leitos.push({
                        numero: i,
                        tipo: leitoData.tipo,
                        status: leitoData.status === 'Em uso' ? 'ocupado' : 'vago',
                        paciente: leitoData.status === 'Em uso' ? {
                            nome: leitoData.nome,
                            matricula: leitoData.matricula,
                            idade: leitoData.idade,
                            pps: leitoData.pps ? `${leitoData.pps}%` : null,
                            spictBr: leitoData.spict === 'elegivel' ? 'Elegível' : 'Não elegível',
                            complexidade: leitoData.complexidade,
                            previsaoAlta: leitoData.previsaoAlta,
                            concessoes: leitoData.concessoes,
                            linhasCuidado: leitoData.linhasCuidado,
                            admissao: leitoData.admAt ? new Date(leitoData.admAt).toLocaleString('pt-BR') : ''
                        } : null
                    });
                } else {
                    // Leito vago
                    leitos.push({
                        numero: i,
                        tipo: i <= 10 ? 'ENF/APTO' : 'UTI',
                        status: 'vago',
                        paciente: null
                    });
                }
            }
            
            return [hospitalId, {
                nome: CONFIG.HOSPITAIS[hospitalId].nome,
                leitos: leitos.sort((a, b) => a.numero - b.numero)
            }];
        });
        
        const results = await Promise.all(promises);
        results.forEach(([hospitalId, data]) => {
            hospitalsData[hospitalId] = data;
        });
        
        logSuccess(`Dados carregados: ${hospitalIds.length} hospitais, ${Object.values(hospitalsData).reduce((acc, h) => acc + h.leitos.length, 0)} leitos`);
        return hospitalsData;
        
    } catch (error) {
        logError('Erro ao carregar dados dos hospitais:', error);
        return {};
    }
};

logSuccess('API.js carregado - Integração Google Apps Script ativa');

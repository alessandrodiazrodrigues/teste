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

// Salvar cores personalizadas
window.saveColors = async function(colors) {
    try {
        logInfo('Salvando cores personalizadas...');
        const result = await apiPost('saveColors', { colors: colors });
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
        const result = await apiGet('resetColors');
        logSuccess('Cores resetadas com sucesso');
        return result;
    } catch (error) {
        logError('Erro ao resetar cores:', error);
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
            (typeof apiData.concessoes === 'string' ? apiData.concessoes.split('|').filter(x => x) : apiData.concessoes) : []
    };
};

// =================== FUNÇÃO PRINCIPAL: CARREGAR DADOS DE TODOS OS HOSPITAIS ===================
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

// =================== CORREÇÃO CRÍTICA: FUNÇÃO loadHospitalData ===================
// Esta função estava faltando e é essencial para o funcionamento do sistema
window.loadHospitalData = async function() {
    try {
        logInfo('🔄 Iniciando carregamento dos dados hospitalares...');
        
        // Carregar todos os dados dos hospitais
        const hospitalsData = await window.loadAllHospitalsData();
        
        // Atualizar variável global
        window.hospitalData = hospitalsData;
        
        // Verificar se dados foram carregados
        const totalHospitais = Object.keys(hospitalsData).length;
        const totalLeitos = Object.values(hospitalsData).reduce((acc, h) => acc + (h.leitos ? h.leitos.length : 0), 0);
        
        if (totalHospitais > 0) {
            logSuccess(`✅ Dados reais carregados com sucesso: ${totalHospitais} hospitais, ${totalLeitos} leitos`);
            
            // Trigger para rerender dashboards se necessário
            if (window.renderCards && typeof window.renderCards === 'function') {
                setTimeout(() => {
                    window.renderCards();
                }, 500);
            }
            
            return hospitalsData;
        } else {
            logError('❌ Nenhum dado foi carregado da API - sem fallback, aguardando dados reais');
            throw new Error('Nenhum dado real encontrado na API');
        }
        
    } catch (error) {
        logError('❌ Erro crítico ao carregar dados hospitalares:', error);
        logError('⚠️ Sistema permanecerá sem dados até API responder corretamente');
        
        // SEM FALLBACK - apenas dados reais da API
        // Manter window.hospitalData vazio se não conseguir carregar da API
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÃO AUXILIAR: GERAR DADOS MOCK ===================
function generateMockData() {
    const mockData = {};
    
    Object.keys(CONFIG.HOSPITAIS).forEach(hospitalId => {
        const hospital = CONFIG.HOSPITAIS[hospitalId];
        if (!hospital.ativo) return;
        
        const leitos = [];
        for (let i = 1; i <= hospital.leitos; i++) {
            const isOcupado = Math.random() > 0.3; // 70% chance de estar ocupado
            
            leitos.push({
                numero: i,
                tipo: i <= 10 ? 'ENF/APTO' : 'UTI',
                status: isOcupado ? 'ocupado' : 'vago',
                paciente: isOcupado ? {
                    nome: `Paciente ${i}`,
                    matricula: `${hospitalId}${String(i).padStart(3, '0')}`,
                    idade: Math.floor(Math.random() * 80) + 20,
                    pps: `${Math.floor(Math.random() * 100)}%`,
                    spictBr: Math.random() > 0.5 ? 'Elegível' : 'Não elegível',
                    complexidade: ['I', 'II', 'III'][Math.floor(Math.random() * 3)],
                    previsaoAlta: ['Hoje Ouro', '24h 2R', '48h 3R'][Math.floor(Math.random() * 3)],
                    concessoes: ['Fisioterapia', 'Oxigenoterapia'].slice(0, Math.floor(Math.random() * 2) + 1),
                    linhasCuidado: ['Cuidados Paliativos', 'APS'].slice(0, Math.floor(Math.random() * 2) + 1),
                    admissao: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString('pt-BR')
                } : null
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
            return true;
        } else {
            throw new Error('Resposta inválida da API');
        }
    } catch (error) {
        logError('❌ Erro na conectividade da API:', error);
        return false;
    }
};

// Monitorar API (executar a cada 5 minutos)
window.monitorAPI = function() {
    // Teste inicial
    window.testAPI();
    
    // Monitoramento contínuo
    setInterval(async () => {
        const isWorking = await window.testAPI();
        if (!isWorking) {
            logError('⚠️ API com problemas - recarregando dados em 30 segundos...');
            setTimeout(() => {
                window.loadHospitalData().catch(error => {
                    logError('Falha no reload automático:', error);
                });
            }, 30000);
        }
    }, 5 * 60 * 1000); // 5 minutos
};

logSuccess('✅ API.js carregado - Integração Google Apps Script ativa com loadHospitalData');

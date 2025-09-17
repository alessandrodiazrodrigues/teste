// =================== INTEGRAÇÃO API GOOGLE APPS SCRIPT - DADOS REAIS ===================

// *** NOVA URL DA API (CORRIGIDA) ***
window.API_URL = 'https://script.google.com/macros/s/AKfycbzbE4HGYpIWGMwt0foLSkPjesbYnfHpFvATFyfMtSgcvh8Fij-VElXVelEu8n_OU3UO/exec';

// =================== FUNÇÕES DE API (CORRIGIDAS PARA CORS) ===================

// Fazer requisição GET para API (CORS-SAFE)
window.apiGet = async function(action, params = {}) {
    try {
        const url = new URL(window.API_URL);
        url.searchParams.append('action', action);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        logInfo(`API GET: ${action} - Carregando dados reais da planilha`);
        
        // *** CONFIGURAÇÃO ANTI-CORS ***
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow', // Importante para Google Apps Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // Evita preflight CORS
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

// Fazer requisição POST para API (CORS-SAFE)
window.apiPost = async function(action, payload) {
    try {
        logInfo(`API POST: ${action} - Salvando na planilha real`);
        
        // *** CONFIGURAÇÃO ANTI-CORS ***
        const response = await fetch(window.API_URL, {
            method: 'POST',
            redirect: 'follow', // Importante para Google Apps Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // Evita preflight CORS
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

// =================== FUNÇÕES ESPECÍFICAS DE LEITOS (DADOS REAIS) ===================

// Buscar leitos de um hospital específico
window.fetchHospitalData = async function(hospital) {
    try {
        logInfo(`Buscando dados REAIS do hospital: ${hospital}`);
        const data = await apiGet('getHospital', { hospital });
        logSuccess(`✅ Dados reais carregados para ${hospital}: ${data.length} leitos`);
        return data;
    } catch (error) {
        logError(`Erro ao buscar dados do hospital ${hospital}:`, error);
        throw error;
    }
};

// Buscar TODOS os dados dos hospitais (FUNÇÃO PRINCIPAL)
window.loadAllHospitalsData = async function() {
    try {
        logInfo('🔄 Carregando TODOS os dados REAIS dos hospitais...');
        
        // *** BUSCAR DADOS DIRETO DA API SEM PARÂMETROS ***
        const response = await fetch(window.API_URL, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const apiData = await response.json();
        
        if (!apiData.ok) {
            throw new Error(apiData.error || 'Erro na API');
        }
        
        // *** PROCESSAR DADOS REAIS DA PLANILHA ***
        const rawData = apiData.data;
        logInfo(`📊 Recebidos ${rawData.length} registros da planilha`);
        
        // Agrupar por hospital
        const hospitalsData = {};
        
        rawData.forEach(leitoData => {
            const hospitalId = leitoData.hospital;
            
            if (!hospitalsData[hospitalId]) {
                hospitalsData[hospitalId] = {
                    nome: CONFIG.HOSPITAIS[hospitalId]?.nome || hospitalId,
                    leitos: []
                };
            }
            
            // *** MAPEAR DADOS REAIS CORRETAMENTE ***
            const leito = {
                numero: leitoData.leito,
                tipo: leitoData.tipo,
                status: leitoData.status.toLowerCase() === 'em uso' ? 'ocupado' : 'vago',
                paciente: null
            };
            
            // Se leito ocupado, adicionar dados do paciente
            if (leito.status === 'ocupado' && leitoData.nome) {
                leito.paciente = {
                    nome: leitoData.nome,
                    matricula: leitoData.matricula,
                    idade: leitoData.idade,
                    admissao: leitoData.admAt ? new Date(leitoData.admAt).toLocaleString('pt-BR') : '',
                    pps: leitoData.pps ? `${leitoData.pps}%` : '',
                    spictBr: leitoData.spict === 'elegivel' ? 'Elegível' : 'Não elegível',
                    complexidade: leitoData.complexidade,
                    previsaoAlta: leitoData.prevAlta || '',
                    prevAlta: leitoData.prevAlta || '', // Alias para compatibilidade
                    linhasCuidado: leitoData.linhas || [],
                    linhas: leitoData.linhas || [], // Alias para compatibilidade
                    concessoes: leitoData.concessoes || []
                };
            }
            
            hospitalsData[hospitalId].leitos.push(leito);
        });
        
        // Ordenar leitos por número
        Object.keys(hospitalsData).forEach(hospitalId => {
            hospitalsData[hospitalId].leitos.sort((a, b) => a.numero - b.numero);
        });
        
        const totalHospitais = Object.keys(hospitalsData).length;
        const totalLeitos = Object.values(hospitalsData).reduce((acc, h) => acc + h.leitos.length, 0);
        
        logSuccess(`✅ DADOS REAIS carregados: ${totalHospitais} hospitais, ${totalLeitos} leitos`);
        
        return hospitalsData;
        
    } catch (error) {
        logError('❌ Erro ao carregar dados REAIS dos hospitais:', error);
        throw error;
    }
};

// =================== FUNÇÃO PRINCIPAL: loadHospitalData (SEM FALLBACK) ===================
window.loadHospitalData = async function() {
    try {
        logInfo('🔄 Iniciando carregamento dos dados REAIS...');
        
        // *** CARREGAR DADOS REAIS DA PLANILHA ***
        const hospitalsData = await window.loadAllHospitalsData();
        
        // Atualizar variável global
        window.hospitalData = hospitalsData;
        
        // Verificar se dados foram carregados
        const totalHospitais = Object.keys(hospitalsData).length;
        const totalLeitos = Object.values(hospitalsData).reduce((acc, h) => acc + (h.leitos ? h.leitos.length : 0), 0);
        
        if (totalHospitais > 0) {
            logSuccess(`✅ DADOS REAIS sincronizados: ${totalHospitais} hospitais, ${totalLeitos} leitos`);
            
            // Trigger para rerender dashboards
            if (window.renderCards && typeof window.renderCards === 'function') {
                setTimeout(() => {
                    window.renderCards();
                }, 500);
            }
            
            return hospitalsData;
        } else {
            throw new Error('Nenhum dado foi retornado pela API');
        }
        
    } catch (error) {
        logError('❌ ERRO CRÍTICO: Não foi possível carregar dados reais:', error);
        
        // *** SEM FALLBACK - APENAS DADOS REAIS ***
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÕES DE SALVAMENTO (DADOS REAIS) ===================

// Admitir paciente (salvar na planilha)
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logInfo(`Admitindo paciente no ${hospital}-${leito} NA PLANILHA REAL`);
        
        const result = await apiPost('admitir', {
            hospital: hospital,
            leito: leito,
            ...dadosPaciente
        });
        
        logSuccess('✅ Paciente admitido na planilha real!');
        return result;
    } catch (error) {
        logError('Erro ao admitir paciente:', error);
        throw error;
    }
};

// Atualizar dados do paciente (salvar na planilha)
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logInfo(`Atualizando paciente ${hospital}-${leito} NA PLANILHA REAL`);
        
        const result = await apiPost('atualizar', {
            hospital: hospital,
            leito: leito,
            ...dadosAtualizados
        });
        
        logSuccess('✅ Dados do paciente atualizados na planilha real!');
        return result;
    } catch (error) {
        logError('Erro ao atualizar paciente:', error);
        throw error;
    }
};

// Dar alta ao paciente (salvar na planilha)
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logInfo(`Dando alta ao paciente ${hospital}-${leito} NA PLANILHA REAL`);
        
        const result = await apiPost('darAlta', {
            hospital: hospital,
            leito: leito
        });
        
        logSuccess('✅ Alta processada na planilha real!');
        return result;
    } catch (error) {
        logError('Erro ao processar alta:', error);
        throw error;
    }
};

// =================== TESTES E MONITORAMENTO ===================

// Testar conectividade da API (DADOS REAIS)
window.testAPI = async function() {
    try {
        logInfo('🔍 Testando conectividade com a planilha real...');
        
        const response = await fetch(window.API_URL, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.ok) {
                logSuccess('✅ API funcionando - Planilha real conectada!');
                return true;
            }
        }
        
        throw new Error('API não respondeu corretamente');
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
            logError('⚠️ API com problemas - tentando reconectar...');
            setTimeout(() => {
                window.loadHospitalData().catch(error => {
                    logError('Falha no reload automático:', error);
                });
            }, 30000);
        }
    }, 5 * 60 * 1000); // 5 minutos
};

// =================== REFRESH APÓS AÇÕES ===================
window.refreshAfterAction = async function() {
    try {
        logInfo('🔄 Atualizando dados após ação...');
        
        // Mostrar loading
        if (window.showLoading) {
            showLoading(document.getElementById('cardsContainer'), 'Sincronizando com a planilha...');
        }
        
        // Recarregar dados da API
        await window.loadHospitalData();
        
        // Re-renderizar cards
        if (window.renderCards) {
            setTimeout(() => {
                window.renderCards();
                if (window.hideLoading) {
                    hideLoading();
                }
            }, 1000);
        }
        
        logSuccess('✅ Interface atualizada com dados da planilha');
    } catch (error) {
        logError('Erro ao atualizar interface:', error);
        if (window.hideLoading) {
            hideLoading();
        }
    }
};

logSuccess('✅ API.js carregado - CONECTADO COM DADOS REAIS DA PLANILHA');

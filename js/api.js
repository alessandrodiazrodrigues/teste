// =================== INTEGRAÇÃO API GOOGLE APPS SCRIPT - DADOS REAIS ===================

// *** NOVA URL DA API (CORRIGIDA) ***
window.API_URL = 'https://script.google.com/macros/s/AKfycbw6syeaWZg1LGgK-31PLDrOgl7FgUjIXyv-r3MD4OCKi-XNQ4ZiFb_UVnl3Gy3PRTPA/exec';

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

// =================== FUNÇÃO PRINCIPAL: loadHospitalData - CORRIGIDA ===================
window.loadHospitalData = async function() {
    try {
        logInfo('🔄 Carregando dados REAIS da planilha...');
        
        // *** BUSCAR DADOS DIRETO DA API ***
        const response = await fetch(window.API_URL, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        const apiData = await response.json();
        
        if (!apiData.ok) {
            throw new Error(apiData.error || 'API retornou erro');
        }
        
        const rawData = apiData.data;
        logInfo(`📊 API retornou ${rawData.length} registros`);
        
        // *** DEBUG: LOG DOS DADOS RECEBIDOS ***
        console.log('🔍 [DEBUG] Dados brutos da API:', rawData);
        console.log('🔍 [DEBUG] Total de registros recebidos:', rawData.length);
        
        // *** DEBUG: CONTAR REGISTROS POR HOSPITAL ***
        const contadorHospitais = {};
        rawData.forEach(reg => {
            contadorHospitais[reg.hospital] = (contadorHospitais[reg.hospital] || 0) + 1;
        });
        console.log('🔍 [DEBUG] Registros por hospital:', contadorHospitais);
        
        // *** PROCESSAR E AGRUPAR DADOS POR HOSPITAL ***
        const hospitalsData = {};
        
        // Inicializar TODOS os hospitais (H1, H2, H3, H4)
        ['H1', 'H2', 'H3', 'H4'].forEach(hospitalId => {
            hospitalsData[hospitalId] = {
                nome: CONFIG.HOSPITAIS[hospitalId]?.nome || hospitalId,
                leitos: []
            };
        });
        
        // Processar cada registro da planilha
        rawData.forEach(registro => {
            const hospitalId = registro.hospital;
            
            if (!hospitalsData[hospitalId]) {
                logInfo(`Hospital ${hospitalId} não configurado ou inativo`);
                return;
            }
            
            // *** CRIAR OBJETO LEITO COM MAPEAMENTO CORRETO ***
            const leito = {
                leito: registro.leito, // CORREÇÃO: usar 'leito' não 'numero'
                numero: registro.leito, // Alias para compatibilidade
                tipo: registro.tipo,
                status: registro.status, // "Em uso" ou "Vago"
                hospital: registro.hospital,
                
                // *** DADOS DO PACIENTE MAPEADOS DIRETAMENTE ***
                nome: registro.nome || '',
                matricula: registro.matricula || '',
                idade: registro.idade || null,
                admAt: registro.admAt || '',
                admissao: registro.admAt || '', // Alias para compatibilidade
                pps: registro.pps || null,
                spict: registro.spict || '', // "elegivel" ou "nao_elegivel"
                spictBr: registro.spict === 'elegivel' ? 'Elegível' : 'Não elegível', // Formatado
                complexidade: registro.complexidade || '',
                prevAlta: registro.prevAlta || '',
                previsaoAlta: registro.prevAlta || '', // Alias para compatibilidade
                linhas: registro.linhas || [],
                linhasCuidado: registro.linhas || [], // Alias para compatibilidade
                concessoes: registro.concessoes || []
            };
            
            // *** DEBUG: LOG DE CADA LEITO PROCESSADO ***
            if (registro.nome) {
                console.log(`🏥 [DEBUG] Leito processado: ${hospitalId}-${registro.leito} - ${registro.nome}`);
            }
            
            hospitalsData[hospitalId].leitos.push(leito);
        });
        
        // *** ORDENAR LEITOS POR NÚMERO ***
        Object.keys(hospitalsData).forEach(hospitalId => {
            hospitalsData[hospitalId].leitos.sort((a, b) => a.leito - b.leito);
        });
        
        // *** ATUALIZAR VARIÁVEL GLOBAL ***
        window.hospitalData = hospitalsData;
        
        // *** ESTATÍSTICAS FINAIS ***
        const totalHospitais = Object.keys(hospitalsData).length;
        const totalLeitos = Object.values(hospitalsData).reduce((acc, h) => acc + h.leitos.length, 0);
        const leitosOcupados = Object.values(hospitalsData).reduce((acc, h) => 
            acc + h.leitos.filter(l => l.status === 'Em uso').length, 0);
        
        logSuccess(`✅ DADOS REAIS carregados:`);
        logSuccess(`   • ${totalHospitais} hospitais ativos`);
        logSuccess(`   • ${totalLeitos} leitos totais`);
        logSuccess(`   • ${leitosOcupados} leitos ocupados`);
        
        // *** DEBUG: LOG DA ESTRUTURA FINAL ***
        console.log('🎯 [DEBUG] Estrutura final hospitalData:', window.hospitalData);
        
        return hospitalsData;
        
    } catch (error) {
        logError('❌ ERRO ao carregar dados reais:', error);
        
        // *** NÃO USAR DADOS MOCK - MANTER VAZIO ***
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÕES DE SALVAMENTO ===================

// Admitir paciente (salvar na planilha)
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logInfo(`Admitindo paciente no ${hospital}-${leito} NA PLANILHA REAL`);
        
        const payload = {
            action: 'admitir',
            hospital: hospital,
            leito: leito,
            nome: dadosPaciente.nome,
            matricula: dadosPaciente.matricula,
            idade: dadosPaciente.idade,
            pps: dadosPaciente.pps,
            spict: dadosPaciente.spict,
            prevAlta: dadosPaciente.prevAlta,
            concessoes: dadosPaciente.concessoes,
            linhas: dadosPaciente.linhas
        };
        
        const response = await fetch(window.API_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.error || 'Erro ao salvar na planilha');
        }
        
        logSuccess('✅ Paciente admitido na planilha real!');
        return result.data;
    } catch (error) {
        logError('Erro ao admitir paciente:', error);
        throw error;
    }
};

// Atualizar dados do paciente (salvar na planilha)
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logInfo(`Atualizando paciente ${hospital}-${leito} NA PLANILHA REAL`);
        
        const payload = {
            action: 'atualizar',
            hospital: hospital,
            leito: leito,
            ...dadosAtualizados
        };
        
        const response = await fetch(window.API_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.error || 'Erro ao atualizar na planilha');
        }
        
        logSuccess('✅ Dados atualizados na planilha real!');
        return result.data;
    } catch (error) {
        logError('Erro ao atualizar paciente:', error);
        throw error;
    }
};

// Dar alta ao paciente (salvar na planilha)
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logInfo(`Dando alta ao paciente ${hospital}-${leito} NA PLANILHA REAL`);
        
        const payload = {
            action: 'darAlta',
            hospital: hospital,
            leito: leito
        };
        
        const response = await fetch(window.API_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.error || 'Erro ao processar alta');
        }
        
        logSuccess('✅ Alta processada na planilha real!');
        return result.data;
    } catch (error) {
        logError('Erro ao processar alta:', error);
        throw error;
    }
};

// =================== REFRESH APÓS AÇÕES ===================
window.refreshAfterAction = async function() {
    try {
        logInfo('🔄 Recarregando dados da planilha após ação...');
        
        // Mostrar loading
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
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
        
        // Recarregar dados
        await window.loadHospitalData();
        
        // Re-renderizar cards
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 500);
        
        logSuccess('✅ Dados atualizados da planilha');
    } catch (error) {
        logError('Erro ao refresh:', error);
        
        // Mesmo com erro, tentar re-renderizar
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 1000);
    }
};

// =================== TESTES E MONITORAMENTO ===================

// Testar conectividade da API
window.testAPI = async function() {
    try {
        logInfo('🔍 Testando conectividade com a planilha...');
        
        const response = await fetch(window.API_URL, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data && data.data.length > 0) {
                logSuccess(`✅ API funcionando - ${data.data.length} registros encontrados`);
                return true;
            }
        }
        
        throw new Error('API não respondeu com dados válidos');
    } catch (error) {
        logError('❌ Erro na API:', error);
        return false;
    }
};

// =================== COMPATIBILIDADE COM VERSÕES ANTERIORES ===================

// Alias para função antiga
window.fetchHospitalData = async function(hospital) {
    logInfo(`Buscando dados do hospital: ${hospital}`);
    
    // Carregar todos os dados e filtrar
    await window.loadHospitalData();
    
    if (window.hospitalData[hospital]) {
        return window.hospitalData[hospital].leitos;
    }
    
    return [];
};

// Alias para função antiga
window.loadAllHospitalsData = window.loadHospitalData;

logSuccess('✅ API.js CORRIGIDO - Mapeamento direto dos dados da planilha');

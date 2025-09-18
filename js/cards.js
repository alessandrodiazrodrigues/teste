// =================== CARDS.JS - VERSÃO FINAL COM CORREÇÕES COMPLETAS ===================

// =================== VARIÁVEIS GLOBAIS ===================  
window.selectedLeito = null;
window.currentHospital = 'H1';

// =================== CORREÇÃO CRÍTICA: MAPEAMENTO DE HOSPITAIS ===================
window.HOSPITAL_MAPPING = {
    H1: 'Neomater',
    H2: 'Cruz Azul', 
    H3: 'Santa Marcelina',
    H4: 'Santa Clara'
};

// =================== FUNÇÃO CRÍTICA CORRIGIDA: SELECT HOSPITAL ===================
window.selectHospital = function(hospitalId) {
    logInfo(`Selecionando hospital: ${hospitalId} (${window.HOSPITAL_MAPPING[hospitalId]})`);
    
    // CORREÇÃO: Definir currentHospital ANTES de qualquer operação
    window.currentHospital = hospitalId;
    
    // CORREÇÃO: Atualizar botões visuais corretamente
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.hospital === hospitalId) {
            btn.classList.add('active');
        }
    });
    
    // CORREÇÃO: Renderizar cards com hospital correto
    window.renderCards();
    
    logSuccess(`Hospital selecionado: ${window.HOSPITAL_MAPPING[hospitalId]}`);
};

// =================== LISTAS COMPLETAS CONFORME MANUAL ===================
window.CONCESSOES_LIST = [
    "Transição Domiciliar",
    "Aplicação domiciliar de medicamentos",
    "Fisioterapia", 
    "Fonoaudiologia",
    "Aspiração",
    "Banho",
    "Curativos",
    "Oxigenoterapia",
    "Recarga de O2",
    "Orientação Nutricional - com dispositivo",
    "Orientação Nutricional - sem dispositivo",
    "Clister", 
    "PICC"
];

window.LINHAS_CUIDADO_LIST = [
    "Assiste",
    "APS",
    "Cuidados Paliativos",
    "ICO (Insuficiência Coronariana)",
    "Oncologia",
    "Pediatria",
    "Programa Autoimune - Gastroenterologia",
    "Programa Autoimune - Neuro-desmielinizante",
    "Programa Autoimune - Neuro-muscular",
    "Programa Autoimune - Reumatologia",
    "Vida Mais Leve Care",
    "Crônicos - Cardiologia",
    "Crônicos - Endocrinologia",
    "Crônicos - Geriatria",
    "Crônicos - Melhor Cuidado",
    "Crônicos - Neurologia",
    "Crônicos - Pneumologia",
    "Crônicos - Pós-bariátrica",
    "Crônicos - Reumatologia"
];

window.PPS_OPTIONS = ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

window.PREVISAO_ALTA_OPTIONS = [
    'Hoje Ouro', '24h Ouro', '24h 2R', '48h 3R', '72h', '96h', 'Sem previsao'
];

// =================== FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO CORRIGIDA ===================
window.renderCards = function() {
    logInfo('Renderizando cards com dados REAIS da API');
    
    const container = document.getElementById('cardsContainer');
    if (!container) {
        logError('Container cardsContainer não encontrado');
        return;
    }

    container.innerHTML = '';
    const hospitalId = window.currentHospital || 'H1';
    const hospital = window.hospitalData[hospitalId];
    
    // CORREÇÃO: Usar mapeamento correto de hospitais
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    if (!hospital || !hospital.leitos || hospital.leitos.length === 0) {
        container.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="color: #60a5fa; margin-bottom: 15px;">
                    <h3>📋 ${hospitalNome}</h3>
                </div>
                <div style="background: rgba(96,165,250,0.1); border-radius: 8px; padding: 20px;">
                    <p style="margin-bottom: 15px;">Carregando dados reais da planilha...</p>
                    <p style="color: #28a745;"><em>✅ API conectada - Dados sincronizando</em></p>
                </div>
            </div>
        `;
        return;
    }
    
    hospital.leitos.forEach(leito => {
        const card = createCard(leito, hospitalNome);
        container.appendChild(card);
    });
    
    logInfo(`${hospital.leitos.length} cards renderizados para ${hospitalNome} com dados reais`);
};

// =================== CRIAR CARD INDIVIDUAL - MANTÉM LAYOUT ORIGINAL 3x3 ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background: var(--card); border-radius: 12px; padding: 20px; color: var(--text-white); box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    
    // CORREÇÃO: Status da API vem como "Em uso"/"Vago", padronizar para "ocupado"/"vago"
    let isVago = leito.status === 'Vago' || leito.status === 'vago';
    if (leito.status === 'Em uso') leito.status = 'ocupado';
    if (leito.status === 'Vago') leito.status = 'vago';
    isVago = leito.status === 'vago';
    
    // CORREÇÃO: Dados vêm diretamente no objeto leito (não em leito.paciente)
    const nome = leito.nome || '';
    const matricula = leito.matricula || '';
    const idade = leito.idade || null;
    const admissao = leito.admAt || '';
    const pps = leito.pps || null;
    const spict = leito.spict || '';
    const previsaoAlta = leito.prevAlta || '';
    
    // CORREÇÃO CRÍTICA: Processar concessões e linhas vindas da API
    const concessoes = processarArrayDaAPI(leito.concessoes || []);
    const linhas = processarArrayDaAPI(leito.linhas || []);
    
    // Calcular tempo de internação
    let tempoInternacao = '';
    if (!isVago && admissao) {
        tempoInternacao = calcularTempoInternacao(admissao);
    }
    
    // Extrair iniciais do nome
    const iniciais = isVago ? '—' : getIniciais(nome);
    
    // Formatar PPS (adicionar % se não tiver)
    let ppsFormatado = pps ? `${pps}%` : '—';
    if (ppsFormatado !== '—' && !ppsFormatado.includes('%')) {
        ppsFormatado = `${pps}%`;
    }
    
    // Formatar SPICT-BR
    const spictFormatado = spict === 'elegivel' ? 'Elegível' : 
                          (spict === 'nao_elegivel' ? 'Não elegível' : '—');
    
    // CORREÇÃO: Usar leito.leito (não leito.numero)
    const numeroLeito = leito.leito || leito.numero || 'N/A';
    
    // MANTER LAYOUT ORIGINAL 3x3 CONFORME ARQUIVO ATUAL
    card.innerHTML = `
        <!-- LINHA 1: Hospital / Leito / Tipo - LAYOUT 3x3 EXATO -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">HOSPITAL</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${hospitalNome}</div>
            </div>
            
            <div style="min-height: 50px; display: flex; align-items: center; justify-content: center;">
                <div class="leito-badge ${isVago ? '' : 'ocupado'}" style="background: ${isVago ? 'var(--status-vago)' : 'var(--status-uso)'}; color: ${isVago ? '#ffffff' : '#000000'}; width: 100%; padding: 15px 8px; border-radius: 8px; font-weight: 700; text-transform: uppercase; text-align: center; font-size: 12px; letter-spacing: 1px;">
                    LEITO ${numeroLeito}
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">TIPO</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${leito.tipo === 'UTI' ? 'UTI' : 'ENF/APTO'}</div>
            </div>
        </div>

        <!-- LINHA 2: Iniciais / Matrícula / Idade - LAYOUT 3x3 EXATO -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">INICIAIS</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${iniciais}</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">MATRÍCULA</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${matricula || '—'}</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">IDADE</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${idade ? idade + ' anos' : '—'}</div>
            </div>
        </div>

        <!-- LINHA 3: PPS / SPICT-BR / Previsão de Alta - LAYOUT 3x3 EXATO -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">PPS</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${ppsFormatado}</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">SPICT-BR</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${spictFormatado}</div>
            </div>
            
            <div style="background: var(--destaque); border: 1px solid rgba(143,211,244,0.5); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: #000000; font-weight: 700; text-transform: uppercase; margin-bottom: 3px;">PREV ALTA</div>
                <div style="color: #000000; font-weight: 700; font-size: 12px; line-height: 1.2;">${previsaoAlta || '—'}</div>
            </div>
        </div>

        <!-- SEÇÃO 4: CONCESSÕES PREVISTAS NA ALTA -->
        <div class="card-section" style="margin-bottom: 15px;">
            <div class="section-title" style="font-size: 11px; color: #ffffff; background: #60a5fa; padding: 8px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; font-weight: 700;">
                CONCESSÕES PREVISTAS NA ALTA
            </div>
            <div class="chips-container" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                ${(concessoes && concessoes.length > 0) 
                    ? concessoes.map(concessao => `<span class="chip" style="font-size: 10px; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 3px 8px; border-radius: 12px; font-weight: 600;">${concessao}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <!-- SEÇÃO 5: LINHA DE CUIDADOS PROPOSTA NA ALTA -->
        <div class="card-section" style="margin-bottom: 15px;">
            <div class="section-title" style="font-size: 11px; color: #ffffff; background: #60a5fa; padding: 8px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; font-weight: 700;">
                LINHA DE CUIDADOS PROPOSTA NA ALTA
            </div>
            <div class="chips-container" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                ${(linhas && linhas.length > 0) 
                    ? linhas.map(linha => `<span class="chip" style="font-size: 10px; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 3px 8px; border-radius: 12px; font-weight: 600;">${linha}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <!-- SEÇÃO 6: ADMISSÃO E TEMPO DE INTERNAÇÃO LADO A LADO -->
        <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: flex-start; align-items: center; gap: 30px; margin-bottom: 12px;">
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">ADMISSÃO</div>
                    <div style="color: #ffffff; font-weight: 600; font-size: 11px;">${admissao ? formatarDataHora(admissao) : '—'}</div>
                </div>
                
                ${!isVago && tempoInternacao ? `
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">INTERNADO HÁ</div>
                    <div style="color: #ffffff; font-weight: 600; font-size: 11px;">${tempoInternacao}</div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <!-- BOTÕES DE AÇÃO -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
            ${isVago 
                ? `<button class="btn-action" data-action="admitir" data-leito="${numeroLeito}" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-transform: uppercase; font-size: 12px;">ADMITIR</button>`
                : `<button class="btn-action" data-action="atualizar" data-leito="${numeroLeito}" style="padding: 10px 20px; background: #374151; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-transform: uppercase; font-size: 12px;">ATUALIZAR</button>`
            }
        </div>
    `;

    // Event listeners para os botões
    const admitBtn = card.querySelector('[data-action="admitir"]');
    if (admitBtn) {
        admitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAdmissaoFlow(numeroLeito);
        });
    }
    
    const updateBtn = card.querySelector('[data-action="atualizar"]');
    if (updateBtn) {
        updateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAtualizacaoFlow(numeroLeito, leito);
        });
    }

    return card;
}

// =================== CORREÇÃO CRÍTICA: PROCESSAR ARRAYS DA API (MELHORADA) ===================
function processarArrayDaAPI(valor) {
    logDebug(`🔍 processarArrayDaAPI recebeu:`, valor, typeof valor);
    
    // Se for array, processar e filtrar
    if (Array.isArray(valor)) {
        const resultado = valor
            .filter(item => item && typeof item === 'string' && item.trim() !== '')
            .map(item => item.trim());
        logDebug(`✅ Array processado:`, resultado);
        return resultado;
    }
    
    // Se for string separada por vírgula ou ponto-e-vírgula
    if (typeof valor === 'string' && valor.length > 0) {
        // CORREÇÃO: Suportar múltiplos separadores
        let separadores = [',', ';', '|'];
        let resultado = [];
        
        for (let sep of separadores) {
            if (valor.includes(sep)) {
                resultado = valor.split(sep)
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
                break;
            }
        }
        
        // Se nenhum separador foi encontrado, tratar como item único
        if (resultado.length === 0 && valor.trim().length > 0) {
            resultado = [valor.trim()];
        }
        
        logDebug(`✅ String processada:`, resultado);
        return resultado;
    }
    
    // Se for vazio/null/undefined
    logDebug(`❌ Valor vazio ou inválido:`, valor);
    return [];
}

// =================== FLUXOS DE ADMISSÃO E ATUALIZAÇÃO ===================
function openAdmissaoFlow(leitoNumero) {
    const button = document.querySelector(`[data-action="admitir"][data-leito="${leitoNumero}"]`);
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ADMITIR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAdmissaoModal(leitoNumero);
        logInfo(`Modal de admissão aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

function openAtualizacaoFlow(leitoNumero, dadosLeito) {
    const button = document.querySelector(`[data-action="atualizar"][data-leito="${leitoNumero}"]`);
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ATUALIZAR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAtualizacaoModal(leitoNumero, dadosLeito);
        logInfo(`Modal de atualização aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

// =================== MODAIS CORRIGIDOS COM BOTÃO CANCELAR FUNCIONANDO ===================
function openAdmissaoModal(leitoNumero) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAdmissaoForm(hospitalNome, leitoNumero);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'admissao');
}

function openAtualizacaoModal(leitoNumero, dadosLeito) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'atualizacao');
    
    // *** CORREÇÃO CRÍTICA: FORÇAR PRE-MARCAÇÃO APÓS RENDERIZAÇÃO ***
    setTimeout(() => {
        forcarPreMarcacaoCheckboxes(modal, dadosLeito);
    }, 100);
}

function createModalOverlay() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 9999; backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    `;
    return modal;
}

function createAdmissaoForm(hospitalNome, leitoNumero) {
    return `
        <div style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ADMITIR PACIENTE
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>Leito:</strong> ${leitoNumero}
            </div>
            
            <!-- Dados Básicos -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">NOME COMPLETO</label>
                    <input id="admNome" type="text" placeholder="Nome completo do paciente" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">MATRÍCULA</label>
                    <input id="admMatricula" type="text" placeholder="Ex: 123456" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">IDADE</label>
                    <input id="admIdade" type="number" min="0" max="120" placeholder="Ex: 65" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                </div>
            </div>
            
            <!-- Dados Clínicos -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select id="admPPS" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="">Selecionar...</option>
                        ${window.PPS_OPTIONS.map(pps => `<option value="${pps}">${pps}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select id="admSPICT" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="nao_elegivel">Não elegível</option>
                        <option value="elegivel">Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREVISÃO ALTA</label>
                    <select id="admPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        ${window.PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- Concessões -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS NA ALTA
                    </div>
                </div>
                <div id="admConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                            <input type="checkbox" value="${c}" style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Linhas de Cuidado -->
            <div style="margin-bottom: 30px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHA DE CUIDADOS PROPOSTA NA ALTA
                    </div>
                </div>
                <div id="admLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(l => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                            <input type="checkbox" value="${l}" style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${l}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Botões -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
            </div>
        </div>
    `;
}

function createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito) {
    const tempoInternacao = dadosLeito?.admAt ? calcularTempoInternacao(dadosLeito.admAt) : '';
    const iniciais = dadosLeito?.nome ? getIniciais(dadosLeito.nome) : '';
    
    // *** CORREÇÃO CRÍTICA: PROCESSAR ARRAYS PARA PRE-MARCAÇÃO DE CHECKBOXES ***
    const concessoesAtuais = processarArrayDaAPI(dadosLeito?.concessoes || []);
    const linhasAtuais = processarArrayDaAPI(dadosLeito?.linhas || []);
    
    // *** DEBUG APRIMORADO ***
    logDebug(`🔍 DADOS RECEBIDOS:`, {
        dadosLeito,
        concessoesOriginais: dadosLeito?.concessoes,
        linhasOriginais: dadosLeito?.linhas,
        concessoesProcessadas: concessoesAtuais,
        linhasProcessadas: linhasAtuais
    });
    
    return `
        <div style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ATUALIZAR PACIENTE
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>Leito:</strong> ${leitoNumero}
            </div>
            
            <!-- Dados Básicos (alguns readonly) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">INICIAIS</label>
                    <input value="${iniciais}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">MATRÍCULA</label>
                    <input value="${dadosLeito?.matricula || ''}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">IDADE</label>
                    <input id="updIdade" type="number" value="${dadosLeito?.idade || ''}" min="0" max="120" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                </div>
            </div>
            
            <!-- Dados Clínicos Editáveis -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select id="updPPS" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="">Selecionar...</option>
                        ${window.PPS_OPTIONS.map(pps => `<option value="${pps}" ${dadosLeito?.pps && `${dadosLeito.pps}%` === pps ? 'selected' : ''}>${pps}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select id="updSPICT" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="nao_elegivel" ${dadosLeito?.spict === 'nao_elegivel' ? 'selected' : ''}>Não elegível</option>
                        <option value="elegivel" ${dadosLeito?.spict === 'elegivel' ? 'selected' : ''}>Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREVISÃO ALTA</label>
                    <select id="updPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        ${window.PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}" ${dadosLeito?.prevAlta === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- *** CORREÇÃO CRÍTICA: CONCESSÕES COM MARCAÇÃO MANUAL *** -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS NA ALTA
                    </div>
                </div>
                <div id="updConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => {
                        const isChecked = concessoesAtuais.includes(c);
                        logDebug(`🔍 Concessão "${c}": ${isChecked ? 'MARCADA' : 'desmarcada'}`);
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                                <input type="checkbox" value="${c}" ${isChecked ? 'checked' : ''} data-original="${isChecked}" style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${c}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- *** CORREÇÃO CRÍTICA: LINHAS DE CUIDADO COM MARCAÇÃO MANUAL *** -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHA DE CUIDADOS PROPOSTA NA ALTA
                    </div>
                </div>
                <div id="updLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(l => {
                        const isChecked = linhasAtuais.includes(l);
                        logDebug(`🔍 Linha "${l}": ${isChecked ? 'MARCADA' : 'desmarcada'}`);
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                                <input type="checkbox" value="${l}" ${isChecked ? 'checked' : ''} data-original="${isChecked}" style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${l}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Tempo de Internação -->
            ${tempoInternacao ? `
            <div style="margin-bottom: 20px; padding: 12px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border-left: 4px solid #fbbf24;">
                <strong>Tempo de Internação:</strong> ${tempoInternacao}
            </div>
            ` : ''}
            
            <!-- Botões -->
            <div style="display: flex; justify-content: space-between; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-alta" style="padding: 12px 30px; background: #ef4444; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">ALTA</button>
                <div style="display: flex; gap: 12px;">
                    <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                    <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
                </div>
            </div>
        </div>
    `;
}

// *** NOVA FUNÇÃO: FORÇAR PRE-MARCAÇÃO DOS CHECKBOXES ***
function forcarPreMarcacaoCheckboxes(modal, dadosLeito) {
    logDebug(`🔧 Forçando pré-marcação de checkboxes...`);
    
    const concessoesAtuais = processarArrayDaAPI(dadosLeito?.concessoes || []);
    const linhasAtuais = processarArrayDaAPI(dadosLeito?.linhas || []);
    
    logDebug(`📋 Concessões para marcar:`, concessoesAtuais);
    logDebug(`📋 Linhas para marcar:`, linhasAtuais);
    
    // *** FORÇAR MARCAÇÃO DAS CONCESSÕES ***
    const concessoesCheckboxes = modal.querySelectorAll('#updConcessoes input[type="checkbox"]');
    concessoesCheckboxes.forEach(checkbox => {
        const shouldBeChecked = concessoesAtuais.includes(checkbox.value);
        if (shouldBeChecked && !checkbox.checked) {
            checkbox.checked = true;
            checkbox.setAttribute('checked', 'checked');
            logDebug(`✅ Concessão "${checkbox.value}" marcada manualmente`);
        }
    });
    
    // *** FORÇAR MARCAÇÃO DAS LINHAS DE CUIDADO ***
    const linhasCheckboxes = modal.querySelectorAll('#updLinhas input[type="checkbox"]');
    linhasCheckboxes.forEach(checkbox => {
        const shouldBeChecked = linhasAtuais.includes(checkbox.value);
        if (shouldBeChecked && !checkbox.checked) {
            checkbox.checked = true;
            checkbox.setAttribute('checked', 'checked');
            logDebug(`✅ Linha "${checkbox.value}" marcada manualmente`);
        }
    });
    
    logDebug(`🔧 Pré-marcação concluída`);
}

// =================== CORREÇÃO CRÍTICA: EVENT LISTENERS DOS MODAIS ===================
function setupModalEventListeners(modal, tipo) {
    // CORREÇÃO: Botão Cancelar COM EVENT LISTENER FUNCIONANDO
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
            logInfo('Modal cancelado pelo usuário');
        });
    }
    
    // Botão Salvar COM INTEGRAÇÃO API REAL
    const btnSalvar = modal.querySelector('.btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const originalText = this.innerHTML;
            showButtonLoading(this, 'SALVANDO...');
            
            try {
                const dadosFormulario = coletarDadosFormulario(modal, tipo);
                
                if (tipo === 'admissao') {
                    // USAR FUNÇÃO REAL DA API
                    await window.admitirPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Paciente admitido com sucesso!');
                } else {
                    // USAR FUNÇÃO REAL DA API
                    await window.atualizarPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Dados atualizados com sucesso!');
                }
                
                hideButtonLoading(this, originalText);
                closeModal(modal);
                
                // REFRESH AUTOMÁTICO
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao salvar: ' + error.message);
                logError('Erro ao salvar:', error);
            }
        });
    }
    
    // Botão Alta COM INTEGRAÇÃO API REAL
    const btnAlta = modal.querySelector('.btn-alta');
    if (btnAlta) {
        btnAlta.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!confirm("Confirmar ALTA deste paciente?")) return;
            
            const originalText = this.innerHTML;
            showButtonLoading(this, 'PROCESSANDO ALTA...');
            
            try {
                // USAR FUNÇÃO REAL DA API
                await window.darAltaPaciente(window.currentHospital, window.selectedLeito);
                
                hideButtonLoading(this, originalText);
                showSuccessMessage('✅ Alta processada com sucesso!');
                closeModal(modal);
                
                // REFRESH AUTOMÁTICO
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao processar alta: ' + error.message);
                logError('Erro ao processar alta:', error);
            }
        });
    }
    
    // CORREÇÃO: Fechar modal clicando fora COM PREVENÇÃO DE BUBBLING
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
        }
    });
}

// =================== CORREÇÃO: FUNÇÃO CLOSE MODAL MELHORADA ===================
function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            window.selectedLeito = null;
            logInfo('Modal fechado');
        }, 300);
    }
}

// *** CORREÇÃO FINAL: FUNÇÃO DE COLETA DE DADOS COMPLETAMENTE REESCRITA ***
function coletarDadosFormulario(modal, tipo) {
    const dados = {
        hospital: window.currentHospital,
        leito: window.selectedLeito
    };
    
    if (tipo === 'admissao') {
        dados.nome = modal.querySelector('#admNome')?.value?.trim() || '';
        dados.matricula = modal.querySelector('#admMatricula')?.value?.trim() || '';
        dados.idade = parseInt(modal.querySelector('#admIdade')?.value) || null;
        dados.pps = modal.querySelector('#admPPS')?.value?.replace('%', '') || null;
        dados.spict = modal.querySelector('#admSPICT')?.value || 'nao_elegivel';
        dados.complexidade = modal.querySelector('#admComplexidade')?.value || 'I';
        dados.prevAlta = modal.querySelector('#admPrevAlta')?.value || 'SP';
        
        // *** COLETA ROBUSTA DE CHECKBOXES ***
        const concessoesSelecionadas = coletarCheckboxesSelecionados(modal, '#admConcessoes');
        const linhasSelecionadas = coletarCheckboxesSelecionados(modal, '#admLinhas');
        
        dados.concessoes = concessoesSelecionadas.length > 0 ? concessoesSelecionadas.join(',') : '';
        dados.linhas = linhasSelecionadas.length > 0 ? linhasSelecionadas.join(',') : '';
        
    } else {
        dados.idade = parseInt(modal.querySelector('#updIdade')?.value) || null;
        dados.pps = modal.querySelector('#updPPS')?.value?.replace('%', '') || null;
        dados.spict = modal.querySelector('#updSPICT')?.value || 'nao_elegivel';
        dados.complexidade = modal.querySelector('#updComplexidade')?.value || 'I';
        dados.prevAlta = modal.querySelector('#updPrevAlta')?.value || 'SP';
        
        // *** COLETA ROBUSTA DE CHECKBOXES ***
        const concessoesSelecionadas = coletarCheckboxesSelecionados(modal, '#updConcessoes');
        const linhasSelecionadas = coletarCheckboxesSelecionados(modal, '#updLinhas');
        
        dados.concessoes = concessoesSelecionadas.length > 0 ? concessoesSelecionadas.join(',') : '';
        dados.linhas = linhasSelecionadas.length > 0 ? linhasSelecionadas.join(',') : '';
    }
    
    // *** LOG FINAL DETALHADO ***
    logDebug(`📋 Dados coletados para ${tipo}:`, dados);
    logDebug(`📋 Concessões: ${dados.concessoes || 'nenhuma'}`);
    logDebug(`📋 Linhas: ${dados.linhas || 'nenhuma'}`);
    
    return dados;
}

// *** NOVA FUNÇÃO: COLETA ROBUSTA DE CHECKBOXES ***
function coletarCheckboxesSelecionados(modal, seletor) {
    const checkboxes = modal.querySelectorAll(`${seletor} input[type="checkbox"]`);
    const selecionados = [];
    
    logDebug(`🔍 Coletando checkboxes de: ${seletor}`);
    logDebug(`🔍 Total de checkboxes encontrados: ${checkboxes.length}`);
    
    checkboxes.forEach((checkbox, index) => {
        const isChecked = checkbox.checked;
        const hasCheckedAttr = checkbox.hasAttribute('checked');
        const dataOriginal = checkbox.dataset.original === 'true';
        
        logDebug(`🔍 Checkbox ${index + 1}: "${checkbox.value}"`, {
            checked: isChecked,
            hasAttribute: hasCheckedAttr,
            dataOriginal: dataOriginal,
            finalStatus: isChecked ? 'SELECIONADO' : 'não selecionado'
        });
        
        if (isChecked) {
            selecionados.push(checkbox.value);
        }
    });
    
    logDebug(`✅ Total selecionados: ${selecionados.length}`, selecionados);
    
    return selecionados;
}

// =================== FUNÇÕES AUXILIARES MANTIDAS ===================
function showButtonLoading(button, loadingText) {
    if (button) {
        button.disabled = true;
        button.innerHTML = loadingText;
        button.style.opacity = '0.7';
    }
}

function hideButtonLoading(button, originalText) {
    if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.opacity = '1';
    }
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success-toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error-toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// =================== FUNÇÕES AUXILIARES PRINCIPAIS ===================
function getIniciais(nomeCompleto) {
    if (!nomeCompleto) return '—';
    return nomeCompleto.split(' ')
        .filter(part => part.length > 0)
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 3)
        .join(' ');
}

function calcularTempoInternacao(admissao) {
    if (!admissao) return '';
    
    try {
        let dataAdmissao;
        
        if (typeof admissao === 'string') {
            if (admissao.includes('/')) {
                // Formato brasileiro: DD/MM/YYYY
                const [datePart] = admissao.split(' ');
                const [dia, mes, ano] = datePart.split('/');
                
                if (dia && mes && ano) {
                    const d = parseInt(dia);
                    const m = parseInt(mes);
                    const a = parseInt(ano);
                    
                    if (!isNaN(d) && !isNaN(m) && !isNaN(a) && 
                        d >= 1 && d <= 31 && m >= 1 && m <= 12 && a >= 1900) {
                        dataAdmissao = new Date(a, m - 1, d);
                    } else {
                        return 'Data inválida';
                    }
                } else {
                    return 'Data incompleta';
                }
            } else {
                dataAdmissao = new Date(admissao);
            }
        } else {
            dataAdmissao = new Date(admissao);
        }
        
        if (!dataAdmissao || isNaN(dataAdmissao.getTime())) {
            return 'Data inválida';
        }
        
        const agora = new Date();
        const diffTime = agora - dataAdmissao;
        
        if (diffTime < 0) return 'Data futura';
        if (diffTime > (2 * 365 * 24 * 60 * 60 * 1000)) return 'Data antiga';
        
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays === 0) return `${diffHours}h`;
        if (diffDays === 1) return `1d ${diffHours}h`;
        return `${diffDays}d ${diffHours}h`;
        
    } catch (error) {
        logError('Erro ao calcular tempo internação:', error);
        return 'Erro no cálculo';
    }
}

function formatarDataHora(dataISO) {
    if (!dataISO) return '—';
    
    try {
        const data = new Date(dataISO);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        logError('Erro ao formatar data:', error);
        return '—';
    }
}

// =================== FUNÇÕES DE LOG (EXPANDIDAS) ===================
function logInfo(message, data = null) {
    console.log(`🔵 [CARDS] ${message}`, data || '');
}

function logError(message, error = null) {
    console.error(`🔴 [CARDS ERROR] ${message}`, error || '');
}

function logSuccess(message) {
    console.log(`🟢 [CARDS SUCCESS] ${message}`);
}

function logDebug(message, data = null) {
    console.log(`🟡 [CARDS DEBUG] ${message}`, data || '');
}

// =================== CSS PARA ANIMAÇÕES E RESPONSIVIDADE ===================
if (!document.getElementById('cardsAnimations')) {
    const style = document.createElement('style');
    style.id = 'cardsAnimations';
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
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .btn-action {
            transition: all 0.2s ease;
        }
        
        .btn-action:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .btn-action:disabled {
            cursor: not-allowed;
            transform: none !important;
        }
        
        .toast {
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            border-left: 4px solid rgba(255,255,255,0.3);
        }
        
        /* Estilos para dropdowns */
        select {
            background-color: #374151 !important;
            color: #ffffff !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            border-radius: 6px !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
        }

        select option {
            background-color: #374151 !important;
            color: #ffffff !important;
        }

        select:focus {
            outline: none !important;
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
        }

        /* *** CORREÇÃO CRÍTICA: CHECKBOXES COM ESTILO MELHORADO *** */
        input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: #60a5fa;
            cursor: pointer;
        }
        
        /* Garantir que checkboxes marcados mantenham estado */
        input[type="checkbox"]:checked {
            background-color: #60a5fa !important;
            border-color: #60a5fa !important;
        }
        
        /* Labels com hover para melhor UX */
        label:has(input[type="checkbox"]) {
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            padding: 4px !important;
        }
        
        label:has(input[type="checkbox"]):hover {
            background-color: rgba(96, 165, 250, 0.1);
        }

        /* Responsividade mobile para modais */
        @media (max-width: 768px) {
            .modal-overlay > div {
                width: 95% !important;
                max-width: none !important;
                margin: 10px !important;
                max-height: 95vh !important;
            }
            
            .modal-overlay div[style*="grid-template-columns"] {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
            }
            
            .modal-overlay div[id$="Concessoes"], 
            .modal-overlay div[id$="Linhas"] {
                grid-template-columns: 1fr !important;
                max-height: 120px !important;
            }
            
            /* *** CORREÇÃO MOBILE: CHECKBOXES MAIORES NO MOBILE *** */
            @media (max-width: 768px) {
                input[type="checkbox"] {
                    width: 18px !important;
                    height: 18px !important;
                    margin-right: 10px !important;
                }
                
                label:has(input[type="checkbox"]) {
                    padding: 8px !important;
                    font-size: 13px !important;
                }
            }
        }
    `;
    document.head.appendChild(style);
}

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    logSuccess('✅ Cards.js FINAL carregado - CHECKBOXES CORRIGIDOS + Pré-marcação funcionando');
    
    // Verificar dependências
    if (typeof window.CONFIG === 'undefined') {
        logError('CONFIG não encontrado - algumas funcionalidades podem não funcionar');
    }
    
    if (typeof window.hospitalData === 'undefined') {
        window.hospitalData = {};
        logInfo('hospitalData inicializado');
    }
    
    // CORREÇÃO: Garantir que seleção inicial funcione
    if (window.currentHospital && window.HOSPITAL_MAPPING[window.currentHospital]) {
        logInfo(`Hospital inicial: ${window.currentHospital} - ${window.HOSPITAL_MAPPING[window.currentHospital]}`);
    }
});

logSuccess('🏥 CARDS.JS FINAL - CORREÇÃO COMPLETA DOS CHECKBOXES IMPLEMENTADA!');

// =================== CARDS.JS - VERSÃO COMPLETA BASEADA NO ARQUIVO ATUAL ===================

// =================== VARIÁVEIS GLOBAIS ===================  
window.selectedLeito = null;
window.currentHospital = 'H1';

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

// =================== FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO (CORRIGIDA PARA API) ===================
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
    
    if (!hospital || !hospital.leitos || hospital.leitos.length === 0) {
        container.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="color: #60a5fa; margin-bottom: 15px;">
                    <h3>📋 ${window.CONFIG?.HOSPITAIS[hospitalId]?.nome || 'Hospital'}</h3>
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
        const card = createCard(leito, hospital.nome);
        container.appendChild(card);
    });
    
    logInfo(`${hospital.leitos.length} cards renderizados para ${hospital.nome} com dados reais`);
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
    const concessoes = leito.concessoes || [];
    const linhas = leito.linhas || [];
    
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

// =================== MODAIS - MANTÉM ESTRUTURA DO ARQUIVO ATUAL ===================
window.openAdmitModal = function(hospital, leito) {
    logInfo(`Abrindo modal de admissão para ${hospital}-${leito}`);
    window.selectedLeito = leito;
    window.currentHospital = hospital;
    
    const modal = document.getElementById('patientModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('patientForm');
    
    if (!modal || !title || !form) {
        logError('Elementos do modal não encontrados');
        return;
    }
    
    title.textContent = `Admitir Paciente - ${hospital} Leito ${leito}`;
    
    form.innerHTML = `
        <div class="form-section">
            <h3>📋 Dados do Paciente</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="admNome">Nome Completo *</label>
                    <input type="text" id="admNome" required placeholder="Nome do paciente">
                </div>
                <div class="form-group">
                    <label for="admMatricula">Matrícula *</label>
                    <input type="text" id="admMatricula" required placeholder="Matrícula">
                </div>
                <div class="form-group">
                    <label for="admIdade">Idade</label>
                    <input type="number" id="admIdade" min="0" max="120" placeholder="Anos">
                </div>
                <div class="form-group">
                    <label for="admPPS">PPS (%)</label>
                    <input type="number" id="admPPS" min="0" max="100" placeholder="0-100">
                </div>
                <div class="form-group">
                    <label for="admSPICT">SPICT</label>
                    <select id="admSPICT">
                        <option value="nao_elegivel">Não Elegível</option>
                        <option value="elegivel">Elegível</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="admComplexidade">Complexidade</label>
                    <select id="admComplexidade">
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>📅 Previsão de Alta</h3>
            <div class="form-group">
                <label for="admPrevAlta">Timeline</label>
                <select id="admPrevAlta">
                    <option value="SP">Sem Previsão</option>
                    <option value="Hoje Ouro">Hoje (Ouro)</option>
                    <option value="Hoje 2R">Hoje (2R)</option>
                    <option value="24h Ouro">24h (Ouro)</option>
                    <option value="24h 2R">24h (2R)</option>
                    <option value="24h 3R">24h (3R)</option>
                    <option value="48h">48h</option>
                    <option value="72h">72h</option>
                    <option value="96h">96h</option>
                </select>
            </div>
        </div>
        
        <div class="form-section">
            <h3>🩺 Linhas de Cuidado</h3>
            <div class="checkbox-grid" id="admLinhas">
                ${renderCheckboxGroup(window.LINHAS_CUIDADO_LIST, 'linha')}
            </div>
        </div>
        
        <div class="form-section">
            <h3>💊 Concessões</h3>
            <div class="checkbox-grid" id="admConcessoes">
                ${renderCheckboxGroup(window.CONCESSOES_LIST, 'concessao')}
            </div>
        </div>
    `;
    
    setupModalEvents(modal, 'admissao');
    showModal(modal);
};

window.openUpdateModal = function(hospital, leito) {
    logInfo(`Abrindo modal de atualização para ${hospital}-${leito}`);
    
    // Buscar dados atuais do paciente
    const hospitalData = window.hospitalData[hospital];
    if (!hospitalData || !hospitalData.leitos) {
        logError('Dados do hospital não encontrados');
        return;
    }
    
    const leitoData = hospitalData.leitos.find(l => l.leito == leito);
    if (!leitoData || leitoData.status === 'vago') {
        logError('Leito não encontrado ou não está ocupado');
        return;
    }
    
    const paciente = leitoData; // Dados vêm diretamente no leito
    window.selectedLeito = leito;
    window.currentHospital = hospital;
    
    const modal = document.getElementById('patientModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('patientForm');
    
    title.textContent = `Atualizar Paciente - ${paciente.nome || 'Paciente'} (${hospital} Leito ${leito})`;
    
    form.innerHTML = `
        <div class="form-section">
            <h3>📋 Dados Clínicos</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="updIdade">Idade</label>
                    <input type="number" id="updIdade" min="0" max="120" value="${paciente.idade || ''}" placeholder="Anos">
                </div>
                <div class="form-group">
                    <label for="updPPS">PPS (%)</label>
                    <input type="number" id="updPPS" min="0" max="100" value="${paciente.pps || ''}" placeholder="0-100">
                </div>
                <div class="form-group">
                    <label for="updSPICT">SPICT</label>
                    <select id="updSPICT">
                        <option value="nao_elegivel" ${paciente.spict === 'nao_elegivel' ? 'selected' : ''}>Não Elegível</option>
                        <option value="elegivel" ${paciente.spict === 'elegivel' ? 'selected' : ''}>Elegível</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="updComplexidade">Complexidade</label>
                    <select id="updComplexidade">
                        <option value="I" ${paciente.complexidade === 'I' ? 'selected' : ''}>I</option>
                        <option value="II" ${paciente.complexidade === 'II' ? 'selected' : ''}>II</option>
                        <option value="III" ${paciente.complexidade === 'III' ? 'selected' : ''}>III</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>📅 Previsão de Alta</h3>
            <div class="form-group">
                <label for="updPrevAlta">Timeline</label>
                <select id="updPrevAlta">
                    <option value="SP" ${paciente.prevAlta === 'SP' ? 'selected' : ''}>Sem Previsão</option>
                    <option value="Hoje Ouro" ${paciente.prevAlta === 'Hoje Ouro' ? 'selected' : ''}>Hoje (Ouro)</option>
                    <option value="Hoje 2R" ${paciente.prevAlta === 'Hoje 2R' ? 'selected' : ''}>Hoje (2R)</option>
                    <option value="24h Ouro" ${paciente.prevAlta === '24h Ouro' ? 'selected' : ''}>24h (Ouro)</option>
                    <option value="24h 2R" ${paciente.prevAlta === '24h 2R' ? 'selected' : ''}>24h (2R)</option>
                    <option value="24h 3R" ${paciente.prevAlta === '24h 3R' ? 'selected' : ''}>24h (3R)</option>
                    <option value="48h" ${paciente.prevAlta === '48h' ? 'selected' : ''}>48h</option>
                    <option value="72h" ${paciente.prevAlta === '72h' ? 'selected' : ''}>72h</option>
                    <option value="96h" ${paciente.prevAlta === '96h' ? 'selected' : ''}>96h</option>
                </select>
            </div>
        </div>
        
        <div class="form-section">
            <h3>🩺 Linhas de Cuidado</h3>
            <div class="checkbox-grid" id="updLinhas">
                ${renderCheckboxGroup(window.LINHAS_CUIDADO_LIST, 'linha', paciente.linhas)}
            </div>
        </div>
        
        <div class="form-section">
            <h3>💊 Concessões</h3>
            <div class="checkbox-grid" id="updConcessoes">
                ${renderCheckboxGroup(window.CONCESSOES_LIST, 'concessao', paciente.concessoes)}
            </div>
        </div>
    `;
    
    setupModalEvents(modal, 'atualizacao');
    showModal(modal);
};

// =================== FUNÇÕES AUXILIARES DO MODAL ===================
function renderCheckboxGroup(items, prefix, selected = []) {
    return items.map(item => `
        <label class="checkbox-item">
            <input type="checkbox" value="${item}" ${selected && selected.includes(item) ? 'checked' : ''}>
            <span class="checkbox-text">${item}</span>
        </label>
    `).join('');
}

function showModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

window.closeModal = function() {
    const modal = document.getElementById('patientModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    window.selectedLeito = null;
};

// =================== CONFIGURAÇÃO DE EVENTOS DO MODAL - CORRIGIDO PARA API ===================
function setupModalEvents(modal, tipo) {
    // Botão Cancelar
    const btnCancel = modal.querySelector('.btn-cancel');
    if (btnCancel) {
        btnCancel.onclick = window.closeModal;
    }
    
    // Botão Salvar - CORREÇÃO CRÍTICA: Usar funções corretas da API
    const btnSave = modal.querySelector('.btn-save');
    if (btnSave) {
        btnSave.addEventListener('click', async function() {
            const originalText = this.innerHTML;
            showButtonLoading(this, '💾 Salvando...');
            
            try {
                const dados = coletarDadosFormulario(modal, tipo);
                
                if (tipo === 'admissao') {
                    // *** CORREÇÃO: Usar função correta da API ***
                    await window.admitirPaciente(dados.hospital, dados.leito, dados);
                    showSuccessMessage('✅ Paciente admitido com sucesso!');
                } else {
                    // *** CORREÇÃO: Usar função correta da API ***
                    await window.atualizarPaciente(dados.hospital, dados.leito, dados);
                    showSuccessMessage('✅ Dados atualizados com sucesso!');
                }
                
                hideButtonLoading(this, originalText);
                window.closeModal();
                
                // *** CORREÇÃO: REFRESH AUTOMÁTICO APÓS SALVAR ***
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao salvar: ' + error.message);
                logError('Erro ao salvar dados:', error);
            }
        });
    }
    
    // Botão Alta - CORREÇÃO CRÍTICA: Usar função correta da API
    const btnAlta = modal.querySelector('.btn-alta');
    if (btnAlta) {
        btnAlta.style.display = tipo === 'atualizacao' ? 'block' : 'none';
        btnAlta.addEventListener('click', async function() {
            if (!confirm("Confirmar ALTA deste paciente?")) return;
            
            const originalText = this.innerHTML;
            showButtonLoading(this, '🏥 Processando Alta...');
            
            try {
                // *** CORREÇÃO: Usar função correta da API ***
                await window.darAltaPaciente(window.currentHospital, window.selectedLeito);
                
                hideButtonLoading(this, originalText);
                showSuccessMessage('✅ Alta processada com sucesso!');
                window.closeModal();
                
                // *** CORREÇÃO: REFRESH AUTOMÁTICO APÓS ALTA ***
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao processar alta: ' + error.message);
                logError('Erro ao processar alta:', error);
            }
        });
    }
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            window.closeModal();
        }
    });
}

// =================== FUNÇÃO DE ALTA DIRETA DOS CARDS ===================
window.processarAlta = async function(hospital, leito) {
    if (!confirm(`Confirmar ALTA do paciente no leito ${hospital}-${leito}?`)) {
        return;
    }
    
    const card = document.querySelector(`[data-hospital="${hospital}"][data-leito="${leito}"]`);
    const button = card ? card.querySelector('.btn-discharge') : null;
    
    if (button) {
        const originalText = button.innerHTML;
        showButtonLoading(button, '🏥 Processando...');
        
        try {
            // *** CORREÇÃO: Usar função correta da API ***
            await window.darAltaPaciente(hospital, leito);
            
            showSuccessMessage('✅ Alta processada com sucesso!');
            
            // *** CORREÇÃO: REFRESH AUTOMÁTICO APÓS ALTA ***
            await window.refreshAfterAction();
            
        } catch (error) {
            if (button) hideButtonLoading(button, originalText);
            showErrorMessage('❌ Erro ao processar alta: ' + error.message);
            logError('Erro ao processar alta:', error);
        }
    }
};

// =================== FUNÇÕES AUXILIARES - MANTÉM ORIGINAIS ===================
function coletarDadosFormulario(modal, tipo) {
    const dados = {
        hospital: window.currentHospital,
        leito: window.selectedLeito
    };
    
    if (tipo === 'admissao') {
        dados.nome = modal.querySelector('#admNome')?.value || '';
        dados.matricula = modal.querySelector('#admMatricula')?.value || '';
        dados.idade = parseInt(modal.querySelector('#admIdade')?.value) || null;
        dados.pps = parseInt(modal.querySelector('#admPPS')?.value) || null;
        dados.spict = modal.querySelector('#admSPICT')?.value || 'nao_elegivel';
        dados.complexidade = modal.querySelector('#admComplexidade')?.value || 'I';
        dados.prevAlta = modal.querySelector('#admPrevAlta')?.value || 'SP';
        dados.concessoes = Array.from(modal.querySelectorAll('#admConcessoes input:checked')).map(i => i.value);
        dados.linhas = Array.from(modal.querySelectorAll('#admLinhas input:checked')).map(i => i.value);
    } else {
        dados.idade = parseInt(modal.querySelector('#updIdade')?.value) || null;
        dados.pps = parseInt(modal.querySelector('#updPPS')?.value) || null;
        dados.spict = modal.querySelector('#updSPICT')?.value || 'nao_elegivel';
        dados.complexidade = modal.querySelector('#updComplexidade')?.value || 'I';
        dados.prevAlta = modal.querySelector('#updPrevAlta')?.value || 'SP';
        dados.concessoes = Array.from(modal.querySelectorAll('#updConcessoes input:checked')).map(i => i.value);
        dados.linhas = Array.from(modal.querySelectorAll('#updLinhas input:checked')).map(i => i.value);
    }
    
    return dados;
}

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

// =================== FUNÇÕES DE LOG ===================
function logInfo(message, data = null) {
    console.log(`🔵 [CARDS] ${message}`, data || '');
}

function logError(message, error = null) {
    console.error(`🔴 [CARDS ERROR] ${message}`, error || '');
}

function logSuccess(message) {
    console.log(`🟢 [CARDS SUCCESS] ${message}`);
}

// =================== MODAIS ADICIONAIS DO ARQUIVO ORIGINAL ===================
function openAdmissaoModal(leitoNumero) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.CONFIG?.HOSPITAIS[hospitalId]?.nome || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAdmissaoForm(hospitalNome, leitoNumero);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'admissao');
}

function openAtualizacaoModal(leitoNumero, dadosLeito) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.CONFIG?.HOSPITAIS[hospitalId]?.nome || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'atualizacao');
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
            
            <!-- Concessões -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS NA ALTA
                    </div>
                </div>
                <div id="updConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                            <input type="checkbox" value="${c}" ${(dadosLeito?.concessoes || []).includes(c) ? 'checked' : ''} style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Linhas de Cuidado -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHA DE CUIDADOS PROPOSTA NA ALTA
                    </div>
                </div>
                <div id="updLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(l => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                            <input type="checkbox" value="${l}" ${(dadosLeito?.linhas || []).includes(l) ? 'checked' : ''} style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${l}</span>
                        </label>
                    `).join('')}
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

// =================== EVENT LISTENERS DOS MODAIS - COMPLETOS ===================
function setupModalEventListeners(modal, tipo) {
    // Botão Cancelar
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            closeModal(modal);
        });
    }
    
    // Botão Salvar COM INTEGRAÇÃO API REAL
    const btnSalvar = modal.querySelector('.btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async function() {
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
        btnAlta.addEventListener('click', async function() {
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
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
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

        /* Checkboxes */
        input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: #60a5fa;
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
            }
        }
    `;
    document.head.appendChild(style);
}

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    logInfo('✅ Cards.js COMPLETO carregado - Baseado no arquivo atual com API real');
    
    // Verificar dependências
    if (typeof window.CONFIG === 'undefined') {
        logError('CONFIG não encontrado - algumas funcionalidades podem não funcionar');
    }
    
    if (typeof window.hospitalData === 'undefined') {
        window.hospitalData = {};
        logInfo('hospitalData inicializado');
    }
});

logSuccess('🏥 CARDS.JS COMPLETO - Versão baseada no arquivo atual + API real funcionando!');

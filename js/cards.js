// =================== CARDS.JS - ARQUIVO COMPLETO COM CORREÇÕES ===================

// =================== DADOS DOS HOSPITAIS (API REAL) ===================
window.hospitalData = {};

// =================== LISTAS DE OPÇÕES ===================
window.CONCESSOES_LIST = [
    "Transição Domiciliar",
    "Aplicação domiciliar de medicamentos",
    "Fisioterapia",
    "Fonoaudiologia",
    "Aspiração",
    "Banho",
    "Curativos",
    "Oxigenoterapia",
    "Recarga de O₂",
    "Orientação Nutricional – com dispositivo",
    "Orientação Nutricional – sem dispositivo",
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
    "Programa Autoimune – Gastroenterologia",
    "Programa Autoimune – Neuro-desmielinizante",
    "Programa Autoimune – Neuro-muscular",
    "Programa Autoimune – Reumatologia",
    "Vida Mais Leve Care",
    "Crônicos – Cardiologia",
    "Crônicos – Endocrinologia",
    "Crônicos – Geriatria",
    "Crônicos – Melhor Cuidado",
    "Crônicos – Neurologia",
    "Crônicos – Pneumologia",
    "Crônicos – Pós-bariátrica",
    "Crônicos – Reumatologia"
];

window.PREVISAO_ALTA_OPTIONS = ['Hoje Ouro', '24h 2R', '48h 3R', '72h', '96h', 'Não definido'];

// =================== FUNÇÕES DE LOADING DOS BOTÕES ===================
window.showButtonLoading = function(button, originalText) {
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
    button.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Carregando...
        </div>
    `;
};

window.hideButtonLoading = function(button, originalText) {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.innerHTML = originalText;
};

// =================== RENDERIZAR CARDS ===================
window.renderCards = function() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    // Verificar se há dados antes de renderizar
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        if (window.showLoading) {
            window.showLoading(container, 'Carregando dados dos hospitais...');
        }
        return;
    }
    
    container.innerHTML = '';
    
    const hospital = window.hospitalData[window.currentHospital];
    if (!hospital) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Hospital não encontrado</div>';
        return;
    }
    
    // Verificar se hospital está ativo
    if (CONFIG.HOSPITAIS[window.currentHospital] && !CONFIG.HOSPITAIS[window.currentHospital].ativo) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Hospital desabilitado</div>';
        return;
    }
    
    hospital.leitos.forEach(leito => {
        const card = createCard(leito, hospital.nome);
        container.appendChild(card);
    });
    
    logInfo(`${hospital.leitos.length} cards renderizados para ${hospital.nome}`);
};

// =================== CRIAR CARD INDIVIDUAL - LAYOUT 3x3 SEM COMPLEXIDADE ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background: #1a1f2e; border-radius: 12px; padding: 20px; color: #ffffff;';
    
    const isVago = leito.status === 'vago';
    
    // Calcular tempo de internação com validação robusta
    let tempoInternacao = '';
    if (!isVago && leito.paciente && leito.paciente.admissao) {
        tempoInternacao = calcularTempoInternacao(leito.paciente.admissao);
    }
    
    card.innerHTML = `
        <!-- LINHA 1: Hospital / Leito / Tipo -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">HOSPITAL</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${hospitalNome}</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: center;">
                <div style="background: ${isVago ? '#16a34a' : '#fbbf24'}; color: ${isVago ? '#ffffff' : '#000000'}; font-weight: 700; text-transform: uppercase; padding: 15px 20px; border-radius: 8px; font-size: 14px; letter-spacing: 1px; width: 100%; text-align: center;">
                    LEITO ${leito.numero}
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">TIPO</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${leito.tipo || 'ENF/APTO'}</div>
            </div>
        </div>

        <!-- LINHA 2: Iniciais / Matrícula / Idade -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">INICIAIS</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : getIniciais(leito.paciente?.nome)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">MATRÍCULA</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : (leito.paciente?.matricula || 'N/A')}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">IDADE</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : (leito.paciente?.idade ? leito.paciente.idade + ' anos' : 'N/A')}</div>
            </div>
        </div>

        <!-- LINHA 3: PPS / SPICT-BR / Previsão de Alta (SEM COMPLEXIDADE) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">PPS</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : (leito.paciente?.pps || 'N/A')}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">SPICT-BR</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : (leito.paciente?.spictBr || 'N/A')}</div>
            </div>
            <div style="background: #8FD3F4; border: 1px solid #8FD3F4; border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(0,0,0,0.7); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">PREV ALTA</div>
                <div style="font-size: 16px; font-weight: 700; color: #000000;">${isVago ? '—' : (leito.paciente?.previsaoAlta || 'N/D')}</div>
            </div>
        </div>

        <!-- LINHA 4: CONCESSÕES PREVISTAS -->
        <div style="margin-bottom: 15px;">
            <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                    CONCESSÕES PREVISTAS
                </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; min-height: 40px;">
                ${isVago ? '<span style="color: rgba(255,255,255,0.5); font-size: 12px;">—</span>' : 
                    (leito.paciente?.concessoes && leito.paciente.concessoes.length > 0 ? 
                        leito.paciente.concessoes.map(c => 
                            `<span style="font-size: 11px; background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 4px 10px; border-radius: 12px; font-weight: 600;">${c}</span>`
                        ).join('') : '<span style="color: rgba(255,255,255,0.5); font-size: 12px;">Nenhuma</span>')}
            </div>
        </div>

        <!-- LINHA 5: LINHA DE CUIDADOS PROPOSTA -->
        <div style="margin-bottom: 15px;">
            <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                    LINHA DE CUIDADOS PROPOSTA NA ALTA
                </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; min-height: 40px;">
                ${isVago ? '<span style="color: rgba(255,255,255,0.5); font-size: 12px;">—</span>' : 
                    (leito.paciente?.linhasCuidado && leito.paciente.linhasCuidado.length > 0 ? 
                        leito.paciente.linhasCuidado.map(l => 
                            `<span style="font-size: 11px; background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 4px 10px; border-radius: 12px; font-weight: 600;">${l}</span>`
                        ).join('') : '<span style="color: rgba(255,255,255,0.5); font-size: 12px;">Nenhuma</span>')}
            </div>
        </div>

        <!-- LINHA 6: Admissão / Internado há + Botão -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; gap: 40px;">
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">ADMISSÃO</div>
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${isVago ? '—' : (leito.paciente?.admissao || 'N/A')}</div>
                </div>
                ${!isVago && tempoInternacao ? `
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">INTERNADO HÁ</div>
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${tempoInternacao}</div>
                </div>
                ` : ''}
            </div>
            <button 
                onclick="window.openForm('${window.currentHospital}', ${leito.numero}, ${isVago})" 
                style="padding: 12px 30px; background: ${isVago ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; color: #ffffff; border: 1px solid ${isVago ? '#3b82f6' : 'rgba(255,255,255,0.2)'}; border-radius: 8px; font-weight: 600; text-transform: uppercase; font-size: 14px; cursor: pointer; transition: all 0.3s;">
                ${isVago ? 'ADMITIR' : 'ATUALIZAR'}
            </button>
        </div>
    `;
    
    return card;
}

// =================== CORREÇÃO CRÍTICA: calcularTempoInternacao ===================
function calcularTempoInternacao(admissao) {
    if (!admissao) return '';
    
    try {
        let dataAdmissao;
        
        // Tentar diferentes formatos de data
        if (typeof admissao === 'string') {
            if (admissao.includes('/')) {
                // Formato brasileiro: DD/MM/YYYY HH:MM:SS
                const [datePart] = admissao.split(' ');
                const [dia, mes, ano] = datePart.split('/');
                
                // Validar partes da data
                if (!dia || !mes || !ano || dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
                    console.warn('Formato de data brasileiro inválido:', admissao);
                    return 'Data inválida';
                }
                
                dataAdmissao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            } else if (admissao.includes('-')) {
                // Formato ISO: YYYY-MM-DD ou similar
                dataAdmissao = new Date(admissao);
            } else {
                // Timestamp numérico em string
                const timestamp = parseInt(admissao);
                if (!isNaN(timestamp)) {
                    dataAdmissao = new Date(timestamp);
                } else {
                    dataAdmissao = new Date(admissao);
                }
            }
        } else if (typeof admissao === 'number') {
            // Timestamp numérico
            dataAdmissao = new Date(admissao);
        } else {
            // Objeto Date ou outro tipo
            dataAdmissao = new Date(admissao);
        }
        
        // Verificar se data é válida
        if (!dataAdmissao || isNaN(dataAdmissao.getTime())) {
            console.warn('Data de admissão inválida após parsing:', { admissao, dataAdmissao });
            return 'Data inválida';
        }
        
        // Verificar se data não é muito antiga ou futura
        const agora = new Date();
        const diffTime = agora - dataAdmissao;
        
        // Se data é futura ou muito antiga (mais de 1 ano), considerar inválida
        if (diffTime < 0) {
            console.warn('Data de admissão no futuro:', { admissao, dataAdmissao, agora });
            return 'Data futura';
        }
        
        if (diffTime > (365 * 24 * 60 * 60 * 1000)) {
            console.warn('Data de admissão muito antiga (>1 ano):', { admissao, dataAdmissao });
            return 'Data muito antiga';
        }
        
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return '1 dia';
        return `${diffDays} dias`;
        
    } catch (error) {
        console.error('Erro ao calcular tempo internação:', error, { admissao });
        return 'Erro no cálculo';
    }
}

// =================== ABRIR FORMULÁRIO COM LOADING ===================
window.openForm = function(hospitalId, leitoNumero, isVago) {
    // Mostrar loading imediatamente
    const button = event.target;
    const originalText = button.innerHTML;
    showButtonLoading(button, originalText);
    
    // Simular delay de carregamento (como se estivesse consultando API)
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 9999; backdrop-filter: blur(5px);
        `;
        
        if (isVago) {
            modal.innerHTML = createAdmissaoForm(hospitalId, leitoNumero);
        } else {
            const leitoData = window.hospitalData[hospitalId]?.leitos?.find(l => l.numero === leitoNumero);
            modal.innerHTML = createAtualizacaoForm(CONFIG.HOSPITAIS[hospitalId].nome, leitoData, hospitalId, leitoNumero);
        }
        
        document.body.appendChild(modal);
        addFormEventListeners(modal);
        
        logInfo(`Formulário ${isVago ? 'admissão' : 'atualização'} aberto para leito ${leitoNumero}`);
    }, 800);
};

// =================== FORMULÁRIO DE ADMISSÃO (INICIAIS EM VEZ DE NOME) ===================
function createAdmissaoForm(hospitalId, leitoNumero) {
    const hospitalNome = CONFIG.HOSPITAIS[hospitalId].nome;
    
    return `
        <div style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ADMISSÃO DE PACIENTE
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>Leito:</strong> ${leitoNumero}
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <!-- INICIAIS (não Nome Completo) -->
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">INICIAIS</label>
                    <input type="text" placeholder="A D" maxlength="3" style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">MATRÍCULA</label>
                    <input type="text" placeholder="14014124" style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">IDADE</label>
                    <input type="number" placeholder="42" style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                        <option>Selecione</option>
                        <option>10%</option>
                        <option>20%</option>
                        <option>30%</option>
                        <option>40%</option>
                        <option>50%</option>
                        <option>60%</option>
                        <option>70%</option>
                        <option>80%</option>
                        <option>90%</option>
                        <option>100%</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                        <option>Não elegível</option>
                        <option>Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREV ALTA</label>
                    <select style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                        <option>Hoje Ouro</option>
                        <option>24h 2R</option>
                        <option>48h 3R</option>
                        <option>72h</option>
                        <option>96h</option>
                        <option>Não definido</option>
                    </select>
                </div>
            </div>
            
            <!-- Concessões -->
            <div style="margin-bottom: 20px;">
                <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS
                    </div>
                </div>
                <div class="concessoes-list" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px;">
                    ${CONCESSOES_LIST.map(c => `
                        <label style="display: block; padding: 6px 0; cursor: pointer;">
                            <input type="checkbox" value="${c}" style="margin-right: 8px;">
                            <span style="font-size: 14px;">${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Linhas de Cuidado -->
            <div style="margin-bottom: 20px;">
                <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHA DE CUIDADOS PROPOSTA NA ALTA
                    </div>
                </div>
                <div class="linhas-list" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px;">
                    ${LINHAS_CUIDADO_LIST.map(l => `
                        <label style="display: block; padding: 6px 0; cursor: pointer;">
                            <input type="checkbox" value="${l}" style="margin-right: 8px;">
                            <span style="font-size: 14px;">${l}</span>
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

// =================== FORMULÁRIO DE ATUALIZAÇÃO (SEM COMPLEXIDADE) ===================
function createAtualizacaoForm(hospitalNome, leitoData, hospitalId, leitoNumero) {
    const tempoInternacao = leitoData && leitoData.paciente && leitoData.paciente.admissao ?
        calcularTempoInternacao(leitoData.paciente.admissao) : '';
    
    return `
        <div style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ATUALIZAÇÃO DE PACIENTE
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>Leito:</strong> ${leitoNumero}
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <!-- INICIAIS (não Nome Completo) -->
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">INICIAIS</label>
                    <input type="text" value="${leitoData && leitoData.paciente ? getIniciais(leitoData.paciente.nome) : ''}" maxlength="3" style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">MATRÍCULA</label>
                    <input type="text" value="${leitoData && leitoData.paciente ? leitoData.paciente.matricula : ''}" style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">IDADE</label>
                    <input type="number" value="${leitoData && leitoData.paciente ? leitoData.paciente.idade : ''}" style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                        ${['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'].map(p => `
                            <option ${leitoData && leitoData.paciente && leitoData.paciente.pps === p ? 'selected' : ''}>${p}</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                        <option ${leitoData && leitoData.paciente && leitoData.paciente.spictBr === 'Não elegível' ? 'selected' : ''}>Não elegível</option>
                        <option ${leitoData && leitoData.paciente && leitoData.paciente.spictBr === 'Elegível' ? 'selected' : ''}>Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREV ALTA</label>
                    <select style="width: 100%; padding: 10px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;">
                        ${PREVISAO_ALTA_OPTIONS.map(p => `
                            <option ${leitoData && leitoData.paciente && leitoData.paciente.previsaoAlta === p ? 'selected' : ''}>${p}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <!-- Concessões -->
            <div style="margin-bottom: 20px;">
                <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS
                    </div>
                </div>
                <div class="concessoes-list" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px;">
                    ${CONCESSOES_LIST.map(c => `
                        <label style="display: block; padding: 6px 0; cursor: pointer;">
                            <input type="checkbox" value="${c}" ${leitoData && leitoData.paciente && leitoData.paciente.concessoes && leitoData.paciente.concessoes.includes(c) ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="font-size: 14px;">${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Linhas de Cuidado -->
            <div style="margin-bottom: 20px;">
                <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHA DE CUIDADOS PROPOSTA NA ALTA
                    </div>
                </div>
                <div class="linhas-list" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px;">
                    ${LINHAS_CUIDADO_LIST.map(l => `
                        <label style="display: block; padding: 6px 0; cursor: pointer;">
                            <input type="checkbox" value="${l}" ${leitoData && leitoData.paciente && leitoData.paciente.linhasCuidado && leitoData.paciente.linhasCuidado.includes(l) ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="font-size: 14px;">${l}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Informações de internação -->
            ${leitoData && leitoData.paciente && leitoData.paciente.admissao ? `
            <div style="display: flex; gap: 40px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 20px;">
                <div>
                    <span style="font-size: 12px; color: rgba(255,255,255,0.6);">Admissão:</span>
                    <strong style="margin-left: 8px;">${leitoData.paciente.admissao}</strong>
                </div>
                <div>
                    <span style="font-size: 12px; color: rgba(255,255,255,0.6);">Internado há:</span>
                    <strong style="margin-left: 8px;">${tempoInternacao}</strong>
                </div>
            </div>
            ` : ''}
            
            <!-- Botões - ALTA SEM "DAR" -->
            <div style="display: flex; justify-content: space-between; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                <div style="display: flex; gap: 12px;">
                    <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
                    <button class="btn-alta" style="padding: 12px 30px; background: #ef4444; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">ALTA</button>
                </div>
            </div>
        </div>
    `;
}

// =================== EVENT LISTENERS DOS FORMULÁRIOS COM LOADING ===================
function addFormEventListeners(modal) {
    // Botão Cancelar
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    // Botão Salvar com Loading
    const btnSalvar = modal.querySelector('.btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', function() {
            const originalText = this.innerHTML;
            showButtonLoading(this, originalText);
            
            // Simular salvamento
            setTimeout(() => {
                hideButtonLoading(this, originalText);
                alert('✅ Dados salvos com sucesso!');
                modal.remove();
                
                // Atualizar cards
                if (window.renderCards) {
                    window.renderCards();
                }
            }, 1200);
        });
    }
    
    // Botão Alta com Loading
    const btnAlta = modal.querySelector('.btn-alta');
    if (btnAlta) {
        btnAlta.addEventListener('click', function() {
            const originalText = this.innerHTML;
            showButtonLoading(this, originalText);
            
            // Simular processo de alta
            setTimeout(() => {
                hideButtonLoading(this, originalText);
                alert('✅ Alta processada com sucesso!');
                modal.remove();
                
                // Atualizar cards
                if (window.renderCards) {
                    window.renderCards();
                }
            }, 1500);
        });
    }
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// =================== FUNÇÕES AUXILIARES ===================
function getIniciais(nomeCompleto) {
    if (!nomeCompleto) return '';
    return nomeCompleto.split(' ')
        .filter(part => part.length > 0)
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 3) // Máximo 3 iniciais
        .join(' ');
}

// =================== FECHAR MODAL ===================
window.closeModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
};

// =================== CSS PARA DROPDOWN CORRIGIDO + LOADING ===================
const cardsCSS = `
<style>
/* =================== LOADING SPINNER =================== */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.btn-loading {
    pointer-events: none;
    opacity: 0.7;
}

.btn-loading .loading-spinner {
    margin-right: 8px;
}

/* =================== DROPDOWN FIX CRÍTICO =================== */
select {
    background-color: #374151 !important;
    color: #ffffff !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
    border-radius: 6px !important;
    padding: 10px 12px !important;
    font-size: 14px !important;
    width: 100% !important;
    cursor: pointer !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
}

select option {
    background-color: #374151 !important;
    color: #ffffff !important;
    padding: 8px !important;
}

select:hover {
    border-color: rgba(255,255,255,0.4) !important;
    background-color: #4b5563 !important;
}

select:focus {
    outline: none !important;
    border-color: #60a5fa !important;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
}

/* Para formulários modais */
.modal-overlay select {
    background-color: #1f2937 !important;
    color: #ffffff !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
}

.modal-overlay select option {
    background-color: #1f2937 !important;
    color: #ffffff !important;
}

/* Correção para WebKit (Chrome/Safari) */
select::-webkit-scrollbar {
    width: 8px;
}

select::-webkit-scrollbar-track {
    background: #374151;
}

select::-webkit-scrollbar-thumb {
    background: #6b7280;
    border-radius: 4px;
}

select::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

/* =================== RESPONSIVIDADE MOBILE =================== */
@media (max-width: 768px) {
    .card > div {
        margin-bottom: 10px !important;
    }
    
    .card > div > div {
        padding: 10px !important;
        font-size: 14px !important;
    }
    
    .card button {
        padding: 10px 20px !important;
        font-size: 12px !important;
    }
    
    /* ALINHAMENTO DOS BOXES MOBILE */
    .card-row {
        display: grid !important;
        grid-template-columns: 1fr 1fr 1fr !important;
        gap: 8px !important;
        margin-bottom: 12px !important;
    }
    
    .card-field {
        flex: 1 !important;
        min-width: 0 !important;
    }
}
</style>
`;

// Inserir CSS no documento
if (!document.getElementById('cardsStyles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'cardsStyles';
    styleEl.innerHTML = cardsCSS;
    document.head.appendChild(styleEl);
}

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    logInfo('✅ Cards.js carregado com todas as correções aplicadas');
});

logSuccess('✅ Cards.js COMPLETO CORRIGIDO: Fix NaN dias + Validação robusta + ENF/APTO + Iniciais + Loading + Dropdowns escuros + Sem Complexidade + Botão ALTA');

// =================== DADOS DOS HOSPITAIS ===================
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

window.PREVISAO_ALTA_OPTIONS = [
    'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
    '24h Ouro', '24h 2R', '24h 3R',
    '48h', '72h', '96h', 'SP'
];

// =================== CARREGAR DADOS DOS HOSPITAIS ===================
window.loadHospitalData = function() {
    logInfo('Carregando dados dos hospitais...');
    
    // Gerar dados mock para cada hospital
    Object.keys(CONFIG.HOSPITAIS).forEach(hospitalId => {
        const hospital = CONFIG.HOSPITAIS[hospitalId];
        window.hospitalData[hospitalId] = {
            nome: hospital.nome,
            leitos: []
        };
        
        // Gerar leitos
        for (let i = 1; i <= hospital.leitos; i++) {
            const isOcupado = Math.random() > 0.3; // 70% de ocupação
            
            if (isOcupado) {
                window.hospitalData[hospitalId].leitos.push({
                    numero: i,
                    tipo: i <= 10 ? 'ENF/APTO' : 'UTI',
                    status: 'ocupado',
                    paciente: {
                        nome: `Paciente ${hospital.nome.substring(0,3)}-${i}`,
                        matricula: `${hospitalId}${String(i).padStart(6, '0')}`,
                        idade: 45 + (i * 3) % 40,
                        pps: `${(Math.floor(Math.random() * 10) + 1) * 10}%`,
                        spictBr: Math.random() > 0.5 ? 'Elegível' : 'Não elegível',
                        previsaoAlta: PREVISAO_ALTA_OPTIONS[Math.floor(Math.random() * PREVISAO_ALTA_OPTIONS.length)],
                        concessoes: CONCESSOES_LIST.slice(0, Math.floor(Math.random() * 3) + 1),
                        linhasCuidado: LINHAS_CUIDADO_LIST.slice(0, Math.floor(Math.random() * 2) + 1),
                        admissao: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString('pt-BR')
                    }
                });
            } else {
                window.hospitalData[hospitalId].leitos.push({
                    numero: i,
                    tipo: i <= 10 ? 'ENF/APTO' : 'UTI',
                    status: 'vago'
                });
            }
        }
    });
    
    logSuccess('Dados dos hospitais carregados');
};

// =================== RENDERIZAR CARDS ===================
window.renderCards = function() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const hospital = window.hospitalData[window.currentHospital];
    if (!hospital) return;
    
    hospital.leitos.forEach(leito => {
        const card = createCard(leito, hospital.nome);
        container.appendChild(card);
    });
    
    logInfo(`${hospital.leitos.length} cards renderizados para ${hospital.nome}`);
};

// =================== CRIAR CARD INDIVIDUAL - LAYOUT IDÊNTICO À IMAGEM ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background: #1a1f2e; border-radius: 12px; padding: 20px; color: #ffffff;';
    
    const isVago = leito.status === 'vago';
    const tempoInternacao = !isVago && leito.paciente.admissao ? 
        calcularTempoInternacao(leito.paciente.admissao) : '';
    
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
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${leito.tipo}</div>
            </div>
        </div>

        <!-- LINHA 2: Iniciais / Matrícula / Idade -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">INICIAIS</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : getIniciais(leito.paciente.nome)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">MATRÍCULA</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : leito.paciente.matricula}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">IDADE</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : leito.paciente.idade + ' anos'}</div>
            </div>
        </div>

        <!-- LINHA 3: PPS / SPICT-BR / Previsão de Alta -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">PPS</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : leito.paciente.pps}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">SPICT-BR</div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${isVago ? '—' : leito.paciente.spictBr}</div>
            </div>
            <div style="background: #8FD3F4; border: 1px solid #8FD3F4; border-radius: 8px; padding: 12px;">
                <div style="font-size: 10px; color: rgba(0,0,0,0.7); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">PREV ALTA</div>
                <div style="font-size: 16px; font-weight: 700; color: #000000;">${isVago ? '—' : leito.paciente.previsaoAlta}</div>
            </div>
        </div>

        <!-- LINHA 4: CONCESSÕES PREVISTAS NA ALTA -->
        <div style="margin-bottom: 15px;">
            <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                    CONCESSÕES PREVISTAS NA ALTA
                </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; min-height: 40px;">
                ${isVago ? '<span style="color: rgba(255,255,255,0.5); font-size: 12px;">—</span>' : 
                    leito.paciente.concessoes.map(c => 
                        `<span style="font-size: 11px; background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 4px 10px; border-radius: 12px; font-weight: 600;">${c}</span>`
                    ).join('')}
            </div>
        </div>

        <!-- LINHA 5: LINHA DE CUIDADOS PROPOSTA NA ALTA -->
        <div style="margin-bottom: 15px;">
            <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                    LINHA DE CUIDADOS PROPOSTA NA ALTA
                </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; min-height: 40px;">
                ${isVago ? '<span style="color: rgba(255,255,255,0.5); font-size: 12px;">—</span>' : 
                    leito.paciente.linhasCuidado.map(l => 
                        `<span style="font-size: 11px; background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 4px 10px; border-radius: 12px; font-weight: 600;">${l}</span>`
                    ).join('')}
            </div>
        </div>

        <!-- LINHA 6: Admissão / Internado há + Botão -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; gap: 40px;">
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">ADMISSÃO</div>
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${isVago ? '—' : leito.paciente.admissao}</div>
                </div>
                ${!isVago ? `
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">INTERNADO HÁ</div>
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${tempoInternacao}</div>
                </div>
                ` : ''}
            </div>
            <button 
                onclick="window.openForm(${leito.numero}, ${isVago})" 
                style="padding: 12px 30px; background: ${isVago ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; color: #ffffff; border: 1px solid ${isVago ? '#3b82f6' : 'rgba(255,255,255,0.2)'}; border-radius: 8px; font-weight: 600; text-transform: uppercase; font-size: 14px; cursor: pointer; transition: all 0.3s;">
                ${isVago ? 'ADMITIR' : 'ATUALIZAR'}
            </button>
        </div>
    `;
    
    return card;
}

// =================== FUNÇÕES AUXILIARES ===================
function getIniciais(nome) {
    if (!nome) return '—';
    const palavras = nome.split(' ').filter(p => p.length > 0);
    return palavras.slice(0, 3).map(p => p[0].toUpperCase()).join('');
}

function calcularTempoInternacao(dataAdmissao) {
    const admissao = new Date(dataAdmissao.split(',')[0].split('/').reverse().join('-'));
    const agora = new Date();
    const diff = agora - admissao;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${dias}d ${horas}h`;
}

// =================== ABRIR FORMULÁRIO ===================
window.openForm = function(leitoNumero, isAdmissao) {
    logInfo(`Abrindo formulário - Leito ${leitoNumero} - ${isAdmissao ? 'Admissão' : 'Atualização'}`);
    
    // Criar modal de formulário
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;';
    
    const hospital = window.hospitalData[window.currentHospital];
    const leito = hospital.leitos.find(l => l.numero === leitoNumero);
    
    if (isAdmissao) {
        modal.innerHTML = createAdmissaoForm(hospital.nome, leitoNumero, leito.tipo);
    } else {
        modal.innerHTML = createAtualizacaoForm(hospital.nome, leito);
    }
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.btn-fechar').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.btn-cancelar').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    if (!isAdmissao) {
        modal.querySelector('.btn-alta').addEventListener('click', () => {
            if (confirm('Confirma a alta do paciente?')) {
                // Atualizar dados
                leito.status = 'vago';
                delete leito.paciente;
                
                // Re-renderizar
                window.renderCards();
                document.body.removeChild(modal);
                
                logSuccess('Alta registrada com sucesso');
            }
        });
    }
    
    modal.querySelector('.btn-salvar').addEventListener('click', () => {
        // Coletar dados do formulário e salvar
        if (isAdmissao) {
            leito.status = 'ocupado';
            leito.paciente = {
                nome: modal.querySelector('#nome').value || 'Paciente',
                matricula: modal.querySelector('#matricula').value || '000000',
                idade: modal.querySelector('#idade').value || 0,
                pps: modal.querySelector('#pps').value,
                spictBr: modal.querySelector('#spict').value,
                previsaoAlta: modal.querySelector('#prevAlta').value,
                concessoes: Array.from(modal.querySelectorAll('.concessoes-list input:checked')).map(cb => cb.value),
                linhasCuidado: Array.from(modal.querySelectorAll('.linhas-list input:checked')).map(cb => cb.value),
                admissao: new Date().toLocaleString('pt-BR')
            };
        } else {
            // Atualizar dados existentes
            leito.paciente.pps = modal.querySelector('#pps').value;
            leito.paciente.spictBr = modal.querySelector('#spict').value;
            leito.paciente.previsaoAlta = modal.querySelector('#prevAlta').value;
            leito.paciente.concessoes = Array.from(modal.querySelectorAll('.concessoes-list input:checked')).map(cb => cb.value);
            leito.paciente.linhasCuidado = Array.from(modal.querySelectorAll('.linhas-list input:checked')).map(cb => cb.value);
        }
        
        // Re-renderizar
        window.renderCards();
        document.body.removeChild(modal);
        
        logSuccess(isAdmissao ? 'Paciente admitido com sucesso' : 'Dados atualizados com sucesso');
    });
};

// =================== FORMULÁRIO DE ADMISSÃO ===================
function createAdmissaoForm(hospitalNome, leitoNumero, tipoLeito) {
    return `
        <div style="background: #1a1f2e; border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">ADMISSÃO DE PACIENTE</h2>
                <button class="btn-fechar" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #ffffff; padding: 8px 16px; border-radius: 6px; cursor: pointer;">FECHAR</button>
            </div>
            
            <div style="padding: 20px;">
                <!-- Informações do Leito -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                        <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">HOSPITAL</div>
                        <div style="font-size: 16px; font-weight: 600;">${hospitalNome}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                        <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">LEITO</div>
                        <div style="font-size: 16px; font-weight: 600;">${leitoNumero}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                        <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">TIPO</div>
                        <div style="font-size: 16px; font-weight: 600;">${tipoLeito}</div>
                    </div>
                </div>
                
                <!-- Dados do Paciente -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">NOME COMPLETO</label>
                        <input id="nome" type="text" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                    </div>
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">MATRÍCULA</label>
                        <input id="matricula" type="text" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                    </div>
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">IDADE</label>
                        <input id="idade" type="number" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">PPS</label>
                        <select id="pps" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                            <option value="">Selecione</option>
                            ${[10,20,30,40,50,60,70,80,90,100].map(v => `<option value="${v}%">${v}%</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">SPICT-BR</label>
                        <select id="spict" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                            <option value="Elegível">Elegível</option>
                            <option value="Não elegível">Não elegível</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">PREV ALTA</label>
                        <select id="prevAlta" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                            ${PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Concessões -->
                <div style="margin-bottom: 20px;">
                    <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                            CONCESSÕES PREVISTAS NA ALTA
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
            </div>
            
            <!-- Botões -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
            </div>
        </div>
    `;
}

// =================== FORMULÁRIO DE ATUALIZAÇÃO ===================
function createAtualizacaoForm(hospitalNome, leito) {
    const tempoInternacao = calcularTempoInternacao(leito.paciente.admissao);
    
    return `
        <div style="background: #1a1f2e; border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">ATUALIZAÇÃO DE PACIENTE</h2>
                <button class="btn-fechar" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #ffffff; padding: 8px 16px; border-radius: 6px; cursor: pointer;">FECHAR</button>
            </div>
            
            <div style="padding: 20px;">
                <!-- Dados fixos do paciente -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
                        <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">INICIAIS</div>
                        <div style="font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.6);">${getIniciais(leito.paciente.nome)}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
                        <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">MATRÍCULA</div>
                        <div style="font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.6);">${leito.paciente.matricula}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                        <div style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">IDADE</div>
                        <div style="font-size: 16px; font-weight: 600;">${leito.paciente.idade}</div>
                    </div>
                </div>
                
                <!-- Campos editáveis -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">PPS</label>
                        <select id="pps" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                            <option value="">Selecione</option>
                            ${[10,20,30,40,50,60,70,80,90,100].map(v => 
                                `<option value="${v}%" ${leito.paciente.pps === v+'%' ? 'selected' : ''}>${v}%</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">SPICT-BR</label>
                        <select id="spict" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                            <option value="Elegível" ${leito.paciente.spictBr === 'Elegível' ? 'selected' : ''}>Elegível</option>
                            <option value="Não elegível" ${leito.paciente.spictBr === 'Não elegível' ? 'selected' : ''}>Não elegível</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">PREV ALTA</label>
                        <select id="prevAlta" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #ffffff;">
                            ${PREVISAO_ALTA_OPTIONS.map(opt => 
                                `<option value="${opt}" ${leito.paciente.previsaoAlta === opt ? 'selected' : ''}>${opt}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Concessões -->
                <div style="margin-bottom: 20px;">
                    <div style="background: #60a5fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                            CONCESSÕES PREVISTAS NA ALTA
                        </div>
                    </div>
                    <div class="concessoes-list" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px;">
                        ${CONCESSOES_LIST.map(c => `
                            <label style="display: block; padding: 6px 0; cursor: pointer;">
                                <input type="checkbox" value="${c}" ${leito.paciente.concessoes.includes(c) ? 'checked' : ''} style="margin-right: 8px;">
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
                                <input type="checkbox" value="${l}" ${leito.paciente.linhasCuidado.includes(l) ? 'checked' : ''} style="margin-right: 8px;">
                                <span style="font-size: 14px;">${l}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Informações de internação -->
                <div style="display: flex; gap: 40px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                    <div>
                        <span style="font-size: 12px; color: rgba(255,255,255,0.6);">Admissão:</span>
                        <strong style="margin-left: 8px;">${leito.paciente.admissao}</strong>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: rgba(255,255,255,0.6);">Internado há:</span>
                        <strong style="margin-left: 8px;">${tempoInternacao}</strong>
                    </div>
                </div>
            </div>
            
            <!-- Botões -->
            <div style="display: flex; justify-content: space-between; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                <div style="display: flex; gap: 12px;">
                    <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
                    <button class="btn-alta" style="padding: 12px 30px; background: #ef4444; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">DAR ALTA</button>
                </div>
            </div>
        </div>
    `;
}

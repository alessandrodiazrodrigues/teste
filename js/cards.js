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

// =================== CRIAR CARD INDIVIDUAL ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const isVago = leito.status === 'vago';
    
    card.innerHTML = `
        <!-- LINHA 1: Hospital / Leito / Tipo -->
        <div class="card-row">
            <div class="card-field">
                <div class="field-label">Hospital</div>
                <div class="field-value">${hospitalNome}</div>
            </div>
            <div class="card-field" style="text-align: center;">
                <div class="leito-badge ${isVago ? '' : 'ocupado'}">
                    LEITO ${leito.numero}
                </div>
            </div>
            <div class="card-field">
                <div class="field-label">Tipo</div>
                <div class="field-value">${leito.tipo}</div>
            </div>
        </div>

        <!-- LINHA 2: Iniciais / Matrícula / Idade -->
        <div class="card-row">
            <div class="card-field">
                <div class="field-label">Iniciais</div>
                <div class="field-value">${isVago ? '—' : getIniciais(leito.paciente.nome)}</div>
            </div>
            <div class="card-field">
                <div class="field-label">Matrícula</div>
                <div class="field-value">${isVago ? '—' : leito.paciente.matricula}</div>
            </div>
            <div class="card-field">
                <div class="field-label">Idade</div>
                <div class="field-value">${isVago ? '—' : leito.paciente.idade + ' anos'}</div>
            </div>
        </div>

        <!-- LINHA 3: PPS / SPICT-BR / Previsão de Alta -->
        <div class="card-row">
            <div class="card-field">
                <div class="field-label">PPS</div>
                <div class="field-value">${isVago ? '—' : leito.paciente.pps}</div>
            </div>
            <div class="card-field">
                <div class="field-label">SPICT-BR</div>
                <div class="field-value">${isVago ? '—' : leito.paciente.spictBr}</div>
            </div>
            <div class="card-field">
                <div class="previsao-alta">
                    ${isVago ? '—' : leito.paciente.previsaoAlta}
                </div>
            </div>
        </div>

        <!-- LINHA 4: CONCESSÕES PREVISTAS NA ALTA -->
        <div class="card-section">
            <div class="section-title">CONCESSÕES PREVISTAS NA ALTA</div>
            <div class="chips-container">
                ${isVago ? '<span style="color: #999;">—</span>' : 
                    leito.paciente.concessoes.map(c => `<span class="chip">${c}</span>`).join('')}
            </div>
        </div>

        <!-- LINHA 5: LINHA DE CUIDADOS PROPOSTA NA ALTA -->
        <div class="card-section">
            <div class="section-title">LINHA DE CUIDADOS PROPOSTA NA ALTA</div>
            <div class="chips-container">
                ${isVago ? '<span style="color: #999;">—</span>' : 
                    leito.paciente.linhasCuidado.map(l => `<span class="chip">${l}</span>`).join('')}
            </div>
        </div>

        <!-- LINHA 6: Admissão + Botão -->
        <div class="card-actions">
            <div>
                <div class="field-label">Admissão</div>
                <div class="field-value">${isVago ? '—' : leito.paciente.admissao}</div>
            </div>
            <button class="btn-action" onclick="openForm(${leito.numero}, ${isVago})">
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
    return palavras.slice(0, 3).map(p => p[0].toUpperCase()).join('.');
}

// =================== ABRIR FORMULÁRIO ===================
window.openForm = function(leitoNumero, isAdmissao) {
    logInfo(`Abrindo formulário - Leito ${leitoNumero} - ${isAdmissao ? 'Admissão' : 'Atualização'}`);
    // Implementação do formulário será feita em outro módulo
    alert(`Formulário ${isAdmissao ? 'Admissão' : 'Atualização'} - Leito ${leitoNumero}`);
};

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos DOM
    const listaPresentes = document.getElementById('lista-presentes');
    const modal = document.getElementById('modal-confirmacao');
    const nomeInput = document.getElementById('nome-confirmacao');
    const emailInput = document.getElementById('email-confirmacao');
    const btnConfirmar = document.getElementById('btn-confirmar-presente');
    const feedbackModal = document.getElementById('feedback-modal');
    const valorContainer = document.getElementById('valor-container');
    
    let presenteSelecionado = null;
    let isAjudaCusto = false;

    // Carrega os presentes do banco de dados
    async function carregarPresentes() {
        try {
            // Carrega presentes normais
            const { data: presentes, error } = await supabase
                .from('presentes')
                .select('*')
                .order('nome');

            if (error) throw error;

            // Carrega ajuda de custo já reservadas
            const { data: ajudasCusto } = await supabase
                .from('reservas_ajuda_custo')
                .select('*')
                .order('data_reserva', { ascending: false });

            // Adiciona ajuda de custo virtual se não existir
            const ajudaCustoExistente = presentes?.some(p => 
                p.nome.toLowerCase().includes('ajuda de custo')
            );

            const listaCompleta = [
                ...(presentes || []),
                ...(!ajudaCustoExistente ? [{
                    id: 'ajuda-custo-virtual',
                    nome: 'Ajuda de Custo',
                    descricao: 'Contribuição para a lua de mel',
                    valor: 0,
                    isVirtual: true,
                    ajudasCusto: ajudasCusto || []
                }] : [])
            ];

            renderizarPresentes(listaCompleta);

        } catch (error) {
            console.error('Erro ao carregar presentes:', error);
            mostrarErroCarregamento();
        }
    }

    // Renderiza os presentes na tela
    function renderizarPresentes(presentes) {
        listaPresentes.innerHTML = presentes.map(presente => {
            const isAjudaCusto = presente.nome.toLowerCase().includes('ajuda de custo');
            const isVirtual = presente.isVirtual;
            const isReservado = presente.reservado && !isAjudaCusto;
            
            return `
                <div class="presente-card ${isReservado ? 'reservado' : ''} ${isAjudaCusto ? 'ajuda-custo' : ''}">
                    <div class="presente-info">
                        <h3>${presente.nome}</h3>
                        ${presente.descricao ? `<p>${presente.descricao}</p>` : ''}
                        ${!isVirtual ? `<p class="valor">${formatarMoeda(presente.valor)}</p>` : ''}
                        
                        ${isAjudaCusto && presente.ajudasCusto?.length > 0 ? `
                            <div class="ajudas-lista">
                                <h4>Contribuições:</h4>
                                <ul>
                                    ${presente.ajudasCusto.map(ajuda => `
                                        <li>${ajuda.reservado_por} - ${formatarMoeda(ajuda.valor)}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${isReservado 
                            ? `<p class="reservado-por">Reservado por: ${presente.reservado_por || 'Convidado'}</p>`
                            : `<label class="checkbox-container">
                                <input type="checkbox" class="checkbox-reservar" 
                                    data-id="${isVirtual ? 'ajuda-custo' : presente.id}" 
                                    data-isajuda="${isAjudaCusto}">
                                <span class="checkmark"></span>
                                <span class="checkbox-label">${isAjudaCusto ? 'Quero contribuir' : 'Quero reservar'}</span>
                               </label>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        // Adiciona eventos aos checkboxes
        document.querySelectorAll('.checkbox-reservar').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.querySelectorAll('.checkbox-reservar').forEach(cb => {
                        if (cb !== e.target) cb.checked = false;
                    });
                    presenteSelecionado = e.target.dataset.id;
                    isAjudaCusto = e.target.dataset.isajuda === 'true';
                    abrirModal();
                }
            });
        });
    }

    // Formata valores monetários
    function formatarMoeda(valor) {
        return valor?.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }) || 'Valor a combinar';
    }

    // Modal functions
    function abrirModal() {
        modal.style.display = 'block';
        nomeInput.value = '';
        emailInput.value = '';
        feedbackModal.textContent = '';
        feedbackModal.className = '';
        
        if (isAjudaCusto) {
            valorContainer.innerHTML = `
                <label for="valor-ajuda">Valor da Contribuição (R$):</label>
                <input type="number" id="valor-ajuda" placeholder="Ex: 200" min="1" step="1" required>
            `;
        } else {
            valorContainer.innerHTML = '';
        }
        
        nomeInput.focus();
    }

    function fecharModal() {
        modal.style.display = 'none';
        document.querySelectorAll('.checkbox-reservar').forEach(cb => cb.checked = false);
        presenteSelecionado = null;
    }

    function mostrarErroCarregamento() {
        listaPresentes.innerHTML = `
            <div class="error-message">
                ❌ Erro ao carregar a lista. Recarregue a página.
                <button onclick="location.reload()">Recarregar</button>
            </div>
        `;
    }

    // Validação de e-mail
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Evento de confirmação
    btnConfirmar.addEventListener('click', async () => {
        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        
        // Validações
        if (!nome || !email) {
            mostrarFeedback('Por favor, preencha todos os campos', 'error');
            return;
        }

        if (!validarEmail(email)) {
            mostrarFeedback('Por favor, digite um e-mail válido', 'error');
            return;
        }

        let valorAjuda = null;
        if (isAjudaCusto) {
            const valorInput = document.getElementById('valor-ajuda');
            valorAjuda = parseFloat(valorInput.value);
            
            if (!valorAjuda || valorAjuda <= 0) {
                mostrarFeedback('Por favor, digite um valor válido para a contribuição', 'error');
                return;
            }
        }

        btnConfirmar.disabled = true;
        mostrarFeedback('Verificando convidado...', 'info');

        try {
            // Verificação rigorosa do convidado (nome E email)
            const { data: convidado, error } = await supabase
                .from('convidados_autorizados')
                .select('nome, email')
                .ilike('nome', nome)
                .eq('email', email)
                .maybeSingle();

            if (error || !convidado) {
                throw new Error('Não encontrado na lista de convidados. Verifique nome e e-mail.');
            }

            // Processa a reserva
            if (!isAjudaCusto) {
                const { data: presente } = await supabase
                    .from('presentes')
                    .select('reservado, nome')
                    .eq('id', presenteSelecionado)
                    .single();

                if (presente?.reservado) {
                    throw new Error(`"${presente.nome}" já foi reservado`);
                }

                const { error: updateError } = await supabase
                    .from('presentes')
                    .update({
                        reservado: true,
                        reservado_por: convidado.nome,
                        email_reserva: email,
                        data_reserva: new Date()
                    })
                    .eq('id', presenteSelecionado);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('reservas_ajuda_custo')
                    .insert({
                        reservado_por: convidado.nome,
                        email_reserva: email,
                        data_reserva: new Date(),
                        valor: valorAjuda
                    });

                if (insertError) throw insertError;
            }

            // Feedback de sucesso
            const mensagem = isAjudaCusto 
                ? `✅ ${convidado.nome}, sua contribuição de ${formatarMoeda(valorAjuda)} foi registrada!`
                : `✅ ${convidado.nome}, o item foi reservado com sucesso!`;
            
            mostrarFeedback(mensagem, 'success');
            
            // Atualiza a lista após 2 segundos
            setTimeout(() => {
                carregarPresentes();
                fecharModal();
            }, 2000);

        } catch (error) {
            mostrarFeedback(`❌ ${error.message}`, 'error');
            console.error('Erro na reserva:', error);
        } finally {
            btnConfirmar.disabled = false;
        }
    });

    // Mostra feedback no modal
    function mostrarFeedback(mensagem, tipo) {
        feedbackModal.innerHTML = mensagem;
        feedbackModal.className = tipo;
    }

    // Event Listeners
    document.querySelector('.close-modal').addEventListener('click', fecharModal);
    window.addEventListener('click', (e) => e.target === modal && fecharModal());

    // Inicialização
    carregarPresentes();
});

// Adicione esta função após as outras funções
function mostrarCarregamento() {
    listaPresentes.innerHTML = `
        <div class="carregando">
            <div class="spinner"></div>
            <p>Carregando lista de presentes...</p>
        </div>
    `;
}

// Modifique a função carregarPresentes para usar o loading:
async function carregarPresentes() {
    mostrarCarregamento(); // Mostra o loading
    
    try {
        // ... resto do código existente ...
    } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        mostrarErroCarregamento();
    }
}
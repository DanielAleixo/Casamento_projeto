document.addEventListener('DOMContentLoaded', async () => {
    const listaPresentes = document.getElementById('lista-presentes');
    const modal = document.getElementById('modal-confirmacao');
    const nomeInput = document.getElementById('nome-confirmacao');
    const emailInput = document.getElementById('email-confirmacao');
    const btnConfirmar = document.getElementById('btn-confirmar-presente');
    const feedbackModal = document.getElementById('feedback-modal');
    const valorContainer = document.getElementById('valor-container');

    let presenteSelecionado = null;
    let isAjudaCusto = false;

    async function carregarPresentes() {
        try {
            const { data: presentes, error } = await supabase
                .from('presentes')
                .select('*')
                .order('nome');

            if (error) throw error;

            const { data: ajudasCusto } = await supabase
                .from('reservas_ajuda_custo')
                .select('*')
                .order('data_reserva', { ascending: false });

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

    function formatarMoeda(valor) {
        return valor?.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }) || 'Valor a combinar';
    }

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

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    btnConfirmar.addEventListener('click', async () => {
        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();

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
            const { data: convidado, error } = await supabase
                .from('convidados_autorizados')
                .select('nome, email')
                .ilike('nome', nome)
                .eq('email', email)
                .maybeSingle();

            if (error || !convidado) {
                throw new Error('Não encontrado na lista de convidados. Verifique nome e e-mail.');
            }

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

            const mensagem = isAjudaCusto
                ? `✅ ${convidado.nome}, sua contribuição de ${formatarMoeda(valorAjuda)} foi registrada!`
                : `✅ ${convidado.nome}, o item foi reservado com sucesso!`;

            mostrarFeedback(mensagem, 'success');

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

    function mostrarFeedback(mensagem, tipo) {
        feedbackModal.innerHTML = mensagem;
        feedbackModal.className = tipo;
    }

    document.querySelector('.close-modal').addEventListener('click', fecharModal);
    window.addEventListener('click', (e) => e.target === modal && fecharModal());

    carregarPresentes();
});

function mostrarCarregamento() {
    listaPresentes.innerHTML = `
        <div class="carregando">
            <div class="spinner"></div>
            <p>Carregando lista de presentes...</p>
        </div>
    `;
}

async function carregarPresentes() {
    mostrarCarregamento();

    try {
    } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        mostrarErroCarregamento();
    }
}
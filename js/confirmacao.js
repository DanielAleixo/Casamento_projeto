document.addEventListener('DOMContentLoaded', async () => {

    const form = document.getElementById('formPresenca');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const presencaSelect = document.getElementById('presenca');
    const btnSubmit = document.querySelector('#formPresenca button[type="submit"]');


    const feedbackDiv = document.getElementById('feedback-mensagem') || createFeedbackElement();


    async function verificarConvidadoAutorizado(nome, email) {
        try {
            const { data, error } = await supabase
                .from('convidados_autorizados')
                .select('nome, email')
                .ilike('nome', nome)
                .eq('email', email)
                .maybeSingle();

            if (error) throw error;
            if (!data) throw new Error('Não consta na lista de convidados');

            return data;
        } catch (error) {
            console.error('Erro na verificação:', error);
            throw new Error('Verificação falhou. Use os dados exatos do convite.');
        }
    }


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Processando...';
            clearFeedback();


            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const presenca = presencaSelect.value === 'true';

            if (!nome || !email) {
                throw new Error('Preencha todos os campos!');
            }


            const convidado = await verificarConvidadoAutorizado(nome, email);


            const { data: confirmacaoExistente } = await supabase
                .from('Presença')
                .select('*')
                .eq('nome', convidado.nome)
                .eq('email', convidado.email)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();


            let resultado;
            if (confirmacaoExistente) {
                resultado = await supabase
                    .from('Presença')
                    .update({
                        presenca,
                        updated_at: new Date()
                    })
                    .eq('id', confirmacaoExistente.id);
            } else {
                resultado = await supabase
                    .from('Presença')
                    .insert({
                        nome: convidado.nome,
                        email: convidado.email,
                        presenca,
                        created_at: new Date()
                    });
            }

            if (resultado.error) throw resultado.error;


            showFeedback(
                `✅ Confirmação ${confirmacaoExistente ? 'atualizada' : 'registrada'}!<br>
                <small>${convidado.nome}, seu status: ${presenca ? 'CONFIRMADO' : 'NÃO COMPARECERÁ'}</small>`,
                'success'
            );


            nomeInput.value = convidado.nome;
            emailInput.value = convidado.email;

        } catch (error) {
            showFeedback(
                `❌ ${error.message}<br>
                <small>Verifique os dados ou contate os noivos</small>`,
                'error'
            );
            console.error('Erro detalhado:', error);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Enviar';
        }
    });


    function createFeedbackElement() {
        const div = document.createElement('div');
        div.id = 'feedback-mensagem';
        div.className = 'feedback';
        form.insertBefore(div, form.firstChild);
        return div;
    }

    function showFeedback(message, type) {
        feedbackDiv.innerHTML = message;
        feedbackDiv.className = `feedback feedback-${type}`;
        feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearFeedback() {
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback';
    }
});


async function verificarSessaoMagicLink() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {

            const usuario = data.session.user;


            const feedbackDiv = document.getElementById('feedback-mensagem') ||
                document.querySelector('.feedback') ||
                createWelcomeMessage();

            feedbackDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h3 style="color: #d8a1a4;">Bem-vindo(a) ao nosso sistema de confirmação!</h3>
                    <p style="color: #666; margin: 1rem 0;">
                        Estamos tão felizes por você estar aqui!<br>
                        Agora é só preencher o formulário abaixo para confirmar sua presença.
                    </p>
                    <p style="color: #999; font-size: 0.9rem;">
                        Email: <strong>${usuario.email}</strong>
                    </p>
                </div>
            `;

            feedbackDiv.className = 'feedback feedback-success';


            const emailInput = document.getElementById('email');
            if (emailInput && usuario.email) {
                emailInput.value = usuario.email;
                emailInput.readOnly = true;
                emailInput.style.background = '#f9f9f9';
            }


            setTimeout(() => {
                supabase.auth.signOut();
            }, 300000);
        }
    } catch (error) {
        console.log('Não há sessão ativa ou erro:', error);
    }
}

verificarSessaoMagicLink();
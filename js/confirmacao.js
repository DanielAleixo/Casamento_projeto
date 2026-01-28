// confirmacao.js - Código Completo com Atualização de Confirmação
document.addEventListener('DOMContentLoaded', async () => {
    // Elementos do formulário
    const form = document.getElementById('formPresenca');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const presencaSelect = document.getElementById('presenca');
    const btnSubmit = document.querySelector('#formPresenca button[type="submit"]');
    
    // Elemento de feedback
    const feedbackDiv = document.getElementById('feedback-mensagem') || createFeedbackElement();

    // Função para verificar convidado autorizado
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

    // Evento de envio do formulário ATUALIZADO
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // 1. Prepara UI
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Processando...';
            clearFeedback();

            // 2. Valida dados
            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const presenca = presencaSelect.value === 'true';

            if (!nome || !email) {
                throw new Error('Preencha todos os campos!');
            }

            // 3. Verifica convidado
            const convidado = await verificarConvidadoAutorizado(nome, email);
            
            // 4. Verifica se já existe confirmação prévia
            const { data: confirmacaoExistente } = await supabase
                .from('Presença')
                .select('*')
                .eq('nome', convidado.nome)
                .eq('email', convidado.email)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // 5. Se existir, ATUALIZA. Se não, CRIA nova confirmação
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

            // 6. Feedback
            showFeedback(
                `✅ Confirmação ${confirmacaoExistente ? 'atualizada' : 'registrada'}!<br>
                <small>${convidado.nome}, seu status: ${presenca ? 'CONFIRMADO' : 'NÃO COMPARECERÁ'}</small>`,
                'success'
            );

            // 7. Mantém os dados no formulário para novas alterações
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

    // Funções auxiliares
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

// Adicione no início do confirmacao.js, depois do DOMContentLoaded
async function verificarSessaoMagicLink() {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
            // Usuário veio do Magic Link
            const usuario = data.session.user;
            
            // Mostra mensagem de boas-vindas
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
            
            // Preenche automaticamente o email se vier do Magic Link
            const emailInput = document.getElementById('email');
            if (emailInput && usuario.email) {
                emailInput.value = usuario.email;
                emailInput.readOnly = true;
                emailInput.style.background = '#f9f9f9';
            }
            
            // Logout após uso (opcional)
            setTimeout(() => {
                supabase.auth.signOut();
            }, 300000); // 5 minutos
        }
    } catch (error) {
        console.log('Não há sessão ativa ou erro:', error);
    }
}

// Chame esta função no início
verificarSessaoMagicLink();
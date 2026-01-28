document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmar = document.getElementById('btnConfirmar');

    if (!btnConfirmar) {
        console.warn('Botão "Confirmar Presença" não encontrado');
        return;
    }

    btnConfirmar.addEventListener('click', async (e) => {
        e.preventDefault();

        mostrarModalColetaEmail();
    });

    function mostrarModalColetaEmail() {
        const modalExistente = document.getElementById('modal-email-casamento');
        if (modalExistente) modalExistente.remove();

        const modal = document.createElement('div');
        modal.id = 'modal-email-casamento';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div class="modal-content-email" style="
                background:rgba(255,255,255,0.95);
                backdrop-filter: blur(15px);
                padding: 3rem;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.3);
                position: relative;
            ">
                <button class="close-modal" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #d8a1a4;
                    cursor: pointer;
                ">&times;</button>
                
                <div class="modal-icon" style="
                    font-size: 4rem;
                    margin-bottom: 1.5rem;
                    animation: float 3s ease-in-out infinite;
                ">💌</div>
                
                <h3 style="
                    font-family: 'Whisper', cursive;
                    font-size: 2.5rem;
                    color: #d8a1a4;
                    margin-bottom: 1rem;
                ">Querido(a) Convidado(a)</h3>
                
                <p style="
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    font-size: 1.1rem;
                ">
                    Nossa alegria será completa com sua presença! 💖<br>
                    Para confirmar, digite seu e-mail abaixo.<br>
                    Enviaremos um link especial para acesso ao nosso sistema de confirmação.
                </p>
                
                <div style="margin-bottom: 1.5rem;">
                    <input type="email" id="inputEmailCasamento" placeholder="seu@email.com" style="
                        width: 100%;
                        padding: 15px;
                        border: 2px solid rgba(216,161,164,0.3);
                        border-radius: 10px;
                        font-size: 1rem;
                        background: rgba(255,255,255,0.9);
                        transition: all 0.3s;
                    ">
                    <p style="
                        color: #999;
                        font-size: 0.9rem;
                        margin-top: 0.5rem;
                        text-align: left;
                    ">
                        🔒 Seus dados são importantes para nós e serão usados apenas para este momento especial.
                    </p>
                </div>
                
                <button id="btnEnviarMagicLink" style="
                    background: linear-gradient(135deg, #d8a1a4 0%, #b19cd9 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 30px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: 100%;
                    margin-bottom: 1rem;
                ">
                    <span class="btn-text">Enviar Link de Confirmação</span>
                    <span class="btn-icon" style="margin-left: 10px;">✨</span>
                </button>
                
                <p style="
                    color: #999;
                    font-size: 0.85rem;
                    line-height: 1.4;
                ">
                    <small>✨ O link será válido por 24 horas<br>
                    💫 Use o mesmo e-mail do convite<br>
                    🌟 Se não receber, verifique sua caixa de spam</small>
                </p>
                
                <div id="feedback-magic-link" style="
                    margin-top: 1.5rem;
                    padding: 1rem;
                    border-radius: 10px;
                    display: none;
                "></div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close-modal');
        const enviarBtn = modal.querySelector('#btnEnviarMagicLink');
        const emailInput = modal.querySelector('#inputEmailCasamento');
        const feedbackDiv = modal.querySelector('#feedback-magic-link');

        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        enviarBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim().toLowerCase();

            if (!email) {
                mostrarFeedback('Por favor, digite seu e-mail', 'error');
                return;
            }

            if (!validarEmail(email)) {
                mostrarFeedback('Digite um e-mail válido', 'error');
                return;
            }

            enviarBtn.disabled = true;
            enviarBtn.querySelector('.btn-text').textContent = 'Enviando...';

            try {
                const { data: convidado } = await supabase
                    .from('convidados_autorizados')
                    .select('nome')
                    .eq('email', email)
                    .maybeSingle();

                const { error } = await supabase.auth.signInWithOtp({
                    email: email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/confirmacao.html`,
                        data: {
                            nome_convidado: convidado?.nome || 'Convidado Especial',
                            tipo: 'confirmacao_casamento'
                        }
                    }
                });

                if (error) throw error;

                mostrarFeedback(`
                    <div style="text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎉</div>
                        <h4 style="color: #2E7D32; margin-bottom: 1rem;">Link Enviado com Sucesso!</h4>
                        <p style="color: #666;">
                            <strong>${convidado?.nome || 'Querido(a)'}</strong>, enviamos um link especial para:<br>
                            <strong>${email}</strong>
                        </p>
                        <p style="color: #666; margin-top: 1rem;">
                            💝 <strong>Aguardamos ansiosos sua confirmação!</strong><br>
                            📧 Verifique sua caixa de entrada e também o spam.
                        </p>
                    </div>
                `, 'success');

                setTimeout(() => {
                    modal.remove();
                }, 5000);

            } catch (error) {
                console.error('Erro ao enviar Magic Link:', error);

                let mensagemErro = 'Erro ao enviar link. Tente novamente.';

                if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
                    mensagemErro = `
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">⏰</div>
                            <p style="color: #C62828;">
                                <strong>Muitas tentativas recentes</strong><br>
                                Por favor, aguarde 1 hora ou<br>
                                entre em contato conosco diretamente.
                            </p>
                            <p style="color: #666; margin-top: 1rem;">
                                💌 <strong>casamentoD&S@contato.com</strong>
                            </p>
                        </div>
                    `;
                }

                mostrarFeedback(mensagemErro, 'error');

                setTimeout(() => {
                    enviarBtn.disabled = false;
                    enviarBtn.querySelector('.btn-text').textContent = 'Enviar Link de Confirmação';
                }, 2000);
            }
        });

        setTimeout(() => emailInput.focus(), 300);

        function mostrarFeedback(mensagem, tipo) {
            feedbackDiv.innerHTML = mensagem;
            feedbackDiv.style.display = 'block';
            feedbackDiv.style.background = tipo === 'success'
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(244, 67, 54, 0.1)';
            feedbackDiv.style.border = tipo === 'success'
                ? '1px solid rgba(76, 175, 80, 0.3)'
                : '1px solid rgba(244, 67, 54, 0.3)';
            feedbackDiv.style.color = tipo === 'success' ? '#2E7D32' : '#C62828';
        }

        function validarEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        #inputEmailCasamento:focus {
            outline: none;
            border-color: #d8a1a4 !important;
            box-shadow: 0 0 0 3px rgba(216, 161, 164, 0.2) !important;
        }
        
        #btnEnviarMagicLink:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(177, 156, 217, 0.3);
        }
        
        #btnEnviarMagicLink:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    console.log('Sistema de Magic Link acolhedor carregado!');
});
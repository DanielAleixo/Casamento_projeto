// login.js - Versão corrigida e simplificada
document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmar = document.getElementById('btnConfirmar');
    let isProcessing = false;

    // Verifica se o botão existe
    if (!btnConfirmar) {
        console.error('Botão "btnConfirmar" não encontrado!');
        return;
    }

    // Adiciona o event listener corretamente
    btnConfirmar.addEventListener('click', async () => {
        if (isProcessing) return;
        
        const email = prompt("Digite seu e-mail para confirmar presença:");
        if (!email) return;

        isProcessing = true;
        btnConfirmar.disabled = true;

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim().toLowerCase(),
                options: {
                    emailRedirectTo: window.location.origin + '/confirmacao.html'
                }
            });

            if (error) throw error;
            
            showFeedback(`✔ Link enviado para <strong>${email}</strong>`, 'success');
        } catch (error) {
            console.error("Erro:", error);
            showFeedback(`Erro: ${error.message}`, 'error');
        } finally {
            isProcessing = false;
            btnConfirmar.disabled = false;
        }
    });

    // Função para mostrar feedback
    function showFeedback(message, type) {
        // Remove feedbacks anteriores
        const oldFeedback = document.getElementById('login-feedback');
        if (oldFeedback) oldFeedback.remove();

        const feedback = document.createElement('div');
        feedback.id = 'login-feedback';
        feedback.innerHTML = message;
        feedback.className = `feedback feedback-${type}`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            color: white;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeIn 0.5s;
            ${type === 'success' ? 'background: #4CAF50;' : 'background: #f44336;'}
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'fadeOut 0.5s';
            setTimeout(() => feedback.remove(), 500);
        }, 3000);
    }
});
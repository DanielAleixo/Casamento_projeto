// 1. Definir a data do casamento
    // Formato: new Date(ano, mês-1, dia, hora, minuto)
    // Exemplo: 25 de dezembro de 2026 às 16:00
const dadaCasamento = new Date(2026, 11, 25, 16, 0, 0);

// 2. Criar a função que atualiza a contagem
function atualizarCronometro() {
    // Pegar a data e hora atual
    const agora = new Date();

    // Calcular a diferença em milissegundos
    const tempoRestante = dadaCasamento - agora;

    // 3. Verificar se a data já passou
    if (tempoRestante <= 0) {
        document.getElementById("dias").textContent = "00";
        document.getElementById("horas").textContent = "00";
        document.getElementById("minutos").textContent = "00";
        document.getElementById("segundos").textContent = "00";
        document.getElementById("mensagem").textContent = "O grande dia chegou!";
        return;
    }
    // 4. Calcular dias, horas, minutos e segundos
        // Dias: total de milissegundos / milissegundos em um dia
    const dias = Math.floor(tempoRestante / (1000 * 60 * 60 * 24));

    // Horas: resto da divisão por dias, dividido por milissegundos em uma hora
    const horas = Math.floor((tempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Minutos: resto da divisão por horas, dividido por milissegundos em um minuto
    const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));

    // Segundos: resto da divisão por minutos, dividido por milissegundos em um segundo
    const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);

 // 5. Atualizar o display
    document.getElementById('dias').textContent = dias.toString().padStart(2, '0');
    document.getElementById('horas').textContent = horas.toString().padStart(2, '0');
    document.getElementById('minutos').textContent = minutos.toString().padStart(2, '0');
    document.getElementById('segundos').textContent = segundos.toString().padStart(2, '0');

}   

// 6. Chamar a função imediatamente e a cada segundo
    atualizarCronometro();
setInterval(atualizarCronometro, 1000);


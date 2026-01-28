// Formato: new Date(ano, mês-1, dia, hora, minuto)
// Exemplo: 25 de dezembro de 2026 às 16:00
const dadaCasamento = new Date(2026, 11, 25, 16, 0, 0);


function atualizarCronometro() {

    const agora = new Date();


    const tempoRestante = dadaCasamento - agora;


    if (tempoRestante <= 0) {
        document.getElementById("dias").textContent = "00";
        document.getElementById("horas").textContent = "00";
        document.getElementById("minutos").textContent = "00";
        document.getElementById("segundos").textContent = "00";
        document.getElementById("mensagem").textContent = "O grande dia chegou!";
        return;
    }

    const dias = Math.floor(tempoRestante / (1000 * 60 * 60 * 24));


    const horas = Math.floor((tempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));

    const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);

    document.getElementById('dias').textContent = dias.toString().padStart(2, '0');
    document.getElementById('horas').textContent = horas.toString().padStart(2, '0');
    document.getElementById('minutos').textContent = minutos.toString().padStart(2, '0');
    document.getElementById('segundos').textContent = segundos.toString().padStart(2, '0');

}

atualizarCronometro();
setInterval(atualizarCronometro, 1000);


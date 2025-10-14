// calendarHandler.js - Código otimizado para adicionar evento ao calendário
document.addEventListener('DOMContentLoaded', () => {
    const saveTheDateBtn = document.getElementById('saveTheDate');
    
    if (saveTheDateBtn) {
        saveTheDateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCalendar();
        });
    }

    function addToCalendar() {
        // Dados do evento
        const eventData = {
            title: "Casamento D & S",
            description: "Venha celebrar nosso casamento!",
            location: "Igreja São José, Rua das Flores, 123",
            start: "2026-12-25T16:00:00-03:00", // Fuso horário de Brasília
            end: "2026-12-25T20:00:00-03:00"
        };

        // Detecção de dispositivo
        const isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
        
        if (isApple) {
            // Formato para Apple Calendar
            const start = new Date(eventData.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const end = new Date(eventData.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            window.location.href = `webcal://p50-calendars.icloud.com/published/2/event?st=${start}&et=${end}&title=${encodeURIComponent(eventData.title)}&location=${encodeURIComponent(eventData.location)}&desc=${encodeURIComponent(eventData.description)}`;
        } else {
            // Formato para Google Calendar e outros
            const start = new Date(eventData.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const end = new Date(eventData.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&details=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}&dates=${start}/${end}`, '_blank');
        }
    }
});
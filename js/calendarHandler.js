document.addEventListener('DOMContentLoaded', () => {
    const saveTheDateBtn = document.getElementById('saveTheDate');

    if (saveTheDateBtn) {
        saveTheDateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCalendar();
        });
    }

    function addToCalendar() {

        const eventData = {
            title: "Casamento Daniel & Sabrina",
            description: "Venha celebrar nosso casamento! Com amor, D & S",
            location: "Santuário Nossa Senhora da Penha, São João da Barra - Atafona, RJ",
            start: "2026-12-25T16:00:00-03:00",
            end: "2026-12-25T20:00:00-03:00"
        };


        const startDate = formatDateForGoogle(eventData.start);
        const endDate = formatDateForGoogle(eventData.end);

        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}&sf=true&output=xml`;


        const appleCalendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${document.location.href}
DTSTART:${formatDateForApple(eventData.start)}
DTEND:${formatDateForApple(eventData.end)}
SUMMARY:${eventData.title}
DESCRIPTION:${eventData.description}
LOCATION:${eventData.location}
END:VEVENT
END:VCALENDAR`;


        const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventData.title)}&body=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}&startdt=${eventData.start}&enddt=${eventData.end}`;


        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isMac = /macintosh|mac os x/.test(userAgent);
        const isAndroid = /android/.test(userAgent);


        mostrarOpcoesCalendario({
            google: googleCalendarUrl,
            apple: appleCalendarUrl,
            outlook: outlookCalendarUrl,
            isIOS: isIOS,
            isMac: isMac,
            isAndroid: isAndroid
        });
    }

    function formatDateForGoogle(dateString) {
        const date = new Date(dateString);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    function formatDateForApple(dateString) {
        const date = new Date(dateString);
        return date.toISOString().replace(/[-:.]/g, '').slice(0, -1) + 'Z';
    }

    function mostrarOpcoesCalendario(opcoes) {

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        modalContent.innerHTML = `
            <h3 style="color: #d8a1a4; margin-bottom: 1.5rem;">Adicionar ao Calendário</h3>
            <p style="margin-bottom: 1.5rem; color: #666;">Escolha seu calendário preferido:</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${opcoes.isIOS || opcoes.isMac ? `
                    <button onclick="window.open('${opcoes.apple}', '_blank'); this.parentElement.parentElement.parentElement.remove();" 
                            style="background: #000; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">
                        📅 Apple Calendar
                    </button>
                ` : ''}
                
                <button onclick="window.open('${opcoes.google}', '_blank'); this.parentElement.parentElement.parentElement.remove();"
                        style="background: #4285F4; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">
                    📅 Google Calendar
                </button>
                
                <button onclick="window.open('${opcoes.outlook}', '_blank'); this.parentElement.parentElement.parentElement.remove();"
                        style="background: #0078D7; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">
                    📅 Outlook Calendar
                </button>
                
                <button onclick="this.parentElement.parentElement.parentElement.remove();"
                        style="background: #f7cac9; color: #333; padding: 12px; border: none; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                    Cancelar
                </button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);


        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
});
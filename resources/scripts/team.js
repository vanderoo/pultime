document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
  
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: [
        { title: 'PAT', start: '2024-10-09', color: 'red' },
        { title: 'Etprof', start: '2024-10-03', color: 'orange' },
        { title: 'Sempro', start: '2024-10-12', color: 'gray' },
      ]
    });
  
    calendar.render();
  
  });
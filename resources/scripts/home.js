document.addEventListener('DOMContentLoaded', function () {
    // Render FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: [
        {
          title: 'PAT Deadline',
          start: '2024-10-09',
        },
        {
          title: 'Seminar Proposal',
          start: '2024-10-12',
        },
        {
          title: 'Etprof Deadline',
          start: '2024-10-20',
        }
      ]
    });
    calendar.render();
  
    // Handle Logout
    const logoutButton = document.getElementById('logout');
    logoutButton.addEventListener('click', function () {
      window.location.href = '../login.html'; // Redirect ke halaman login
    });
  });
  
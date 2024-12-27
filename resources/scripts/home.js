document.addEventListener('DOMContentLoaded', () => {
  initializeCalendar();
  setupPopupHandlers();
  handleTaskFormSubmission();

});

function getAllSavedCourses() {
  const allKeys = Object.keys(localStorage).filter(key => key.startsWith('coursesId_'));
  let allCourses = [];
  allKeys.forEach(key => {
    const courses = JSON.parse(localStorage.getItem(key)) || [];  // Ambil data array dari localStorage
    allCourses = [...allCourses, ...courses];  // Gabungkan array
  });
  allCourses = [...new Set(allCourses)];
  return allCourses;
}


async function fetchTasks() {
  try {
    const baseUrl = `http://localhost:3000/tasks/by-user`;
    const courses = getAllSavedCourses();

    console.log(courses)

    const url = new URL(baseUrl);
    url.searchParams.append('courses', JSON.stringify(courses));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Tambahkan token jika diperlukan
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil event dari server.');
    }

    const tasks = await response.json(); // Data dari API
    console.log(tasks.data)
    return tasks.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    alert('Gagal mengambil data task. Silakan coba lagi.');
    return [];
  }
}

function mapTasksToEvents(tasks) {
  return tasks.map((task) => ({
    id: task.id, // ID unik untuk setiap event
    title: task.name, // Nama task sebagai judul event
    start: task.start_date, // Tanggal mulai event
    end: task.end_date || null, // Tanggal selesai event (opsional)
    color: "red", // Warna berdasarkan progress
    extendedProps: {
      description: task.description,
      context: task.context,
      assignee: task.assignee,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    },
  }));
}

// Fungsi untuk inisialisasi kalender
async function initializeCalendar() {
  const calendarEl = document.getElementById('calendar');

  // Ambil task dari API
  const tasks = await fetchTasks();

  // Peta task ke event FullCalendar
  const events = mapTasksToEvents(tasks);

  // Inisialisasi FullCalendar dengan event
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: events,
    eventClick: (info) => {
      // Logika saat event diklik
      console.log('Detail Event:', info.event.extendedProps);
      alert(`Nama: ${info.event.title}\nDeskripsi: ${info.event.extendedProps.description}\nDeadline: ${info.event.start}`);
    },
  });

  calendar.render();
}

// Fungsi untuk menangani tombol popup
function setupPopupHandlers() {
  const addTaskButton = document.getElementById('add-task');
  const popupOverlay = document.getElementById('add-task-popup-overlay');
  const closePopup = document.getElementById('add-task-close-popup');

  addTaskButton.addEventListener('click', () => togglePopup(true));
  closePopup.addEventListener('click', () => togglePopup(false));

  function togglePopup(isVisible) {
    popupOverlay.style.display = isVisible ? 'flex' : 'none';
  }
}

// Fungsi untuk menangani pengiriman form tugas
function handleTaskFormSubmission() {
  const taskForm = document.getElementById('task-form');
  const popupOverlay = document.getElementById('add-task-popup-overlay');

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskData = getTaskFormData();
    const accessToken = getAccessToken();

    if (!accessToken) {
      alert('Access token tidak ditemukan! Harap login ulang.');
      return;
    }

    try {
      const result = await submitTaskData(taskData, accessToken);
      if (result.success) {
        alert('Task berhasil ditambahkan!');
        console.log('Task berhasil ditambahkan:', result.data);
        initializeCalendar();
      } else {
        handleApiError(result.error);
      }
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      alert('Terjadi kesalahan saat menghubungi server.');
    }

    popupOverlay.style.display = 'none';
    taskForm.reset();
  });
}

// Fungsi untuk mengambil data dari form tugas
function getTaskFormData() {
  const taskDateValue = document.getElementById('task-date').value;
  return {
    name: document.getElementById('task-name').value,
    description: document.getElementById('task-desc').value || "tbd",
    start_date: new Date(taskDateValue).toISOString(),
    context: "class",
    user_id: localStorage.getItem('userId'),
  };
}

// Fungsi untuk mendapatkan access token
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Fungsi untuk mengirim data tugas ke API
async function submitTaskData(taskData, accessToken) {
  const response = await fetch('http://localhost:3000/task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(taskData),
  });

  const result = await response.json();
  if (response.ok) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result };
  }
}

// Fungsi untuk menangani error dari API
function handleApiError(error) {
  console.error('Error:', error);
  const errorMessage = error.errors?.[0]?.message || 'Unknown error';
  alert(`Gagal menambahkan task: ${error.status} - ${errorMessage}`);
}

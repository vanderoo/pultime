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
      throw new Error('Gagal mengambil tugas dari server.');
    }

    const tasks = await response.json(); // Data dari API
    console.log(tasks.data)
    return tasks.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal Mengambil Data',
      text: 'Gagal mengambil data task. Silakan coba lagi.',
    });
    return [];
  }
}

function mapTasksToEvents(tasks) {
  return tasks.map((task) => ({
    id: task.id,
    title: task.name,
    start: task.start_date,
    end: task.end_date || null,
    color: "red",
    extendedProps: {
      description: task.description,
      context: task.context,
      assignee: task.assignee,
      userId: task.user_id,
      courseId: task.course_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    },
  }));
}

// Fungsi untuk inisialisasi kalender
async function initializeCalendar() {
  const calendarEl = document.getElementById("calendar");
  const tasks = await fetchTasks(); // Ambil task dari API
  const events = mapTasksToEvents(tasks); // Peta task ke event FullCalendar

  // Elemen popup untuk detail tugas
  const showTaskPopup = document.getElementById("show-task-popup");
  const closeShowTaskPopup = document.getElementById("close-show-task-popup");
  const showTaskName = document.getElementById("show-task-name");
  const showTaskDesc = document.getElementById("show-task-desc");
  const showTaskDate = document.getElementById("show-task-date");

  // Fungsi untuk menampilkan popup detail tugas
  function showTaskDetails(event) {
    showTaskName.value = event.title;
    showTaskDesc.value = event.extendedProps.description || "";
    showTaskDate.value = event.start
      ? new Date(event.start).toISOString().slice(0, -1)
      : "";

    showTaskPopup.style.display = "flex"; // Tampilkan popup
  }

  // Fungsi untuk menyembunyikan popup
  function hideTaskDetails() {
    showTaskPopup.style.display = "none"; // Sembunyikan popup
  }

  closeShowTaskPopup.addEventListener("click", hideTaskDetails);

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: events,
    eventClick: (info) => {
      showTaskDetails(info.event); // Panggil fungsi untuk menampilkan popup saat event diklik
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
      Swal.fire({
        icon: 'warning',
        title: 'Akses Ditolak',
        text: 'Access token tidak ditemukan! Harap login ulang.',
      });
      return;
    }

    try {
      const result = await submitTaskData(taskData, accessToken);
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Task berhasil ditambahkan!',
        });
        console.log('Task berhasil ditambahkan:', result.data);
        initializeCalendar();
      } else {
        handleApiError(result.error);
      }
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan',
        text: 'Terjadi kesalahan saat menghubungi server.',
      });
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
    context: "personal",
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
    console.log(result);
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result };
  }
}

// Fungsi untuk menangani error dari API
function handleApiError(error) {
  console.error('Error:', error);
  const errorMessage = error.errors?.[0]?.message || 'Unknown error';
  Swal.fire({
    icon: 'error',
    title: 'Gagal Menambahkan Task',
    text: `${error.status} - ${errorMessage}`,
  });
}


document.addEventListener('DOMContentLoaded', () => {
  initializeCalendar();
  setupPopupHandlers();
  handleTaskFormSubmission();
  document.getElementById('edit-updatable-task').addEventListener('click', handleEditTask);
  document.getElementById('save-updatable-task').addEventListener('click', handleSaveTask);
  document.getElementById('cancel-updatable-task').addEventListener('click', handleCancelEditTask);
  document.getElementById('delete-updatable-task').addEventListener('click', handleDeleteTask);
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
    const baseUrl = `https://pultime.api.deroo.tech/tasks/by-user`;
    const courses = getAllSavedCourses();

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return [];
    }

    const url = new URL(baseUrl);
    url.searchParams.append('courses', JSON.stringify(courses));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Tambahkan token jika diperlukan
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

// Elemen popup untuk detail tugas umum
const showTaskPopup = document.getElementById("show-task-popup");
const closeShowTaskPopup = document.getElementById("close-show-task-popup");
const showTaskName = document.getElementById("show-task-name");
const showTaskDesc = document.getElementById("show-task-desc");
const showTaskDate = document.getElementById("show-task-date");

// Elemen popup untuk detail tugas updatable
const showUpdatableTaskPopup = document.getElementById("show-updatable-task-popup");
const closeShowUpdatableTaskPopup = document.getElementById("close-show-updatable-task-popup");
const showUpdatableTaskName = document.getElementById("show-updatable-task-name");
const showUpdatableTaskDesc = document.getElementById("show-updatable-task-desc");
const showUpdatableTaskDate = document.getElementById("show-updatable-task-date");

// Fungsi untuk inisialisasi kalender
async function initializeCalendar() {
  const calendarEl = document.getElementById("calendar");
  const tasks = await fetchTasks(); // Ambil task dari API
  const events = mapTasksToEvents(tasks); // Peta task ke event FullCalendar

  closeShowTaskPopup.addEventListener("click", hideTaskDetails);
  closeShowUpdatableTaskPopup.addEventListener("click", hideUpdatableTaskDetails);

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: events,
    eventClick: (info) => {
      showTaskDetails(info.event); // Panggil fungsi untuk menampilkan popup saat event diklik
      console.log(info.event);
    },
  });

  calendar.render();
}

// Fungsi untuk menampilkan popup detail tugas
function showTaskDetails(event) {
  if (event.extendedProps.userId != null) {
    // Tampilkan popup updatable task
    showUpdatableTaskName.value = event.title;
    showUpdatableTaskDesc.value = event.extendedProps.description || "";
    showUpdatableTaskDate.value = event.start
      ? new Date(event.start).toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T')
      : "";

    // Set atribut taskId di elemen showUpdatableTaskName
    showUpdatableTaskName.setAttribute('taskId', event.id);

    showUpdatableTaskPopup.style.display = "flex"; // Tampilkan popup updatable task
  } else {
    // Tampilkan popup general task
    showTaskName.value = event.title;
    showTaskDesc.value = event.extendedProps.description || "";
    showTaskDate.value = event.start
      ? new Date(event.start).toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T')
      : "";

    showTaskName.setAttribute('taskId', event.id);

    showTaskPopup.style.display = "flex"; // Tampilkan popup general task
  }
}

// Fungsi untuk menyembunyikan popup general task
function hideTaskDetails() {
  showTaskPopup.style.display = "none"; // Sembunyikan popup general task
}

// Fungsi untuk menyembunyikan popup updatable task
function hideUpdatableTaskDetails() {
  showUpdatableTaskPopup.style.display = "none"; // Sembunyikan popup updatable task
}

function handleEditTask() {
  // Mengaktifkan input di form
  showUpdatableTaskName.disabled = false;
  showUpdatableTaskDesc.disabled = false;
  showUpdatableTaskDate.disabled = false;

  // Menyembunyikan tombol "Ubah" dan menampilkan tombol aksi baru
  document.getElementById('edit-updatable-task').style.display = 'none';
  document.getElementById('update-actions').style.display = 'block';
}

// Fungsi untuk menangani klik pada tombol Simpan (submit form ke API)
function handleSaveTask() {
  // Ambil data dari form
  const taskId = showUpdatableTaskName.getAttribute('taskId');
  const updatedTask = {
    name: showUpdatableTaskName.value,
    description: showUpdatableTaskDesc.value,
    start_date: showUpdatableTaskDate.value,
    context: "personal",
  };

  // Kirim data ke API (gunakan fetch untuk melakukan POST atau PUT request)
  fetch(`https://pultime.api.deroo.tech/task/${taskId}`, {
    method: 'PUT', // Menggunakan PUT untuk update task
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(updatedTask),
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        Swal.fire({
          title: 'Tugas Diperbarui!',
          text: 'Tugas berhasil diperbarui.',
          icon: 'success',
        }).then(() => {
          // Tindakan setelah sukses, seperti menutup popup atau memuat ulang halaman
          hideUpdatableTaskDetails();
          handleCancelEditTask();
          initializeCalendar();
        });
      } else {
        console.log(data);
        Swal.fire({
          title: 'Gagal Memperbarui',
          text: data.errors[0].message,
          icon: 'error',
        });
      }
    });
}

function handleCancelEditTask() {
  // Menonaktifkan kembali input di form
  showUpdatableTaskName.disabled = true;
  showUpdatableTaskDesc.disabled = true;
  showUpdatableTaskDate.disabled = true;

  // Menyembunyikan tombol aksi baru dan menampilkan tombol "Ubah"
  document.getElementById('edit-updatable-task').style.display = 'inline-block';
  document.getElementById('update-actions').style.display = 'none';
}

// Fungsi untuk menangani aksi penghapusan task
function handleDeleteTask() {
  const accessToken = localStorage.getItem('accessToken'); // Ambil token dari localStorage
  const taskId = showUpdatableTaskName.getAttribute('taskId');

  // Menampilkan konfirmasi menggunakan SweetAlert
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Tugas ini akan dihapus secara permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
  }).then((result) => {
    if (result.isConfirmed) {
      // Jika pengguna mengonfirmasi penghapusan, kirimkan request ke API dengan token akses
      fetch(`https://pultime.api.deroo.tech/task/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
        .then(response => response.json())  // Mengambil body response dalam bentuk JSON
        .then(data => {
          console.log(data);
          if (data.errors && data.errors.length > 0) {
            // Jika ada error dalam response body, tampilkan pesan error
            Swal.fire({
              title: 'Gagal Menghapus',
              text: data.errors[0].message, // Menampilkan pesan error pertama
              icon: 'error',
            }).then(() => {
              // Tindakan setelah sukses, seperti menutup popup atau memuat ulang halaman
              hideUpdatableTaskDetails(); // Menyembunyikan popup setelah penghapusan
            });
          } else {
            // Jika tidak ada error, anggap penghapusan berhasil
            Swal.fire({
              title: 'Tugas Terhapus!',
              text: 'Tugas berhasil dihapus.',
              icon: 'success',
            }).then(() => {
              // Tindakan setelah sukses, seperti menutup popup atau memuat ulang halaman
              hideUpdatableTaskDetails(); // Menyembunyikan popup setelah penghapusan
              initializeCalendar();
            });
          }
        })
        .catch(error => {
          // Menangani kesalahan jaringan atau server
          Swal.fire({
            title: 'Error',
            text: 'Terjadi kesalahan jaringan.',
            icon: 'error',
          });
        });
    }
  });
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
  const response = await fetch('https://pultime.api.deroo.tech/task', {
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


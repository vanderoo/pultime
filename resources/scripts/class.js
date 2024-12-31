const classId = getClassIdFromUrl();
const userId = localStorage.getItem('userId');
document.addEventListener('DOMContentLoaded', () => {
  if (classId) {
    updateClassData(classId);
  }
  initializeCalendar(classId);
  setupPopupHandlers();
  handleTaskFormSubmission(classId);
  handleLeaveClass();
  document.getElementById('edit-updatable-task').addEventListener('click', handleEditTask);
  document.getElementById('save-updatable-task').addEventListener('click', handleSaveTask);
  document.getElementById('cancel-updatable-task').addEventListener('click', handleCancelEditTask);
  document.getElementById('delete-updatable-task').addEventListener('click', handleDeleteTask);
  document.getElementById("copy-icon").addEventListener("click", function () {
    const classCode = document.getElementById("class_code").innerText;
    navigator.clipboard.writeText(classCode)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Copied!',
          text: 'Class code copied to clipboard!',
          timer: 1000,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  });
});

async function fetchTasksByContext(context, contextId) {
  try {
    const baseUrl = `https://pultime.api.deroo.tech/tasks/by-context/${context}/${contextId}`;
    const courses = getSavedCourses(contextId);

    const url = new URL(baseUrl);
    url.searchParams.append('courses', JSON.stringify(courses));

    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Access token tidak ditemukan.');
    }

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let tasks = await response.json();

    // Jika token kedaluwarsa, coba refresh token
    if (tasks.status === 'UNAUTHORIZED_TOKEN_EXPIRED') {
      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (!refreshTokenValue) {
        throw new Error('Refresh token tidak tersedia');
      }

      // Coba refresh token
      const newTokens = await fetchRefreshToken(refreshTokenValue);

      accessToken = newTokens.access_token;

      // Simpan token baru ke localStorage
      localStorage.setItem('accessToken', accessToken);

      // Coba lagi dengan token yang baru
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      tasks = await response.json();
    }

    if (!response.ok || tasks.code !== 200) {
      throw new Error('Gagal mengambil event dari server.');
    }

    console.log(tasks.data);
    return tasks.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    Swal.fire({
      title: 'Gagal Mengambil Data',
      text: 'Terjadi kesalahan saat mengambil data tugas. Silakan coba lagi.',
      icon: 'error',
    });
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
      userId: task.user_id,
      courseId: task.course_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    },
  }));
}

const showUpdatableTaskPopup = document.getElementById("show-updatable-task-popup");
const closeShowUpdatableTaskPopup = document.getElementById("close-show-updatable-task-popup");
const showUpdatableTaskName = document.getElementById("show-updatable-task-name");
const showUpdatableTaskDesc = document.getElementById("show-updatable-task-desc");
const showUpdatableTaskDate = document.getElementById("show-updatable-task-date");
const showUpdatableTaskCourse = document.getElementById("show-updatable-task-course");

// Fungsi untuk inisialisasi kalender
async function initializeCalendar(classId) {
  const calendarEl = document.getElementById('calendar');
  const tasks = await fetchTasksByContext("class", classId);
  const events = mapTasksToEvents(tasks);

  closeShowUpdatableTaskPopup.addEventListener("click", hideUpdatableTaskDetails);

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: events,
    eventClick: (info) => {
      showTaskDetails(info.event);
      console.log(info.event);
    },
  });

  calendar.render();
}

// Fungsi untuk menampilkan popup detail tugas
function showTaskDetails(event) {
  // Tampilkan popup updatable task
  showUpdatableTaskName.value = event.title;
  showUpdatableTaskDesc.value = event.extendedProps.description || "";
  showUpdatableTaskDate.value = event.start
    ? new Date(event.start).toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T')
    : "";

  // Set atribut taskId di elemen showUpdatableTaskName
  showUpdatableTaskName.setAttribute('taskId', event.id);
  showUpdatableTaskCourse.value = event.extendedProps.courseId;

  showUpdatableTaskPopup.style.display = "flex"; // Tampilkan popup updatable task
}

// Fungsi untuk menyembunyikan popup updatable task
function hideUpdatableTaskDetails() {
  showUpdatableTaskPopup.style.display = "none"; // Sembunyikan popup updatable task
  handleCancelEditTask();
}

function handleEditTask() {
  // Mengaktifkan input di form
  showUpdatableTaskName.disabled = false;
  showUpdatableTaskDesc.disabled = false;
  showUpdatableTaskDate.disabled = false;
  showUpdatableTaskCourse.disabled = false;

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
    context: "class",
    course_id: showUpdatableTaskCourse.value,
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
          initializeCalendar(classId);
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
  showUpdatableTaskCourse.disabled = true;

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
              initializeCalendar(classId);
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
function handleTaskFormSubmission(classId) {
  const taskForm = document.getElementById('task-form');
  const popupOverlay = document.getElementById('add-task-popup-overlay');

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskData = getTaskFormData();
    const accessToken = getAccessToken();

    if (!accessToken) {
      Swal.fire({
        title: 'Akses Ditolak!',
        text: 'Access token tidak ditemukan! Harap login ulang.',
        icon: 'warning',
        confirmButtonText: 'Login Ulang',
      }).then(() => {
        // Opsional: Tambahkan logika untuk redirect ke halaman login
        window.location.href = '/login'; // Ganti dengan URL halaman login Anda
      });
      return;
    }

    try {
      const result = await submitTaskData(taskData, accessToken);
      if (result.success) {
        Swal.fire({
          title: 'Sukses!',
          text: 'Task berhasil ditambahkan!',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          console.log('Task berhasil ditambahkan:', result.data);
          initializeCalendar(classId); // Memuat ulang kalender
        });
      } else {
        handleApiError(result.error);
      }
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      Swal.fire({
        title: 'Kesalahan!',
        text: 'Terjadi kesalahan saat menghubungi server.',
        icon: 'error',
      });
    }

    popupOverlay.style.display = 'none';
    taskForm.reset();
  });
}

// Fungsi untuk mengambil data dari form tugas
function getTaskFormData() {
  const taskDateValue = document.getElementById('task-date').value;
  const selectedCourseId = document.getElementById('task-course').value;  // Mengambil nilai kursus yang dipilih

  return {
    name: document.getElementById('task-name').value,
    description: document.getElementById('task-desc').value || "tbd",
    start_date: new Date(taskDateValue).toISOString(),
    context: "class",
    class_id: getClassIdFromUrl(),
    course_id: selectedCourseId,
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
    title: 'Gagal Menambahkan Task!',
    text: `${error.status} - ${errorMessage}`,
    icon: 'error',
    confirmButtonText: 'OK',
  });
}


// Fungsi untuk mendapatkan classId dari URL
function getClassIdFromUrl() {
  return window.location.hash.substring(1); // Menghapus '#' dari hash URL
}

function updateClassData(classId) {
  const classCodeElement = document.getElementById('class_code');
  const classNameElement = document.getElementById('class_name');  // Element untuk menampilkan nama kelas
  const dropdownContent = document.getElementById('dropdown_content');
  const courseSelect = document.getElementById('task-course');  // Dropdown content untuk kursus

  // Ambil accessToken dari localStorage atau sessionStorage
  const accessToken = localStorage.getItem('accessToken'); // Sesuaikan dengan tempat Anda menyimpan token

  // Jika tidak ada token, tampilkan pesan error
  if (!accessToken) {
    classNameElement.textContent = 'Access token is missing';
    return;
  }

  // Menggunakan fetch untuk mengambil data kelas dari API
  const apiUrl = `https://pultime.api.deroo.tech/class/${classId}`;

  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`, // Menambahkan accessToken di header
      'Content-Type': 'application/json',
    }
  })
    .then(response => response.json())
    .then(async data => {
      if (data.status === 'UNAUTHORIZED_TOKEN_EXPIRED') {
        // Token kedaluwarsa, coba refresh token
        const refreshTokenValue = localStorage.getItem('refreshToken');

        if (!refreshTokenValue) {
          console.error('Refresh token tidak ditemukan.');
          classNameElement.textContent = 'Error fetching class data';
          return;
        }

        try {
          // Refresh token dan dapatkan access token baru
          const newTokens = await fetchRefreshToken(refreshTokenValue);

          // Update access token di localStorage
          localStorage.setItem('accessToken', newTokens.access_token);

          // Coba lagi dengan token yang baru
          return fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newTokens.access_token}`,
              'Content-Type': 'application/json',
            },
          })
            .then(response => response.json())
            .then(data => handleClassData(data))
            .catch(error => handleError(error));
        } catch (error) {
          console.error('Error refreshing token:', error);
          classNameElement.textContent = 'Error refreshing token';
        }
      } else if (data.code === 200) {
        handleClassData(data);
      } else {
        classNameElement.textContent = 'Class not found';
      }
    })
    .catch(error => {
      handleError(error);
    });
}

function handleError(error) {
  console.error('Error fetching class data:', error);
  classNameElement.textContent = 'Error fetching class data';
}

function handleClassData(data) {
  const classCodeElement = document.getElementById('class_code');
  const classNameElement = document.getElementById('class_name');
  const dropdownContent = document.getElementById('dropdown_content');
  const courseSelect = document.getElementById('task-course');
  const showUpdatableTaskCourse = document.getElementById("show-updatable-task-course");

  classNameElement.textContent = data.data.class_name;
  classCodeElement.textContent = data.data.class_code;

  // Mengosongkan konten dropdown sebelumnya
  dropdownContent.innerHTML = '';

  // Menambahkan kursus ke dalam dropdown-content
  data.data.courses.forEach(course => {
    const courseLabel = document.createElement('label');

    // Membuat checkbox untuk setiap kursus
    const courseCheckbox = document.createElement('input');
    courseCheckbox.type = 'checkbox';

    // Memeriksa apakah ID kursus sudah ada di localStorage
    const savedCourses = getSavedCourses();

    courseCheckbox.checked = !savedCourses.includes(course.id); // Centang sesuai data di localStorage
    // Menambahkan ID kursus sebagai atribut data
    courseCheckbox.setAttribute('data-course-id', course.id);

    // Menambahkan event listener untuk menyimpan status checkbox saat berubah
    courseCheckbox.addEventListener('change', () => {
      const updatedCourses = getSavedCourses(); // Ambil array kursus yang tersimpan
      if (!courseCheckbox.checked) {
        // Jika dicentang, tambahkan ID ke array
        updatedCourses.push(course.id);
      } else {
        // Jika tidak dicentang, hapus ID dari array
        const index = updatedCourses.indexOf(course.id);
        if (index > -1) {
          updatedCourses.splice(index, 1);
        }
      }
      saveCourses(updatedCourses);
      initializeCalendar(classId);
    });

    const courseText = document.createTextNode(` ${course.course_name}`);

    courseLabel.appendChild(courseCheckbox);
    courseLabel.appendChild(courseText);

    dropdownContent.appendChild(courseLabel);

    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.course_name;
    courseSelect.appendChild(option);
    if (showUpdatableTaskCourse) {
      showUpdatableTaskCourse.appendChild(option.cloneNode(true));
    }
  });
}

function getSavedCourses() {
  const savedCourses = localStorage.getItem(`coursesId_${classId}`);
  return savedCourses ? JSON.parse(savedCourses) : [];
}

// Simpan array courses yang terpilih ke localStorage
function saveCourses(courses) {
  localStorage.setItem(`coursesId_${classId}`, JSON.stringify(courses));
}

function handleLeaveClass() {
  const leaveClassElement = document.getElementById('leave_class');

  // Menambahkan event listener untuk menghapus user dari kelas saat elemen #leave_class diklik
  leaveClassElement.addEventListener('click', function (event) {
    event.preventDefault(); // Mencegah aksi default dari link

    // Cek apakah userId dan classId tersedia
    if (!userId || !classId) {
      Swal.fire({
        title: 'Data Tidak Lengkap!',
        text: 'User ID atau Class ID hilang. Harap periksa kembali.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Mengirim permintaan DELETE ke API
    fetch(`https://pultime.api.deroo.tech/class/${classId}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Menambahkan token jika diperlukan
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Gagal menghapus user dari kelas.');
        }
        return response.json();
      })
      .then(result => {
        if (result.code === 200) {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Anda berhasil keluar dari kelas.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            window.location.href = '/';
          });
        } else {
          Swal.fire({
            title: 'Gagal!',
            text: 'Gagal keluar dari kelas. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          title: 'Kesalahan!',
          text: 'Terjadi kesalahan saat menghapus user dari kelas. Silakan coba lagi.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      });
  });
}
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
});

async function fetchTasksByContext(context, contextId) {
  try {
    const baseUrl = `http://localhost:3000/tasks/by-context/${context}/${contextId}`;
    const courses = getSavedCourses(contextId);

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
async function initializeCalendar(classId) {
  const calendarEl = document.getElementById('calendar');

  // Ambil task dari API
  const tasks = await fetchTasksByContext("class", classId);

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
function handleTaskFormSubmission(classId) {
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
        initializeCalendar(classId);
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
  const apiUrl = `http://localhost:3000/class/${classId}`;

  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`, // Menambahkan accessToken di header
      'Content-Type': 'application/json',
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        // Memperbarui nama kelas di kontainer utama jika data berhasil diambil
        console.log(data)
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
            saveCourses(updatedCourses); // Simpan kembali array yang diperbarui
            initializeCalendar(classId)
          });

          // Menambahkan nama kursus
          const courseText = document.createTextNode(` ${course.course_name}`);

          // Menambahkan checkbox dan nama kursus ke dalam label
          courseLabel.appendChild(courseCheckbox);
          courseLabel.appendChild(courseText);

          // Menambahkan label ke dalam dropdown-content
          dropdownContent.appendChild(courseLabel);

          const option = document.createElement('option');
          option.value = course.id; // Menyimpan ID kursus sebagai nilai option
          option.textContent = course.course_name; // Menampilkan nama kursus sebagai teks option
          courseSelect.appendChild(option);
        });
      } else {
        classNameElement.textContent = 'Class not found';
      }
    })
    .catch(error => {
      console.error('Error fetching class data:', error);
      classNameElement.textContent = 'Error fetching class data';
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
      alert('User atau class ID hilang.');
      return;
    }

    // Mengirim permintaan DELETE ke API
    fetch(`http://localhost:3000/class/${classId}/users/${userId}`, {
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
        alert('Berhasil keluar dari kelas');
        // Tambahkan logika untuk melakukan update tampilan atau redirect jika perlu
        window.location.href = '/';
      } else {
        alert('Gagal keluar dari kelas');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menghapus user dari kelas');
    });
  });
}
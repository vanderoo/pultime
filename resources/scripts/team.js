const teamId = window.location.hash.substring(1);
const userId = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', () => {

  if (teamId) {
    renderTeamData(teamId);
  }

  handleLeaveTeam();
  setupPopupHandlers();
  handleTaskFormSubmission();

  document.getElementById("copy-icon").addEventListener("click", function () {
    const classCode = document.getElementById("team_code").innerText;
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

function renderTeamData(teamId) {
  const teamCodeElement = document.getElementById('team_code');
  const teamNameElement = document.getElementById('team_name'); // Elemen untuk menampilkan nama tim

  // Ambil accessToken dari localStorage atau sessionStorage
  const accessToken = localStorage.getItem('accessToken'); // Sesuaikan dengan tempat Anda menyimpan token

  // Jika tidak ada token, tampilkan pesan error
  if (!accessToken) {
    teamNameElement.textContent = 'Access token is missing';
    return;
  }

  // Menggunakan fetch untuk mengambil data tim dari API
  const apiUrl = `http://localhost:3000/team/${teamId}`;

  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`, // Menambahkan accessToken di header
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200) {
        // Memperbarui nama tim dan kode tim di elemen HTML jika data berhasil diambil
        teamNameElement.textContent = data.data.team_name;
        teamCodeElement.textContent = data.data.team_code;
      } else {
        teamNameElement.textContent = 'Team not found';
        teamCodeElement.textContent = '-';
      }
    })
    .catch((error) => {
      console.error('Error fetching team data:', error);
      teamNameElement.textContent = 'Error fetching team data';
      teamCodeElement.textContent = '-';
    });
}

function handleLeaveTeam() {
  const leaveTeamElement = document.getElementById('leave_team');

  leaveTeamElement.addEventListener('click', function (event) {
    event.preventDefault();

    // Cek apakah userId dan teamId tersedia
    if (!userId || !teamId) {
      Swal.fire({
        title: 'Data Tidak Lengkap!',
        text: 'User ID atau Team ID hilang. Harap periksa kembali.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Mengirim permintaan DELETE ke API untuk menghapus user dari tim
    fetch(`http://localhost:3000/team/${teamId}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Menambahkan token jika diperlukan
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Gagal menghapus user dari tim.');
        }
        return response.json();
      })
      .then(result => {
        if (result.code === 200) {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Anda berhasil keluar dari tim.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            window.location.href = '/';
          });
        } else {
          Swal.fire({
            title: 'Gagal!',
            text: 'Gagal keluar dari tim. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          title: 'Kesalahan!',
          text: 'Terjadi kesalahan saat menghapus user dari tim. Silakan coba lagi.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      });
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
    const accessToken = localStorage.getItem('accessToken');

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
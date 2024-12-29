const teamId = window.location.hash.substring(1);
const userId = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', async () => {

  if (teamId) {
    renderTeamData(teamId);
    renderTaskList();
    renderAssigneeOption();
  }

  handleLeaveTeam();
  setupPopupHandlers();
  handleTaskFormSubmission();
  initializeTaskListDragable();

  document.getElementById('edit-updatable-task').addEventListener('click', handleEditTask);
  document.getElementById('save-updatable-task').addEventListener('click', handleSaveTask);
  document.getElementById('cancel-updatable-task').addEventListener('click', handleCancelEditTask);
  document.getElementById('delete-updatable-task').addEventListener('click', handleDeleteTask);

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

function initializeTaskListDragable() {
  document.querySelectorAll('.task-list').forEach(taskList => {
    new Sortable(taskList, {
      group: 'shared',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: (event) => {
        const taskCard = event.item;
        const taskId = taskCard.querySelector('.task-card-name').getAttribute('taskId');

        const columnId = taskCard.closest('.column').id;
        let progress = '';

        switch (columnId) {
          case 'todo-column':
            progress = 'not_started';
            break;
          case 'doing-column':
            progress = 'in_progress';
            break;
          case 'done-column':
            progress = 'completed';
            break;
          default:
            console.log('Unknown column');
            return;
        }

        updateTaskStatus(taskId, progress);
      },
    });
  });
}

function updateTaskStatus(taskId, progress) {
  const updatedTask = {
    progress: progress,
    context: 'team',
  };

  fetch(`http://localhost:3000/task/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(updatedTask),
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        renderTaskList();
      } else {
        console.log(data);
      }
    });
}

async function fetchTasksByContext(context, contextId) {
  try {
    const apiUrl = `http://localhost:3000/tasks/by-context/${context}/${contextId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil event dari server.');
    }

    const tasks = await response.json();
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

async function renderAssigneeOption() {
  try {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error("Access token is missing");
    }

    const url = `http://localhost:3000/team/${teamId}/users`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users data");
    }

    const data = await response.json();

    const assigneeSelect = document.getElementById('task-assignee');
    const assigneeDetailSelect = document.getElementById('show-updatable-task-assignee');

    assigneeSelect.innerHTML = '<option value="" disabled selected>Pilih Assignee</option>';
    assigneeDetailSelect.innerHTML = '<option value="" disabled selected>Pilih Assignee</option>';

    data.data.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.username;
      assigneeSelect.appendChild(option);
      assigneeDetailSelect.appendChild(option.cloneNode(true));
    });

  } catch (error) {
    console.error("Error rendering assignee options:", error);
    Swal.fire({
      title: 'Gagal Mengambil Data Assignee',
      text: 'Terjadi kesalahan saat mengambil data pengguna. Silakan coba lagi.',
      icon: 'error',
    });
  }
}

async function renderTaskList() {
  const todoColumn = document.getElementById('todo-column').querySelector('.task-list');
  const doingColumn = document.getElementById('doing-column').querySelector('.task-list');
  const doneColumn = document.getElementById('done-column').querySelector('.task-list');

  todoColumn.innerHTML = '';
  doingColumn.innerHTML = '';
  doneColumn.innerHTML = '';

  const tasks = await fetchTasksByContext('team', teamId);

  tasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    const formattedDate = new Date(task.start_date)
      .toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' })
      .split(':')
      .slice(0, -1)
      .join(':');

    taskCard.innerHTML = `
    <p class="task-card-name" taskId="${task.id}">${task.name}</p>
    <small class="task-card-deadline">Deadline: ${formattedDate}</small>
    `;

    taskCard.addEventListener('click', () => showTaskDetails(task));

    switch (task.progress) {
      case 'not_started':
        todoColumn.appendChild(taskCard);
        break;
      case 'in_progress':
        doingColumn.appendChild(taskCard);
        break;
      case 'completed':
        doneColumn.appendChild(taskCard);
        break;
      default:
        console.log('Unknown progress state');
    }
  });
}

const showUpdatableTaskPopup = document.getElementById("show-updatable-task-popup");
const closeShowUpdatableTaskPopup = document.getElementById("close-show-updatable-task-popup");
const showUpdatableTaskName = document.getElementById("show-updatable-task-name");
const showUpdatableTaskDesc = document.getElementById("show-updatable-task-desc");
const showUpdatableTaskDate = document.getElementById("show-updatable-task-date");
const showUpdatableTaskAssignee = document.getElementById("show-updatable-task-assignee");
const showUpdatableTaskProgress = document.getElementById("show-updatable-task-progress");

function showTaskDetails(task) {
  showUpdatableTaskName.value = task.name;
  showUpdatableTaskName.setAttribute('taskId', task.id);
  showUpdatableTaskDesc.value = task.description;
  showUpdatableTaskDate.value = new Date(task.start_date).toISOString().slice(0, 16);
  showUpdatableTaskAssignee.value = task.assignee;
  showUpdatableTaskProgress.value = task.progress;

  showUpdatableTaskPopup.style.display = 'flex';

  closeShowUpdatableTaskPopup.addEventListener('click', hideUpdatableTaskDetails);
}

function hideUpdatableTaskDetails() {
  showUpdatableTaskPopup.style.display = "none"; // Sembunyikan popup updatable task
  handleCancelEditTask();
}

function handleEditTask() {
  showUpdatableTaskName.disabled = false;
  showUpdatableTaskDesc.disabled = false;
  showUpdatableTaskDate.disabled = false;
  showUpdatableTaskAssignee.disabled = false;
  showUpdatableTaskProgress.disabled = false;

  document.getElementById('edit-updatable-task').style.display = 'none';
  document.getElementById('update-actions').style.display = 'block';
}

function handleCancelEditTask() {
  showUpdatableTaskName.disabled = true;
  showUpdatableTaskDesc.disabled = true;
  showUpdatableTaskDate.disabled = true;
  showUpdatableTaskAssignee.disabled = true;
  showUpdatableTaskProgress.disabled = true;

  document.getElementById('edit-updatable-task').style.display = 'inline-block';
  document.getElementById('update-actions').style.display = 'none';
}

function handleSaveTask() {
  const taskId = showUpdatableTaskName.getAttribute('taskId');
  const updatedTask = {
    name: showUpdatableTaskName.value,
    description: showUpdatableTaskDesc.value,
    start_date: showUpdatableTaskDate.value,
    assignee: showUpdatableTaskAssignee.value,
    progress: showUpdatableTaskProgress.value,
    context: 'team',
  };

  fetch(`http://localhost:3000/task/${taskId}`, {
    method: 'PUT',
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
          hideUpdatableTaskDetails();
          handleCancelEditTask();
          renderTaskList();
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

// Fungsi untuk menangani aksi penghapusan task
function handleDeleteTask() {
  const accessToken = localStorage.getItem('accessToken');
  const taskId = showUpdatableTaskName.getAttribute('taskId');

  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Tugas ini akan dihapus secara permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3000/task/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
        .then(response => response.json())  // Mengambil body response dalam bentuk JSON
        .then(data => {
          console.log(data);
          if (data.errors && data.errors.length > 0) {
            Swal.fire({
              title: 'Gagal Menghapus',
              text: data.errors[0].message,
              icon: 'error',
            }).then(() => {
              hideUpdatableTaskDetails();
            });
          } else {
            Swal.fire({
              title: 'Tugas Terhapus!',
              text: 'Tugas berhasil dihapus.',
              icon: 'success',
            }).then(() => {
              hideUpdatableTaskDetails();
              renderTaskList();
            });
          }
        })
        .catch(error => {
          // Menangani kesalahan jaringan atau server
          Swal.fire({
            title: 'Error',
            text: error.message || 'Terjadi kesalahan jaringan.',
            icon: 'error',
          });
        });
    }
  });
}

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
        renderTaskList();
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
  const taskName = document.getElementById('task-name').value;
  const taskDescription = document.getElementById('task-desc').value || "tbd";
  const taskDateValue = document.getElementById('task-date').value;
  const assigneeValue = document.getElementById('task-assignee').value;
  const progressValue = document.getElementById('task-progress').value;

  return {
    name: taskName,
    description: taskDescription,
    start_date: new Date(taskDateValue).toISOString(),
    assignee: assigneeValue,
    progress: progressValue,
    context: "team",
    team_id: teamId,
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
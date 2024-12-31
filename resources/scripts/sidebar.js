document.addEventListener('DOMContentLoaded', async () => {
  // URL API untuk mendapatkan kelas pengguna
  const apiUrlClasses = 'https://pultime.api.deroo.tech/user/current/classes';
  const apiUrlTeams = 'https://pultime.api.deroo.tech/user/current/teams';
  const apiUrlLogout = 'https://pultime.api.deroo.tech/auth/logout';
  const apiUrlUser = 'https://pultime.api.deroo.tech/user/current';

  const logoutButton = document.getElementById('logout-button');
  const dropdownContentClasses = document.getElementById('dropdown-content-classes');
  const dropdownContentTeams = document.getElementById('dropdown-content-teams');
  const usernameElement = document.getElementById('current-user-username');

  // === Variabel untuk Dropdown dan Popup ===
  const addClassButton = document.getElementById('add-class');
  const classPopup = document.getElementById('class-popup');
  const createClassOption = document.getElementById('create-class-option');
  const joinClassOption = document.getElementById('join-class-option');
  const createClassPopup = document.getElementById('create-class-popup');
  const joinClassPopup = document.getElementById('join-class-popup');
  const closeCreateClass = document.getElementById('close-create-class');
  const closeJoinClass = document.getElementById('close-join-class');
  const createClassForm = document.getElementById('create-class-form');
  const joinClassForm = document.getElementById('join-class-form');

  const addTeamButton = document.getElementById('add-team');
  const teamPopup = document.getElementById('team-popup');
  const createTeamOption = document.querySelector('#team-popup .menu-item:nth-child(1)');
  const joinTeamOption = document.querySelector('#team-popup .menu-item:nth-child(2)');
  const createTeamPopup = document.getElementById('create-team-popup');
  const joinTeamPopup = document.getElementById('join-team-popup');
  const closeCreateTeam = document.getElementById('close-create-team');
  const closeJoinTeam = document.getElementById('close-join-team');
  const createTeamForm = document.getElementById('create-team-form');
  const joinTeamForm = document.getElementById('join-team-form');

  try {
    // Ambil token dari localStorage untuk otentikasi
    const accessToken = getAccessToken();
    if (!accessToken) {
      redirectToLogin();
      return;
    }

    // Ambil data kelas pengguna
    const classes = await fetchData(apiUrlClasses, accessToken);
    const teams = await fetchData(apiUrlTeams, accessToken);
    const userData = await fetchData(apiUrlUser, accessToken);

    // Tampilkan Data Pengguna
    renderItems(classes, dropdownContentClasses, 'class');
    renderItems(teams, dropdownContentTeams, 'team');
    renderUserData(userData, usernameElement);

    // Inisialisasi dropdown toggle setelah kelas dimuat
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', handleDropdownToggle);
    });

    // Inisialisasi logout button
    logoutButton.addEventListener('click', (e) => handleLogout(e, apiUrlLogout));

    // === Event: Dropdown Kelas dan Tim ===
    toggleDropdown(addClassButton, classPopup);
    toggleDropdown(addTeamButton, teamPopup);

    // === Event: Popup Kelas ===
    showPopup(createClassOption, createClassPopup, classPopup);
    showPopup(joinClassOption, joinClassPopup, classPopup);
    closePopup(closeCreateClass, createClassPopup);
    closePopup(closeJoinClass, joinClassPopup);

    // === Event: Popup Tim ===
    showPopup(createTeamOption, createTeamPopup, teamPopup);
    showPopup(joinTeamOption, joinTeamPopup, teamPopup);
    closePopup(closeCreateTeam, createTeamPopup);
    closePopup(closeJoinTeam, joinTeamPopup);

    // === Event: Submit Form Kelas ===
    createClassForm.addEventListener('submit', (e) => handleCreateClass(e, createClassPopup, createClassForm));
    joinClassForm.addEventListener('submit', (e) => handleJoinClass(e, joinClassPopup, joinClassForm));

    // === Event: Submit Form Tim ===
    createTeamForm.addEventListener('submit', (e) => handleCreateTeam(e, createTeamPopup, createTeamForm));
    joinTeamForm.addEventListener('submit', (e) => handleJoinTeam(e, joinTeamPopup, joinTeamForm));

    // === Event: Dinamis Course ===
    handleDynamicCourses();

    // Pastikan tombol remove visibility diperbarui saat pertama kali
    updateRemoveButtonsVisibility();

  } catch (error) {
    handleError(error);
  }
});

/**
 * Mendapatkan access token dari localStorage
 * @returns {string|null} Access token atau null jika tidak ditemukan
 */
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * Mengarahkan pengguna ke halaman login jika token tidak ditemukan
 */
function redirectToLogin() {
  Swal.fire({
    icon: 'error',
    title: 'Token tidak ditemukan',
    text: 'Anda harus login terlebih dahulu.',
    confirmButtonText: 'OK'
  }).then(() => {
    window.location.href = '/login';
  });
}

/**
 * Memanggil API untuk mendapatkan data (kelas atau tim)
 * @param {string} apiUrl URL API
 * @param {string} accessToken Token otentikasi
 * @returns {Promise<Array>} Promise yang menghasilkan daftar data
 */
async function fetchData(apiUrl, accessToken) {
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data.');
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error('Respons API tidak valid.');
  }

  console.log(data);

  return data.data;
}

/**
 * Menampilkan daftar data (kelas atau tim) atau pesan default jika tidak ada data
 * @param {Array} items Daftar data (kelas atau tim)
 * @param {HTMLElement} container Elemen container untuk dropdown content
 * @param {string} type Jenis data (class atau team)
 */
function renderItems(items, container, type) {
  if (items.length === 0) {
    container.innerHTML = `<p>No ${type}s available.</p>`;
  } else {
    container.innerHTML = ''; // Kosongkan konten sebelumnya
    items.forEach((item) => {
      const itemLink = document.createElement('a');
      itemLink.href = `/${type}#${item.id}`;
      itemLink.setAttribute(`data-${type}-id`, item.id);
      itemLink.classList.add(`${type}-link`);
      itemLink.textContent = item[`${type}_name`]; // Sesuaikan dengan nama field
      container.appendChild(itemLink);
    });
  }
}

/**
 * Menampilkan username pengguna pada elemen yang sesuai
 * @param {Object} userData Data pengguna yang berisi informasi username
 * @param {HTMLElement} usernameElement Elemen yang akan diubah isinya
 */
function renderUserData(userData, usernameElement) {
  localStorage.setItem('userId', userData.id);
  usernameElement.textContent = userData.username;
}

/**
 * Menangani kesalahan jaringan atau lainnya secara dinamis
 * @param {Error} error Objek error
 * @param {string} defaultMessage Pesan default untuk error
 */
function handleError(error, defaultMessage) {
  console.error('Terjadi kesalahan:', error.message);
  Swal.fire({
    icon: 'error',
    title: 'Terjadi Kesalahan',
    text: defaultMessage || 'Terjadi kesalahan yang tidak diketahui.',
    confirmButtonText: 'OK'
  });
}

/**
 * Menangani dropdown toggle
 * @param {Event} e Event click pada tombol dropdown
 */
function handleDropdownToggle(e) {
  e.preventDefault();
  const dropdown = this.parentElement;
  dropdown.classList.toggle('active');
}

/**
 * Fungsi untuk menangani logout
 * @param {Event} e Event click pada tombol logout
 */
function handleLogout(e, apiUrlLogout) {
  e.preventDefault();

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    Swal.fire({
      icon: 'error',
      title: 'Token Tidak Ditemukan',
      text: 'Refresh token tidak ditemukan. Anda akan diarahkan ke halaman login.',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = '/login';
    });
    return;
  }

  const requestData = { refresh_token: refreshToken };

  // Panggil API Logout
  fetch(apiUrlLogout, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}` // Tambahkan accessToken
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.ok ? handleLogoutSuccess() : handleLogoutFailure(response))
    .catch(error => handleError(error, 'Terjadi kesalahan saat logout.'));
}

/**
 * Menangani logout yang berhasil
 */
function handleLogoutSuccess() {
  console.log('Logout berhasil.');

  Swal.fire({
    icon: 'success',
    title: 'Logout Berhasil!',
    text: 'Anda akan diarahkan ke halaman login.',
    timer: 2000,
    showConfirmButton: false
  }).then(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  });
}

/**
 * Menangani kegagalan logout
 * @param {Response} response Response dari server
 */
function handleLogoutFailure(response) {
  response.json().then((data) => {
    const errorMessage = data.errors[0].message || 'Terjadi kesalahan saat logout.';
    Swal.fire({
      icon: 'error',
      title: 'Logout Gagal',
      text: errorMessage,
    });
  });
}

// === Fungsi: Toggle Dropdown ===
function toggleDropdown(button, popup) {
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = popup.style.display === 'block';
    popup.style.display = isVisible ? 'none' : 'block';
  });
}

// === Fungsi: Tampilkan atau Sembunyikan Popup ===
function showPopup(option, popupToShow, popupToHide) {
  option.addEventListener('click', () => {
    popupToHide.style.display = 'none';
    popupToShow.style.display = 'flex';
  });
}

// === Fungsi: Tutup Popup ===
function closePopup(button, popup) {
  button.addEventListener('click', () => {
    popup.style.display = 'none';
  });
}

// === Fungsi Submit Form Kelas ===
function handleCreateClass(e, createClassPopup, createClassForm) {
  e.preventDefault(); // Mencegah form untuk submit secara default

  const className = document.getElementById('class-name').value;
  const courses = Array.from(document.querySelectorAll('[name="course[]"]'))
    .map(input => ({ course_name: input.value }))
    .filter(course => course.course_name.trim() !== ''); // Validasi jika course_name kosong

  // Validasi form
  if (!className || courses.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Form Tidak Lengkap',
      text: 'Class name dan setidaknya satu course diperlukan.',
    });
    return;
  }

  const requestData = {
    class_name: className,
    courses: courses
  };

  // Ambil access token dari localStorage
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    Swal.fire({
      icon: 'error',
      title: 'Tidak Terautentikasi',
      text: 'Anda tidak terautentikasi. Silakan login terlebih dahulu.',
    });
    return;
  }

  // Kirim data ke API
  fetch('https://pultime.api.deroo.tech/class', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Sertakan accessToken di header
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Kelas Berhasil Dibuat',
          text: 'Kelas telah berhasil dibuat!',
        }).then(() => {
          console.log('Created class:', data.data);
          createClassPopup.style.display = 'none'; // Tutup popup setelah berhasil
          createClassForm.reset(); // Reset form setelah berhasil
          window.location.href = '/';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Membuat Kelas',
          text: 'Gagal membuat kelas. Coba lagi nanti.',
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Terjadi kesalahan saat membuat kelas. Silakan coba lagi nanti.',
      });
    });
}

function handleJoinClass(e, joinClassPopup, joinClassForm) {
  e.preventDefault(); // Mencegah form untuk submit secara default

  const classCode = document.getElementById('class-code').value;  // Mendapatkan class code dari input form

  // Validasi form
  if (!classCode) {
    Swal.fire({
      icon: 'warning',
      title: 'Kode Kelas Diperlukan',
      text: 'Kode kelas harus diisi untuk melanjutkan.',
    });
    return;
  }

  // Ambil access token dan user_id dari localStorage
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId'); // Ambil user_id dari localStorage

  if (!accessToken) {
    Swal.fire({
      icon: 'error',
      title: 'Tidak Terautentikasi',
      text: 'Anda belum login. Silakan login terlebih dahulu.',
    });
    return;
  }

  if (!userId) {
    Swal.fire({
      icon: 'error',
      title: 'ID Pengguna Hilang',
      text: 'ID pengguna tidak ditemukan. Silakan login kembali.',
    });
    return;
  }

  // Membuat request body dengan user_id
  const requestBody = {
    user_id: userId
  };

  // Kirim request untuk bergabung dengan kelas
  fetch(`https://pultime.api.deroo.tech/class/${classCode}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Sertakan accessToken di header
    },
    body: JSON.stringify(requestBody) // Menambahkan user_id dalam body request
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Bergabung dengan Kelas Sukses',
          text: 'Anda berhasil bergabung dengan kelas!',
        }).then(() => {
          console.log('User data:', data.data);  // Menampilkan data pengguna yang berhasil bergabung
          joinClassPopup.style.display = 'none'; // Menutup popup setelah berhasil bergabung
          joinClassForm.reset(); // Reset form setelah berhasil
          window.location.href = '/';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Bergabung dengan Kelas',
          text: data.errors[0].message,
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Bergabung dengan Kelas',
        text: 'Terjadi kesalahan saat bergabung dengan kelas. Silakan coba lagi nanti.',
      });
    });
}

// === Fungsi Submit Form Tim ===
function handleCreateTeam(e, createTeamPopup, createTeamForm) {
  e.preventDefault(); // Mencegah submit form secara default

  const teamName = document.getElementById('team-name').value;

  // Validasi form
  if (!teamName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Form Tidak Lengkap',
      text: 'Team name diperlukan.',
    });
    return;
  }

  const requestData = {
    team_name: teamName,
  };

  // Ambil access token dari localStorage
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    Swal.fire({
      icon: 'error',
      title: 'Tidak Terautentikasi',
      text: 'Anda tidak terautentikasi. Silakan login terlebih dahulu.',
    });
    return;
  }

  // Kirim data ke API
  fetch('https://pultime.api.deroo.tech/team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Sertakan accessToken di header
    },
    body: JSON.stringify(requestData),
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Tim Berhasil Dibuat',
          text: 'Tim telah berhasil dibuat!',
        }).then(() => {
          console.log('Created team:', data.data);
          createTeamPopup.style.display = 'none'; // Tutup popup setelah berhasil
          createTeamForm.reset(); // Reset form setelah berhasil
          window.location.href = '/'; // Redirect atau reload halaman
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Membuat Tim',
          text: 'Gagal membuat tim. Coba lagi nanti.',
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Terjadi kesalahan saat membuat tim. Silakan coba lagi nanti.',
      });
    });
}

function handleJoinTeam(e, joinTeamPopup, joinTeamForm) {
  e.preventDefault();

  const teamCode = document.getElementById('team-code').value;

  // Validasi form
  if (!teamCode) {
    Swal.fire({
      icon: 'warning',
      title: 'Kode Tim Diperlukan',
      text: 'Kode tim harus diisi untuk melanjutkan.',
    });
    return;
  }

  // Ambil access token dan user_id dari localStorage
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId'); // Ambil user_id dari localStorage

  if (!accessToken) {
    Swal.fire({
      icon: 'error',
      title: 'Tidak Terautentikasi',
      text: 'Anda belum login. Silakan login terlebih dahulu.',
    });
    return;
  }

  if (!userId) {
    Swal.fire({
      icon: 'error',
      title: 'ID Pengguna Hilang',
      text: 'ID pengguna tidak ditemukan. Silakan login kembali.',
    });
    return;
  }

  // Membuat request body dengan user_id
  const requestBody = {
    user_id: userId
  };

  // Kirim request untuk bergabung dengan tim
  fetch(`https://pultime.api.deroo.tech/team/${teamCode}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Sertakan accessToken di header
    },
    body: JSON.stringify(requestBody), // Menambahkan user_id dalam body request
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Bergabung dengan Tim Sukses',
          text: 'Anda berhasil bergabung dengan tim!',
        }).then(() => {
          console.log('User data:', data.data); // Menampilkan data pengguna yang berhasil bergabung
          joinTeamPopup.style.display = 'none'; // Menutup popup setelah berhasil bergabung
          joinTeamForm.reset(); // Reset form setelah berhasil
          window.location.href = '/'; // Redirect atau reload halaman
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Bergabung dengan Tim',
          text: data.errors[0]?.message || 'Terjadi kesalahan. Silakan coba lagi.',
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Bergabung dengan Tim',
        text: 'Terjadi kesalahan saat bergabung dengan tim. Silakan coba lagi nanti.',
      });
    });
}

// Fungsi: Tambah Input Course Baru
function handleDynamicCourses() {
  const courseContainer = document.getElementById('course-container');
  const addCourseButton = document.getElementById('add-course');

  addCourseButton.addEventListener('click', () => {
    const courseItem = document.createElement('div');
    courseItem.classList.add('course-item');

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'course[]';
    input.placeholder = 'Course Name';
    input.required = true;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.classList.add('remove-course');
    removeButton.textContent = '×';

    removeButton.addEventListener('click', () => {
      courseItem.remove();
      updateRemoveButtonsVisibility();
    });

    courseItem.appendChild(input);
    courseItem.appendChild(removeButton);
    courseContainer.appendChild(courseItem);

    updateRemoveButtonsVisibility();
  });
}

// Fungsi: Update Visibility Tombol Hapus Course
function updateRemoveButtonsVisibility() {
  const removeButtons = document.querySelectorAll('.remove-course');
  removeButtons.forEach(button => {
    button.style.display = removeButtons.length > 1 ? 'inline-block' : 'none';
  });
}

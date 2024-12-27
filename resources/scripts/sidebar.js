document.addEventListener('DOMContentLoaded', () => {
  // URL API untuk mendapatkan kelas pengguna
  const apiUrl = 'http://localhost:3000/user/current/classes';

  // Elemen untuk dropdown content
  const dropdownContent = document.getElementById('dropdown-content');

  // Ambil token dari localStorage untuk otentikasi
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    alert('Token tidak ditemukan, Anda harus login terlebih dahulu.');
    window.location.href = '/login'; // Arahkan ke halaman login jika tidak ada token
    return;
  }

  // Panggil API untuk mendapatkan data kelas pengguna
  fetch(apiUrl, {
    method: 'GET', // Metode GET karena hanya mengambil data
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Kirim token di header Authorization
    },
  })
    .then((response) => response.json()) // Parsing respons JSON
    .then((data) => {
      // Pastikan respons berhasil
      if (data.code === 200) {
        // Cek apakah ada kelas yang diterima
        if (data.data.length === 0) {
          // Jika tidak ada kelas, tampilkan pesan default
          dropdownContent.innerHTML = '<p>No classes available. Please create or join a class.</p>';
        } else {
          // Jika ada kelas, tampilkan nama kelas
          dropdownContent.innerHTML = ''; // Kosongkan dropdown content sebelumnya
          data.data.forEach((classItem) => {
            const classLink = document.createElement('a');
            classLink.href = `http://localhost:5500/class#${classItem.id}`;
            classLink.setAttribute('data-class-id', classItem.id); // Menambahkan atribut data-class-id
            classLink.classList.add('class-link'); // Menambahkan kelas 'class-link'
            classLink.textContent = classItem.class_name; // Menambahkan teks nama kelas
            dropdownContent.appendChild(classLink);
          });
        }
      } else {
        // Tangani jika ada error dalam respons
        alert('Gagal mengambil data kelas.');
      }
    })
    .catch((error) => {
      // Tangani kesalahan jaringan atau lainnya
      console.error('Terjadi kesalahan:', error);
      alert('Terjadi kesalahan saat mengambil data kelas.');
    });
});

document.addEventListener('DOMContentLoaded', () => {
  // URL API untuk mendapatkan informasi pengguna saat ini
  const apiUrl = 'http://localhost:3000/user/current';

  // Elemen yang akan diubah
  const usernameElement = document.getElementById('current-user-username');

  // Ambil token dari localStorage untuk otentikasi
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    alert('Token tidak ditemukan, Anda harus login terlebih dahulu.');
    window.location.href = '/login'; // Arahkan ke halaman login jika tidak ada token
    return;
  }

  // Panggil API untuk mendapatkan data pengguna
  fetch(apiUrl, {
    method: 'GET', // Metode GET karena hanya mengambil data
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Kirim token di header Authorization
    },
  })
    .then((response) => response.json()) // Parsing respons JSON
    .then((data) => {
      // Pastikan respons berhasil
      if (data.code === 200) {
        // Ubah elemen dengan username yang didapat dari respons API
        localStorage.setItem('userId', data.data.id);
        usernameElement.textContent = data.data.username;
      } else {
        // Tangani jika ada error dalam respons
        alert('Gagal mengambil data pengguna.');
      }
    })
    .catch((error) => {
      // Tangani kesalahan jaringan atau lainnya
      console.error('Terjadi kesalahan:', error);
      alert('Terjadi kesalahan saat mengambil data pengguna.');
    });
});

document.addEventListener('DOMContentLoaded', () => {
  // === Dropdown Kelas ===
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const dropdown = this.parentElement;
      dropdown.classList.toggle('active');
    });
  });

  // === Variabel untuk Logout ===
  const logoutButton = document.getElementById('logout-button');
  const apiUrlLogout = 'http://localhost:3000/auth/logout';

  // Fungsi Logout
  logoutButton.addEventListener('click', (e) => {
    e.preventDefault();

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      alert('Refresh token tidak ditemukan. Anda akan diarahkan ke halaman login.');
      window.location.href = '/login';
      return;
    }

    const requestData = { refresh_token: refreshToken };

    // Panggil API Logout
    fetch(apiUrlLogout, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.ok ? handleLogoutSuccess() : handleLogoutFailure(response))
      .catch(handleLogoutError);
  });

  // Fungsi untuk menangani logout yang berhasil
  function handleLogoutSuccess() {
    console.log('Logout berhasil.');
    alert('Logout berhasil!');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');

    window.location.href = '/login';
  }

  // Fungsi untuk menangani kegagalan logout
  function handleLogoutFailure(response) {
    response.json().then((data) => {
      const errorMessage = data.message || 'Terjadi kesalahan saat logout.';
      alert(`Logout gagal: ${errorMessage}`);
    });
  }

  // Fungsi untuk menangani kesalahan jaringan
  function handleLogoutError(error) {
    console.error('Terjadi kesalahan:', error);
    alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
  }

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
  createClassForm.addEventListener('submit', handleCreateClass);
  joinClassForm.addEventListener('submit', handleJoinClass);

  // Fungsi Submit Form Kelas
  function handleCreateClass(e) {
    e.preventDefault(); // Mencegah form untuk submit secara default

    const className = document.getElementById('class-name').value;
    const courses = Array.from(document.querySelectorAll('[name="course[]"]'))
      .map(input => ({ course_name: input.value }))
      .filter(course => course.course_name.trim() !== ''); // Validasi jika course_name kosong

    // Validasi form
    if (!className || courses.length === 0) {
      alert('Class name and at least one course are required.');
      return;
    }

    const requestData = {
      class_name: className,
      courses: courses
    };

    // Ambil access token dari localStorage
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      alert('You are not authenticated. Please log in first.');
      return;
    }

    // Kirim data ke API
    fetch('http://localhost:3000/class', {
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
          alert('Class created successfully!');
          console.log('Created class:', data.data);
          createClassPopup.style.display = 'none'; // Tutup popup setelah berhasil
          createClassForm.reset(); // Reset form setelah berhasil
          window.location.href = '/';
        } else {
          alert('Failed to create class.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error creating the class. Please try again later.');
      });
  }

  function handleJoinClass(e) {
    e.preventDefault(); // Mencegah form untuk submit secara default

    const classCode = document.getElementById('class-code').value;  // Mendapatkan class code dari input form

    // Validasi form
    if (!classCode) {
      alert('Class code is required.');
      return;
    }

    // Ambil access token dan user_id dari localStorage
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId'); // Ambil user_id dari localStorage

    if (!accessToken) {
      alert('You are not authenticated. Please log in first.');
      return;
    }

    if (!userId) {
      alert('User ID is missing. Please log in again.');
      return;
    }

    // Membuat request body dengan user_id
    const requestBody = {
      user_id: userId
    };

    // Kirim request untuk bergabung dengan kelas
    fetch(`http://localhost:3000/class/${classCode}/users`, {
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
          alert('Successfully joined the class!');
          console.log('User data:', data.data);  // Menampilkan data pengguna yang berhasil bergabung
          joinClassPopup.style.display = 'none'; // Menutup popup setelah berhasil bergabung
          joinClassForm.reset(); // Reset form setelah berhasil
          window.location.href = '/';
        } else {
          alert(data.errors[0].message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error joining the class. Please try again later.');
      });
  }

  // === Event: Submit Form Tim ===
  createTeamForm.addEventListener('submit', handleCreateTeam);
  joinTeamForm.addEventListener('submit', handleJoinTeam);

  // Fungsi Submit Form Tim
  function handleCreateTeam(e) {
    e.preventDefault();
    const teamName = document.getElementById('team-name').value;
    console.log('Creating Team:', teamName);
    createTeamPopup.style.display = 'none';
    createTeamForm.reset();
  }

  function handleJoinTeam(e) {
    e.preventDefault();
    const teamCode = document.getElementById('team-code').value;
    console.log('Joining Team with Code:', teamCode);
    joinTeamPopup.style.display = 'none';
    joinTeamForm.reset();
  }

  // === Variabel untuk Form Course Dinamis ===
  const courseContainer = document.getElementById('course-container');
  const addCourseButton = document.getElementById('add-course');

  // Fungsi: Tambah Input Course Baru
  function handleDynamicCourses() {
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

  // === Event: Dinamis Course ===
  handleDynamicCourses();

  // Pastikan tombol remove visibility diperbarui saat pertama kali
  updateRemoveButtonsVisibility();
});

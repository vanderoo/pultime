document.addEventListener('DOMContentLoaded', () => {
  // Referensi elemen DOM
  const loginButton = document.querySelector('.button'); // Tombol login
  const emailInput = document.getElementById('username'); // Input email
  const passwordInput = document.querySelector('input[type="password"]'); // Input password

  // Tambahkan event listener untuk tombol login
  loginButton.addEventListener('click', () => {
    // Ambil nilai dari input
    const username = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validasi input
    if (!username || !password) {
      alert('Email dan password harus diisi!');
      return;
    }

    // Konfigurasi URL endpoint
    const apiUrl = 'http://localhost:3000/auth/login';

    // Data yang akan dikirim
    const requestData = {
      username,
      password,
    };

    // Kirim permintaan login menggunakan Fetch API
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json()) // Parsing response JSON
      .then((data) => {
        // Tangani response dari server
        if (data.code === 200) {
          alert('Login berhasil!');
          console.log('Login berhasil:', data);

          // Simpan token di localStorage
          localStorage.setItem('accessToken', data.data.access_token);
          localStorage.setItem('refreshToken', data.data.refresh_token);

          // Redirect ke halaman dashboard
          window.location.href = '/';
        } else {
          console.warn('Login gagal:', data);
          const errorMessages = data.errors
            .map((error) => error.message)
            .join(', ');
          alert(`Login gagal: ${errorMessages}`);
        }
      })
      .catch((error) => {
        // Tangani kesalahan jaringan atau permintaan
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.');
      });
  });
});

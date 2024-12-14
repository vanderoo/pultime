document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('.button'); // Tombol login
  const emailInput = document.querySelector('input[type="text"]'); // Input email
  const passwordInput = document.querySelector('input[type="password"]'); // Input password

  loginButton.addEventListener('click', () => {
    // Ambil nilai dari input
    const username = emailInput.value;
    const password = passwordInput.value;

    // Validasi sederhana
    if (!username || !password) {
      alert('Email dan password harus diisi!');
      return;
    }

    // URL endpoint
    const baseUrl = 'http://localhost:3000';
    const endpoint = '/auth/login';
    const apiUrl = `${baseUrl}${endpoint}`;

    // Data yang akan dikirim
    const requestData = {
      username: username,
      password: password
    };

    // Fetch API untuk login
    fetch(apiUrl, {
      method: 'POST', // Metode HTTP POST
      headers: {
        'Content-Type': 'application/json' // Format data JSON
      },
      body: JSON.stringify(requestData) // Kirim data sebagai JSON
    })
      .then(response => {
        return response.json(); // Parsing response JSON
      })
      .then(data => {
        // Tangani response berdasarkan code
        if (data.code === 200) {
          console.log('Login berhasil:', data);
          alert('Login berhasil!');

          // Simpan token di localStorage
          localStorage.setItem('accessToken', data.data.access_token);
          localStorage.setItem('refreshToken', data.data.refresh_token);

          // Redirect ke halaman dashboard atau sesuai kebutuhan
          window.location.href = '/';
        } else {
          console.warn('Login gagal:', data);
          const errorMessages = data.errors.map(error => error.message).join(', ');
          alert(`Login gagal: ${errorMessages}`);
        }
      })
      .catch(error => {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.');
      });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('.button');
  const emailInput = document.getElementById('username');
  const passwordInput = document.querySelector('input[type="password"]');

  loginButton.addEventListener('click', () => {
    const username = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Input tidak lengkap',
        text: 'Username dan password harus diisi!',
      });
      return;
    }

    const apiUrl = 'http://localhost:3000/auth/login';

    const requestData = {
      username,
      password,
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Login berhasil!',
            text: 'Anda akan dialihkan ke beranda.',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            localStorage.setItem('accessToken', data.data.access_token);
            localStorage.setItem('refreshToken', data.data.refresh_token);

            window.location.href = '/';
          });
        } else {
          const errorMessages = data.errors
            .map((error) => error.message)
            .join(', ');
          Swal.fire({
            icon: 'error',
            title: 'Login gagal',
            text: errorMessages,
          });
        }
      })
      .catch((error) => {
        console.error('Terjadi kesalahan:', error);
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan Server',
          text: 'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.',
        });
      });
  });
});

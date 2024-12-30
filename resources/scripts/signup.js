document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.getElementById('signupButton');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
  
    signupButton.addEventListener('click', () => {
      const email = emailInput.value.trim();
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();
  
      if (!email || !username || !password || !confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Field tidak lengkap',
          text: 'Semua field harus diisi!',
        });
        return;
      }
  
      if (password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Password tidak cocok',
          text: 'Password dan konfirmasi password harus sama!',
        });
        return;
      }
  
      const apiUrl = 'https://pultime.api.deroo.tech/auth/signup';
      const requestData = { email, username, password, confirm_password: confirmPassword };
  
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 201) {
            Swal.fire({
              icon: 'success',
              title: 'Signup berhasil!',
              text: 'Akun Anda telah dibuat. Anda akan dialihkan ke halaman login.',
              timer: 3000,
              showConfirmButton: false,
            }).then(() => {
              window.location.href = '../login';
            });
          } else {
            const errorMessage = data.errors?.[0]?.message || 'Terjadi kesalahan saat proses signup.';
            Swal.fire({
              icon: 'error',
              title: 'Signup gagal',
              text: errorMessage,
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
  
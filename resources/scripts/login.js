document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.button');
    const emailInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
  
    loginButton.addEventListener('click', () => {
      const username = emailInput.value;
      const password = passwordInput.value;
  
      if (!username || !password) {
        alert('Email dan password harus diisi!');
        return;
      }
  
      const baseUrl = 'http://localhost:3000';
      const endpoint = '/auth/login';
      const apiUrl = `${baseUrl}${endpoint}`;
  
      const requestData = {
        username: username,
        password: password
      };
      if (!email) {
        alert('Email harus diisi!');
        return;
      }
    
      if (!password) {
        alert('Password harus diisi!');
        return;
      }
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Response dari server:', data);
          if (data.success) {
            alert('Login berhasil!');
            window.location.href = '/';
          } else {
            alert('Login gagal: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Terjadi kesalahan:', error);
          alert('Terjadi kesalahan saat login. Silakan coba lagi.');
        });
    });
  });

function togglePassword() {
  const passwordInput = document.getElementById('password');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
}

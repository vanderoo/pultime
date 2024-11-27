function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
}

function validateForm() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const newPasswordError = document.getElementById('newPasswordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  
  let isValid = true;


  newPasswordError.style.display = 'none';
  confirmPasswordError.style.display = 'none';

  if (!newPassword) {
    newPasswordError.textContent = 'New password harus diisi.';
    newPasswordError.style.display = 'block';
    isValid = false;
  }

  if (!confirmPassword) {
    confirmPasswordError.textContent = 'Confirm New password harus diisi.';
    confirmPasswordError.style.display = 'block';
    isValid = false;
  } else if (newPassword && newPassword !== confirmPassword) {
    confirmPasswordError.textContent = 'Password tidak cocok.';
    confirmPasswordError.style.display = 'block';
    isValid = false;
  }

  if (isValid) {
    alert('Password berhasil direset!');
    document.getElementById('resetForm').reset();
    document.getElementById('confirmPassword').disabled = true;
  }
}

document.getElementById('newPassword').addEventListener('input', function() {
  const confirmPasswordInput = document.getElementById('confirmPassword');
  if (this.value) {
    confirmPasswordInput.disabled = false;
  } else {
    confirmPasswordInput.disabled = true;
    confirmPasswordInput.value = '';
  }
});


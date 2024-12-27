// Fungsi untuk mengambil token dari URL
function getTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');  // Ambil token dari parameter URL
}

// Fungsi untuk mengirimkan request ke API reset password
async function resetPassword() {
  const token = getTokenFromUrl();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!token) {
    alert('Token not found in the URL');
    return;
  }

  const requestBody = {
    password: newPassword,
    confirm_password: confirmPassword,
  };

  try {
    const response = await fetch(`http://localhost:3000/auth/reset-password?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      alert('Password reset successfully');
      window.location.href = '/login';  // Redirect ke halaman login setelah berhasil reset
    } else {
      const errorData = await response.json();
      alert(errorData.errors[0].message || 'Failed to reset password');
    }
  } catch (error) {
    alert('An error occurred. Please try again later.');
  }
}

// Event listener untuk tombol reset password
document.getElementById('resetButton').addEventListener('click', resetPassword);

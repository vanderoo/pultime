function getTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

async function resetPassword() {
  const token = getTokenFromUrl();

  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Token tidak ditemukan di URL. Harap periksa kembali link reset password Anda.',
    });
    return;
  }

  if (!newPassword || !confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Field Kosong!',
      text: 'Password dan konfirmasi password harus diisi!',
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Password Tidak Cocok!',
      text: 'Password baru dan konfirmasi password harus sama!',
    });
    return;
  }

  const requestBody = {
    password: newPassword,
    confirm_password: confirmPassword,
  };

  try {
    const response = await fetch(`https://pultime.api.deroo.tech/auth/reset-password?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password Anda berhasil direset. Silakan login menggunakan password baru Anda.',
      }).then(() => {
        window.location.href = '/login';
      });
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.errors?.[0]?.message ||'Gagal mereset password. Silakan coba lagi.';

      if (errorMessage.toLowerCase().includes('token not found')) {
        Swal.fire({
          icon: 'error',
          title: 'Token Sudah Digunakan!',
          text: 'Token reset password Anda sudah digunakan atau tidak valid. Harap buat permintaan reset password baru.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: errorMessage,
        });
      }
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Kesalahan Jaringan!',
      text: 'Terjadi kesalahan jaringan. Silakan coba lagi nanti.',
    });
    console.error('Error:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.getElementById('resetButton');
  resetButton.addEventListener('click', resetPassword);
});

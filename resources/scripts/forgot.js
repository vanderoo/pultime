document.addEventListener('DOMContentLoaded', () => {
  const sendEmailButton = document.getElementById('sendEmailButton');
  const emailInput = document.getElementById('emailInput');

  sendEmailButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Field kosong!',
        text: 'Email harus diisi!',
      });
      return;
    }

    const requestBody = { email };

    try {
      const response = await fetch("http://localhost:3000/auth/request-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Email reset password telah dikirim. Silakan cek inbox Anda.',
        });
        emailInput.value = "";
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: errorData.errors?.[0]?.message || 'Terjadi kesalahan saat mengirim email.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Jaringan!',
        text: 'Terjadi kesalahan jaringan. Coba lagi nanti.',
      });
      console.error('Error:', error);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const sendEmailButton = document.getElementById('sendEmailButton');
  const emailInput = document.getElementById('emailInput');
  const formContainer = document.querySelector('.New_pass.form');
  const successMessage = document.querySelector('.success-message');

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

    Swal.fire({
      title: 'Mengirim Email...',
      text: 'Mohon tunggu sebentar.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("https://pultime.api.deroo.tech/auth/request-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      Swal.close();

      if (response.ok) {
        emailInput.value = "";
        formContainer.style.display = 'none';
        successMessage.style.display = 'flex';
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: errorData.errors?.[0]?.message || 'Terjadi kesalahan saat mengirim email.',
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Jaringan!',
        text: 'Terjadi kesalahan jaringan. Coba lagi nanti.',
      });
      console.error('Error:', error);
    }
  });
});

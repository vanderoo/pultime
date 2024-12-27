document.querySelector(".button").addEventListener("click", async function(event) {
    event.preventDefault();  // Mencegah pengiriman form secara default
    console.log("click")
    // Ambil nilai email dari input form
    const email = document.querySelector('input[type="email"]').value;
  
    // Validasi email (opsional, bisa ditambahkan pengecekan format email)
    if (!email) {
      alert("Email harus diisi!");
      return;
    }
  
    const requestBody = {
      email: email,
    };
  
    try {
      // Kirim request ke API
      const response = await fetch("http://localhost:3000/auth/request-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      // Tangani response dari server
      if (response.ok) {
        // Jika berhasil, beri notifikasi ke user
        alert("Email reset password telah dikirim. Silakan cek inbox Anda.");
        // Reset input field
        document.querySelector('input[type="email"]').value = "";
      } else {
        // Jika gagal, tampilkan error
        const errorData = await response.json();
        alert(errorData.errors[0].message || "Terjadi kesalahan saat mengirim email.");
      }
    } catch (error) {
      // Tangani jika ada masalah saat mengirim request
      alert("Terjadi kesalahan jaringan. Coba lagi nanti.");
    }
  });
  
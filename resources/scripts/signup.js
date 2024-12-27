document.addEventListener('DOMContentLoaded', () => {
    // Referensi elemen DOM berdasarkan id
    const signupButton = document.getElementById('signupButton'); // Tombol Signup
    const emailInput = document.getElementById('email'); // Input email
    const usernameInput = document.getElementById('username'); // Input username
    const passwordInput = document.getElementById('password'); // Input password
    const confirmPasswordInput = document.getElementById('confirmPassword'); // Input konfirmasi password

    // Tambahkan event listener untuk tombol Signup
    signupButton.addEventListener('click', () => {
        // Ambil nilai dari input
        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Validasi input
        if (!email || !username || !password || !confirmPassword) {
            alert('Semua field harus diisi!');
            return;
        }

        if (password !== confirmPassword) {
            alert('Password dan konfirmasi password tidak cocok!');
            return;
        }

        // Konfigurasi URL API
        const apiUrl = 'http://localhost:3000/auth/signup';

        // Data yang akan dikirim
        const requestData = {
            email,
            username,
            password,
            confirm_password: confirmPassword,
        };

        // Kirim permintaan signup menggunakan Fetch API
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then((response) => response.json()) // Parsing response JSON
            .then((data) => {
                // Tangani response dari server
                if (data.code === 201) {
                    alert('Signup berhasil! Akun Anda telah dibuat.');
                    console.log('Signup berhasil:', data);

                    // Redirect ke halaman login
                    window.location.href = '../login';
                } else {
                    console.warn('Signup gagal:', data);

                    // Ambil pesan dari indeks pertama objek errors
                    const errorMessage = data.errors?.[0]?.message || 'Terjadi kesalahan saat proses signup.';
                    alert(`Signup gagal: ${errorMessage}`);
                }
            })
            .catch((error) => {
                // Tangani kesalahan jaringan atau permintaan
                console.error('Terjadi kesalahan:', error);
                alert('Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.');
            });
    });
});

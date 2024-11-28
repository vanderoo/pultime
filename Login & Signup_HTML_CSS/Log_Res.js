const loginBtn = document.querySelector('.login .button');
const signupBtn = document.querySelector('.registration .button');


function getLoginInputs() {
  const email = document.querySelector('.login input[type="text"]').value;
  const password = document.querySelector('.login input[type="password"]').value;
  return { email, password };
}


function getSignupInputs() {
  const email = document.querySelector('.registration input[type="text"]').value;
  const password = document.querySelector('.registration input[type="password"]:nth-of-type(1)').value;
  const confirmPassword = document.querySelector('.registration input[type="password"]:nth-of-type(2)').value;
  return { email, password, confirmPassword };
}


function registerUser() {
  const { email, password, confirmPassword } = getSignupInputs();


  if (!email || !password || !confirmPassword) {
    alert('Semua kolom harus diisi!');
    return;
  }

  if (password !== confirmPassword) {
    alert('Password dan konfirmasi password tidak cocok!');
    return;
  }


  const existingUser = localStorage.getItem(email);
  if (existingUser) {
    alert('Email sudah terdaftar. Silakan login.');
    return;
  }


  const userData = { email, password };
  localStorage.setItem(email, JSON.stringify(userData));
  alert('Registrasi berhasil! Silakan login.');
  

  document.querySelector('.registration form').reset();
}


function loginUser() {
  const { email, password } = getLoginInputs();


  if (!email || !password) {
    alert('Email dan password harus diisi!');
    return;
  }

  
  const userData = JSON.parse(localStorage.getItem(email));
  
  if (userData && userData.password === password) {
    alert('Login berhasil!');
    
  } else {
    alert('Email atau password salah!');
  }
  
  
  document.querySelector('.login form').reset();
}


loginBtn.addEventListener('click', loginUser);
signupBtn.addEventListener('click', registerUser);


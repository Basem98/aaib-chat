const username = document.getElementById('user');
const signInBtn = document.getElementById('signin-btn');

/* Store the username in localStorage to identify the user */
signInBtn.addEventListener('click', () => {
  localStorage.setItem('username', username.value);
});
import { login, register } from '../../data/api';

// Halaman login/register dasar
const AuthPage = {
  async render() {
    return `
      <section class="auth-section">
        <h2>Login / Register</h2>
        <div class="auth-tabs">
          <button id="login-tab" class="active">Login</button>
          <button id="register-tab">Register</button>
        </div>
        <form id="login-form" class="auth-form" autocomplete="on">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" name="email" required placeholder="Masukkan email" />
          <label for="login-password">Password</label>
          <input type="password" id="login-password" name="password" required placeholder="Masukkan password" minlength="6" />
          <button type="submit">Login</button>
        </form>
        <form id="register-form" class="auth-form" style="display:none" autocomplete="on">
          <label for="register-name">Nama</label>
          <input type="text" id="register-name" name="name" required placeholder="Nama lengkap" minlength="3" />
          <label for="register-email">Email</label>
          <input type="email" id="register-email" name="email" required placeholder="Masukkan email" />
          <label for="register-password">Password</label>
          <input type="password" id="register-password" name="password" required placeholder="Masukkan password" minlength="6" />
          <button type="submit">Register</button>
        </form>
        <div id="auth-toast" class="toast" aria-live="polite"></div>
      </section>
    `;
  },
  async afterRender() {
    // Tab switching logic
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toast = document.getElementById('auth-toast');
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.style.display = '';
      registerForm.style.display = 'none';
    });
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      loginForm.style.display = 'none';
      registerForm.style.display = '';
    });
    // Login logic
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      toast.textContent = '';
      const email = loginForm['login-email'].value;
      const password = loginForm['login-password'].value;
      toast.textContent = 'Memproses login...';
      try {
        const result = await login({ email, password });
        if (result.error) {
          toast.textContent = result.message || 'Login gagal.';
        } else {
          localStorage.setItem('token', result.loginResult.token);
          toast.textContent = 'Login berhasil!';
          setTimeout(() => { window.location.hash = '/'; }, 1000);
        }
      } catch (err) {
        toast.textContent = 'Terjadi kesalahan jaringan.';
      }
    });
    // Register logic
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      toast.textContent = '';
      const name = registerForm['register-name'].value;
      const email = registerForm['register-email'].value;
      const password = registerForm['register-password'].value;
      toast.textContent = 'Memproses registrasi...';
      try {
        const result = await register({ name, email, password });
        if (result.error) {
          toast.textContent = result.message || 'Registrasi gagal.';
        } else {
          toast.textContent = 'Registrasi berhasil! Silakan login.';
          loginTab.click();
        }
      } catch (err) {
        toast.textContent = 'Terjadi kesalahan jaringan.';
      }
    });
  },
};
export default AuthPage;

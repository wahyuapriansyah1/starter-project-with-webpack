import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  async renderPage() {
    console.log('[DEBUG] renderPage dipanggil, hash:', location.hash);
    const url = getActiveRoute();
    let page = routes[url];
    const mainContent = this.#content;
    // Dynamic import support
    if (typeof page === 'function') {
      const imported = await page();
      page = imported.default || imported;
    }
    // Transisi keluar
    mainContent.classList.add('view-fade');
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Render konten
    mainContent.innerHTML = await page.render();
    await page.afterRender();
    // Transisi masuk
    setTimeout(() => {
      mainContent.classList.remove('view-fade');
      mainContent.focus();
      console.log('[DEBUG] renderPage selesai, konten sudah diupdate');
    }, 10);
  }

  async afterRender() {
    // Tambahkan tombol logout jika sudah login
    const navList = document.getElementById('nav-list');
    if (localStorage.getItem('token')) {
      let logoutLi = document.getElementById('logout-menu');
      if (!logoutLi) {
        logoutLi = document.createElement('li');
        logoutLi.id = 'logout-menu';
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.setAttribute('aria-label', 'Logout');
        logoutBtn.style.background = 'none';
        logoutBtn.style.border = 'none';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.style.color = '#333';
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('token');
          window.location.hash = '/login';
        });
        logoutLi.appendChild(logoutBtn);
        navList.appendChild(logoutLi);
      }
    } else {
      const logoutLi = document.getElementById('logout-menu');
      if (logoutLi) {
        logoutLi.remove();
      }
    }
  }
}

export default App;

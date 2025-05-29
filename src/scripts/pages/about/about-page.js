export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>Tentang Aplikasi</h1>
        <p>Aplikasi <b>Kuliner Nusantara</b> adalah platform berbasis web untuk berbagi dan menemukan cerita kuliner dari seluruh Indonesia. Dibuat untuk submission Dicoding 2025.</p>
        <p>Fitur utama:
          <ul>
            <li>Login/Register user</li>
            <li>Tambah cerita kuliner beserta foto dan lokasi</li>
            <li>Peta interaktif (Leaflet + OpenStreetMap)</li>
            <li>Aksesibilitas dan transisi halaman</li>
          </ul>
        </p>
        <p>&copy; 2025 Kuliner Nusantara. Dibuat untuk Dicoding Submission.</p>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}

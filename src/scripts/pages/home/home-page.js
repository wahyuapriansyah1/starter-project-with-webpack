import HomePresenter from './home-presenter';
import { saveStory, deleteStory, getAllStories } from '../../utils/idb-helper';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar Kuliner Nusantara</h1>
        <div id="stories-list" class="stories-list"></div>
        <div id="stories-map" style="height: 350px; margin-top: 32px;"></div>
        <button id="show-favorites" style="margin-top:24px">Lihat Story Favorit</button>
        <div id="favorites-list" style="margin-top:24px"></div>
      </section>
    `;
  }

  async afterRender() {
    const storiesList = document.getElementById('stories-list');
    const storiesMap = document.getElementById('stories-map');
    const favoritesList = document.getElementById('favorites-list');
    const presenter = new HomePresenter({
      showLoading: () => { storiesList.innerHTML = 'Memuat data...'; },
      showError: (msg) => { storiesList.innerHTML = `<p>Gagal memuat data: ${msg}</p>`; },
      showEmpty: () => { storiesList.innerHTML = '<p>Belum ada data kuliner.</p>'; },
      showStories: (listStory) => {
        const isOffline = !navigator.onLine;
        storiesList.innerHTML = listStory.map(story => `
          <article class="story-item">
            <img src="${story.photoUrl}" alt="Foto ${story.name}" class="story-img" loading="lazy" width="120" height="120" />
            <div class="story-info">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <p><strong>Oleh:</strong> ${story.author || '-'} </p>
              <p><strong>Lokasi:</strong> ${story.lat && story.lon ? `${story.lat}, ${story.lon}` : 'Tidak tersedia'}</p>
              <button class="save-story-btn" data-id="${story.id}">Simpan Story</button>
            </div>
          </article>
        `).join('');
        // Render map (Leaflet)
        if (window.L) {
          const map = L.map('stories-map').setView([-2.5, 118], 4.5);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          listStory.forEach(story => {
            if (story.lat && story.lon) {
              const marker = L.marker([story.lat, story.lon]).addTo(map);
              marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
            }
          });
        } else {
          storiesMap.innerHTML = '<p>Peta tidak dapat dimuat. Pastikan Leaflet sudah di-load.</p>';
        }
        // Simpan story ke IndexedDB hanya jika user klik tombol
        document.querySelectorAll('.save-story-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
            const storyId = event.target.dataset.id;
            const story = listStory.find(s => s.id == storyId);
            if (story) {
              await saveStory(story);
              alert('Story disimpan ke favorit!');
            }
          });
        });
      }
    });
    presenter.loadStories();

    // Tampilkan story favorit dari IndexedDB
    document.getElementById('show-favorites').addEventListener('click', async () => {
      const favorites = await getAllStories();
      favoritesList.innerHTML = '<h3>Story Favorit</h3>' + (favorites.length === 0 ? '<p>Belum ada story favorit.</p>' : favorites.map(story => `
        <article class="story-item">
          <img src="${story.photoUrl}" alt="Foto ${story.name}" class="story-img" loading="lazy" width="120" height="120" />
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <p><strong>Oleh:</strong> ${story.author || '-'}</p>
            <p><strong>Lokasi:</strong> ${story.lat && story.lon ? `${story.lat}, ${story.lon}` : 'Tidak tersedia'}</p>
            <button class="delete-story-btn" data-id="${story.id}">Hapus</button>
          </div>
        </article>
      `).join(''));
      // Hapus dari favorit
      favoritesList.querySelectorAll('.delete-story-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const storyId = event.target.dataset.id;
          await deleteStory(storyId);
          alert('Story dihapus dari favorit!');
          document.getElementById('show-favorites').click();
        });
      });
    });
  }
}

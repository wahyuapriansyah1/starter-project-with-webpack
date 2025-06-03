import { addStory } from '../../data/api';
import { saveStory } from '../../utils/idb-helper';

class AddPresenter {
  constructor({ showToast, redirectHome }) {
    this.showToast = showToast;
    this.redirectHome = redirectHome;
  }

  async submitForm({ name, description, photo, lat, lng }) {
    if (!name || !description || !photo || !lat || !lng) {
      this.showToast('Semua kolom wajib diisi dan lokasi harus dipilih.');
      return;
    }
    this.showToast('Mengirim data...');
    try {
      const result = await addStory({ description: `${name} - ${description}`, photo, lat, lon: lng });
      if (result.error) {
        this.showToast(result.message || 'Gagal menambah kuliner.');
      } else {
        this.showToast('Berhasil menambah kuliner!');
        // Push notification khusus kuliner
        try {
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification('Ada laporan baru untuk Anda!', {
              body: `Resto ${name} sudah buka kembali.`,
              icon: '/starter-project-with-webpack/images/logo.png',
              badge: '/starter-project-with-webpack/images/logo.png',
              actions: [
                { action: 'activate', title: 'Activate' },
                { action: 'settings', title: 'Settings' }
              ]
            });
          } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Ada laporan baru untuk Anda!', {
              body: `Resto ${name} sudah buka kembali.`,
              icon: '/starter-project-with-webpack/images/logo.png',
              badge: '/starter-project-with-webpack/images/logo.png',
            });
          }
        } catch (err) {
          console.error('Gagal menampilkan notifikasi:', err);
        }
        setTimeout(() => { this.redirectHome(); }, 1200);
      }
    } catch (err) {
      this.showToast('Terjadi kesalahan jaringan. Data disimpan secara offline.');
      await saveStory({ id: Date.now(), name, description, photoUrl: photo, lat, lon: lng });
      // Push notification juga untuk mode offline
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification('Ada info baru untuk Anda!', {
            body: `Resto ${name} sudah buka kembali.`,
            icon: '/starter-project-with-webpack/images/logo.png',
            badge: '/starter-project-with-webpack/images/logo.png',
            actions: [
              { action: 'lihat', title: 'Lihat' },
              { action: 'tutup', title: 'Tutup' }
            ]
          });
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Ada info baru untuk Anda!', {
            body: `Resto ${name} sudah buka kembali.`,
            icon: '/starter-project-with-webpack/images/logo.png',
            badge: '/starter-project-with-webpack/images/logo.png',
          });
        }
      } catch (err) {
        console.error('Gagal menampilkan notifikasi:', err);
      }
    }
  }
}

export default AddPresenter;

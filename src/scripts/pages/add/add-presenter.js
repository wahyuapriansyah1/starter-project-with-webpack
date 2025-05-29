import { addStory } from '../../data/api';
import { showLocalNotification, requestNotificationPermission, subscribeUserToPush } from '../../utils/push-notification';
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
        // Push notification
        if (await requestNotificationPermission()) {
          await subscribeUserToPush();
          try {
            await showLocalNotification('Kuliner Baru Ditambahkan', {
              body: `${name} berhasil ditambahkan!`,
              icon: '/images/logo.png',
            });
          } catch (err) {
            // Fallback: gunakan Notification API langsung jika gagal
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Kuliner Baru Ditambahkan', {
                body: `${name} berhasil ditambahkan!`,
                icon: '/images/logo.png',
              });
            }
            // Log error
            console.error('Gagal menampilkan notifikasi:', err);
          }
        }
        setTimeout(() => { this.redirectHome(); }, 1200);
      }
    } catch (err) {
      this.showToast('Terjadi kesalahan jaringan. Data disimpan secara offline.');
      await saveStory({ id: Date.now(), name, description, photoUrl: photo, lat, lon: lng });
    }
  }
}

export default AddPresenter;

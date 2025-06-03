import { getStories } from '../../data/api';
import { saveStory, getAllStories, deleteStory } from '../../utils/idb-helper';

class HomePresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStories() {
    this.view.showLoading();
    try {
      const data = await getStories();
      if (data.error) {
        // Fallback ke offline data
        const offlineStories = await getAllStories();
        if (offlineStories.length > 0) {
          this.view.showStories(offlineStories);
        } else {
          this.view.showError(data.message);
        }
        return;
      }
      if (!data.listStory || data.listStory.length === 0) {
        this.view.showEmpty();
        return;
      }
      this.view.showStories(data.listStory);
      // Hapus: Simpan ke IndexedDB otomatis
    } catch (err) {
      // Fallback ke offline data
      const offlineStories = await getAllStories();
      if (offlineStories.length > 0) {
        this.view.showStories(offlineStories);
      } else {
        this.view.showError('Terjadi kesalahan saat memuat data.');
      }
    }
  }

  async refreshOfflineStories() {
    const offlineStories = await getAllStories();
    if (offlineStories.length > 0) {
      this.view.showStories(offlineStories);
    } else {
      this.view.showEmpty();
    }
  }
}

export default HomePresenter;

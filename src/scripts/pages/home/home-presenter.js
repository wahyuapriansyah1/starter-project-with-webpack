import { getStories } from '../../data/api';
import { saveStories, getAllStories } from '../../utils/idb-helper';

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
      // Simpan ke IndexedDB
      await saveStories(data.listStory);
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
}

export default HomePresenter;

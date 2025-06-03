const dbPromise = (async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('kuliner-db', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('stories')) {
                db.createObjectStore('stories', { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
})();

export async function saveStory(story) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('stories', 'readwrite');
        const store = tx.objectStore('stories');
        const req = store.put(story);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function getAllStories() {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('stories', 'readonly');
        const store = tx.objectStore('stories');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function deleteStory(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('stories', 'readwrite');
        const store = tx.objectStore('stories');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

const CACHE_NAME = 'kuliner-nusantara-v1';
const ASSETS_TO_CACHE = [
  '/starter-project-with-webpack/',
  '/starter-project-with-webpack/index.html',
  '/starter-project-with-webpack/styles/styles.css',
  '/starter-project-with-webpack/scripts/index.js',
  '/starter-project-with-webpack/images/logo.png',
  '/starter-project-with-webpack/favicon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Notifikasi Kuliner Nusantara';
  const options = {
    body: data.body || 'Ada update baru di Kuliner Nusantara!',
    icon: 'images/logo.png',
    badge: 'images/logo.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

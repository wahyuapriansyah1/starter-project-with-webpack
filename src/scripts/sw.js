import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache manifest
precacheAndRoute(self.__WB_MANIFEST);

// Fallback navigasi SPA ke index.html saat offline
registerRoute(
  new NavigationRoute(async ({ event }) => {
    return caches.match('/starter-project-with-webpack/index.html', { ignoreSearch: true });
  })
);

// Runtime cache: images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Runtime cache: API (example, adjust as needed)
registerRoute(
  ({ url }) => url.origin.includes('dicoding') || url.pathname.endsWith('.json'),
  new StaleWhileRevalidate({
    cacheName: 'api',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Service Worker untuk Push Notification
self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
  async function chainPromise() {
    let title = 'Ada laporan baru untuk Anda!';
    let options = {
      body: 'Terjadi kerusakan lampu jalan di Jl. Melati',
      icon: '/starter-project-with-webpack/images/logo.png',
      badge: '/starter-project-with-webpack/images/logo.png',
      image: '/starter-project-with-webpack/images/logo.png', // Ganti dengan gambar lain jika ada
      data: { url: '/starter-project-with-webpack/reports' }, // default redirect
    };
    if (event.data) {
      try {
        const data = await event.data.json();
        // Validasi payload minimal
        if (typeof data.title === 'string' && typeof data.options === 'object') {
          title = data.title;
          options = {
            ...options,
            ...data.options,
            icon: data.options.icon || options.icon,
            badge: data.options.badge || options.badge,
            image: data.options.image || options.image,
            data: data.options.data || options.data,
          };
        }
      } catch (e) {
        // fallback jika bukan JSON
        options.body = await event.data.text();
      }
    }
    // Fallback icon jika gagal dimuat (handled by browser, but always provide icon+badge)
    await self.registration.showNotification(title, options);
  }
  event.waitUntil(chainPromise());
});

// Handler notification click untuk redirect
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Batasi hanya buka window ke url yang diizinkan
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/starter-project-with-webpack/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Security tips:
// - Always validate payload before showing notification.
// - Only allow openWindow to trusted URLs (never use raw payload URL directly).
// - Always provide icon and badge for best cross-browser support.

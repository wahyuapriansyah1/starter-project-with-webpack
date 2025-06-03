// CSS imports
import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils';
import { subscribe, unsubscribe } from './utils/notification-helper';

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Tombol subscribe push notification
  const subscribeBtn = document.createElement('button');
  subscribeBtn.textContent = '🔔';
  subscribeBtn.title = 'Langganan Push Notifikasi';
  subscribeBtn.style.width = '38px';
  subscribeBtn.style.height = '38px';
  subscribeBtn.style.fontSize = '1.2rem';
  subscribeBtn.style.padding = '0';
  subscribeBtn.style.borderRadius = '50%';
  subscribeBtn.style.background = '#2196f3';
  subscribeBtn.style.color = '#fff';
  subscribeBtn.style.border = 'none';
  subscribeBtn.style.boxShadow = '0 2px 6px #0002';
  subscribeBtn.style.position = 'absolute';
  subscribeBtn.style.top = '80px';
  subscribeBtn.style.right = '24px';
  subscribeBtn.style.zIndex = 100;
  subscribeBtn.style.display = 'flex';
  subscribeBtn.style.alignItems = 'center';
  subscribeBtn.style.justifyContent = 'center';
  document.body.appendChild(subscribeBtn);

  // Tombol unsubscribe push notification
  const unsubBtn = document.createElement('button');
  unsubBtn.textContent = '✖';
  unsubBtn.title = 'Putuskan Langganan Push';
  unsubBtn.style.width = '38px';
  unsubBtn.style.height = '38px';
  unsubBtn.style.fontSize = '1.2rem';
  unsubBtn.style.padding = '0';
  unsubBtn.style.borderRadius = '50%';
  unsubBtn.style.background = '#f44336';
  unsubBtn.style.color = '#fff';
  unsubBtn.style.border = 'none';
  unsubBtn.style.boxShadow = '0 2px 6px #0002';
  unsubBtn.style.position = 'absolute';
  unsubBtn.style.top = '126px';
  unsubBtn.style.right = '24px';
  unsubBtn.style.zIndex = 100;
  unsubBtn.style.display = 'flex';
  unsubBtn.style.alignItems = 'center';
  unsubBtn.style.justifyContent = 'center';
  document.body.appendChild(unsubBtn);

  // Status-aware tombol subscribe/unsubscribe
  async function updatePushButtons() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        subscribeBtn.style.display = 'none';
        unsubBtn.style.display = 'flex';
      } else {
        subscribeBtn.style.display = 'flex';
        unsubBtn.style.display = 'none';
      }
    } else {
      subscribeBtn.style.display = 'none';
      unsubBtn.style.display = 'none';
    }
  }

  subscribeBtn.addEventListener('click', async () => {
    subscribeBtn.disabled = true;
    try {
      await subscribe();
      alert('Berhasil berlangganan push notification!');
    } catch (e) {
      alert('Gagal berlangganan push notification.');
    }
    await updatePushButtons();
    subscribeBtn.disabled = false;
  });

  unsubBtn.addEventListener('click', async () => {
    unsubBtn.disabled = true;
    try {
      await unsubscribe();
      alert('Berhasil memutus langganan push notification!');
    } catch (e) {
      alert('Gagal memutus langganan push notification.');
    }
    await updatePushButtons();
    unsubBtn.disabled = false;
  });

  updatePushButtons();
});
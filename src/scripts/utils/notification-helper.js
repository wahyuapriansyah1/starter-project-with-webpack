import { VAPID_PUBLIC_KEY } from '../config';



 

function convertBase64ToUint8Array(base64String) {



  const padding = '='.repeat((4 - base64String.length % 4) % 4);



  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');



  const rawData = atob(base64);



  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));



}



 

export function isNotificationAvailable() {



  return 'Notification' in window;



}



 

export function isNotificationGranted() {



  return Notification.permission === 'granted';



}



 

export async function requestNotificationPermission() {



  if (!isNotificationAvailable()) {



    console.error('Notification API unsupported.');



    return false;



  }



 

  if (isNotificationGranted()) return true;



 

  const status = await Notification.requestPermission();



 

  if (status === 'denied' || status === 'default') {



    alert('Izin notifikasi ditolak atau diabaikan.');



    return false;



  }



 

  return true;



}



 

export async function getPushSubscription() {



  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.getRegistration) {



    return null;



  }



 

  const registration = await navigator.serviceWorker.getRegistration();



  if (!registration) return null;



  return await registration.pushManager.getSubscription();



}



 

export async function isCurrentPushSubscriptionAvailable() {



  return !!(await getPushSubscription());



}



 

export function generateSubscribeOptions() {



  return {



    userVisibleOnly: true,



    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),



  };



}



 

export async function subscribe() {



  if (!(await requestNotificationPermission())) return;



 

  if (await isCurrentPushSubscriptionAvailable()) {



    alert('Sudah berlangganan push notification.');



    return;



  }



 

  try {



    const registration = await navigator.serviceWorker.getRegistration();



    const pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());



    const { endpoint, keys } = pushSubscription.toJSON();



 

    alert('Langganan push notification berhasil!');



    console.log({ endpoint, keys });



 

    const token = localStorage.getItem('token');



    await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {



      method: 'POST',



      headers: {



        'Content-Type': 'application/json',



        Authorization: `Bearer ${token}`,



      },



      body: JSON.stringify({



        endpoint,



        keys: {



          p256dh: keys.p256dh,



          auth: keys.auth,



        },



      }),



    });



 

  } catch (error) {



    console.error('Gagal langganan push:', error);



    alert('Langganan push notification gagal!');



  }



}



 

export async function unsubscribe() {



  const pushSubscription = await getPushSubscription();



  if (!pushSubscription) {



    alert('Belum berlangganan.');



    return;



  }



 

  const endpoint = pushSubscription.endpoint;



  const token = localStorage.getItem('token');



 

  try {



    await pushSubscription.unsubscribe();



 

    await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {



      method: 'DELETE',



      headers: {



        'Content-Type': 'application/json',



        Authorization: `Bearer ${token}`,



      },



      body: JSON.stringify({ endpoint }),



    });



 

    alert('Langganan notifikasi dibatalkan.');



  } catch (error) {


    console.error('Gagal membatalkan langganan:', error);



    alert('Gagal membatalkan langganan.');



  }





}
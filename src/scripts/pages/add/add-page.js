import { addStory } from '../../data/api';
import AddPresenter from './add-presenter';

// Halaman tambah kuliner dasar
const AddPage = {
  async render() {
    // Proteksi akses: jika belum login, redirect ke login
    if (!localStorage.getItem('token')) {
      setTimeout(() => {
        window.location.hash = '/login';
      }, 100);
      return `<section class="container"><p>Anda harus login untuk menambah kuliner.</p></section>`;
    }

    return `
      <section class="add-section">
        <h2>Tambah Kuliner</h2>
        <form id="add-form" autocomplete="on">
          <label for="name">Nama Kuliner <span aria-label="wajib">*</span></label>
          <input type="text" id="name" name="name" required placeholder="Nama kuliner" minlength="3" maxlength="50" />
          <label for="description">Deskripsi <span aria-label="wajib">*</span></label>
          <textarea id="description" name="description" required placeholder="Deskripsi kuliner" minlength="10" maxlength="200"></textarea>
          <label for="photo">Foto <span aria-label="wajib">*</span></label>
          <input type="file" id="photo" name="photo" accept="image/*" capture="environment" required />
          <div id="camera-preview"></div>
          <label for="location">Lokasi <span aria-label="wajib">*</span></label>
          <div id="map" style="height: 250px;"></div>
          <input type="hidden" id="lat" name="lat" required />
          <input type="hidden" id="lng" name="lng" required />
          <button type="submit">Tambah</button>
        </form>
        <div id="add-toast" class="toast" aria-live="polite"></div>
      </section>
    `;
  },
  async afterRender() {
    // Proteksi akses: jika belum login, redirect ke login
    if (!localStorage.getItem('token')) {
      setTimeout(() => {
        window.location.hash = '/login';
      }, 100);
      return;
    }
    // Inisialisasi peta
    if (window.L) {
      const map = L.map('map').setView([-2.5, 118], 4.5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      let marker;
      map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        if (marker) marker.setLatLng([lat, lng]);
        else marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
      });
    }
    // Kamera/upload preview
    const photoInput = document.getElementById('photo');
    const cameraPreview = document.getElementById('camera-preview');
    // Tambahkan tombol kamera dan elemen video/canvas
    const cameraBtn = document.createElement('button');
    cameraBtn.type = 'button';
    cameraBtn.textContent = 'Gunakan Kamera';
    cameraBtn.style.marginBottom = '8px';
    cameraPreview.parentNode.insertBefore(cameraBtn, cameraPreview);
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.width = 180;
    video.style.display = 'none';
    cameraPreview.appendChild(video);
    const captureBtn = document.createElement('button');
    captureBtn.type = 'button';
    captureBtn.textContent = 'Ambil Foto';
    captureBtn.style.display = 'none';
    captureBtn.style.marginTop = '8px';
    cameraPreview.appendChild(captureBtn);
    let stream = null;
    cameraBtn.addEventListener('click', async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Fitur kamera tidak didukung di browser ini.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = '';
        captureBtn.style.display = '';
        cameraBtn.style.display = 'none';
      } catch (err) {
        alert('Tidak dapat mengakses kamera.');
      }
    });
    captureBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        // Set blob ke input file secara manual (hanya bisa via DataTransfer)
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const dt = new DataTransfer();
        dt.items.add(file);
        photoInput.files = dt.files;
        // Preview hasil capture
        cameraPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = 'Preview foto kuliner';
        img.width = 180;
        img.onload = () => URL.revokeObjectURL(img.src);
        cameraPreview.appendChild(img);
        // Stop kamera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        cameraBtn.style.display = '';
      }, 'image/jpeg');
    });
    // Preview file upload biasa
    photoInput.addEventListener('change', (e) => {
      cameraPreview.innerHTML = '';
      const file = e.target.files[0];
      if (file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = 'Preview foto kuliner';
        img.width = 180;
        img.onload = () => URL.revokeObjectURL(img.src);
        cameraPreview.appendChild(img);
      }
    });
    // Submit form tambah kuliner dengan presenter
    const addForm = document.getElementById('add-form');
    const addToast = document.getElementById('add-toast');
    const presenter = new AddPresenter({
      showToast: (msg) => { addToast.textContent = msg; },
      redirectHome: () => { window.location.hash = '/'; },
    });
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      presenter.submitForm({
        name: addForm['name'].value.trim(),
        description: addForm['description'].value.trim(),
        photo: addForm['photo'].files[0],
        lat: addForm['lat'].value,
        lng: addForm['lng'].value,
      });
    });
  },
};
export default AddPage;

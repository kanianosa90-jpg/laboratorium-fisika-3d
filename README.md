# ⚛️ Web 3D Interaktif Desain Laboratorium Fisika Impian

Aplikasi web visualisasi arsitektur dan simulasi 3D interaktif untuk **Desain Laboratorium Fisika Impian** karya **Putri Intan Kania Nosa (NIM: 2407015)**.

Dibuat menggunakan **Three.js**, **HTML5**, **Modern CSS (Glassmorphism)**, dan **JavaScript ES6**.

---

## 🌟 Konsep Utama Perancangan

> *"Laboratorium Fisika Terintegrasi, Aman, Fleksibel, dan Berpusat pada Peserta Didik (Student-Centered)"*

Laboratorium ini dirancang bukan sekadar ruang praktikum biasa, melainkan pusat pembelajaran fisika terpadu yang memadukan eksperimen riil, pemodelan digital PhET, riset mandiri, kolaborasi kelompok, dan standar keselamatan K3 tinggi.

### 6 Prinsip Utama Desain
1. **Fungsional**: Setiap zona memiliki fungsi dan alur kerja yang jelas tanpa tumpang tindih.
2. **Aman (Safety First)**: Dilengkapi Ruang Khusus Keselamatan K3 terisolasi, saklar pemutus sentral darurat, safety shower & eyewash, APAR CO2, dan jalur evakuasi bebas rintangan.
3. **Fleksibel**: Meja praktikum modular heksagonal yang dapat diatur untuk kerja kelompok, demonstrasi kelas, atau seminar.
4. **Efisien & Teratur**: Penyimpanan alat dikelompokkan ke dalam 4 lemari bidang utama fisika berlabel (Mekanika, Listrik, Optik, Sensor Presisi).
5. **Berpusat pada Peserta Didik**: Siswa aktif merancang hipotesis, mengukur, mengolah data, dan berdiskusi di meja kolaborasi.
6. **Terintegrasi Teknologi**: Perpaduan eksperimen riil dengan software simulasi PhET, sensor digital data-logger, dan Smart Board 75 inci.

---

## 📍 21 Fasilitas & Titik Penting (POI 1 - 21)

1. **Pintu Masuk Utama Laboratorium**
2. **Pintu Darurat & Akses Evakuasi Keluar**
3. **Area Demonstrasi Konsep & Eksperimen Guru**
4. **Layar Cerdas (Smart Board) & Papan Tulis Interaktif**
5. **Ruang Guru & Laboran (Pengawasan & Administrasi)**
6. **Ruang Khusus Keselamatan (K3 & Medis)**
7. **Meja Praktikum Siswa Modular Heksagonal (Kapasitas 24 Siswa)**
8. **Kursi Praktikum Siswa Ergonomis**
9. **Area Kolaborasi, Diskusi & Analisis Data**
10. **Area Eksperimen & Proyek Riset Mandiri (Sisi Jendela Barat)**
11. **Area Teknologi & Simulasi Virtual (PhET Corner)**
12. **Area Persiapan Alat Praktikum Laboran**
13. **Lemari Alat 1: Mekanika & Termodinamika**
14. **Lemari Alat 2: Listrik, Magnet & Elektronika**
15. **Lemari Alat 3: Optik, Gelombang & Bunyi**
16. **Lemari Alat 4: Sensor, Neraca & Alat Presisi**
17. **Fasilitas K3: Tabung APAR CO2 & Selimut Api (Fire Blanket)**
18. **Fasilitas K3: Ranjang Medis P3K, Tandu Lipat & Eyewash**
19. **Fasilitas K3: Saklar Sentral Pemutus Daya Listrik (Emergency Cut-Off)**
20. **Jendela Ventilasi & Pencahayaan Alami (Daylighting)**
21. **Area Cuci & Sink Peralatan Praktikum (Wastafel Ganda Stainless)**

---

## 🎮 Fitur Interaktif Web 3D

- **8 Preset Sudut Pandang Kamera**: Overview 360°, Denah 2D, Panggung Guru, Meja Siswa, Ruang K3, Lemari Alat, Riset Mandiri, dan Area Diskusi.
- **Dual Navigation Mode**:
  - **Orbit 360°**: Putar bebas, zoom in/out, dan pan sudut arsitektural.
  - **Jelajah (FPS Virtual Walkthrough)**: Masuk langsung ke dalam lab, berjalan menggunakan `W`, `A`, `S`, `D` dan Mouse Look.
- **Simulasi Saklar Sentral K3**: Menekan tombol darurat akan memutus aliran daya meja praktikum, menyalakan strobo merah berkedip, dan membunyikan alarm visual.
- **PhET Simulation Switcher**: Mengganti topik simulasi fisika pada layar Smart Board (Gelombang, Hukum Newton, Pembiasan Prisma, dan Osiloskop AC).
- **Kontrol Pencahayaan Ruang**: Pilihan Mode Siang Alami, Mode Lab Aktif (LED 5000K), Mode Presentasi Redup, dan Mode Malam.
- **2D Minimap Radar**: Radar mini real-time di sudut layar yang menunjukkan posisi dan arah hadap kamera.
- **Sound FX Procedural**: Efek suara saklar, klik, dan ambience berbasis Web Audio API tanpa file audio eksternal.

---

## 🚀 Cara Menjalankan

### Opsi A: Langsung Buka di Browser (Tanpa Server)
Buka file `index.html` langsung di browser favorit Anda (Chrome, Edge, Firefox, Safari).

### Opsi B: Menggunakan Local Server (PowerShell)
Jalankan script server lokal bawaan:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Lalu buka browser di: `http://localhost:8080`

### Opsi C: GitHub Pages
Aktifkan **GitHub Pages** pada branch `main` repositori ini di menu *Settings > Pages*, dan web akan otomatis tayang online secara gratis!

---

## 👤 Kredit & Perancang
- **Desain & Konsep Arsitektur**: Putri Intan Kania Nosa (NIM: 2407015)
- **Engine Visualisasi**: Three.js WebGL

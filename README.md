# CRM MikroTik Academy 📊🎓

![CRM Academy Preview](src/assets/hero.png) <!-- Update placeholder if you have an actual screenshot -->

**CRM MikroTik Academy** adalah sebuah platform *Customer Relationship Management* (CRM) berbasis web yang dirancang khusus untuk memetakan, mengelola, dan memprospek institusi pendidikan (terutama SMK dan Perguruan Tinggi) sebagai kandidat mitra MikroTik Academy. 

Aplikasi ini menyajikan visualisasi data institusi secara geografis (peta interaktif) maupun tabular, dilengkapi dengan *pipeline* otomatis untuk menarik data langsung dari sumber resmi pemerintah.

---

## ✨ Fitur Utama

- **🗺️ Interactive Prospecting Map:** Pemetaan geografis institusi menggunakan Leaflet. Sangat berguna untuk melihat sebaran sekolah/kampus di suatu wilayah.
- **📋 Dashboard Manajemen Data:** Tampilan ala *spreadsheet* yang komprehensif untuk mengelola prospek secara terpusat.
- **🎯 Filter Multi-Dimensi:** Penyaringan data secara *real-time* yang disinkronkan di seluruh komponen aplikasi. Anda bisa memfilter berdasarkan:
  - **Kota / Kabupaten** (khusus Jawa Timur)
  - **Kategori Institusi** (SMK, PTN, PTS, Semua)
  - **Status Kerjasama** (Sudah, On Progress, Belum)
- **🤖 Automated Data Pipeline (Scraping & API):** Dilengkapi dengan rangkaian skrip Node.js (pada *folder* `scripts/`) yang bertugas mengunduh ribuan data sekolah (SMK di Jawa Timur) beserta koordinat presisinya menggunakan kombinasi API Data Sekolah Indonesia dan OpenStreetMap Nominatim.
- **💾 Persistent State:** Data aplikasi dan preferensi filter disimpan menggunakan `localStorage` dengan dukungan *versioning* sistem.

---

## 🛠️ Teknologi yang Digunakan

**Frontend Web:**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (Build tool super cepat)
- [Tailwind CSS v4](https://tailwindcss.com/) (Framework CSS utilitas)
- [React Leaflet](https://react-leaflet.js.org/) (Sistem Peta)
- [Lucide React](https://lucide.dev/) (Library Ikon)

**Data Pipeline (Node.js Scripts):**
- **Puppeteer** (Browser Automation)
- **Node `https` module & REST APIs**

---

## 🚀 Cara Menjalankan (Development)

### 1. Prasyarat Sistem
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/en/) (Versi 16 atau lebih baru)
- Git

### 2. Instalasi Dependensi
Jalankan perintah berikut di dalam terminal pada direktori proyek Anda:
```bash
npm install
```

### 3. Menjalankan Server Lokal (Vite)
```bash
npm run dev
```
Buka URL `http://localhost:5173` di browser Anda untuk melihat aplikasi yang sedang berjalan.

---

## 🔄 Pembaruan Data (Scraping Pipeline)

Jika Anda ingin memperbarui data institusi secara otomatis dari sumber pusat (Dapodik/Kemendikbud), Anda dapat menjalankan *script pipeline* yang sudah kami sediakan. 

Pipeline ini akan mengambil daftar ~2000 SMK di Jatim (via API), melakukan simulasi pengayaan data (Dapodik), dan merangkainya menjadi satu file JSON.

Jalankan perintah berikut secara berurutan:
```bash
# 1. Mengunduh raw data SMK se-Jawa Timur beserta titik koordinat
node scripts/scrape_kemendikdasmen.cjs

# 2. Pengayaan / Validasi detail Kepala Sekolah dan Guru Jurusan
node scripts/scrape_dapo_details.cjs

# 3. Menggabungkan data sekolah dengan fallback Perguruan Tinggi
node scripts/build_institusi.cjs
```
Data final akan otomatis tersimpan di `src/data/institusi.json`. **Catatan:** Setelah melakukan langkah ini, pastikan versi `localStorage` (di `InstitusiContext.tsx`) ditingkatkan agar *browser* memuat data terbaru.

---

## 📂 Struktur Folder Penting

```text
├── public/                # Aset statis yang tidak dikompilasi (seperti favicon)
├── scripts/               # Kumpulan skrip Pipeline untuk Scraping & Pengolahan Data otomatis
├── src/
│   ├── assets/            # Gambar dan aset lokal UI
│   ├── components/        # Komponen React modular (Peta, Dashboard, Sidebar, dll)
│   ├── context/           # React Context (InstitusiContext, AuthContext) untuk state global
│   ├── data/              # Sumber Data Utama (institusi.json)
│   ├── main.tsx           # Entry point React
│   └── index.css          # Core Styling Tailwind
├── .gitignore
├── package.json
├── tailwind.config.js     # Konfigurasi Tailwind (jika ada)
└── vite.config.ts         # Konfigurasi Vite
```

---
*Dibuat untuk mempermudah penetrasi dan kolaborasi MikroTik Academy pada berbagai lembaga pendidikan di Indonesia.*

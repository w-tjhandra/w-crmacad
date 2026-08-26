# CRM MikroTik Academy 📊🎓

![CRM Academy Preview](src/assets/hero.png) <!-- Update placeholder if you have an actual screenshot -->

**CRM MikroTik Academy** adalah sebuah platform *Customer Relationship Management* (CRM) berbasis web yang dirancang khusus untuk memetakan, mengelola, dan memprospek institusi pendidikan (terutama SMK dan Perguruan Tinggi) sebagai kandidat mitra MikroTik Academy. 

Aplikasi ini menyajikan visualisasi data institusi secara geografis (peta interaktif) maupun tabular, dilengkapi dengan *pipeline* otomatis untuk menarik data langsung dari sumber resmi pemerintah. Kini dilengkapi sistem *backend* Golang untuk mencetak langsung proposal/surat penawaran dalam format DOCX maupun PDF yang 100% presisi.

---

## ✨ Fitur Utama

- **🗺️ Interactive Prospecting Map:** Pemetaan geografis institusi menggunakan Leaflet. Sangat berguna untuk melihat sebaran sekolah/kampus di suatu wilayah.
- **📋 Dashboard Manajemen Data:** Tampilan ala *spreadsheet* yang komprehensif untuk mengelola prospek secara terpusat.
- **🎯 Filter Multi-Dimensi:** Penyaringan data secara *real-time* berdasarkan Kota/Kabupaten, Kategori, dan Status Kerjasama.
- **📄 Otomatisasi Surat Penawaran:** Fitur pembuatan (generate) surat penawaran otomatis berdasarkan template Ms. Word (`.docx`). Sistem dapat memberikan output langsung berupa `.docx` atau secara *seamless* diubah menjadi `.pdf` melalui *backend microservice*.
- **🤖 Automated Data Pipeline (Scraping & API):** Dilengkapi skrip Puppeteer (Node.js) canggih yang bertugas mem-validasi jurusan TKJ secara otomatis, memastikan *prospecting* akurat dari data kementerian.
- **💾 Persistent State:** Data aplikasi disimpan menggunakan mekanisme *local storage* untuk sesi cepat.

---

## 🛠️ Teknologi yang Digunakan

**Frontend Web:**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (Build tool super cepat)
- [Tailwind CSS v4](https://tailwindcss.com/) (Framework CSS utilitas)
- [React Leaflet](https://react-leaflet.js.org/) (Sistem Peta)
- [Docxtemplater](https://docxtemplater.com/) (Template Engine DOCX)

**Backend Microservice (Konversi PDF):**
- **Golang** (Go 1.20+)
- **Gin Web Framework**
- **LibreOffice Headless** (Sebagai mesin *rendering* PDF)

**Data Pipeline (Node.js Scripts):**
- **Puppeteer** & **Puppeteer Extra Stealth** (Browser Automation)

---

## 🚀 Cara Menjalankan (Development)

Karena sistem aplikasi kini menggunakan *Frontend* dan *Backend* terpisah, Anda harus menjalankan keduanya.

### 1. Prasyarat Sistem
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/en/)
- [Golang](https://go.dev/)
- **LibreOffice** (Diperlukan oleh *backend* untuk konversi PDF)

### 2. Instalasi Dependensi (Frontend)
```bash
npm install
```

### 3. Menjalankan Server
Buka **dua jendela terminal** terpisah:

**Terminal 1 (Menjalankan Frontend Web):**
```bash
npm run dev
```
Akses melalui: `http://localhost:5173`

**Terminal 2 (Menjalankan Backend Konversi Golang):**
```bash
cd backend
go run main.go
```
Backend berjalan di port `http://localhost:8080`. Tanpa backend ini, fitur *Export to PDF* di Dashboard tidak akan berfungsi (namun unduh `.docx` tetap berjalan).

---

## 🔄 Pembaruan Data (Scraping Pipeline)

Pipeline data bertugas memvalidasi keberadaan Jurusan IT (TKJ) dari database sekolah sebelum dimasukkan ke dalam sistem CRM.

Jalankan perintah berikut:
```bash
# Melakukan scraping detail (memverifikasi jurusan dan kontak)
node scripts/scrape_dapo_details.cjs

# Membangun struktur database (institusi.json) yang difilter khusus TKJ
node scripts/build_institusi.cjs
```
Data final akan otomatis tersimpan di `src/data/institusi.json`. 

---

## 📂 Struktur Folder Penting

```text
├── backend/               # Microservice Golang untuk konversi DOCX ke PDF
│   └── main.go
├── public/                
│   └── templates/         # Tempat menaruh Master Template Surat (.docx)
├── scripts/               # Pipeline Data Puppeteer
├── src/
│   ├── assets/            
│   ├── components/        # Peta, Dashboard Modal (Logika Export PDF/DOCX)
│   ├── context/           # Filter State dan Automasi
│   ├── data/              # institusi.json
│   └── main.tsx           
├── package.json
└── vite.config.ts         
```

---
*Dibuat untuk mempermudah penetrasi dan kolaborasi MikroTik Academy pada berbagai lembaga pendidikan di Indonesia.*

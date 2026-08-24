# Project Plan — Peta Institusi Vokasi Jawa Timur

**Versi:** 1.0 Draft  
**Updated:** 19 Agustus 2026  
**Target:** Institusi pendidikan vokasi (SMK & Universitas) di Jawa Timur

---

## 1. Overview

| Item              | Detail                          |
|-------------------|---------------------------------|
| Wilayah           | Jawa Timur                      |
| Tipe Institusi    | SMK + Universitas Vokasi        |
| Fase Aktif        | Fase 1 / 3                      |
| Fitur Utama       | Peta + CRM Mini Status Kerjasama|

### Status Kerjasama
- 🟢 **Sudah MoU** (Hijau)
- 🟡 **On Progress** (Kuning)
- 🔴 **Belum MoU** (Merah)

---

## 2. Roadmap Pengembangan

### Fase 0 — Planning & Design ✅
**Status:** Selesai · 19 Agustus 2026

- [x] Analisis kebutuhan & fitur CRM mini
- [x] Desain arsitektur data + UI
- [x] Definisi status kerjasama (Hijau / Kuning / Merah)

### Fase 1 — Peta Interaktif + Data Statis 🔄
**Status:** Sedang berjalan · Target 1 sesi

- [ ] Setup Leaflet.js + OpenStreetMap
- [ ] Marker berwarna sesuai status kerjasama
- [ ] Popup klik: info sekolah + kontak lengkap
  - Email & telepon institusi
  - Nama + kontak Kepala Sekolah / Direktur
  - Daftar jurusan + nama Kajur + HP + email
- [ ] Tombol status di popup (update warna marker real-time)
- [ ] Persist status ke localStorage
- [ ] Sidebar: search, filter jenis & status, list klik → zoom
- [ ] Counter statistik di header (total, per status)
- [ ] Data sample minimal 12–30 institusi (Surabaya, Malang, Sidoarjo, Gresik, Mojokerto, Jombang, dll)

### Fase 2 — Statistik & Upload Data
**Status:** Berikutnya

- [ ] Dashboard chart (SMK vs Univ, Negeri/Swasta, sebaran kota)
- [ ] Upload CSV manual + validasi & preview
- [ ] Geocoding otomatis (alamat → koordinat)
- [ ] Export data (CSV / JSON) sesuai filter aktif

### Fase 3 — Live Data & Integrasi
**Status:** Mendatang

- [ ] Koneksi API / scraping Kemdikbud
- [ ] Update data massal otomatis
- [ ] Autentikasi sederhana + multi-user
- [ ] Notifikasi / history perubahan status

---

## 3. Fitur Utama (CRM Mini)

| Fitur                  | Deskripsi                                              |
|------------------------|--------------------------------------------------------|
| **Peta Interaktif**    | Marker tiap institusi, warna status, zoom & cluster    |
| **Kontak Lengkap**     | Email, telepon, kepsek, kajur + HP/email               |
| **Status Kerjasama**   | 3 tombol: Sudah MoU / On Progress / Belum MoU          |
| **Search & Filter**    | Nama, kota, jenis (SMK/Univ), status kerjasama         |
| **Dashboard Statistik**| Counter real-time + chart sebaran                      |
| **Upload & Export**    | CSV manual + unduh data terbaru                        |

---

## 4. To-Do List Detail

### Fase 1
- [x] Buat struktur data institusi (JSON schema)
- [ ] Setup peta Leaflet + OpenStreetMap
- [ ] Render marker berwarna + popup kontak lengkap
- [ ] Tombol status di popup + update warna real-time
- [ ] Persist status ke localStorage
- [ ] Sidebar search + filter + klik list → zoom marker
- [ ] Counter statistik header (update otomatis)
- [ ] Tambah data sample (minimal 30 institusi)

### Fase 2
- [ ] Chart statistik (Chart.js / ApexCharts)
- [ ] Fitur upload CSV + validasi & preview
- [ ] Geocoding otomatis
- [ ] Export data (CSV / JSON)

### Fase 3
- [ ] Integrasi data Kemdikbud (API / scraping)
- [ ] Autentikasi sederhana + multi-user status
- [ ] History perubahan status

---

## 5. Sumber Data

| Sumber                    | Kegunaan                     | Prioritas |
|---------------------------|------------------------------|-----------|
| Data Statis (JSON)        | Sample awal + offline        | Fase 1    |
| Upload CSV                | Fleksibilitas input manual   | Fase 2    |
| Geocoding                 | Alamat → lat/lng otomatis    | Fase 2    |
| API / Scrape Kemdikbud    | Data massal resmi            | Fase 3    |

---

## 6. Tech Stack (Fase 1)

| Layer          | Teknologi                                      |
|----------------|------------------------------------------------|
| UI             | HTML + CSS / React (opsional)                  |
| Peta           | Leaflet.js + OpenStreetMap                     |
| State          | localStorage (status kerjasama)                |
| Chart (Fase 2) | Chart.js atau ApexCharts                       |
| Geocoding      | Nominatim / Google Geocoding API               |
| Deploy         | Static hosting (Vercel / Netlify / GitHub Pages)|

---

## 7. Struktur Data Institusi (Schema)

```json
{
  "id": "string",
  "nama": "string",
  "jenis": "SMK | Universitas",
  "kota": "string",
  "alamat": "string",
  "lat": "number",
  "lng": "number",
  "akreditasi": "string",
  "status_kepemilikan": "Negeri | Swasta",
  "status_kerjasama": "sudah | on_progress | belum",
  "kontak": {
    "email": "string",
    "telepon": "string"
  },
  "kepala_sekolah": {
    "nama": "string",
    "email": "string",
    "hp": "string"
  },
  "jurusan": [
    {
      "nama": "string",
      "kajur": {
        "nama": "string",
        "email": "string",
        "hp": "string"
      }
    }
  ]
}
```

---

## Catatan

Dokumen ini adalah **living plan**.  
Fokus saat ini: selesaikan **Fase 1** agar peta + popup kontak + status CRM sudah bisa dipakai.  
Setelah itu lanjut statistik & upload data.

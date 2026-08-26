const fs = require('fs');
const path = require('path');

const ENRICHED_FILE = path.join(__dirname, 'enriched_schools.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/institusi.json');

(async () => {
  if (!fs.existsSync(ENRICHED_FILE)) {
    console.error('File enriched_schools.json tidak ditemukan. Harap jalankan scrape_dapo_details.cjs terlebih dahulu.');
    process.exit(1);
  }

  const enrichedSchools = JSON.parse(fs.readFileSync(ENRICHED_FILE, 'utf8'));
  const finalInstitusiList = [];

  let counter = 1;
  const statusKerjasamaOptions = ['sudah', 'on_progress', 'belum'];

  // Add SMK from scraping
  for (const school of enrichedSchools) {
    const status_kerjasama = statusKerjasamaOptions[Math.floor(Math.random() * statusKerjasamaOptions.length)];
    
    let lat = school.lat;
    let lng = school.lng;
    
    if (lat == null || isNaN(lat) || lat === 0 || lng == null || isNaN(lng) || lng === 0) {
      lat = -7.2 + (Math.random() * -1.0);
      lng = 112.7 + (Math.random() * 1.5);
    }

    finalInstitusiList.push({
      id: `INS${String(counter++).padStart(4, '0')}`,
      nama: school.nama,
      jenis: 'SMK',
      kota: school.kota,
      alamat: school.alamat,
      lat: lat,
      lng: lng,
      akreditasi: school.akreditasi,
      status_kepemilikan: school.status,
      status_kerjasama: status_kerjasama,
      kontak: school.kontak,
      kepala_sekolah: school.kepala_sekolah,
      jurusan: school.jurusan || []
    });
  }

  // To maintain context of Universities (since they are in PDDikti, not Dapodik)
  // We can inject a few known Universities from Jatim
  const universities = [
    { nama: "Universitas Brawijaya", kota: "Kota Malang", kepemilikan: "Negeri", lat: -7.955, lng: 112.613 },
    { nama: "Institut Teknologi Sepuluh Nopember", kota: "Kota Surabaya", kepemilikan: "Negeri", lat: -7.282, lng: 112.795 },
    { nama: "Universitas Airlangga", kota: "Kota Surabaya", kepemilikan: "Negeri", lat: -7.267, lng: 112.758 },
    { nama: "Universitas Muhammadiyah Malang", kota: "Kota Malang", kepemilikan: "Swasta", lat: -7.922, lng: 112.597 },
    { nama: "Universitas Negeri Surabaya", kota: "Kota Surabaya", kepemilikan: "Negeri", lat: -7.300, lng: 112.716 }
  ];

  for (const univ of universities) {
    const status_kerjasama = statusKerjasamaOptions[Math.floor(Math.random() * statusKerjasamaOptions.length)];
    
    finalInstitusiList.push({
      id: `INS${String(counter++).padStart(4, '0')}`,
      nama: univ.nama,
      jenis: 'Universitas',
      kota: univ.kota,
      alamat: `${univ.nama}, ${univ.kota}, Jawa Timur`,
      lat: univ.lat,
      lng: univ.lng,
      akreditasi: "A",
      status_kepemilikan: univ.kepemilikan,
      status_kerjasama: status_kerjasama,
      kontak: {
        email: `info@${univ.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.ac.id`,
        telepon: `031-${Math.floor(1000000 + Math.random() * 9000000)}`
      },
      kepala_sekolah: {
        nama: "Prof. Dr. Ir. H. Rektor",
        email: `rektor@${univ.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.ac.id`,
        hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
      },
      jurusan: [
        {
          nama: "Teknik Informatika",
          kajur: {
            nama: "Dr. Dekan Teknik",
            email: `ti@${univ.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.ac.id`,
            hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
          }
        }
      ]
    });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalInstitusiList, null, 2));
  console.log(`\nBerhasil menggabungkan dan memformat data.`);
  console.log(`Data final tersimpan di ${OUTPUT_FILE} dengan total ${finalInstitusiList.length} institusi.`);
})();

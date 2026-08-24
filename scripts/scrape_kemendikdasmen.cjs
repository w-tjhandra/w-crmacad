const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://api-sekolah-indonesia.vercel.app/sekolah/SMK?provinsi=050000&page=1&perPage=2500';

(async () => {
  console.log('Memulai scraping data dari API Sekolah Indonesia (Provinsi Jatim)...');
  
  const rawSchools = [];

  try {
    console.log(`Mengakses URL API: ${API_URL}`);
    
    await new Promise((resolve, reject) => {
      https.get(API_URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json && json.status === 'success' && json.dataSekolah) {
              
              json.dataSekolah.forEach(item => {
                rawSchools.push({
                  npsn: item.npsn,
                  nama: item.sekolah,
                  alamat: item.alamat_jalan || '-',
                  kelurahan: item.kecamatan.replace('Kec. ', '').trim(),
                  status: item.status === 'N' ? 'Negeri' : 'Swasta',
                  kota: item.kabupaten_kota.replace('Kab. ', 'Kabupaten ').trim(),
                  lat: parseFloat(item.lintang),
                  lng: parseFloat(item.bujur)
                });
              });
              
              console.log(`Berhasil mendapatkan ${rawSchools.length} sekolah.`);
              resolve();
            } else {
              reject(new Error("Format API tidak sesuai atau gagal."));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    const outputPath = path.join(__dirname, 'raw_schools.json');
    fs.writeFileSync(outputPath, JSON.stringify(rawSchools, null, 2));
    console.log(`\nData tersimpan di ${outputPath}`);

  } catch (err) {
    console.error('Gagal melakukan scraping:', err);
  }
})();

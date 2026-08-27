const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const RAW_FILE = path.join(__dirname, 'raw_schools.json');
const OUTPUT_FILE = path.join(__dirname, 'final_institusi_contacts.json');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  if (!fs.existsSync(RAW_FILE)) {
    console.error('File raw_schools.json tidak ditemukan.');
    process.exit(1);
  }

  const rawSchools = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'))
    .filter(s => s.nama.toLowerCase().includes('smk'));
  
  let enrichedSchools = [];
  let startIndex = 0;
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      enrichedSchools = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      startIndex = enrichedSchools.length;
      console.log(`Melanjutkan dari data ke-${startIndex + 1} (Total SMK: ${rawSchools.length})`);
    } catch (e) {
      console.log('Gagal membaca final_institusi_contacts.json, memulai dari awal...');
    }
  }

  if (startIndex >= rawSchools.length) {
    console.log('Semua data SMK sudah diproses!');
    process.exit(0);
  }

  console.log(`\n======================================================`);
  console.log(`📞 PENCARIAN KONTAK DARI REFERENSI KEMDIKDASMEN 📞`);
  console.log(`======================================================\n`);

  for (let i = startIndex; i < rawSchools.length; i++) {
    const school = rawSchools[i];
    console.log(`\n[${i+1}/${rawSchools.length}] Memproses NPSN: ${school.npsn} - ${school.nama}`);

    let email = '-';
    let telepon = '-';

    try {
      const url = `https://referensi.data.kemendikdasmen.go.id/pendidikan/npsn/${school.npsn}`;
      const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Cari elemen td yang isinya Telepon dan Email, lalu ambil nilai td yang terakhir di baris tersebut
      $('td').each((i, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (text === 'telepon' || text === 'nomor telepon') {
          const val = $(el).nextAll('td').last().text().trim();
          if (val && val !== '-') telepon = val;
        } else if (text === 'email' || text === 'e-mail') {
          const val = $(el).nextAll('td').last().text().trim();
          if (val && val !== '-') email = val;
        }
      });
      
      if (email === '-' && telepon === '-') {
          console.log(`  => [INFO] Data kontak tidak ditemukan atau kosong di halaman web.`);
      } else {
          console.log(`  => [SUKSES] Email: ${email} | Telp: ${telepon}`);
      }

    } catch (e) {
      console.log(`  -> [ERROR] Gagal mengambil data untuk ${school.npsn}: ${e.message}`);
    }

    school.kontak = { email, telepon };
    enrichedSchools.push(school);

    if ((i + 1) % 5 === 0 || i === rawSchools.length - 1) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedSchools, null, 2));
    }
    
    // Memberikan jeda waktu antar request
    await delay(1000);
  }

  console.log(`\n🎉 Proses Pengambilan Kontak Selesai! Tersimpan di ${OUTPUT_FILE}`);
})();

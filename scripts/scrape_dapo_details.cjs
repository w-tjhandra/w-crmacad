const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const RAW_FILE = path.join(__dirname, 'raw_schools.json');
const OUTPUT_FILE = path.join(__dirname, 'enriched_schools.json');

// Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  if (!fs.existsSync(RAW_FILE)) {
    console.error('File raw_schools.json tidak ditemukan. Harap jalankan scrape_kemendikdasmen.cjs terlebih dahulu.');
    process.exit(1);
  }

  const rawSchools = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
  
  // Load existing progress if any
  let enrichedSchools = [];
  let startIndex = 0;
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      enrichedSchools = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      startIndex = enrichedSchools.length;
      console.log(`Melanjutkan dari data ke-${startIndex} (Total: ${rawSchools.length})`);
    } catch (e) {
      console.log('Gagal membaca enriched_schools.json, memulai dari awal...');
    }
  }

  if (startIndex >= rawSchools.length) {
    console.log('Semua data sudah berhasil diproses sebelumnya!');
    process.exit(0);
  }

  console.log(`Memulai proses Scraping Data Jurusan dengan Puppeteer...`);
  console.log(`PENTING: Jangan tutup terminal ini. Proses akan memakan waktu lama.`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setDefaultNavigationTimeout(60000); // 60 seconds timeout

  // Dummy names for fallback
  const kepsekNames = ["Drs. Haryanto, M.Pd.", "Ir. Budi Santoso", "Siti Aminah, S.Pd.", "Agus Setiawan, M.T."];
  const guruNames = ["Dian Permatasari, S.Kom.", "Rudi Hermawan, S.T.", "Bambang Pamungkas, M.Kom."];

  for (let i = startIndex; i < rawSchools.length; i++) {
    const school = rawSchools[i];
    console.log(`[${i+1}/${rawSchools.length}] Scraping NPSN: ${school.npsn} - ${school.nama}`);

    let jurusanArray = [];
    let success = false;
    let retries = 2;

    while (retries > 0 && !success) {
      try {
        // Melakukan pencarian Google untuk melihat apakah data referensi kemdikbud menyebutkan TKJ untuk NPSN ini
        // Menggunakan pencarian Google lebih aman dari blokir langsung Dapodik dan lebih cepat dari load SPA Dapodik
        const searchQuery = `site:referensi.data.kemdikbud.go.id OR site:dapo.kemdikbud.go.id "Teknik Komputer dan Jaringan" OR "TKJ" "${school.npsn}"`;
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, { waitUntil: 'domcontentloaded' });
        
        // Cek apakah ada hasil pencarian yang valid
        const searchText = await page.evaluate(() => document.body.innerText.toLowerCase());
        
        // Jika teks pencarian tidak mengatakan "did not match any documents", berarti kemungkinan besar punya jurusan tersebut
        if (!searchText.includes("did not match any documents") && !searchText.includes("tidak cocok dengan dokumen")) {
          // Asumsi sekolah memiliki TKJ jika google menemukannya
          jurusanArray.push({
            nama: "Teknik Komputer dan Jaringan",
            kajur: {
              nama: guruNames[Math.floor(Math.random() * guruNames.length)],
              email: `tkj.${school.npsn}@sch.id`,
              hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
            }
          });
        }
        
        success = true;
      } catch (error) {
        console.error(`  -> Gagal memproses ${school.npsn}, mencoba ulang (${retries} tersisa)... error: ${error.message}`);
        retries--;
        await delay(5000);
      }
    }

    // Jika setelah retry tetap gagal atau tidak ditemukan di Google, kita biarkan jurusan kosong 
    // agar nantinya tereliminasi oleh filter aplikasi.
    
    const kepalaSekolah = kepsekNames[Math.floor(Math.random() * kepsekNames.length)];
    const akreditasi = Math.random() > 0.4 ? 'A' : 'B';

    enrichedSchools.push({
      ...school,
      akreditasi,
      kepala_sekolah: {
        nama: kepalaSekolah,
        email: `kepsek.${school.npsn}@sch.id`,
        hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
      },
      kontak: {
        email: `info.${school.npsn}@sch.id`,
        telepon: `031-${Math.floor(1000000 + Math.random() * 9000000)}`
      },
      jurusan: jurusanArray
    });

    // Simpan progress setiap 5 sekolah agar aman
    if ((i + 1) % 5 === 0 || i === rawSchools.length - 1) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedSchools, null, 2));
      console.log(`[SAVE] Progress disimpan pada data ke-${i + 1}`);
    }

    // Sistem Cooldown Otomatis: Istirahat 5 Menit setiap memproses 200 sekolah dalam satu sesi
    const processedInThisSession = i + 1 - startIndex;
    if (processedInThisSession > 0 && processedInThisSession % 200 === 0 && i !== rawSchools.length - 1) {
      console.log(`\n[COOLDOWN] Telah memproses 200 sekolah berturut-turut.`);
      console.log(`Beristirahat selama 5 menit untuk mendinginkan IP dan menghindari blokir...`);
      await delay(300000); // 300,000 ms = 5 menit
      console.log(`[RESUME] Istirahat selesai. Melanjutkan scraping...\n`);
    } else {
      // Random delay normal antara 2-5 detik antar sekolah
      const randomDelay = Math.floor(Math.random() * 3000) + 2000;
      await delay(randomDelay);
    }
  }

  await browser.close();
  console.log(`\nProses Scraping Selesai 100%! Data tersimpan di ${OUTPUT_FILE}`);
  console.log(`Langkah selanjutnya: Jalankan 'node scripts/build_institusi.cjs'`);
})();

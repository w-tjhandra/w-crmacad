const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

const DATA_FILE = path.join(__dirname, '../src/data/institusi.json');
const LIMIT = 10; // Default limit for testing

const fetchHtml = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('File institusi.json tidak ditemukan!');
    process.exit(1);
  }

  const institusiData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  
  // Find schools that still have mock email (info.NPSN@sch.id) or mock phone (031-)
  const pendingSchools = institusiData.filter(inst => 
    inst.jenis === 'SMK' && 
    inst.kontak && 
    (inst.kontak.email.includes('.npsn@sch.id') || inst.kontak.email.includes('@sch.id') || inst.kontak.telepon.startsWith('031-'))
  );

  console.log(`Ditemukan ${pendingSchools.length} sekolah yang belum diperbarui.`);
  
  if (pendingSchools.length === 0) {
    console.log('Semua data sudah terbarui!');
    return;
  }

  const targets = pendingSchools.slice(0, LIMIT);
  console.log(`Mengekstrak kontak riil untuk ${targets.length} sekolah...\n`);

  let successCount = 0;

  for (let i = 0; i < targets.length; i++) {
    const school = targets[i];
    // Find the NPSN from the mock email or ID if possible. 
    // Wait, the school object doesn't store NPSN natively at the top level except if it's inside ID or we extract it.
    // The mock email is info.20503429@sch.id. Let's extract NPSN from it!
    const npsnMatch = school.kontak.email.match(/info\.(\d+)@sch\.id/);
    if (!npsnMatch) {
      console.log(`[${i+1}/${targets.length}] Skipped ${school.nama}: Tidak dapat menemukan NPSN dari email dummy.`);
      continue;
    }
    
    const npsn = npsnMatch[1];
    const url = `https://referensi.data.kemendikdasmen.go.id/pendidikan/npsn/${npsn}`;
    
    console.log(`[${i+1}/${targets.length}] Mengambil data NPSN: ${npsn} (${school.nama})`);
    
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      
      let email = '-';
      let telepon = '-';
      let operator = '-';
      let akreditasi = school.akreditasi || '-';

      // Parse detail from table rows
      $('tr').each((idx, el) => {
        const text = $(el).text();
        if (text.includes('Email') && !text.includes('Kementerian')) {
          const tds = $(el).find('td');
          if (tds.length >= 4) email = $(tds[3]).text().trim();
        }
        if (text.includes('Telepon')) {
          const tds = $(el).find('td');
          if (tds.length >= 4) telepon = $(tds[3]).text().trim();
        }
        if (text.includes('Operator')) {
          const tds = $(el).find('td');
          if (tds.length >= 4) operator = $(tds[3]).text().trim();
        }
        if (text.includes('Akreditasi')) {
          const tds = $(el).find('td');
          if (tds.length >= 4) {
            // Usually inside an anchor tag
            const akrText = $(tds[3]).text().trim();
            if (akrText) akreditasi = akrText.substring(0, 1);
          }
        }
      });

      // Update school data
      // Update kontak
      school.kontak.email = email || '-';
      school.kontak.telepon = telepon || '-';
      // Update kepsek with operator if kepsek is mock
      if (school.kepala_sekolah && school.kepala_sekolah.nama.match(/Drs\.|Ir\.|S\.Pd/)) {
         school.kepala_sekolah.nama = `Operator: ${operator || '-'}`;
      }
      school.akreditasi = akreditasi || '-';
      
      successCount++;
      await delay(1500); // 1.5 seconds delay between requests to avoid rate limit
    } catch (err) {
      console.error(`Gagal memproses ${npsn}: ${err.message}`);
    }
  }

  // Save back to institusi.json
  fs.writeFileSync(DATA_FILE, JSON.stringify(institusiData, null, 2));
  console.log(`\nProses selesai! Berhasil memperbarui ${successCount} institusi.`);
  
  // Bump version in InstitusiContext.tsx to trigger reload if running locally
  const contextPath = path.join(__dirname, '../src/context/InstitusiContext.tsx');
  if (fs.existsSync(contextPath)) {
    let contextData = fs.readFileSync(contextPath, 'utf8');
    const versionMatch = contextData.match(/institusi_data_version',\s*'(\d+\.\d+)'/);
    if (versionMatch) {
      const oldVer = parseFloat(versionMatch[1]);
      const newVer = (oldVer + 0.1).toFixed(1);
      contextData = contextData.replace(new RegExp(`'${versionMatch[1]}'`, 'g'), `'${newVer}'`);
      fs.writeFileSync(contextPath, contextData);
      console.log(`Cache version ditingkatkan ke ${newVer}`);
    }
  }
})();

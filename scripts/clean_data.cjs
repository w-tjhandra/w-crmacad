const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/institusi.json');

function normalizeSchoolName(name) {
  if (!name) return "";
  let n = name.toLowerCase();
  n = n.replace(/kantor tkj/g, '');
  n = n.replace(/\bsmkn?\b/g, '');
  n = n.replace(/\bsma\b/g, '');
  n = n.replace(/\buniversitas\b/g, '');
  n = n.replace(/\binstitut\b/g, '');
  n = n.replace(/\bpoliteknik\b/g, '');
  return n.replace(/[^a-z0-9]/g, '');
}

function cleanData() {
  console.log('Reading data from', dataPath);
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const institusi = JSON.parse(rawData);
  
  console.log(`Total records before cleaning: ${institusi.length}`);
  
  const seenSchoolNames = new Set();
  const seenPrincipals = new Set();
  const seenKajur = new Set();
  
  const cleanedInstitusi = [];
  
  let duplicateSchoolCount = 0;
  let haluPrincipalCount = 0;
  let haluKajurCount = 0;
  
  for (const school of institusi) {
    const normName = normalizeSchoolName(school.nama);
    
    // Deduplicate Schools
    if (seenSchoolNames.has(normName)) {
      duplicateSchoolCount++;
      continue;
    }
    seenSchoolNames.add(normName);
    
    // Clean Halu Principals (duplicate across schools)
    if (school.kepala_sekolah && school.kepala_sekolah.nama) {
      if (seenPrincipals.has(school.kepala_sekolah.nama) || school.kepala_sekolah.nama.length < 3) {
        school.kepala_sekolah.nama = "Belum Ada Data";
        school.kepala_sekolah.email = "-";
        school.kepala_sekolah.hp = "-";
        haluPrincipalCount++;
      } else {
        seenPrincipals.add(school.kepala_sekolah.nama);
      }
    }
    
    // Clean Halu Kajur (duplicate across schools)
    if (school.jurusan && Array.isArray(school.jurusan)) {
      for (const j of school.jurusan) {
        if (j.kajur && j.kajur.nama) {
          if (seenKajur.has(j.kajur.nama) || j.kajur.nama.length < 3) {
            j.kajur.nama = "Belum Ada Data";
            j.kajur.email = "-";
            j.kajur.hp = "-";
            haluKajurCount++;
          } else {
            seenKajur.add(j.kajur.nama);
          }
        }
      }
    }
    
    cleanedInstitusi.push(school);
  }
  
  console.log(`Removed ${duplicateSchoolCount} duplicate schools.`);
  console.log(`Cleared ${haluPrincipalCount} halu/duplicate principal names.`);
  console.log(`Cleared ${haluKajurCount} halu/duplicate kajur names.`);
  console.log(`Total records after cleaning: ${cleanedInstitusi.length}`);
  
  fs.writeFileSync(dataPath, JSON.stringify(cleanedInstitusi, null, 2));
  console.log('Clean data saved back to', dataPath);
}

cleanData();

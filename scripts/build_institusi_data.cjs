const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const rawDataPath = path.join(__dirname, '../raw_gmaps.json');
const outDataPath = path.join(__dirname, '../src/data/institusi.json');

// Generate ID Helper
const generateId = (prefix, i) => `${prefix}${i.toString().padStart(4, '0')}`;

async function main() {
    if (!fs.existsSync(rawDataPath)) {
        console.error("raw_gmaps.json not found! Run scrape_gmaps.cjs first.");
        process.exit(1);
    }
    
    const raw = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));
    console.log(`Loaded ${raw.length} raw institutions from GMaps.`);
    
    // We will process the data and map it to our CRM schema
    const finalData = [];
    let idCounter = 1;
    
    for (const item of raw) {
        const isUniversitas = item.nama.toLowerCase().includes('universitas') || item.query.includes('Universitas');
        const jenis = isUniversitas ? "Universitas" : "SMK";
        
        // CRM Schema template
        const institusi = {
            id: generateId("INS", idCounter++),
            nama: item.nama,
            jenis: jenis,
            alamat: item.alamat || "Jakarta", // Simplified address from GMaps
            koordinat: { lat: -6.2, lng: 106.8 }, // Placeholder
            status_kerjasama: "Belum Ada", // Default
            kepala_sekolah: {
                nama: "Belum Divalidasi",
                email: "-",
                hp: "-"
            },
            jurusan: [
                {
                    nama_jurusan: isUniversitas ? "Teknik Informatika" : "Teknik Komputer dan Jaringan",
                    kajur: {
                        nama: "Belum Divalidasi",
                        email: "-",
                        hp: "-"
                    },
                    jumlah_siswa: 0
                }
            ],
            riwayat_aktivitas: []
        };
        
        finalData.push(institusi);
    }
    
    console.log(`Writing ${finalData.length} records to ${outDataPath}`);
    fs.writeFileSync(outDataPath, JSON.stringify(finalData, null, 2));
    console.log("Data successfully built!");
    
    console.log("\n=========================================");
    console.log("VALIDATION PIPELINE INSTRUCTIONS");
    console.log("=========================================");
    console.log("The data has been populated from Google Maps.");
    console.log("To validate Head of School/Rector from Kemendikbud portals,");
    console.log("You can run a specific validator script that uses Puppeteer.");
    console.log("Note: Running full validation for 80+ schools takes time and might be rate-limited.");
}

main();

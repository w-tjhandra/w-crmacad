const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('./raw_gmaps.json', 'utf8'));

const extractKota = (nama) => {
  const n = nama.toLowerCase();
  if (n.includes('timur')) return 'Jakarta Timur';
  if (n.includes('selatan')) return 'Jakarta Selatan';
  if (n.includes('barat')) return 'Jakarta Barat';
  if (n.includes('utara')) return 'Jakarta Utara';
  if (n.includes('pusat')) return 'Jakarta Pusat';
  return 'Jakarta Pusat'; // Default if none found, to make it not 'halu' we can just pick one or distribute randomly
};

const determineKepemilikan = (nama) => {
  const n = nama.toLowerCase();
  if (n.includes('negeri') || n.includes(' state') || n.includes('unj') || n.includes('ui ') || n === 'ui' || n.includes('universitas indonesia')) {
    return 'Negeri';
  }
  return 'Swasta';
};

const getJenis = (nama) => {
  const n = nama.toLowerCase();
  if (n.includes('universitas') || n.includes('kampus') || n.includes('ui') || n.includes('unusia') || n.includes('uniji')) {
    return 'Universitas';
  }
  return 'SMK';
};

const generateDummyPhone = () => `021-${Math.floor(1000000 + Math.random() * 9000000)}`;

const names = ["Budi Santoso", "Andi Wijaya", "Siti Aminah", "Dewi Lestari", "Agus Setiawan", "Rini Yulianti", "Hendra Gunawan", "Maya Sari"];

const getRandomName = () => names[Math.floor(Math.random() * names.length)] + (Math.random() > 0.5 ? ' S.Pd., M.Si.' : ' M.Pd.');

let counter = 1;

const result = rawData.map(item => {
  const jenis = getJenis(item.nama);
  const kepemilikan = determineKepemilikan(item.nama);
  const kota = extractKota(item.nama);
  
  // Try to parse lat/lng from link if possible, otherwise randomize a bit around Jakarta
  // Ex: 3d-6.1672613!4d106.8370406
  let lat = -6.2;
  let lng = 106.8;
  const match = item.link.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match) {
    lat = parseFloat(match[1]);
    lng = parseFloat(match[2]);
  } else {
    lat = -6.1 + (Math.random() * -0.2);
    lng = 106.7 + (Math.random() * 0.2);
  }

  const status_kerjasama_options = ['sudah', 'on_progress', 'belum'];
  const status_kerjasama = status_kerjasama_options[Math.floor(Math.random() * status_kerjasama_options.length)];

  return {
    id: `INS${String(counter++).padStart(4, '0')}`,
    nama: item.nama,
    jenis: jenis,
    kota: kota,
    alamat: `Jl. Pendidikan No. ${Math.floor(Math.random() * 100)}, ${kota}, DKI Jakarta`,
    lat: lat,
    lng: lng,
    akreditasi: Math.random() > 0.3 ? 'A' : 'B',
    status_kepemilikan: kepemilikan,
    status_kerjasama: status_kerjasama,
    kontak: {
      email: `info@${item.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
      telepon: generateDummyPhone()
    },
    kepala_sekolah: {
      nama: getRandomName(),
      email: `kepsek@${item.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
      hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
    },
    jurusan: jenis === 'SMK' ? [
      {
        nama: "Teknik Komputer dan Jaringan",
        kajur: {
          nama: getRandomName(),
          email: `tkj@${item.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
          hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
        }
      },
      {
        nama: "Rekayasa Perangkat Lunak",
        kajur: {
          nama: getRandomName(),
          email: `rpl@${item.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
          hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
        }
      }
    ] : [
      {
        nama: "Teknik Informatika",
        kajur: {
          nama: getRandomName(),
          email: `ti@${item.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}.ac.id`,
          hp: `08${Math.floor(1000000000 + Math.random() * 900000000)}`
        }
      }
    ]
  };
});

fs.writeFileSync('./src/data/institusi.json', JSON.stringify(result, null, 2));
console.log('Successfully updated institusi.json');

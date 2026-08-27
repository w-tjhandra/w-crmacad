const fs = require('fs');
const dns = require('dns');
const util = require('util');
const path = require('path');

const resolveMx = util.promisify(dns.resolveMx);

async function checkDomainMX(domain) {
  try {
    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (err) {
    return false;
  }
}

async function main() {
  const institusiPath = path.join(__dirname, '..', 'src', 'data', 'institusi.json');
  const data = JSON.parse(fs.readFileSync(institusiPath, 'utf8'));

  const domainCache = new Map();
  let invalidCount = 0;
  let validCount = 0;
  let noEmailCount = 0;

  console.log('Mulai memeriksa email...');

  // Extract unique domains
  for (const inst of data) {
    if (inst.kontak && inst.kontak.email && inst.kontak.email !== '-') {
      const email = inst.kontak.email;
      const parts = email.split('@');
      if (parts.length === 2) {
        const domain = parts[1].toLowerCase();
        if (!domainCache.has(domain)) {
          domainCache.set(domain, null); // null means not checked yet
        }
      }
    } else {
        noEmailCount++;
    }
  }

  const uniqueDomains = Array.from(domainCache.keys());
  console.log(`Ditemukan ${uniqueDomains.length} domain unik. Mengecek MX records...`);

  // Check domains in parallel chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < uniqueDomains.length; i += chunkSize) {
    const chunk = uniqueDomains.slice(i, i + chunkSize);
    const promises = chunk.map(async (domain) => {
      const isValid = await checkDomainMX(domain);
      domainCache.set(domain, isValid);
    });
    await Promise.all(promises);
    process.stdout.write(`\rProgress: ${Math.min(i + chunkSize, uniqueDomains.length)} / ${uniqueDomains.length} domains diperiksa`);
  }
  console.log('\nPengecekan domain selesai. Mengupdate data...');

  // Update data
  for (const inst of data) {
    if (inst.kontak && inst.kontak.email && inst.kontak.email !== '-') {
      const parts = inst.kontak.email.split('@');
      if (parts.length === 2) {
        const domain = parts[1].toLowerCase();
        const isValid = domainCache.get(domain);
        inst.kontak.is_email_valid = isValid;
        if (isValid) {
          validCount++;
        } else {
          invalidCount++;
        }
      } else {
          inst.kontak.is_email_valid = false;
          invalidCount++;
      }
    }
  }

  fs.writeFileSync(institusiPath, JSON.stringify(data, null, 2));

  console.log('Update selesai!');
  console.log(`Email Valid: ${validCount}`);
  console.log(`Email Tidak Aktif/Format Salah: ${invalidCount}`);
  console.log(`Tidak ada email: ${noEmailCount}`);
}

main().catch(console.error);

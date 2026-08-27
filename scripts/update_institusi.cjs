const fs = require('fs');
const path = require('path');

const institusiPath = path.join(__dirname, '..', 'src', 'data', 'institusi.json');
const contactsPath = path.join(__dirname, 'final_institusi_contacts.json');

const institusiData = JSON.parse(fs.readFileSync(institusiPath, 'utf8'));
const contactsData = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));

// Build a map of contacts by nama
const contactsMap = new Map();
for (const contact of contactsData) {
  contactsMap.set(contact.nama.toLowerCase().trim(), contact.kontak);
}

let updatedCount = 0;
let matchCount = 0;

for (const institusi of institusiData) {
  const nameKey = institusi.nama.toLowerCase().trim();
  if (contactsMap.has(nameKey)) {
    matchCount++;
    const contact = contactsMap.get(nameKey);
    let isUpdated = false;
    
    // update email if it exists and is not "-"
    if (contact.email && contact.email !== '-') {
      institusi.kontak.email = contact.email;
      isUpdated = true;
    }
    
    // update telepon if it exists and is not "-"
    if (contact.telepon && contact.telepon !== '-') {
      institusi.kontak.telepon = contact.telepon;
      isUpdated = true;
    }

    if (isUpdated) {
        updatedCount++;
    }
  }
}

fs.writeFileSync(institusiPath, JSON.stringify(institusiData, null, 2));

console.log(`Total institutions in institusi.json: ${institusiData.length}`);
console.log(`Total contacts in final_institusi_contacts.json: ${contactsData.length}`);
console.log(`Matched ${matchCount} institutions by name.`);
console.log(`Updated contacts for ${updatedCount} institutions.`);

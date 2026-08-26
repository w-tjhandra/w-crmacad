const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Try referensi detail page
  const referensiUrl = 'https://referensi.data.kemendikdasmen.go.id/pendidikan/npsn/20503429';
  console.log(`Navigating to ${referensiUrl}...`);
  try {
    await page.goto(referensiUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    const content = await page.content();
    fs.writeFileSync('test_referensi_detail.html', content);
    console.log('Saved referensi detail page');
  } catch(e) {
    console.error('Error referensi:', e.message);
  }

  // Try dapodik detail page using UUID from api
  const dapodikUrl = 'https://dapo.kemdikbud.go.id/sekolah/B2AA7403-B458-4111-BC69-675FFB56E5EE';
  console.log(`Navigating to ${dapodikUrl}...`);
  try {
    await page.goto(dapodikUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    const content = await page.content();
    fs.writeFileSync('test_dapodik_detail.html', content);
    console.log('Saved dapodik detail page');
  } catch(e) {
    console.error('Error dapodik:', e.message);
  }

  await browser.close();
})();

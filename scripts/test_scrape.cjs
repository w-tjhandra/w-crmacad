const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const ajaxRequests = [];
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('ajax') || url.includes('json') || url.includes('get')) {
      try {
        const text = await response.text();
        ajaxRequests.push({ url, length: text.length, snippet: text.substring(0, 200) });
      } catch (e) {
        // ignore
      }
    }
  });

  const url = 'https://referensi.data.kemendikdasmen.go.id/pendidikan/dikmen/050000/3';
  console.log(`Navigating to ${url}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const content = await page.content();
    fs.writeFileSync('test_dikmen.html', content);
    console.log('Saved to test_dikmen.html');
    
    fs.writeFileSync('test_ajax.json', JSON.stringify(ajaxRequests, null, 2));
    console.log('Saved ajax requests to test_ajax.json');
  } catch (err) {
    console.error('Error fetching referensi:', err.message);
  }

  await browser.close();
})();

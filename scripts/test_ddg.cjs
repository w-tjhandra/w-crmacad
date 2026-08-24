const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function duckDuckGoSearch(query) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&ia=web`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const results = await page.evaluate(() => {
        const snippets = document.querySelectorAll('.result__snippet');
        return Array.from(snippets).map(s => s.innerText);
    });
    
    await browser.close();
    return results;
}

duckDuckGoSearch('site:dapo.kemdikbud.go.id "SMK Negeri 1 Jakarta"').then(console.log);

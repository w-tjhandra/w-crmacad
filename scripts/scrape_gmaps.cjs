const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 500;
            let scrolls = 0;
            const timer = setInterval(() => {
                // The main scrolling container in Google Maps search results usually has role="feed"
                const feed = document.querySelector('div[role="feed"]');
                if (feed) {
                    feed.scrollBy(0, distance);
                    totalHeight += distance;
                    scrolls++;

                    // Stop after some scrolls to avoid infinite loops, or when reached bottom
                    if (scrolls >= 40) { // Limit to ~40 scrolls for this demo
                        clearInterval(timer);
                        resolve();
                    }
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, 800);
        });
    });
}

async function scrapeGMaps(query) {
    console.log(`Starting GMaps scraping for query: ${query}`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Set a large viewport
    await page.setViewport({ width: 1280, height: 800 });

    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('Scrolling to load more results...');
    await new Promise(r => setTimeout(r, 2000)); // Wait a bit for initial load
    
    // Try to click "Accept All" cookies if it appears (mostly in EU, but good practice)
    try {
        const acceptButton = await page.$('button[aria-label="Accept all"]');
        if (acceptButton) await acceptButton.click();
    } catch(e) {}

    await autoScroll(page);

    console.log('Extracting data...');
    // Google Maps DOM is tricky. Usually, results are in `div[role="feed"]` 
    // And each item has an `a` tag with the place URL. 
    // We can extract aria-labels or inner texts.
    
    const results = await page.evaluate(() => {
        const items = [];
        // Extracting elements that look like search results. 
        // We look for 'a' tags that have 'href' containing '/maps/place/'
        const links = document.querySelectorAll('a[href*="/maps/place/"]');
        
        links.forEach(link => {
            const name = link.getAttribute('aria-label');
            if (name) {
                // Google maps structure often places the address near the link
                const parent = link.closest('div');
                let address = '';
                if(parent) {
                    const texts = parent.innerText.split('\n').filter(t => t.trim() !== '');
                    if(texts.length > 2) {
                        // The address is usually the second or third text block
                        address = texts.find(t => t.includes(',') && !t.includes(name)) || '';
                    }
                }
                items.push({
                    nama: name,
                    alamat: address,
                    link: link.href
                });
            }
        });
        return items;
    });

    await browser.close();

    // Deduplicate by name
    const uniqueResults = [];
    const seen = new Set();
    for (const r of results) {
        if (!seen.has(r.nama)) {
            seen.add(r.nama);
            uniqueResults.push(r);
        }
    }

    console.log(`Found ${uniqueResults.length} unique results.`);
    return uniqueResults;
}

async function main() {
    const queries = ["SMK di Jakarta", "Universitas di Jakarta"];
    const allData = [];
    
    for (const q of queries) {
        try {
            const data = await scrapeGMaps(q);
            allData.push(...data.map(d => ({...d, query: q})));
        } catch(e) {
            console.error(`Error scraping ${q}:`, e);
        }
    }

    fs.writeFileSync('raw_gmaps.json', JSON.stringify(allData, null, 2));
    console.log('Saved to raw_gmaps.json');
}

if (require.main === module) {
    main();
}

module.exports = { scrapeGMaps };

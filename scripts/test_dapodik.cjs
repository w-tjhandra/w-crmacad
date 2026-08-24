const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testDapodik() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const schoolName = "SMK Negeri 1 Jakarta";
    console.log("Navigating to: " + `https://dapo.kemendikdasmen.go.id/pencarian?q=${encodeURIComponent(schoolName)}`);
    
    await page.goto(`https://dapo.kemendikdasmen.go.id/pencarian?q=${encodeURIComponent(schoolName)}`, { waitUntil: 'networkidle2' });
    
    // Check if there is a table
    const content = await page.content();
    console.log("Length of HTML:", content.length);
    
    await browser.close();
}

testDapodik();

const puppeteer = require('puppeteer');
const fs = require('fs');

async function debug() {
    console.log("Launching puppeteer...");
    const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('response', response => console.log('RESPONSE:', response.url(), response.status()));

    try {
        console.log("Navigating to Flats...");
        await page.goto('http://localhost:5173/flats', { waitUntil: 'networkidle2' });
        
        console.log("Waiting for Flats to load...");
        await new Promise(r => setTimeout(r, 2000));
        
        await page.screenshot({ path: 'debug_flats_1.png' });
        console.log("Screenshot 1 taken.");

        // Find Book Now button
        console.log("Setting logged in user in localStorage...");
        await page.evaluate(() => {
            localStorage.setItem("society_user", JSON.stringify({
                message: "Login successful",
                flag: 1,
                uid: 1,
                uname: "Admin User",
                uusername: "admin",
                umail: "admin@example.com",
                role: "Admin",
                resident_type: "Owner"
            }));
        });
        
        await page.reload({ waitUntil: 'networkidle2' });

        console.log("Clicking the first Book Now button via DOM...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Book Now'));
            if (btns.length > 0) btns[0].click();
        });
        
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'debug_flats_modal.png' });
        console.log("Modal Screenshot taken.");

        console.log("Clicking Confirm Booking...");
        await page.evaluate(() => {
            const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm Booking'));
            if (confirmBtn) confirmBtn.click();
        });

        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'debug_flats_result.png' });
        console.log("Result Screenshot taken.");


    } catch (e) {
        console.error("Error during puppeteer:", e);
    } finally {
        await browser.close();
        process.exit(0);
    }
}

debug();

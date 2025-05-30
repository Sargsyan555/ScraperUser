"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeTruckmir = scrapeTruckmir;
const puppeteer_1 = require("puppeteer");
const constants_1 = require("../../../constants/constants");
async function waitForSearchResponse(page, urlPart) {
    return new Promise((resolve) => {
        function onResponse(response) {
            if (response.url().includes(urlPart) && response.status() === 200) {
                page.off('response', onResponse);
                resolve();
            }
        }
        page.on('response', onResponse);
    });
}
async function scrapeTruckmir(productNumbers) {
    const myBrands = [
        'CAT',
        'Cummins',
        'Deutz',
        'John Deere',
        'Perkins',
        'Volvo',
        'Komatsu',
        'Scania',
        'FEBI',
    ];
    const url = 'https://truckmir.ru/';
    const browser = await puppeteer_1.default.launch({ headless: true });
    const page = await browser.newPage();
    const results = [];
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        for (const productNumber of productNumbers) {
            const result = {
                shop: constants_1.SOURCE_WEBPAGE_KEYS.truckmir,
                found: false,
                price: constants_1.BASICS.zero,
                name: constants_1.BASICS.empotyString,
            };
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.type('input[name="article"]', productNumber);
                await Promise.all([
                    page.keyboard.press('Enter'),
                    waitForSearchResponse(page, 'search'),
                ]);
                await page.waitForSelector('.table.table-condensed.table-striped tbody tr', { visible: true, timeout: 60000 });
                const rows = await page.$$('.table.table-condensed.table-striped tbody tr');
                if (rows.length === 0) {
                    results.push(result);
                    continue;
                }
                const matched = await page.evaluate((brands) => {
                    const rows = document.querySelectorAll('.table.table-condensed.table-striped tbody tr');
                    for (const row of rows) {
                        const brand = row.children[0]?.textContent?.trim();
                        if (brand &&
                            brands.map((b) => b.toUpperCase()).includes(brand.toUpperCase())) {
                            row.children[0].click();
                            return true;
                        }
                    }
                    return false;
                }, myBrands);
                if (!matched) {
                    results.push(result);
                    continue;
                }
                await page.waitForNavigation({
                    waitUntil: 'domcontentloaded',
                    timeout: 30000,
                });
                const title = await page.$eval('.card-title, .page-title', (el) => el.textContent?.trim() || '');
                const priceText = await page.$eval('.td_price span', (el) => el.textContent?.trim() || '0');
                const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
                result.found = true;
                result.name = title;
                result.price = isNaN(price) ? constants_1.BASICS.zero : price;
            }
            catch (err) {
                console.error(`Error while scraping product ${productNumber}:`, err);
            }
            results.push(result);
        }
        await browser.close();
        return results;
    }
    catch (error) {
        console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.truckmir} General Error:`, error);
        await browser.close();
        return productNumbers.map(() => ({
            shop: constants_1.SOURCE_WEBPAGE_KEYS.truckmir,
            found: false,
            price: constants_1.BASICS.zero,
            name: constants_1.BASICS.empotyString,
        }));
    }
}
//# sourceMappingURL=truckmir.js.map
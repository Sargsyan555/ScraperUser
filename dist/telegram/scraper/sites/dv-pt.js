"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeDvPt = scrapeDvPt;
const puppeteer_1 = require("puppeteer");
const constants_1 = require("../../../constants/constants");
async function scrapeDvPt(productNumbers) {
    const results = [];
    const browser = await puppeteer_1.default.launch({ headless: true });
    const start = performance.now();
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        for (const name of productNumbers) {
            const result = {
                found: false,
                shop: constants_1.SOURCE_WEBPAGE_KEYS.dvpt,
            };
            try {
                await page.goto(constants_1.SOURCE_URLS.dvpt, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000,
                });
                await page.type('#search_form_input', name);
                await Promise.all([
                    page.waitForNavigation({
                        waitUntil: 'domcontentloaded',
                        timeout: 10000,
                    }),
                    page.click('input[type="submit"][title="Искать"]'),
                ]);
                const productExists = await page.$('.goods a[itemprop="url"]');
                if (!productExists) {
                    results.push(result);
                    continue;
                }
                const firstProductLinkSelector = '.goods a[itemprop="url"]';
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                    page.click(firstProductLinkSelector),
                ]);
                await page.waitForSelector('h1', { timeout: 10000 });
                const productResult = await page.evaluate((BRANDS) => {
                    const title = document.querySelector('h1')?.textContent?.trim() || '';
                    const priceText = document.querySelector('.price')?.textContent?.trim() ||
                        document
                            .querySelector('.catalog_group_price')
                            ?.textContent?.trim() ||
                        '0';
                    const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
                    let searchedProductBrand = '';
                    document.querySelectorAll('.item').forEach((item) => {
                        const label = item
                            .querySelector('.title span')
                            ?.textContent?.trim();
                        if (label === 'Бренд:') {
                            searchedProductBrand =
                                item.querySelector('.values span')?.textContent?.trim() || '';
                        }
                    });
                    return {
                        brend: searchedProductBrand,
                        found: true,
                        name: title,
                        shop: 'dvpt',
                        price,
                    };
                }, constants_1.BRANDS);
                results.push(productResult);
            }
            catch (err) {
                console.error(`Error for product ${name}:`, err);
                results.push({
                    found: false,
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.dvpt,
                });
            }
        }
        await browser.close();
        console.log(`Search time for "${productNumbers[0]} in shtren":`, performance.now() - start);
        return results;
    }
    catch (browserErr) {
        console.error('Failed to launch browser:', browserErr);
        return productNumbers.map(() => ({
            shop: constants_1.SOURCE_WEBPAGE_KEYS.dvpt,
            found: false,
        }));
    }
}
//# sourceMappingURL=dv-pt.js.map
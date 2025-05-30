"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeTruckdrive = scrapeTruckdrive;
const constants_1 = require("../../../constants/constants");
const puppeteer_1 = require("puppeteer");
async function scrapeTruckdrive(productNames) {
    const browser = await puppeteer_1.default.launch({ headless: true });
    const results = [];
    const start = performance.now();
    try {
        const page = await browser.newPage();
        for (const name of productNames) {
            const result = {
                shop: constants_1.SOURCE_WEBPAGE_KEYS.truckdrive,
                found: false,
                price: constants_1.BASICS.zero,
                name: constants_1.BASICS.empotyString,
            };
            try {
                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                        req.abort();
                    }
                    else {
                        req.continue();
                    }
                });
                await page.goto(constants_1.SOURCE_URLS.truckdrive, {
                    waitUntil: 'domcontentloaded',
                });
                await page.evaluate(() => {
                    const input = document.querySelector('#inputsearch_searchstring');
                    if (input)
                        input.value = '';
                });
                await page.type('#inputsearch_searchstring', name);
                await page.keyboard.press('Enter');
                try {
                    await page.waitForSelector('.search-without-results', {
                        timeout: 2000,
                    });
                    results.push({
                        shop: constants_1.SOURCE_WEBPAGE_KEYS.truckdrive,
                        found: false,
                        price: constants_1.BASICS.zero,
                        name: constants_1.BASICS.empotyString,
                    });
                    continue;
                }
                catch {
                    console.log('product found');
                    await page.waitForSelector('#search-result-clarify');
                    const matchingHref = await page.$$eval('#search-result-clarify a', (links, BRANDS) => {
                        let fallbackHref = null;
                        for (const link of links) {
                            const brandDiv = link.querySelector('.search-result__clarify-brand');
                            const brand = brandDiv?.textContent?.trim();
                            if (!fallbackHref) {
                                fallbackHref = link.href;
                            }
                            if (brand && BRANDS.includes(brand)) {
                                return link.href;
                            }
                        }
                        return fallbackHref;
                    }, constants_1.BRANDS);
                    if (matchingHref) {
                        await page.goto(matchingHref, { waitUntil: 'domcontentloaded' });
                    }
                    else {
                        continue;
                    }
                    await page.waitForSelector('.catalog-products-table__product-item');
                    const productData = await page.evaluate(() => {
                        const productItem = document.querySelector('.catalog-products-table__product-item');
                        if (!productItem)
                            return null;
                        const brandEl = productItem.querySelector('.catalog-products-table__product-brand-desc');
                        const brand = brandEl
                            ? brandEl.innerText.replace('Бренд:', '').trim()
                            : null;
                        const titleEl = productItem.querySelector('.catalog-products-table__product-name span');
                        const title = titleEl ? titleEl.innerText.trim() : null;
                        const priceEl = productItem.querySelector('.offer__product-price span');
                        const price = priceEl ? priceEl.innerText.trim() : null;
                        return { title, price, brand };
                    });
                    result.name = productData?.title || '';
                    result.price = productData?.price || '-';
                    result.found = true;
                    results.push(result);
                }
            }
            catch (innerError) {
                console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.truckdrive} Error for "${name}":`, innerError);
                results.push(result);
            }
        }
    }
    catch (error) {
        console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.truckdrive} Unexpected Error:`, error);
    }
    finally {
        console.log(`Search time for "${productNames[0]}":`, performance.now() - start, results);
        await browser.close();
    }
    return results;
}
//# sourceMappingURL=truckdrive.js.map
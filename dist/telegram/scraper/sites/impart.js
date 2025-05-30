"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeImpart = scrapeImpart;
const puppeteer_1 = require("puppeteer");
const constants_1 = require("../../../constants/constants");
async function scrapeImpart(productNumbers) {
    const productNumber = productNumbers[0];
    const browser = await puppeteer_1.default.launch({ headless: true });
    const page = await browser.newPage();
    const start = performance.now();
    const query = encodeURIComponent(productNumber);
    const url = `${constants_1.SOURCE_URLS.impart}${query}`;
    try {
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000,
        });
        const result = await page.evaluate((productNumber_, BRANDS_, BASICS_, KEYS_) => {
            const parsePrice = (priceStr) => {
                const cleaned = priceStr.replace(/[\s ]+/g, '').replace(',', '.');
                const num = parseFloat(cleaned);
                return Number.isFinite(num) ? num : BASICS_.zero;
            };
            const rows = Array.from(document.querySelectorAll('tbody tr.search-result-table-item'));
            for (const row of rows) {
                const article = row
                    .querySelector('td.search-result-table-addit .search-result-table-article')
                    ?.textContent?.trim() || '';
                const brandMobile = row
                    .querySelector('td.search-result-table-addit .search-result-table-brand.d-inline.d-xxl-none')
                    ?.textContent?.trim() || '';
                const brandDesktop = row
                    .querySelector('td.search-result-table-brand.d-none.d-xxl-block')
                    ?.textContent?.trim() || '';
                const brand = brandDesktop || brandMobile || '';
                if (article !== productNumber_) {
                    continue;
                }
                const matchedBrand = BRANDS_.find((b) => brand.toLowerCase().includes(b.toLowerCase()) ||
                    article.toLowerCase().includes(b.toLowerCase()));
                if (matchedBrand) {
                    const nameCell = row.querySelector('td.search-result-table-name a .search-result-table-text');
                    const name = nameCell?.textContent?.trim() || '';
                    const fallbackName = brand || '';
                    const priceCell = row.querySelector('td .search-result-table-price > div:first-child');
                    const rawPrice = priceCell?.textContent?.trim() || '';
                    const price = parsePrice(rawPrice);
                    return {
                        name: name || fallbackName,
                        price,
                        shop: KEYS_.impart,
                        found: true,
                    };
                }
            }
            const fallbackRow = rows[0] || rows[rows.length - 1];
            if (fallbackRow) {
                const article = fallbackRow
                    .querySelector('td.search-result-table-addit .search-result-table-article')
                    ?.textContent?.trim() || '';
                const brandMobile = fallbackRow
                    .querySelector('td.search-result-table-addit .search-result-table-brand.d-inline.d-xxl-none')
                    ?.textContent?.trim() || '';
                const brandDesktop = fallbackRow
                    .querySelector('td.search-result-table-brand.d-none.d-xxl-block')
                    ?.textContent?.trim() || '';
                const brand = brandDesktop || brandMobile || '';
                const nameCell = fallbackRow.querySelector('td.search-result-table-name a .search-result-table-text');
                const name = nameCell?.textContent?.trim() || '';
                const fallbackName = brand || '';
                const priceCell = fallbackRow.querySelector('td .search-result-table-price > div:first-child');
                const rawPrice = priceCell?.textContent?.trim() || '';
                const price = parsePrice(rawPrice);
                return {
                    name: name,
                    price,
                    shop: KEYS_.impart,
                    found: true,
                    brand: fallbackName,
                };
            }
            return {
                shop: KEYS_.impart,
                found: false,
            };
        }, productNumber, constants_1.BRANDS, constants_1.BASICS, constants_1.SOURCE_WEBPAGE_KEYS);
        console.log(result, performance.now() - start);
        return [result];
    }
    catch (error) {
        console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.impart} Error:`, error);
        return [
            {
                shop: constants_1.SOURCE_WEBPAGE_KEYS.impart,
                found: false,
            },
        ];
    }
}
//# sourceMappingURL=impart.js.map
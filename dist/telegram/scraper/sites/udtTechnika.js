"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.udtTechnika = udtTechnika;
const puppeteer_1 = require("puppeteer");
const constants_1 = require("../../../constants/constants");
async function udtTechnika(productNumbers) {
    const browser = await puppeteer_1.default.launch({ headless: true });
    const page = await browser.newPage();
    const results = [];
    const start = performance.now();
    for (const productNumber of productNumbers) {
        const result = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.udtTechnika,
            found: false,
        };
        try {
            await page.goto('https://www.udt-technika.ru/', {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('#parts', { timeout: 5000 });
            await page.evaluate(() => {
                const input = document.querySelector('#parts');
                if (input)
                    input.value = '';
            });
            await page.type('#parts', productNumber);
            await page.click('#button_search_1');
            try {
                await page.waitForSelector('.table-responsive', { timeout: 10000 });
            }
            catch {
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!! udtky-um chi gtel errorer talu stex');
                return [result];
            }
            const productRow = await page.$$eval('#patientTable tbody tr', (rows, BRANDS, productNumber, SOURCE_WEBPAGE_KEYS) => {
                let fallbackProduct = null;
                for (const row of rows) {
                    const cells = Array.from(row.querySelectorAll('td'));
                    const name = cells[0]?.textContent?.trim() || '';
                    const productCode = cells[1]?.textContent;
                    const priceText = cells[6]?.textContent?.trim() || '';
                    const brand = cells[7]?.textContent?.trim() || '';
                    const priceMatch = priceText.match(/([\d\s]+) руб\./);
                    const price = priceMatch
                        ? parseFloat(priceMatch[1].replace(/\s/g, ''))
                        : 0;
                    const product = {
                        name: name,
                        brand,
                        price,
                        found: true,
                    };
                    if (!fallbackProduct) {
                        if ((productCode &&
                            productCode !== productNumber.replace(/-/g, '') &&
                            productCode !== productNumber) ||
                            !productCode) {
                            return {
                                shop: SOURCE_WEBPAGE_KEYS.udtTechnika,
                                found: false,
                                price: '1234',
                                name: productCode,
                                brand: '',
                            };
                        }
                        fallbackProduct = product;
                    }
                    const normalizedBrand = brand.toUpperCase();
                    const match = BRANDS.find((b) => normalizedBrand === b.toUpperCase());
                    if (match) {
                        return product;
                    }
                }
                return fallbackProduct;
            }, constants_1.BRANDS, productNumber, constants_1.SOURCE_WEBPAGE_KEYS);
            if (productRow?.found) {
                result.name = productRow.name;
                result.price = productRow.price;
                result.found = true;
                result.brand = productRow.brand;
            }
        }
        catch (err) {
            console.error(`Error fetching "${productNumber}":`, err);
        }
        results.push(result);
    }
    console.log(results);
    console.log(`Search time for "${productNumbers[0]} in udt":`, performance.now() - start);
    await browser.close();
    return results;
}
//# sourceMappingURL=udtTechnika.js.map
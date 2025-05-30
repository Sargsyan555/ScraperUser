"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeMirDiesel = scrapeMirDiesel;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const constants_1 = require("../../../constants/constants");
async function scrapeMirDiesel(names) {
    const results = [];
    for (const name of names) {
        const start = performance.now();
        const result = {
            found: false,
            shop: constants_1.SOURCE_WEBPAGE_KEYS.mirdiesel,
            name,
        };
        try {
            const searchUrl = `${constants_1.SOURCE_URLS.mirdiesel}catalog/?q=${encodeURIComponent(name)}`;
            const searchResponse = await axios_1.default.get(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            const $search = cheerio.load(searchResponse.data);
            const productLink = $search('.list_item')
                .first()
                .find('a.thumb')
                .attr('href');
            if (!productLink) {
                results.push(result);
                continue;
            }
            const productUrl = `${constants_1.SOURCE_URLS.mirdiesel.replace(/\/$/, '')}${productLink}`;
            const productResponse = await axios_1.default.get(productUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            const $ = cheerio.load(productResponse.data);
            const priceBlockText = $('span[class*="price"]').first().text().trim();
            const priceMatch = priceBlockText.match(/(\d[\d\s]*)\s*₽/);
            const parsedPriceText = priceMatch
                ? priceMatch[1].replace(/\s/g, '')
                : null;
            let foundBrands = false;
            $('ul[id^="bx_"][id*="_prop_490_list"] li').each((_, el) => {
                const brandText = $(el).find('span.cnt').text().trim();
                if (constants_1.BRANDS.includes(brandText)) {
                    foundBrands = true;
                }
            });
            const title = $('#pagetitle').text().trim();
            if (foundBrands) {
                results.push({
                    name: title,
                    price: parsedPriceText,
                    found: true,
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.mirdiesel,
                });
            }
            else {
                results.push(result);
            }
            console.log(`Search time for "${name}":`, performance.now() - start);
        }
        catch (error) {
            console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.mirdiesel} Error for "${name}":`, error);
            results.push(result);
        }
    }
    return results;
}
//# sourceMappingURL=mirdiesel.js.map
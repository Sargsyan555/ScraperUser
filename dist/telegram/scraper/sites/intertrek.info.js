"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intertrek = intertrek;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const constants_1 = require("../../../constants/constants");
async function intertrek(productCodes) {
    const results = [];
    for (const productCode of productCodes) {
        const result = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.intertrek,
            found: false,
            name: productCode,
        };
        try {
            const searchUrl = `http://intertrek.info/search?search=${encodeURIComponent(productCode)}`;
            const { data: searchHtml } = await axios_1.default.get(searchUrl);
            const $ = cheerio.load(searchHtml);
            const firstProductAnchor = $('tr[itemprop="itemListElement"] a[itemprop="item"]').first();
            if (!firstProductAnchor.length) {
                results.push(result);
                continue;
            }
            const relativeLink = firstProductAnchor.attr('href');
            if (!relativeLink) {
                results.push(result);
                continue;
            }
            const productUrl = `http://intertrek.info${relativeLink}`;
            const { data: productHtml } = await axios_1.default.get(productUrl);
            const $$ = cheerio.load(productHtml);
            const productName = $$('.dl-horizontal dd').eq(1).text().trim();
            const brandModel = $$('.dl-horizontal dd').eq(5).text().trim();
            const brandDvigitel = $$('.dl-horizontal dd').eq(4).text().trim();
            const rawPrice = $$('td[style*="white-space:nowrap"] p')
                .first()
                .text()
                .trim();
            const matchedBrand = constants_1.BRANDS.find((b) => brandModel.toLowerCase().includes(b.toLowerCase()) ||
                brandDvigitel.toLowerCase().includes(b.toLowerCase()));
            if (!productName || !rawPrice || !matchedBrand) {
                results.push(result);
                continue;
            }
            const priceNumber = parseFloat(rawPrice.replace(/\s|руб\.?/gi, '').replace(',', '.'));
            results.push({
                shop: constants_1.SOURCE_WEBPAGE_KEYS.intertrek,
                found: true,
                name: productName,
                price: priceNumber,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred.';
            console.error(`❗ [Intertrek] Error for "${productCode}": ${message}`);
            results.push(result);
        }
    }
    return results;
}
//# sourceMappingURL=intertrek.info.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeZiptehOnline = scrapeZiptehOnline;
const axios_1 = require("axios");
const cheerio = require("cheerio");
async function scrapeZiptehOnline(productCode) {
    const start = performance.now();
    const searchUrl = '';
    try {
        const searchResponse = await axios_1.default.get(searchUrl);
        const $ = cheerio.load(searchResponse.data);
        const firstProductAnchor = $('tr[itemprop="itemListElement"] a[itemprop="item"]').first();
        if (!firstProductAnchor.length) {
            return `❌ Product "${productCode}" not found.`;
        }
        const relativeLink = firstProductAnchor.attr('href');
        if (!relativeLink) {
            return `❌ Product link not found for "${productCode}".`;
        }
        const productUrl = `http://intertrek.info${relativeLink}`;
        const productResponse = await axios_1.default.get(productUrl);
        const $$ = cheerio.load(productResponse.data);
        const productName = $$('.dl-horizontal dd').eq(1).text().trim();
        const priceText = $$('td[style*="white-space:nowrap"] p')
            .first()
            .text()
            .trim();
        if (!productName || !priceText) {
            return `⚠️ Info not found for product "${productCode}".`;
        }
        return `🔍 Product: ${productCode}\n📦 Name: ${productName}\n💰 Price: ${priceText}`;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred.';
        return `❗ Error: ${message}`;
    }
}
//# sourceMappingURL=ziptehOnline.js.map
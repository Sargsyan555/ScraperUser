"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const axios_1 = require("axios");
const cheerio = require("cheerio");
async function fetchOneProductPerBrand(url) {
    const response = await axios_1.default.get(url);
    const $ = cheerio.load(response.data);
    const products = [];
    const brandsSeen = new Set();
    $('table.search-list tbody tr').each((_, tr) => {
        const row = $(tr);
        const brand = row.find('td').eq(0).text().trim();
        if (brandsSeen.has(brand))
            return;
        const article = row.find('td').eq(1).find('a.highslide').text().trim();
        const name = row.find('td').eq(2).text().trim();
        let priceText = row.find('td.amount b').text().trim();
        priceText = priceText.replace(/\s/g, '').replace(',', '.');
        const price = parseFloat(priceText) || 0;
        products.push({ article, name, brand, price });
        brandsSeen.add(brand);
    });
    return products;
}
(async () => {
    try {
        const products = await fetchOneProductPerBrand(worker_threads_1.workerData.url);
        worker_threads_1.parentPort?.postMessage(products);
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage([]);
    }
})();
//# sourceMappingURL=scraper.worker-voltag.js.map
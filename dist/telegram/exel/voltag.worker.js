"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const axios_1 = require("axios");
const cheerio = require("cheerio");
async function fetchOneProductPerBrand(url) {
    try {
        console.log(url);
        const response = await axios_1.default.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
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
    catch (err) {
        console.error(`Worker failed on URL ${url}`);
        return undefined;
    }
}
(async () => {
    const urls = worker_threads_1.workerData;
    const results = [];
    let count = 0;
    for (const url of urls) {
        console.log(count++, urls.length);
        const products = await fetchOneProductPerBrand(url);
        if (products)
            results.push(...products);
    }
    worker_threads_1.parentPort?.postMessage(results);
})();
//# sourceMappingURL=voltag.worker.js.map
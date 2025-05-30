"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cheerio = require("cheerio");
const worker_threads_1 = require("worker_threads");
(async () => {
    const url = worker_threads_1.workerData;
    console.log(url);
    try {
        const { data } = await axios_1.default.get(url, { timeout: 500 });
        const $ = cheerio.load(data);
        const name = $('li:contains("Название")')
            .text()
            .replace('Название:', '')
            .trim();
        const brand = $('li:contains("Производитель")')
            .text()
            .replace('Производитель:', '')
            .trim();
        const articul = $('li')
            .filter((_, el) => $(el).text().trim().startsWith('Артикул:'))
            .text()
            .replace('Артикул:', '')
            .trim()
            .split('/')[0];
        console.log(articul);
        if (!name || !articul) {
            worker_threads_1.parentPort?.postMessage({
                success: false,
                url,
                error: 'Empty or invalid content',
            });
            return;
        }
        const priceText = $('#cenabasket2').text().trim();
        const price = priceText.replace(/[^\d]/g, '');
        worker_threads_1.parentPort?.postMessage({
            success: true,
            data: { articul, name, brand, price },
        });
    }
    catch (err) {
        worker_threads_1.parentPort?.postMessage({ success: false, url });
    }
})();
//# sourceMappingURL=scraper.workerUdt.js.map
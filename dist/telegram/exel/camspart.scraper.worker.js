"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const axios_1 = require("axios");
const cheerio = require("cheerio");
async function getProductData(url) {
    try {
        const { data: html } = await axios_1.default.get(url);
        const $ = cheerio.load(html);
        const titleRaw = $('.shop_product__title[itemprop="name"]').text().trim();
        const title = titleRaw.toUpperCase();
        if (!title)
            return null;
        const articulRaw = $('.shop_product__article span[itemprop="productID"]').text();
        console.log(articulRaw);
        const articul = articulRaw.replace(/Артикул:\s*/i, '').trim();
        const price = $('.price__new [itemprop="price"]').text().trim();
        const brandMatch = title.match(/\b[A-ZА-Я]{3,}\b/);
        const brand = brandMatch ? brandMatch[0] : '';
        worker_threads_1.parentPort?.postMessage({ title, articul, price, brand, url });
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage(null);
    }
}
getProductData(worker_threads_1.workerData.url);
//# sourceMappingURL=camspart.scraper.worker.js.map
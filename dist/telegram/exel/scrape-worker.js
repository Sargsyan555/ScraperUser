"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cheerio = require("cheerio");
const worker_threads_1 = require("worker_threads");
async function scrapeCategory(baseUrl) {
    const brand = baseUrl.split('/product-category/')[1].replace('/', '');
    const products = [];
    let currentPage = 1;
    while (true) {
        const url = currentPage === 1 ? baseUrl : `${baseUrl}?paged=${currentPage}`;
        try {
            const { data } = await axios_1.default.get(url);
            const $ = cheerio.load(data);
            const productItems = $('li.product.type-product');
            if (productItems.length === 0)
                break;
            productItems.each((_, elem) => {
                const name = $(elem)
                    .find('h2.woocommerce-loop-product__title')
                    .text()
                    .trim();
                const price = $(elem)
                    .find('span.woocommerce-Price-amount')
                    .text()
                    .trim();
                console.log(name, url);
                const articleMatch = name.match(/(\d{3,}-\d{3,}|\d{6,})/);
                const article = articleMatch ? articleMatch[1] : '';
                if (name && price) {
                    products.push({ name, price, brand, article });
                }
            });
            const nextPageLink = $('ul.page-numbers li a.next.page-numbers');
            if (nextPageLink.length === 0)
                break;
            currentPage++;
        }
        catch (err) {
            break;
        }
    }
    return products;
}
scrapeCategory(worker_threads_1.workerData.baseUrl)
    .then((result) => {
    worker_threads_1.parentPort?.postMessage(result);
})
    .catch((err) => {
    worker_threads_1.parentPort?.postMessage({ error: err.message });
});
//# sourceMappingURL=scrape-worker.js.map
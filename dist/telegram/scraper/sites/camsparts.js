"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeCamsParts = scrapeCamsParts;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const constants_1 = require("../../../constants/constants");
async function scrapeCamsParts(productNumbers) {
    const start = performance.now();
    const results = [];
    for (const name of productNumbers) {
        try {
            const searchQuery = name.trim().replace(/\s+/g, '+');
            const searchUrl = `${constants_1.SOURCE_URLS.camsparts}${searchQuery}`;
            const response = await axios_1.default.get(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            const $ = cheerio.load(response.data);
            const firstProduct = $('.product__list .product').first();
            const relativeLink = firstProduct.find('a.product__img').attr('href');
            if (!relativeLink) {
                results.push({
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.camsparts,
                    found: false,
                    name,
                });
                continue;
            }
            const productUrl = `https://camsparts.ru${relativeLink}`;
            const productPage = await axios_1.default.get(productUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            const $$ = cheerio.load(productPage.data);
            const brand = $$('.breadcrumb__item span[itemprop="name"]');
            const nameFromBreadcrumb = brand
                .map((i, el) => $$(el).text())
                .get()
                .join(' ');
            const words = nameFromBreadcrumb.trim().split(/\s+/);
            const thirdWord = words[2];
            console.log(thirdWord);
            console.log(thirdWord);
            if (!thirdWord) {
                results.push({
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.camsparts,
                    found: false,
                    name,
                });
                continue;
            }
            const priceText = $$('.price__new[itemprop="offers"] span[itemprop="price"]').attr('content') || $$('.price__new[itemprop="offers"] span[itemprop="price"]').text();
            const price = priceText ? priceText.replace(/[^\d]/g, '') : constants_1.BASICS.zero;
            results.push({
                shop: constants_1.SOURCE_WEBPAGE_KEYS.camsparts,
                found: true,
                name,
                price,
                brand: thirdWord,
            });
        }
        catch (error) {
            console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.camsparts} Error for "${name}":`, error);
            results.push({
                shop: constants_1.SOURCE_WEBPAGE_KEYS.camsparts,
                found: false,
                name,
            });
        }
        finally {
            console.log(`Search time for "${productNumbers[0]} in camsparts":`, performance.now() - start);
        }
    }
    return results;
}
//# sourceMappingURL=camsparts.js.map
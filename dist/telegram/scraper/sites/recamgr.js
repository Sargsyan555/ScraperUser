"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeRecamgr = scrapeRecamgr;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const constants_1 = require("../../../constants/constants");
async function scrapeRecamgr(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const start = performance.now();
        const fallbackResult = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.recamgr,
            found: false,
        };
        try {
            const searchUrl = `${constants_1.SOURCE_URLS.recamgr}${encodeURIComponent(name)}`;
            const response = await axios_1.default.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
            });
            const $ = cheerio.load(response.data);
            const searchLength = $('.text.search-legend');
            const searchLengthText = searchLength.text().trim();
            const matches = searchLengthText.match(/\d+/g);
            const foundedProductCount = matches
                ? parseInt(matches[matches.length - 1], 10)
                : null;
            if (!foundedProductCount) {
                results.push(fallbackResult);
                continue;
            }
            const products = $('.goods__item');
            if (!products.length) {
                results.push(fallbackResult);
                continue;
            }
            const productsArray = products.toArray();
            let matchedProduct = null;
            for (const el of productsArray) {
                const product = $(el);
                const title = product.find('.lnk').text().trim() || 'Без названия';
                const words = title
                    .replace(/[()]/g, '')
                    .split(/\s+/)
                    .map((word) => word.toLowerCase());
                const matchBrand = constants_1.BRANDS.find((brand) => {
                    const brandLower = brand.toLowerCase();
                    return words.some((word) => word === brandLower);
                });
                const rawPrice = product.find('.price .new_price .price__value').text().trim() ||
                    constants_1.BASICS.zero;
                const price = rawPrice.replace(/\s*₽$/, '');
                if (matchBrand) {
                    matchedProduct = {
                        shop: constants_1.SOURCE_WEBPAGE_KEYS.recamgr,
                        found: true,
                        name: title,
                        price: price,
                        brand: matchBrand,
                    };
                    break;
                }
            }
            if (matchedProduct) {
                results.push(matchedProduct);
            }
            else {
                const firstProduct = products.first();
                const title = firstProduct.find('.lnk').text().trim() || 'Без названия';
                const rawPrice = firstProduct.find('.price .new_price .price__value').text().trim() ||
                    constants_1.BASICS.zero;
                const price = rawPrice.replace(/\s*₽$/, '');
                const words = title
                    .replace(/[()]/g, '')
                    .split(/\s+/)
                    .map((word) => word.toLowerCase());
                const matchBrand = constants_1.BRANDS.find((brand) => {
                    const brandLower = brand.toLowerCase();
                    return words.some((word) => word === brandLower);
                });
                let brendOfFirstProduct = matchBrand;
                if (!brendOfFirstProduct) {
                    brendOfFirstProduct = title;
                }
                results.push({
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.recamgr,
                    found: true,
                    name: title,
                    price: price,
                    brand: brendOfFirstProduct,
                });
            }
        }
        catch (error) {
            console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.recamgr} Error for "${name}":`, error);
            results.push(fallbackResult);
        }
        finally {
            console.log(results);
            console.log(`Search time for "${name} in Recmagr":`, performance.now() - start);
        }
    }
    return results;
}
//# sourceMappingURL=recamgr.js.map
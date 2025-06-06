"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapePcaGroup = scrapePcaGroup;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const constants_1 = require("../../../constants/constants");
async function scrapePcaGroup(productNumbers) {
    const start = performance.now();
    const results = [];
    for (const name of productNumbers) {
        const resultOfEachProduct = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.pcagroup,
            found: false,
        };
        const searchQuery = name.trim().replace(/\s+/g, '+');
        const searchUrl = `${constants_1.SOURCE_URLS.pcagroup}${searchQuery}`;
        try {
            const response = await axios_1.default.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
            });
            const $ = cheerio.load(response.data, {
                decodeEntities: true,
                xmlMode: false,
            });
            const productCard = $('.card').first();
            if (!productCard.length) {
                results.push(resultOfEachProduct);
                continue;
            }
            const artText = $('.card__art')
                .toArray()
                .map((el) => $(el).text().trim())
                .find((text) => text.startsWith('Артикул:'));
            const article = artText?.replace('Артикул:', '').trim();
            let articuleCheckOfFirst = article === name;
            if (!articuleCheckOfFirst) {
                articuleCheckOfFirst = article?.split(' ').find((e) => e === name);
            }
            if (!articuleCheckOfFirst) {
                results.push(resultOfEachProduct);
                continue;
            }
            const brandOfFirst = $('.card__art')
                .toArray()
                .map((el) => $(el).text().trim())
                .find((text) => text.startsWith('Производитель:'))
                ?.replace('Производитель:', '')
                .trim();
            const brandCheckOfFirst = constants_1.BRANDS.some((b) => {
                if (brandOfFirst && brandOfFirst.toLowerCase() === b.toLowerCase()) {
                    return b;
                }
                return false;
            });
            const priceOfFirst = productCard
                .find('.price')
                .text()
                .trim()
                .replace(/\D/g, '');
            const cleanPriceOfFirst = priceOfFirst && !isNaN(+priceOfFirst)
                ? priceOfFirst
                : constants_1.BASICS.empotyString;
            const titleOfFirst = productCard.find('.card__title').text().trim();
            if (brandCheckOfFirst) {
                results.push({
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.pcagroup,
                    found: true,
                    name: titleOfFirst,
                    price: cleanPriceOfFirst,
                    brand: brandOfFirst,
                });
                continue;
            }
            else {
                resultOfEachProduct.brand = brandOfFirst;
                resultOfEachProduct.price = cleanPriceOfFirst;
                resultOfEachProduct.name = titleOfFirst;
                resultOfEachProduct.shop = constants_1.SOURCE_WEBPAGE_KEYS.pcagroup;
                resultOfEachProduct.found = true;
            }
            $('.card').each((i, el) => {
                const card = $(el);
                const artElements = card.find('.card__art');
                let articul = '';
                let brand = '';
                artElements.each((_, artEl) => {
                    const text = $(artEl).text().trim();
                    if (text.includes('Артикул')) {
                        articul = text.replace('Артикул:', '').trim();
                    }
                    if (text.includes('Производитель')) {
                        brand = text.replace('Производитель:', '').trim();
                    }
                });
                let arrayOfArticulNumbersEachProduct = article === name;
                if (!arrayOfArticulNumbersEachProduct) {
                    arrayOfArticulNumbersEachProduct = articul
                        ?.split(' ')
                        .find((e) => e === name);
                }
                const checkedBrand = constants_1.BRANDS.some((b) => {
                    if (brand.toLowerCase() === b.toLowerCase()) {
                        return b;
                    }
                    return false;
                });
                if (arrayOfArticulNumbersEachProduct && checkedBrand) {
                    const title = card.find('.card__title').text().trim();
                    const price = productCard
                        .find('.price')
                        .text()
                        .trim()
                        .replace(/\D/g, '');
                    const cleanPrice = price && !isNaN(+price) ? price : constants_1.BASICS.empotyString;
                    results.push({
                        shop: constants_1.SOURCE_WEBPAGE_KEYS.pcagroup,
                        found: true,
                        name: title,
                        price: cleanPrice,
                    });
                    return false;
                }
            });
            if (results.length) {
                continue;
            }
            else if (resultOfEachProduct.found) {
                results.push(resultOfEachProduct);
            }
            else {
                results.push(resultOfEachProduct);
            }
        }
        catch (error) {
            console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.pcagroup} Error:`, error);
            results.push({
                shop: constants_1.SOURCE_WEBPAGE_KEYS.pcagroup,
                found: false,
            });
        }
        finally {
            console.log(results);
            console.log(`Search time for "${productNumbers[0]} in pcagroup":`, performance.now() - start);
        }
    }
    return results;
}
//# sourceMappingURL=pcagroup.js.map
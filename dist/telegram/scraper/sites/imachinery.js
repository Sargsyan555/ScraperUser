"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeIMachinery = scrapeIMachinery;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const constants_1 = require("../../../constants/constants");
async function scrapeIMachinery(productNumbers) {
    const start = performance.now();
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };
    const tasks = productNumbers.map(async (productNumber) => {
        const url = `${constants_1.SOURCE_URLS.imachinery}${encodeURIComponent(productNumber)}`;
        try {
            const response = await axios_1.default.get(url, { headers });
            const $ = cheerio.load(response.data);
            const result = {
                shop: constants_1.SOURCE_WEBPAGE_KEYS.imachinery,
                found: false,
            };
            const bTag = $('b')
                .filter((_, el) => $(el).text().includes('из'))
                .first();
            const matchB = $(bTag)
                .text()
                .match(/\d+\s*из\s*(\d+)/);
            const countOfproduct = matchB ? parseInt(matchB[1], 10) : 0;
            let fallbackProduct = null;
            $('.result-item .red-marker li')
                .slice(0, countOfproduct)
                .each((i, el) => {
                const name = $(el).find('b').first().text().trim();
                const splitedName = name.split(' ');
                const matchName = splitedName.find((e) => e.toLowerCase() === productNumber.toLowerCase());
                if (!matchName) {
                    return false;
                }
                const priceText = $(el).find('b.pric').text().trim();
                const price = priceText.replace(/^Цена:\s*/i, '').replace(/\D/g, '');
                const productionInfo = $('.texte span')
                    .filter((_, el) => $(el).text().includes('Производство'))
                    .first()
                    .text()
                    .trim();
                const brandMatch = productionInfo.match(/Производство\s*-\s*(\w+)/);
                const brandName = brandMatch ? brandMatch[1] : null;
                if (i === 0 && brandName) {
                    fallbackProduct = {
                        shop: constants_1.SOURCE_WEBPAGE_KEYS.imachinery,
                        name,
                        price: price.trim() !== '' && !isNaN(+price) ? price : constants_1.BASICS.zero,
                        found: true,
                        brand: brandName,
                    };
                }
                if (!brandName || !brandName.trim() || !name) {
                    return;
                }
                const matchedBrand = constants_1.BRANDS.find((brand) => brandName === brand);
                if (matchedBrand) {
                    result.name = name;
                    result.price =
                        price.trim() !== '' && !isNaN(+price) ? price : constants_1.BASICS.zero;
                    result.found = true;
                    result.brand = brandName;
                    return false;
                }
            });
            if (!result.found && fallbackProduct) {
                return fallbackProduct;
            }
            return result;
        }
        catch (error) {
            console.error(`${constants_1.SOURCE_WEBPAGE_KEYS.imachinery} Error:`, error);
            return { shop: constants_1.SOURCE_WEBPAGE_KEYS.imachinery, found: false };
        }
    });
    const settledResults = await Promise.allSettled(tasks);
    const res = settledResults.map((res) => {
        if (res.status === 'fulfilled') {
            return res.value;
        }
        else {
            return { shop: constants_1.SOURCE_WEBPAGE_KEYS.imachinery, found: false };
        }
    });
    console.log(`Search time for "${productNumbers[0]} in imachinery":`, performance.now() - start);
    return res;
}
//# sourceMappingURL=imachinery.js.map
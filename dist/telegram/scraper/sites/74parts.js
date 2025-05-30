"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape74Parts = scrape74Parts;
const constants_1 = require("../../../constants/constants");
const _74PartsData_1 = require("../74PartsData");
function scrape74Parts(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const result = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.parts74,
            found: false,
        };
        const product = (0, _74PartsData_1.findProductBy74Part)(name);
        if (product) {
            result.found = true;
            result.name = product.title || '-';
            result.price = product.price || '-';
            result.brand =
                (product.title && extractBrand(product.title)) || 'нет бренда';
        }
        results.push(result);
    }
    return Promise.resolve(results);
}
function extractBrand(text) {
    const upperWords = text.match(/\b[A-Z0-9]+(?:\s+[A-Z0-9]+)*\b/g);
    if (!upperWords || upperWords.length === 0) {
        return '';
    }
    if (upperWords.length === 1) {
        return upperWords[0];
    }
    const lastTwo = upperWords.slice(-2).join(', ');
    return lastTwo;
}
//# sourceMappingURL=74parts.js.map
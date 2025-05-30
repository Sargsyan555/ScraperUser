"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeIstkDeutz = scrapeIstkDeutz;
const constants_1 = require("../../../constants/constants");
const istkDeutzData_1 = require("../istkDeutzData");
function scrapeIstkDeutz(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const result = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.istk,
            found: false,
        };
        const product = (0, istkDeutzData_1.findProductByistkDeutz)(name);
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
    const match = text.match(/[A-Z]+/g);
    return match ? match.join(' ') : '';
}
//# sourceMappingURL=istk-deutz.js.map
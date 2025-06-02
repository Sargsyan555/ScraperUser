"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeIstkDeutz = scrapeIstkDeutz;
const constants_1 = require("../../../constants/constants");
const istkDeutzData_1 = require("../istkDeutzData");
function scrapeIstkDeutz(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const products = (0, istkDeutzData_1.findProductsByistkDeutz)(name);
        if (products.length > 0) {
            for (const product of products) {
                results.push({
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.istk,
                    found: true,
                    name: product.title || '-',
                    price: product.price || '-',
                    brand: (product.title && extractBrand(product.title)) || 'нет бренда',
                });
            }
        }
        else {
            results.push({
                shop: constants_1.SOURCE_WEBPAGE_KEYS.istk,
                found: false,
            });
        }
    }
    return Promise.resolve(results);
}
function extractBrand(text) {
    const match = text.match(/[A-Z]+/g);
    return match ? match.join(' ') : '';
}
//# sourceMappingURL=istk-deutz.js.map
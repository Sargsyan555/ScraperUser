"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeSeltex = scrapeSeltex;
const constants_1 = require("../../../constants/constants");
const SeltexData_1 = require("../SeltexData");
function scrapeSeltex(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const result = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.seltex,
            found: false,
        };
        const products = (0, SeltexData_1.findProductsBySeltex)(name);
        for (const product of products) {
            console.log('Seltex Nadasdnasn', product);
            if (product.price) {
                const result = {
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.seltex,
                    found: true,
                    name: product.articul || '-',
                    price: product.price || '-',
                    brand: product.brand && product.brand?.length > 1
                        ? product.brand
                        : 'нет бренда',
                };
                results.push(result);
                console.log('Seltex Res Nadasdnasn', result);
            }
        }
        if (!results.length) {
            results.push(result);
        }
    }
    return Promise.resolve(results);
}
//# sourceMappingURL=seltex.js.map
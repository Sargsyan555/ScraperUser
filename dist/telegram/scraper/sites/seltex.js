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
        const product = (0, SeltexData_1.findProductBySeltex)(name);
        if (product) {
            result.found = true;
            result.name = product.name || '-';
            result.price = product.price || '-';
            result.brand =
                product.brand && product.brand?.length > 1
                    ? product.brand
                    : 'нет бренда';
        }
        results.push(result);
    }
    return Promise.resolve(results);
}
//# sourceMappingURL=seltex.js.map
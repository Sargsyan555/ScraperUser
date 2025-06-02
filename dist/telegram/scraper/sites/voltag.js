"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeVoltag = scrapeVoltag;
const constants_1 = require("../../../constants/constants");
const VoltagData_1 = require("../VoltagData");
function scrapeVoltag(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const products = (0, VoltagData_1.findProductsByVoltag)(name.trim());
        if (products.length > 0) {
            for (const product of products) {
                const result = {
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.voltag,
                    found: true,
                    name: product.Name || '-',
                    price: product.Price || '-',
                    brand: product.Brand || 'нет бренда',
                };
                results.push(result);
            }
        }
        else {
            results.push({
                shop: constants_1.SOURCE_WEBPAGE_KEYS.voltag,
                found: false,
            });
        }
    }
    return Promise.resolve(results);
}
//# sourceMappingURL=voltag.js.map
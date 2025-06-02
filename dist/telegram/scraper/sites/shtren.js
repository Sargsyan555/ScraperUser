"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeShtren = scrapeShtren;
const constants_1 = require("../../../constants/constants");
const ShtrenData_1 = require("../ShtrenData");
function scrapeShtren(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const products = (0, ShtrenData_1.findProductsByShtren)(name.trim());
        if (products.length > 0) {
            for (const product of products) {
                results.push({
                    shop: constants_1.SOURCE_WEBPAGE_KEYS.shtern,
                    found: true,
                    name: product.Name || '-',
                    price: product.Price || '-',
                    brand: product.Brand || 'нет бренда',
                });
            }
        }
        else {
            results.push({
                shop: constants_1.SOURCE_WEBPAGE_KEYS.shtern,
                found: false,
            });
        }
    }
    return Promise.resolve(results);
}
//# sourceMappingURL=shtren.js.map
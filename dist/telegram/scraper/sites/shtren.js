"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeShtren = scrapeShtren;
const constants_1 = require("../../../constants/constants");
const ShtrenData_1 = require("../ShtrenData");
function scrapeShtren(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const result = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.shtern,
            found: false,
        };
        const product = (0, ShtrenData_1.findProductByShtren)(name);
        if (product) {
            result.found = true;
            result.name = product.Name || '-';
            result.price = product.Price || '-';
            result.brand = product.Brand || 'нет бренда';
        }
        results.push(result);
    }
    return Promise.resolve(results);
}
//# sourceMappingURL=shtren.js.map
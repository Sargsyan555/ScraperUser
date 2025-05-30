"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeVoltag = scrapeVoltag;
const constants_1 = require("../../../constants/constants");
const VoltagData_1 = require("../VoltagData");
function scrapeVoltag(productNumbers) {
    const results = [];
    for (const name of productNumbers) {
        const result = {
            shop: constants_1.SOURCE_WEBPAGE_KEYS.voltag,
            found: false,
        };
        const product = (0, VoltagData_1.findProductByVoltag)(name);
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
//# sourceMappingURL=voltag.js.map
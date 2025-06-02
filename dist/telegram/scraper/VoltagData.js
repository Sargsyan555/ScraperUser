"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsByArticle = void 0;
exports.findProductsByVoltag = findProductsByVoltag;
const XLSX = require("xlsx");
const productsByArticle = {};
exports.productsByArticle = productsByArticle;
function loadExcelData() {
    const workbook = XLSX.readFile('src/telegram/scraper/voltag.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    for (const row of sheetData) {
        if (row.article) {
            const key = String(row.article).trim();
            const product = {
                Articul: key,
                Name: row.name || '-',
                Price: typeof row.price === 'string'
                    ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
                    : row.price || 0,
                Brand: row.brand || '-',
            };
            if (!productsByArticle[key]) {
                productsByArticle[key] = [];
            }
            productsByArticle[key].push(product);
        }
    }
}
loadExcelData();
console.log('Voltag Excel db is Done');
function findProductsByVoltag(article) {
    const key = article.trim();
    return productsByArticle[key] || [];
}
//# sourceMappingURL=VoltagData.js.map
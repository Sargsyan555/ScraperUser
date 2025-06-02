"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsByArticle = void 0;
exports.findProductsByShtren = findProductsByShtren;
const XLSX = require("xlsx");
const productsByArticle = {};
exports.productsByArticle = productsByArticle;
function loadExcelData() {
    const workbook = XLSX.readFile('src/telegram/scraper/shtren.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    for (const row of sheetData) {
        if (row.Articul) {
            const key = String(row.Articul).trim();
            const product = {
                Articul: key,
                Name: row.Name || '-',
                Price: typeof row.Price === 'string'
                    ? parseInt(row.Price.replace(/[^\d]/g, ''), 10) || 0
                    : row.Price || 0,
                Brand: row.Brand || '-',
            };
            if (!productsByArticle[key]) {
                productsByArticle[key] = [];
            }
            productsByArticle[key].push(product);
        }
    }
}
loadExcelData();
console.log('Shtren Exel db is Done ');
function findProductsByShtren(article) {
    const key = article.trim();
    return productsByArticle[key] || [];
}
//# sourceMappingURL=ShtrenData.js.map
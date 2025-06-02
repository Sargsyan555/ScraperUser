"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsByArticle = void 0;
exports.findProductsBy74Part = findProductsBy74Part;
const XLSX = require("xlsx");
const productsByArticle = {};
exports.productsByArticle = productsByArticle;
function loadExcelData() {
    const workbook = XLSX.readFile('src/telegram/scraper/74PartBase.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    for (const row of sheetData) {
        if (row.article) {
            const key = String(row.article).trim();
            const product = {
                article: key,
                title: row.title || '-',
                price: typeof row.price === 'string'
                    ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
                    : row.price || 0,
                availability: row.availability || '-',
            };
            if (!productsByArticle[key]) {
                productsByArticle[key] = [];
            }
            productsByArticle[key].push(product);
        }
    }
}
loadExcelData();
console.log('74Part Exel db is Done ');
function findProductsBy74Part(article) {
    const key = article.trim();
    return productsByArticle[key] || [];
}
//# sourceMappingURL=74PartsData.js.map
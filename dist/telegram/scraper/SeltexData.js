"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsByArticle = void 0;
exports.findProductBySeltex = findProductBySeltex;
const XLSX = require("xlsx");
const productsByArticle = {};
exports.productsByArticle = productsByArticle;
function loadExcelData() {
    const workbook = XLSX.readFile('src/telegram/scraper/SeltexPrice.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    for (const row of sheetData) {
        if (row['all numbers']) {
            const articles = String(row['all numbers'])
                .split('/')
                .map((a) => a.trim())
                .filter((a) => a.length > 0);
            for (const key of articles) {
                productsByArticle[key] = {
                    name: row.name || '-',
                    price: typeof row.price === 'string'
                        ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
                        : row.price || 0,
                    stock: row.stock || '-',
                    brand: row.brand || '-',
                    'stock msk': row['stock msk'] || '-',
                    'stock mpb': row['stock mpb'] || '-',
                };
            }
        }
    }
}
loadExcelData();
console.log('Seltex Exel db is Done ');
function findProductBySeltex(article) {
    const key = article.trim();
    return productsByArticle[key] || null;
}
//# sourceMappingURL=SeltexData.js.map
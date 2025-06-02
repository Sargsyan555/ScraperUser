"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsByArticle = void 0;
exports.findProductsBySeltex = findProductsBySeltex;
const XLSX = require("xlsx");
const productsByArticle = {};
exports.productsByArticle = productsByArticle;
function loadExcelData() {
    const workbook = XLSX.readFile('src/telegram/scraper/SeltexPrice.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    for (const row of sheetData) {
        if (row['articul']) {
            const product = {
                name: row.name || '-',
                price: typeof row.price === 'string'
                    ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
                    : row.price || 0,
                stock: row.stock || '-',
                brand: row.brand || '-',
                'stock msk': row['stock msk'] || '-',
                'stock mpb': row['stock mpb'] || '-',
                articul: row['articul'],
            };
            if (!productsByArticle[row['articul']]) {
                productsByArticle[row['articul']] = [];
            }
            productsByArticle[row['articul']].push(product);
        }
    }
}
loadExcelData();
console.log('Seltex Exel db is Done ');
function findProductsBySeltex(article) {
    const key = article.trim();
    return productsByArticle[key] || [];
}
//# sourceMappingURL=SeltexData.js.map
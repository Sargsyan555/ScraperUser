"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsByArticul = void 0;
exports.findProductByistkDeutz = findProductByistkDeutz;
const XLSX = require("xlsx");
const productsByArticul = {};
exports.productsByArticul = productsByArticul;
function loadExcelData() {
    const workbook = XLSX.readFile('src/telegram/scraper/istk-deutzZ.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    for (const row of sheetData) {
        if (row.articul) {
            const key = String(row.articul).trim();
            productsByArticul[key] = {
                title: row.title || '-',
                price: typeof row.price === 'string'
                    ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
                    : row.price || 0,
                stock: row.stock || '-',
            };
        }
    }
}
loadExcelData();
console.log('istd Exel db is Done ');
function findProductByistkDeutz(articul) {
    const key = articul.trim();
    return productsByArticul[key] || null;
}
//# sourceMappingURL=istkDeutzData.js.map
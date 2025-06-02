"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeventyFourPartService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
let SeventyFourPartService = class SeventyFourPartService {
    productsByArticle = {};
    loadExcelData() {
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
                if (!this.productsByArticle[key]) {
                    this.productsByArticle[key] = [];
                }
                this.productsByArticle[key].push(product);
            }
        }
        console.log('✅ 74Part Excel DB loaded and cached.');
    }
    findProductsByArticle(article) {
        const key = article.trim();
        return this.productsByArticle[key] || [];
    }
};
exports.SeventyFourPartService = SeventyFourPartService;
exports.SeventyFourPartService = SeventyFourPartService = __decorate([
    (0, common_1.Injectable)()
], SeventyFourPartService);
//# sourceMappingURL=74Parts.js.map
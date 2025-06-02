"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeltexService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
let SeltexService = class SeltexService {
    productsByArticle = {};
    loadExcelData() {
        const workbook = XLSX.readFile("src/telegram/scraper/SeltexPrice.xlsx");
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        for (const row of sheetData) {
            if (row["articul"]) {
                const product = {
                    name: row.name || "-",
                    price: typeof row.price === "string"
                        ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
                        : row.price || 0,
                    stock: row.stock || "-",
                    brand: row.brand || "-",
                    "stock msk": row["stock msk"] || "-",
                    "stock mpb": row["stock mpb"] || "-",
                    articul: row["articul"],
                };
                if (!this.productsByArticle[row["articul"]]) {
                    this.productsByArticle[row["articul"]] = [];
                }
                this.productsByArticle[row["articul"]].push(product);
            }
        }
        console.log("✅ Seltex Excel DB loaded and cached.");
    }
    findProductsBySeltex(article) {
        const key = article.trim();
        return this.productsByArticle[key] || [];
    }
};
exports.SeltexService = SeltexService;
exports.SeltexService = SeltexService = __decorate([
    (0, common_1.Injectable)()
], SeltexService);
//# sourceMappingURL=seltex.service.js.map
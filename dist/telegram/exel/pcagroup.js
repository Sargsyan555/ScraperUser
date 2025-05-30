"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperPcaGroupService = void 0;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const path = require("path");
const common_1 = require("@nestjs/common");
let ScraperPcaGroupService = class ScraperPcaGroupService {
    outputFilePath = path.join(__dirname, '..', '..', 'products.xlsx');
    saveToExcel(products, filePath) {
        const worksheetData = products.map((p) => ({
            Articule: p.articul,
            Name: p.name,
            Price: p.price,
            Brand: p.brand,
            URL: p.url,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, filePath);
        console.log(`Excel file saved to: ${filePath}`);
    }
    async scrapeAllPages() {
        const res = await axios_1.default.get('https://pcagroup.ru/search/?search=');
        const $ = cheerio.load(res.data);
        const products = [];
        for (let page = 1; page <= 235; page++) {
            const url = `https://pcagroup.ru/search/?search=&_paged=${page}`;
            const res = await axios_1.default.get(url);
            const $ = cheerio.load(res.data);
            $('.card').each((_, element) => {
                const card = $(element);
                const link = card.find('a.card__image').attr('href')?.trim() ?? '';
                const name = card.find('.card__title').text().trim();
                const artText = card.find('.card__art').first().text().trim();
                const brandText = card.find('.card__art').last().text().trim();
                const priceText = card.find('.price').text().trim();
                const articulMatch = artText.match(/Артикул:\s*(\S+)/);
                const articul = articulMatch ? articulMatch[1] : '';
                const brandMatch = brandText.match(/Производитель:\s*(.*)/);
                const brand = brandMatch ? brandMatch[1] : 'Неизвестно';
                const price = priceText.replace(/\D/g, '') || '0';
                products.push({
                    articul,
                    brand,
                    name,
                    price,
                    url: link,
                });
            });
        }
        this.saveToExcel(products, this.outputFilePath);
        return { products, excelFilePath: this.outputFilePath };
    }
};
exports.ScraperPcaGroupService = ScraperPcaGroupService;
exports.ScraperPcaGroupService = ScraperPcaGroupService = __decorate([
    (0, common_1.Injectable)()
], ScraperPcaGroupService);
//# sourceMappingURL=pcagroup.js.map
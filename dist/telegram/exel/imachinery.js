"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperImachineryService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const path = require("path");
let ScraperImachineryService = class ScraperImachineryService {
    baseUrl = 'https://imachinery.ru/specialoffers/';
    outputFilePath = path.join(__dirname, '..', '..', 'products.xlsx');
    async scrapePage(page) {
        const url = page === 1 ? this.baseUrl : `${this.baseUrl}?PAGEN_2=${page}`;
        const response = await axios_1.default.get(url);
        const $ = cheerio.load(response.data);
        const products = [];
        $('div[id^="bx_"]').each((_, element) => {
            const name = $(element).find('h3.kart_name a').text().trim();
            const articule = name.split(' ')[0];
            const priceText = $(element).find('.price').text().trim();
            const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
            const tagLinks = $(element).find('.sk-tags-inner a');
            let brand = '';
            if (tagLinks.length > 0) {
                const firstText = $(tagLinks[0]).text().trim();
                const isRussian = /^[а-яА-ЯЁё\s]+$/.test(firstText);
                if (isRussian && tagLinks[1]) {
                    brand = $(tagLinks[1]).text().trim();
                }
                else {
                    brand = firstText;
                }
            }
            const link = $(element).find('h3.kart_name a').attr('href')?.trim() || '';
            const fullUrl = link ? new URL(link, this.baseUrl).href : this.baseUrl;
            products.push({ name, price, articule, brand, url: fullUrl });
        });
        return products;
    }
    async scrapeAllPages(maxPages = 122) {
        const allProducts = [];
        for (let page = 1; page <= maxPages; page++) {
            console.log(`Scraping page ${page}...`);
            const products = await this.scrapePage(page);
            allProducts.push(...products);
        }
        this.saveToExcel(allProducts, this.outputFilePath);
        return {
            products: allProducts,
            excelFilePath: this.outputFilePath,
        };
    }
    saveToExcel(products, filePath) {
        const worksheetData = products.map((p) => ({
            Articule: p.articule,
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
};
exports.ScraperImachineryService = ScraperImachineryService;
exports.ScraperImachineryService = ScraperImachineryService = __decorate([
    (0, common_1.Injectable)()
], ScraperImachineryService);
//# sourceMappingURL=imachinery.js.map
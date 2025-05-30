"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
let ScraperService = class ScraperService {
    baseUrl = 'https://www.seltex.ru';
    async scrapeCatalog() {
        const catalogUrl = `${this.baseUrl}/catalog`;
        try {
            const response = await axios_1.default.get(catalogUrl);
            const data = response.data;
            const $ = cheerio.load(data);
            const productLinks = [];
            $('a.btn.btn-primary.btn-xs').each((_, el) => {
                const link = $(el).attr('href');
                console.log(link);
                const priceTd = $(el).closest('td').nextAll('td').eq(1);
                const priceText = priceTd.text().trim();
                const price = parseFloat(priceText);
                if (!isNaN(price) && price > 0 && link) {
                    productLinks.push(this.baseUrl + link);
                }
            });
            console.log('!!!!!!!!!!!!!!!', productLinks);
            const products = [];
            let count = 0;
            for (const link of productLinks) {
                if (count > 10) {
                    break;
                }
                count++;
                const product = await this.scrapeProduct(link);
                if (product)
                    products.push(product);
            }
            console.log(products);
            this.saveToExcel(products);
        }
        catch (error) {
            console.error('Error scraping catalog:', error.message);
        }
    }
    async scrapeProduct(url) {
        try {
            const { data } = await axios_1.default.get(url);
            const $ = cheerio.load(data);
            const container = $('.jumbotron.my-part-description.container');
            const name = container.find('h1').text().trim();
            const priceText = container
                .find('div:contains("Цена") span')
                .first()
                .text()
                .trim();
            const price = parseFloat(priceText);
            const brand = container
                .find('div:contains("Производитель") span')
                .first()
                .text()
                .trim();
            const article = container.find('#partNumber').text().trim();
            return {
                name,
                brand,
                article,
                price,
                feature: article,
            };
        }
        catch (error) {
            console.error(`Failed to scrape product page: ${url}`, error.message);
            return null;
        }
    }
    saveToExcel(data) {
        const sheet = XLSX.utils.json_to_sheet(data);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, 'Products');
        const outputDir = path.resolve(__dirname, '..', '..', 'output');
        const filePath = path.join(outputDir, 'seltex_products.xlsx');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        XLSX.writeFile(book, filePath);
        console.log(`✅ Excel file saved: ${filePath}`);
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = __decorate([
    (0, common_1.Injectable)()
], ScraperService);
//# sourceMappingURL=scraperService.js.map
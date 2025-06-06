"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScraperImachineryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperImachineryService = void 0;
const axios_1 = require("axios");
const path = require("path");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
let ScraperImachineryService = ScraperImachineryService_1 = class ScraperImachineryService {
    logger = new common_1.Logger(ScraperImachineryService_1.name);
    baseUrl = 'https://imachinery.ru/specialoffers/';
    maxPages = 122;
    outputFilePath = path.join(process.cwd(), 'src/telegram/scraper', 'imachinery.xlsx');
    constructor() {
        this.scrapeAndExport().catch((err) => this.logger.error('Initial scrape failed:', err));
    }
    async handleCron() {
        this.logger.log('Running scheduled scraping for Imachinery...');
        try {
            await this.scrapeAndExport();
            this.logger.log('Scheduled scraping completed successfully.');
        }
        catch (error) {
            this.logger.error('Scheduled scraping failed:', error);
        }
    }
    async scrapeAndExport() {
        try {
            const allProducts = [];
            for (let page = 1; page <= this.maxPages; page++) {
                this.logger.log(`Scraping page ${page}...`);
                const products = await this.scrapePage(page);
                allProducts.push(...products);
            }
            this.saveToExcel(allProducts);
            this.logger.log(`✅ Excel file saved: ${this.outputFilePath}`);
            return this.outputFilePath;
        }
        catch (error) {
            this.logger.error('Failed to scrape and export Imachinery data:', error.message || error);
            return null;
        }
    }
    async scrapePage(page) {
        const url = page === 1 ? this.baseUrl : `${this.baseUrl}?PAGEN_2=${page}`;
        const response = await axios_1.default.get(url);
        const $ = cheerio.load(response.data);
        const products = [];
        $('div[id^="bx_"]').each((_, element) => {
            const name = $(element).find('h3.kart_name a').text().trim();
            const articule = name.split(' ')[0];
            const priceText = $(element).find('.price').text().trim();
            const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
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
    saveToExcel(products) {
        const worksheetData = products.map((p) => ({
            Артикул: p.articule,
            Название: p.name,
            Цена: p.price,
            Бренд: p.brand,
            Ссылка: p.url,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ImachineryProducts');
        XLSX.writeFile(workbook, this.outputFilePath);
    }
};
exports.ScraperImachineryService = ScraperImachineryService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperImachineryService.prototype, "handleCron", null);
exports.ScraperImachineryService = ScraperImachineryService = ScraperImachineryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperImachineryService);
//# sourceMappingURL=ScraperServiceImachinery.js.map
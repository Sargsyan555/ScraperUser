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
var ScraperServicePcagroup_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServicePcagroup = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const path = require("path");
let ScraperServicePcagroup = ScraperServicePcagroup_1 = class ScraperServicePcagroup {
    logger = new common_1.Logger(ScraperServicePcagroup_1.name);
    outputFilePath = path.join(process.cwd(), '/src/telegram/scraper', 'pcagroup.xlsx');
    constructor() {
        this.scrapeAllPages().catch((err) => this.logger.error('Initial scraping failed:', err));
    }
    async handleCron() {
        this.logger.log('Running scheduled scraping for pcagroup...');
        try {
            await this.scrapeAllPages();
            this.logger.log('Scheduled scraping completed successfully.');
        }
        catch (error) {
            this.logger.error('Scheduled scraping failed:', error);
        }
    }
    async saveToExcel(products, filePath) {
        const worksheetData = products.map((p) => ({
            Articul: p.articul,
            Name: p.name,
            Price: p.price,
            Brand: p.brand,
            URL: p.url,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, filePath);
        this.logger.log(`✅ Excel file saved to: ${filePath}`);
    }
    async scrapeAllPages() {
        const products = [];
        for (let page = 1; page <= 235; page++) {
            const url = `https://pcagroup.ru/search/?search=&_paged=${page}`;
            try {
                const res = await axios_1.default.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
                    },
                });
                const $ = cheerio.load(res.data);
                $('.card').each((_, element) => {
                    const card = $(element);
                    const link = card.find('a.card__image').attr('href')?.trim() || '';
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
                this.logger.log(`✅ Page ${page} scraped`);
            }
            catch (error) {
                this.logger.error(`❌ Error on page ${page}: ${error.message}`);
            }
        }
        await this.saveToExcel(products, this.outputFilePath);
    }
};
exports.ScraperServicePcagroup = ScraperServicePcagroup;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServicePcagroup.prototype, "handleCron", null);
exports.ScraperServicePcagroup = ScraperServicePcagroup = ScraperServicePcagroup_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServicePcagroup);
//# sourceMappingURL=scraperServicePcagroup.js.map
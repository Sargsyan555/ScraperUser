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
var ScraperSolidService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperSolidService = void 0;
const axios_1 = require("axios");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const path = require("path");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
let ScraperSolidService = ScraperSolidService_1 = class ScraperSolidService {
    logger = new common_1.Logger(ScraperSolidService_1.name);
    baseUrl = "https://solid-t.ru/catalog/?code=&sort=price&PAGEN_1";
    outputFilePath = path.join(process.cwd(), "src/telegram/scraper", "SolidPrice.xlsx");
    constructor() {
        this.scrapeAllPages().catch((err) => this.logger.error("Initial scrape failed:", err));
    }
    async handleCron() {
        this.logger.log("⏰ Running scheduled Solid scraper...");
        try {
            await this.scrapeAllPages();
            this.logger.log("✅ Scheduled Solid scrape completed.");
        }
        catch (error) {
            this.logger.error("❌ Scheduled Solid scrape failed:", error);
        }
    }
    async scrapePage(page) {
        const url = page === 1 ? this.baseUrl : `${this.baseUrl}=${page}`;
        this.logger.log(`Scraping page: ${url}`);
        try {
            const response = await axios_1.default.get(url);
            const $ = cheerio.load(response.data);
            const products = [];
            $(".catalog-block__item").each((_, element) => {
                const $el = $(element);
                const name = $el.find(".product-thumbs__name a").text().trim();
                const relativeUrl = $el.find(".product-thumbs__name a").attr("href") || "";
                const fullUrl = `https://solid-t.ru${relativeUrl}`;
                const article = $el
                    .find('.product-thumbs__params-item:contains("Артикул:")')
                    .text()
                    .replace("Артикул:", "")
                    .trim();
                const brand = $el
                    .find('.product-thumbs__params-item:contains("Производитель:")')
                    .text()
                    .replace("Производитель:", "")
                    .trim();
                const availability = $el
                    .find('.product-thumbs__params-item:contains("Наличие:")')
                    .text()
                    .replace("Наличие:", "")
                    .trim();
                const price = $el.find(".product-item-price-current").text().trim();
                products.push({
                    name,
                    url: fullUrl,
                    article,
                    brand,
                    availability,
                    price,
                });
            });
            return products;
        }
        catch (error) {
            this.logger.error(`Failed to scrape page ${page}:`, error.message || error);
            return [];
        }
    }
    async scrapeAllPages(maxPages = 241) {
        const allProducts = [];
        for (let page = 1; page <= maxPages; page++) {
            const products = await this.scrapePage(page);
            if (products.length === 0)
                break;
            allProducts.push(...products);
        }
        this.saveToExcel(allProducts);
    }
    saveToExcel(products) {
        const worksheetData = products.map((p) => ({
            Article: p.article,
            Name: p.name,
            Price: p.price,
            Brand: p.brand,
            URL: p.url,
            Availability: p.availability,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SolidProducts");
        XLSX.writeFile(workbook, this.outputFilePath);
        this.logger.log(`✅ Excel file saved: ${this.outputFilePath}`);
    }
};
exports.ScraperSolidService = ScraperSolidService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperSolidService.prototype, "handleCron", null);
exports.ScraperSolidService = ScraperSolidService = ScraperSolidService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperSolidService);
//# sourceMappingURL=scraperServiceSolid.js.map
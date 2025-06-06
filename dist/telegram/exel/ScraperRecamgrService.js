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
var ScraperRecamgrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperRecamgrService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
const zlib = require("zlib");
const xml2js_1 = require("xml2js");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const path = require("path");
let ScraperRecamgrService = ScraperRecamgrService_1 = class ScraperRecamgrService {
    logger = new common_1.Logger(ScraperRecamgrService_1.name);
    constructor() {
        this.scrapeAndSave().catch((err) => this.logger.error('Initial scrape failed:', err));
    }
    async handleCron() {
        this.logger.log('Running scheduled scrape for recamgr...');
        try {
            await this.scrapeAndSave();
            this.logger.log('✅ Scheduled scrape completed successfully.');
        }
        catch (error) {
            this.logger.error('❌ Scheduled scrape failed:', error);
        }
    }
    isProductUrl(url) {
        return /\/p\/[0-9]+-/.test(url);
    }
    async getUrlsFromGzSitemap(gzUrl) {
        const response = await axios_1.default.get(gzUrl, { responseType: 'arraybuffer' });
        const xmlBuffer = zlib.gunzipSync(response.data);
        const xml = xmlBuffer.toString('utf8');
        const parsed = await (0, xml2js_1.parseStringPromise)(xml);
        return parsed.urlset.url
            .map((entry) => entry.loc[0])
            .filter(this.isProductUrl)
            .slice(1, 10);
    }
    extractArticul(nameText) {
        const parts = nameText.split(/\s|\//).reverse();
        return parts.find((p) => /[0-9\-]{5,}/.test(p)) || '';
    }
    extractBrand($) {
        const brandTag = $('a[title*="Запчасти"]');
        const title = brandTag.attr('title');
        if (!title)
            return '';
        const match = title.match(/Запчасти\s+(.*)/);
        return match ? match[1].trim() : title.trim();
    }
    extractPrice($) {
        const priceText = $('.goods-card__price .price__value').first().text();
        return priceText.replace(/[^\d.,]/g, '').replace(/\s/g, '');
    }
    async scrapeAndSave() {
        try {
            const sitemapUrl = 'https://recamgr.ru/sitemap_storage__firms__28__31__31705__sitemap2.xml.gz';
            const productUrls = await this.getUrlsFromGzSitemap(sitemapUrl);
            const products = [];
            for (const url of productUrls) {
                try {
                    const { data } = await axios_1.default.get(url);
                    const $ = cheerio.load(data);
                    const nameText = $('.title.section__title h1').first().text().trim();
                    const articul = this.extractArticul(nameText);
                    const brand = this.extractBrand($);
                    const price = this.extractPrice($);
                    products.push({ articul, name: nameText, brand, price, url });
                }
                catch (err) {
                    this.logger.warn(`Failed to scrape: ${url}`);
                }
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Products');
            worksheet.columns = [
                { header: 'Articul', key: 'articul', width: 20 },
                { header: 'Name', key: 'name', width: 50 },
                { header: 'Brand', key: 'brand', width: 30 },
                { header: 'Price', key: 'price', width: 20 },
                { header: 'URL', key: 'url', width: 50 },
            ];
            worksheet.addRows(products);
            const filePath = path.join(process.cwd(), '/src/telegram/scraper', 'RecamgrPrice.xlsx');
            await workbook.xlsx.writeFile(filePath);
            this.logger.log(`✅ Processed Excel saved: ${filePath}`);
        }
        catch (error) {
            this.logger.error('Failed to scrape and save Excel:', error.message || error);
        }
    }
};
exports.ScraperRecamgrService = ScraperRecamgrService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperRecamgrService.prototype, "handleCron", null);
exports.ScraperRecamgrService = ScraperRecamgrService = ScraperRecamgrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperRecamgrService);
//# sourceMappingURL=ScraperRecamgrService.js.map
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
var ScraperServiceUdtTechnika_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceUdtTechnika = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
const xml2js_1 = require("xml2js");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const path = require("path");
let ScraperServiceUdtTechnika = ScraperServiceUdtTechnika_1 = class ScraperServiceUdtTechnika {
    logger = new common_1.Logger(ScraperServiceUdtTechnika_1.name);
    sitemapUrl = 'https://www.udt-technika.ru/sitemap.xml';
    constructor() {
        this.scrapeAndExport().catch((err) => this.logger.error('Initial run failed:', err));
    }
    async handleCron() {
        this.logger.log('⏰ Scheduled run started...');
        try {
            await this.scrapeAndExport();
            this.logger.log('✅ Scheduled run completed successfully.');
        }
        catch (error) {
            this.logger.error('❌ Scheduled run failed:', error.message || error);
        }
    }
    async getProductUrls() {
        const sitemapXml = await axios_1.default.get(this.sitemapUrl).then((res) => res.data);
        const sitemapParsed = await (0, xml2js_1.parseStringPromise)(sitemapXml);
        const sitemapUrls = sitemapParsed.sitemapindex.sitemap.map((s) => s.loc[0]);
        const productUrls = [];
        for (const url of sitemapUrls) {
            const sitemapContent = await axios_1.default.get(url).then((res) => res.data);
            const parsed = await (0, xml2js_1.parseStringPromise)(sitemapContent);
            const urls = parsed.urlset.url
                .map((u) => u.loc[0])
                .filter((u) => u.includes('itemid'));
            productUrls.push(...urls);
        }
        return productUrls;
    }
    async scrapeProduct(url) {
        try {
            const { data } = await axios_1.default.get(url, { timeout: 5000 });
            const $ = cheerio.load(data);
            const name = $('li:contains("Название")')
                .text()
                .replace('Название:', '')
                .trim();
            const brand = $('li:contains("Производитель")')
                .text()
                .replace('Производитель:', '')
                .trim();
            const articul = $('li')
                .filter((_, el) => $(el).text().trim().startsWith('Артикул:'))
                .text()
                .replace('Артикул:', '')
                .trim()
                .split('/')[0];
            const priceText = $('#cenabasket2').text().trim();
            const price = priceText.replace(/[^\d]/g, '');
            if (!name || !articul)
                return null;
            return { articul, name, brand, price };
        }
        catch (e) {
            this.logger.warn(`⚠️ Failed to scrape ${url}: ${e.message}`);
            return null;
        }
    }
    async scrapeAndExport() {
        this.logger.log('🔍 Starting scrape...');
        const productUrls = await this.getProductUrls();
        this.logger.log(`📦 Found ${productUrls.length} product URLs`);
        const products = [];
        for (let i = 0; i < productUrls.length; i++) {
            const url = productUrls[i];
            this.logger.log(`Scraping (${i + 1}/${productUrls.length}): ${url}`);
            const product = await this.scrapeProduct(url);
            if (product)
                products.push(product);
        }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products');
        worksheet.columns = [
            { header: 'Артикул', key: 'articul', width: 25 },
            { header: 'Название', key: 'name', width: 40 },
            { header: 'Цена', key: 'price', width: 15 },
            { header: 'Производитель', key: 'brand', width: 30 },
        ];
        worksheet.addRows(products);
        const outputPath = path.join(process.cwd(), '/src/telegram/scraper', 'udttechnika.xlsx');
        await workbook.xlsx.writeFile(outputPath);
        this.logger.log(`✅ Excel file saved: ${outputPath}`);
    }
};
exports.ScraperServiceUdtTechnika = ScraperServiceUdtTechnika;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServiceUdtTechnika.prototype, "handleCron", null);
exports.ScraperServiceUdtTechnika = ScraperServiceUdtTechnika = ScraperServiceUdtTechnika_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServiceUdtTechnika);
//# sourceMappingURL=ScraperServiceUdtTechnika.js.map
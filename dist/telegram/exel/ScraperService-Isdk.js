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
var ScraperServiceIstkDeutz_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceIstkDeutz = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
const fast_xml_parser_1 = require("fast-xml-parser");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const path = require("path");
let ScraperServiceIstkDeutz = ScraperServiceIstkDeutz_1 = class ScraperServiceIstkDeutz {
    logger = new common_1.Logger(ScraperServiceIstkDeutz_1.name);
    sitemapUrl = 'https://istk-deutz.ru/sitemap.xml';
    outputFilePath = path.join(process.cwd(), 'src/telegram/scraper', 'istk-deutzZ.xlsx');
    constructor() {
        this.main().catch((err) => this.logger.error('Initial scraping failed', err));
    }
    async handleCron() {
        this.logger.log('Running scheduled istk-deutz scraper...');
        try {
            await this.main();
            this.logger.log('Scheduled scraping completed.');
        }
        catch (error) {
            this.logger.error('Scheduled scraping failed:', error);
        }
    }
    delay(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }
    async fetchSitemapUrls(sitemapUrl) {
        const response = await axios_1.default.get(sitemapUrl);
        const parser = new fast_xml_parser_1.XMLParser();
        const parsed = parser.parse(response.data);
        if (parsed.sitemapindex?.sitemap) {
            const sitemapUrls = parsed.sitemapindex.sitemap.map((item) => item.loc);
            const nestedUrls = [];
            for (const url of sitemapUrls) {
                this.logger.log(`📂 Reading nested sitemap: ${url}`);
                const nested = await this.fetchSitemapUrls(url);
                nestedUrls.push(...nested);
                await this.delay(300);
            }
            return nestedUrls;
        }
        if (parsed.urlset?.url) {
            return parsed.urlset.url.map((item) => item.loc);
        }
        return [];
    }
    async scrapeData(url) {
        try {
            const { data } = await axios_1.default.get(url);
            const $ = cheerio.load(data);
            const title = $('h1').first().text().trim();
            const price = $('.price_noauth .price').first().text().trim();
            const stock = $('.product-quantity ul li').first().text().trim();
            return { url, title, price, stock };
        }
        catch (error) {
            this.logger.error(`❌ Error scraping ${url}: ${error.message}`);
            return null;
        }
    }
    async main() {
        const allUrls = await this.fetchSitemapUrls(this.sitemapUrl);
        const filtered = allUrls.filter((url) => url.includes('/zapchasti/'));
        this.logger.log(`🔎 Found ${filtered.length} URLs with /zapchasti/`);
        const results = [];
        for (const [i, url] of filtered.entries()) {
            this.logger.log(`📄 Processing ${i + 1}/${filtered.length}: ${url}`);
            const data = await this.scrapeData(url);
            if (data)
                results.push(data);
            await this.delay(200);
        }
        const worksheet = XLSX.utils.json_to_sheet(results);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Zapchasti');
        XLSX.writeFile(workbook, this.outputFilePath);
        this.logger.log(`✅ Saved to ${this.outputFilePath}`);
    }
};
exports.ScraperServiceIstkDeutz = ScraperServiceIstkDeutz;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServiceIstkDeutz.prototype, "handleCron", null);
exports.ScraperServiceIstkDeutz = ScraperServiceIstkDeutz = ScraperServiceIstkDeutz_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServiceIstkDeutz);
//# sourceMappingURL=ScraperService-Isdk.js.map
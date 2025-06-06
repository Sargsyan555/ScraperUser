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
var ScraperServiceDvPt_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceDvPt = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
const fast_xml_parser_1 = require("fast-xml-parser");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
let ScraperServiceDvPt = ScraperServiceDvPt_1 = class ScraperServiceDvPt {
    sitemapUrl = 'https://dv-pt.ru/sitemap.xml';
    logger = new common_1.Logger(ScraperServiceDvPt_1.name);
    constructor() {
        this.fetchAndSaveUrls().catch((err) => this.logger.error('Initial download failed:', err));
        this.scrapeAndExport().catch((err) => this.logger.error('Initial scrap from .json  failed:', err));
    }
    async handleCron() {
        this.logger.log('Запущен плановый парсинг dv-pt');
        try {
            await this.fetchAndSaveUrls();
            await this.scrapeAndExport();
            this.logger.log('✅ Парсинг и экспорт завершены успешно.');
        }
        catch (error) {
            this.logger.error('❌ Ошибка во время планового парсинга:', error);
        }
    }
    async fetchAndSaveUrls() {
        this.logger.log(`Получение ссылок из sitemap: ${this.sitemapUrl}`);
        const response = await axios_1.default.get(this.sitemapUrl);
        const parser = new fast_xml_parser_1.XMLParser();
        const parsed = parser.parse(response.data);
        const allUrls = parsed.urlset.url.map((item) => item.loc);
        const productUrls = allUrls.filter((url) => url.includes('/shop/goods/'));
        const filePath = path.join(process.cwd(), 'dv-pt.json');
        fs.writeFileSync(filePath, JSON.stringify(productUrls, null, 2), 'utf-8');
        this.logger.log(`Сохранено ${productUrls.length} ссылок в ${filePath}`);
    }
    async scrapeAndExport() {
        const filePath = path.join(process.cwd(), 'dv-pt.json');
        const urls = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const results = await this.processAll(urls, 8, 500, 300);
        const worksheet = xlsx.utils.json_to_sheet(results);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
        const outputFilePath = path.join(process.cwd(), '/src/telegram/scraper', 'dvpt.xlsx');
        xlsx.writeFile(workbook, outputFilePath);
        this.logger.log(`📦 Данные сохранены в файл: ${outputFilePath}`);
    }
    async scrapePage(url, attempt = 1) {
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                    Referer: 'https://dv-pt.ru/',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                timeout: 15000,
            });
            const $ = cheerio.load(response.data);
            const title = $('h1').first().text().trim();
            const price = $('.price .strong').first().text().trim();
            const article = $('.values span').first().text().trim();
            return { url, title, price, article };
        }
        catch (error) {
            if (error.response?.status === 403 && attempt < 3) {
                this.logger.warn(`⚠️ 403 Forbidden. Повтор (${attempt + 1}) для: ${url}`);
                await delay(50000);
                return this.scrapePage(url, attempt + 1);
            }
            this.logger.error(`❌ Ошибка при парсинге ${url}: ${error.message}`);
            return { url, title: '', price: '', article: '', error: error.message };
        }
    }
    async processAll(urls, concurrency = 7, perRequestDelay = 500, startDelayStep = 300) {
        const results = [];
        let index = 0;
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        async function worker(workerId) {
            await delay(workerId * startDelayStep);
            while (true) {
                const currentIndex = index++;
                if (currentIndex >= urls.length)
                    break;
                const url = urls[currentIndex];
                console.log(`🔄 [Worker ${workerId + 1}] ${currentIndex + 1}/${urls.length}: ${url}`);
                const result = await this.scrapePage(url);
                results.push(result);
                await delay(perRequestDelay);
            }
        }
        const boundWorker = worker.bind(this);
        const workers = Array.from({ length: concurrency }, (_, i) => boundWorker(i));
        await Promise.all(workers);
        return results;
    }
};
exports.ScraperServiceDvPt = ScraperServiceDvPt;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServiceDvPt.prototype, "handleCron", null);
exports.ScraperServiceDvPt = ScraperServiceDvPt = ScraperServiceDvPt_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServiceDvPt);
//# sourceMappingURL=scraperServiceDv-Pt.js.map
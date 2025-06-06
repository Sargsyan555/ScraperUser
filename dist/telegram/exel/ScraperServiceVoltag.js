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
var ScraperServiceVoltag_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceVoltag = void 0;
const axios_1 = require("axios");
const path = require("path");
const fs = require("fs");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const XLSX = require("xlsx");
const xml2js_1 = require("xml2js");
const worker_threads_1 = require("worker_threads");
let ScraperServiceVoltag = ScraperServiceVoltag_1 = class ScraperServiceVoltag {
    logger = new common_1.Logger(ScraperServiceVoltag_1.name);
    sitemapUrl = 'https://voltag.ru/sitemap.xml';
    outputDir = path.join(process.cwd(), '/src/telegram/scraper');
    constructor() {
        this.scrapeAndSave().catch((err) => this.logger.error('Initial scraping failed:', err));
    }
    async handleCron() {
        this.logger.log('Running scheduled scraping...');
        try {
            await this.scrapeAndSave();
            this.logger.log('Scraping completed successfully.');
        }
        catch (error) {
            this.logger.error('Scheduled scraping failed:', error);
        }
    }
    async scrapeAndSave() {
        this.logger.log(`Fetching sitemap: ${this.sitemapUrl}`);
        try {
            const { data: sitemapXml } = await axios_1.default.get(this.sitemapUrl);
            const sitemapIndex = (await (0, xml2js_1.parseStringPromise)(sitemapXml));
            const sitemapUrls = sitemapIndex.sitemapindex.sitemap.map((s) => s.loc[0]);
            const allCatalogUrls = [];
            for (const sitemapUrl of sitemapUrls) {
                const { data: subXml } = await axios_1.default.get(sitemapUrl);
                const subResult = (await (0, xml2js_1.parseStringPromise)(subXml));
                const catalogUrls = (subResult.urlset?.url || [])
                    .map((u) => u.loc[0])
                    .filter((url) => url.includes('/catalog/group/'));
                allCatalogUrls.push(...catalogUrls);
            }
            const allPriceUrls = allCatalogUrls.map((url) => url.replace('/catalog/group/', '/price/group/'));
            const chunks = this.chunkArray(allPriceUrls, 5);
            const allProducts = [];
            const workerPromises = chunks.map((chunk) => {
                return new Promise((resolve, reject) => {
                    const worker = new worker_threads_1.Worker(path.join(__dirname, 'voltag.worker.js'), {
                        workerData: chunk,
                    });
                    worker.on('message', (products) => resolve(products));
                    worker.on('error', reject);
                    worker.on('exit', (code) => {
                        if (code !== 0)
                            reject(new Error(`Worker exited with code ${code}`));
                    });
                });
            });
            const results = await Promise.all(workerPromises);
            for (const products of results) {
                allProducts.push(...products);
            }
            this.saveToExcel(allProducts);
        }
        catch (err) {
            this.logger.error('Error during scraping:', err.message || err);
        }
    }
    chunkArray(arr, size) {
        const result = [];
        const chunkSize = Math.ceil(arr.length / size);
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }
    saveToExcel(data) {
        if (!data.length) {
            this.logger.warn('No data to save to Excel.');
            return;
        }
        const sheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, 'VoltagProducts');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        const filePath = path.join(this.outputDir, 'VoltagPrice.xlsx');
        XLSX.writeFile(workbook, filePath);
        this.logger.log(`✅ Excel saved: ${filePath}`);
    }
};
exports.ScraperServiceVoltag = ScraperServiceVoltag;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServiceVoltag.prototype, "handleCron", null);
exports.ScraperServiceVoltag = ScraperServiceVoltag = ScraperServiceVoltag_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServiceVoltag);
//# sourceMappingURL=ScraperServiceVoltag.js.map
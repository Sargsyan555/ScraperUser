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
var ScraperServiceShtren_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceShtren = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const worker_threads_1 = require("worker_threads");
const path = require("path");
const ExcelJS = require("exceljs");
let ScraperServiceShtren = ScraperServiceShtren_1 = class ScraperServiceShtren {
    logger = new common_1.Logger(ScraperServiceShtren_1.name);
    categories = [
        'https://xn--e1aqig3a.com/product-category/volvo/',
        'https://xn--e1aqig3a.com/product-category/deutz/',
        'https://xn--e1aqig3a.com/product-category/perkins/',
        'https://xn--e1aqig3a.com/product-category/cat/',
    ];
    async handleCron() {
        this.logger.log('⏰ Scheduled scraping started...');
        try {
            const { filePath } = await this.scrapeAllCategories();
            this.logger.log(`✅ Scheduled scraping finished. File: ${filePath}`);
        }
        catch (error) {
            this.logger.error('❌ Scheduled scraping failed:', error);
        }
    }
    constructor() {
        this.scrapeAllCategories().catch((err) => this.logger.error('Initial download failed:', err));
    }
    async scrapeAllCategories() {
        this.logger.log('📦 Starting scraping of all categories...');
        try {
            const promises = this.categories.map((categoryUrl) => {
                this.logger.log(`🔍 Scraping category: ${categoryUrl}`);
                return this.runWorker(categoryUrl);
            });
            const results = await Promise.all(promises);
            const allProducts = results.flat();
            const fileName = 'shtren.xlsx';
            const filePath = await this.saveToExcel(allProducts, fileName);
            this.logger.log(`✅ Scraping completed. Excel saved at: ${filePath}`);
            return { products: allProducts, filePath };
        }
        catch (error) {
            this.logger.error('❌ Error during scraping:', error);
            throw error;
        }
    }
    runWorker(categoryUrl) {
        return new Promise((resolve, reject) => {
            const worker = new worker_threads_1.Worker(path.resolve(__dirname, './scrape-workerShtern.js'), {
                workerData: { baseUrl: categoryUrl },
            });
            worker.on('message', (data) => {
                data.error ? reject(new Error(data.error)) : resolve(data);
            });
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker exited with code ${code}`));
                }
            });
        });
    }
    async saveToExcel(products, filename) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Products');
        sheet.columns = [
            { header: 'Articul', key: 'article', width: 20 },
            { header: 'Name', key: 'name', width: 50 },
            { header: 'Price', key: 'price', width: 20 },
            { header: 'Brand', key: 'brand', width: 20 },
        ];
        products.forEach((product) => sheet.addRow(product));
        const filePath = path.join(process.cwd(), 'src', 'telegram', 'scraper', filename);
        await workbook.xlsx.writeFile(filePath);
        this.logger.log(`📁 Excel saved to: ${filePath}`);
        return filePath;
    }
};
exports.ScraperServiceShtren = ScraperServiceShtren;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServiceShtren.prototype, "handleCron", null);
exports.ScraperServiceShtren = ScraperServiceShtren = ScraperServiceShtren_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServiceShtren);
//# sourceMappingURL=scraperServiceShtern.js.map
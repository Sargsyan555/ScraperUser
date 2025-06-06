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
var ScraperServiceSeltex_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceSeltex = void 0;
const axios_1 = require("axios");
const path = require("path");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
let ScraperServiceSeltex = ScraperServiceSeltex_1 = class ScraperServiceSeltex {
    baseUrl = 'https://www.seltex.ru';
    catalogUrl = `${this.baseUrl}/catalog`;
    logger = new common_1.Logger(ScraperServiceSeltex_1.name);
    constructor() {
        this.downloadAndProcessExcel().catch((err) => this.logger.error('Initial download failed:', err));
    }
    async handleCron() {
        this.logger.log('Running scheduled Excel download...');
        try {
            await this.downloadAndProcessExcel();
            this.logger.log('Scheduled Excel download completed successfully.');
        }
        catch (error) {
            this.logger.error('Scheduled Excel download failed:', error);
        }
    }
    async downloadAndProcessExcel() {
        this.logger.log(`Fetching catalog page: ${this.catalogUrl}`);
        try {
            const response = await axios_1.default.get(this.catalogUrl);
            const $ = cheerio.load(response.data);
            const excelUrl = $('a')
                .filter((_, el) => $(el).text().trim() === 'ЗАГРУЗИТЬ ПРАЙС')
                .attr('href');
            if (!excelUrl) {
                this.logger.error('Excel download link not found on catalog page!');
                return;
            }
            this.logger.log(`Found Excel link: ${excelUrl}`);
            const fileResponse = await axios_1.default.get(excelUrl, {
                responseType: 'arraybuffer',
            });
            const workbook = XLSX.read(fileResponse.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                defval: '',
            });
            const columnMap = {
                name: 'name',
                manufacturer: 'brand',
                'main number': 'articul',
                'all numbers': 'all numbers',
                price: 'price',
                'stock msk': 'stock msk',
                'stock spb': 'stock spb',
            };
            const processedData = jsonData.map((row) => {
                const newRow = {};
                for (const oldKey in row) {
                    const lowerKey = oldKey.toLowerCase();
                    if (columnMap[lowerKey]) {
                        newRow[columnMap[lowerKey]] = row[oldKey];
                    }
                }
                return newRow;
            });
            const newSheet = XLSX.utils.json_to_sheet(processedData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'ProcessedProducts');
            const newFilePath = path.join(process.cwd(), '/src/telegram/scraper', 'SeltexPrice.xlsx');
            XLSX.writeFile(newWorkbook, newFilePath);
            this.logger.log(`✅ Processed Excel saved: ${newFilePath}`);
        }
        catch (error) {
            this.logger.error('Failed to download/process Excel:', error.message || error);
        }
    }
};
exports.ScraperServiceSeltex = ScraperServiceSeltex;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServiceSeltex.prototype, "handleCron", null);
exports.ScraperServiceSeltex = ScraperServiceSeltex = ScraperServiceSeltex_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServiceSeltex);
//# sourceMappingURL=scraperServiceSeltex.js.map
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
var SkladService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkladService = void 0;
const axios_1 = require("axios");
const XLSX = require("xlsx");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
let SkladService = SkladService_1 = class SkladService {
    logger = new common_1.Logger(SkladService_1.name);
    yandexDiskUrl = 'https://disk.yandex.ru/i/FE5LjEWujhR0Xg';
    data = { Sklad: {} };
    constructor() {
        this.loadSkladExcel().catch((e) => this.logger.error('Initial Sklad load failed', e));
    }
    async handleCron() {
        this.logger.log('Scheduled Sklad Excel load started');
        try {
            await this.loadSkladExcel();
            this.logger.log('Scheduled Sklad Excel load finished');
        }
        catch (e) {
            this.logger.error('Scheduled Sklad Excel load failed', e);
        }
    }
    async loadSkladExcel() {
        this.logger.log(`Downloading Excel from Yandex Disk: ${this.yandexDiskUrl}`);
        const response = await axios_1.default.get(this.yandexDiskUrl, {
            responseType: 'arraybuffer',
        });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const skladItems = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
        });
        this.data.Sklad = {};
        for (const row of skladItems) {
            if (!row['кат.номер'])
                continue;
            const key = String(row['кат.номер']).trim();
            const priceValue = row['цена, RUB'];
            let price;
            if (typeof priceValue === 'string') {
                price = parseInt(priceValue.replace(/[^\d]/g, ''), 10) || 0;
            }
            else if (typeof priceValue === 'number') {
                price = priceValue;
            }
            else {
                price = 0;
            }
            const product = {
                title: row['название детали'] || '-',
                price,
            };
            if (!this.data.Sklad[key]) {
                this.data.Sklad[key] = [];
            }
            this.data.Sklad[key].push(product);
        }
        this.logger.log('✅ Sklad loaded and processed');
    }
};
exports.SkladService = SkladService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SkladService.prototype, "handleCron", null);
exports.SkladService = SkladService = SkladService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SkladService);
//# sourceMappingURL=ScraperServiceSklad.js.map
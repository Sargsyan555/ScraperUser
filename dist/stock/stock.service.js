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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const stock_storage_1 = require("./stock.storage");
const readExcelFromYandexDisk_1 = require("./readExcelFromYandexDisk");
let StockService = class StockService {
    stockStorage;
    constructor(stockStorage) {
        this.stockStorage = stockStorage;
    }
    async onModuleInit() {
        await this.updateStock();
        setInterval(() => this.updateStock(), 24 * 60 * 60 * 1000);
    }
    async updateStock() {
        try {
            const skladItems = await (0, readExcelFromYandexDisk_1.readExcelFromYandexDisk)('https://disk.yandex.ru/i/FE5LjEWujhR0Xg');
            this.stockStorage.setData(skladItems);
        }
        catch (error) {
            console.error('[StockService] Ошибка обновления склада:', error.message);
        }
    }
    getStock() {
        const data = this.stockStorage.getData();
        if (data instanceof Error) {
            throw data;
        }
        return data;
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stock_storage_1.StockStorage])
], StockService);
//# sourceMappingURL=stock.service.js.map
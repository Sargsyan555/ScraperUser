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
exports.DocumentHandler = void 0;
const common_1 = require("@nestjs/common");
const parse_and_read_1 = require("../exel/parse.and.read");
const comparator_exelFiles_1 = require("../exel/comparator.exelFiles");
const generator_createResultExcel_1 = require("../exel/generator.createResultExcel");
const manu_1 = require("../utils/manu");
const users_service_1 = require("../authorization/users.service");
const stock_service_1 = require("../../stock/stock.service");
let DocumentHandler = class DocumentHandler {
    userService;
    stockService;
    constructor(userService, stockService) {
        this.userService = userService;
        this.stockService = stockService;
    }
    async handle(ctx) {
        const message = ctx.message;
        if (!message || !('document' in message)) {
            return ctx.reply('❌ Пожалуйста, отправьте Excel‑файл.');
        }
        const { document } = message;
        const fileName = document.file_name ?? '';
        if (!/\.xlsx?$/.test(fileName)) {
            return ctx.reply('❌ Загрузите файл с расширением `.xlsx` или `.xls`');
        }
        try {
            await ctx.reply('🔍 Идёт проверка по складу...');
            const inputItems = await (0, parse_and_read_1.parseExcelFromTelegram)(document.file_id, ctx.telegram);
            if (!inputItems.length) {
                return ctx.reply('Ваш файл Excel пустой.');
            }
            const skladItems = this.stockService.getStock();
            console.log(skladItems.length > 0 ? 'sklad is done !' : 'sklad dont loaded');
            await ctx.reply('🌐 Идёт поиск по сайтам поставщиков. Пожалуйста, подождите...');
            const start = performance.now();
            const { messages, rows } = await (0, comparator_exelFiles_1.compareItems)(inputItems, skladItems);
            const durationSec = ((performance.now() - start) / 1000).toFixed(2);
            const resultBuffer = (0, generator_createResultExcel_1.createResultExcelBuffer)(rows);
            await ctx.reply(`⏱ Операция заняла ${durationSec} секунд.`);
            await ctx.replyWithDocument({
                source: resultBuffer,
                filename: 'result.xlsx',
            });
            ctx.session.step = undefined;
            const x = await (0, manu_1.getMainMenuKeyboard)(ctx.from?.username || '', this.userService);
            await ctx.reply('👇 Выберите, что хотите сделать дальше:', {
                parse_mode: 'MarkdownV2',
                ...x,
            });
        }
        catch (err) {
            console.error('Ошибка при обработке Excel:', err);
            await ctx.reply('❌ Не удалось обработать файл.');
        }
    }
};
exports.DocumentHandler = DocumentHandler;
exports.DocumentHandler = DocumentHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        stock_service_1.StockService])
], DocumentHandler);
//# sourceMappingURL=document.handler.js.map
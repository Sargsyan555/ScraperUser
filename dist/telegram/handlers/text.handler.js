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
exports.TextHandler = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../authorization/users.service");
const stock_service_1 = require("../../stock/stock.service");
const validator_1 = require("../utils/validator");
const comparator_textMsg_1 = require("../textMsg/comparator.textMsg");
let TextHandler = class TextHandler {
    usersService;
    stockService;
    constructor(usersService, stockService) {
        this.usersService = usersService;
        this.stockService = stockService;
    }
    async handle(ctx) {
        if (ctx.session.step === "single_part_request") {
            const start = performance.now();
            const message = ctx.message;
            const textMessage = message?.text?.trim();
            if (!textMessage) {
                await ctx.reply("❌ Пожалуйста, отправьте текстовое сообщение.");
                return;
            }
            const parts = textMessage.split(",").map((part) => part.trim());
            let artikul = "";
            let qtyStr = "1";
            let brand = "";
            if (parts.length === 3) {
                [artikul, qtyStr, brand] = parts;
            }
            else if (parts.length === 2) {
                let second;
                [artikul, second] = parts;
                if (!isNaN(Number(second))) {
                    qtyStr = second;
                }
                else {
                    brand = second;
                }
            }
            else if (parts.length === 1) {
                artikul = parts[0];
            }
            else {
                await ctx.reply("❌ Неверный формат. Пример: 1979322, 1, CAT");
                return;
            }
            const qty = Number(qtyStr);
            if (!artikul || isNaN(qty) || qty < 1) {
                await ctx.reply("❌ Неверные данные. Пример: 1979322, 1, CAT");
                return;
            }
            await ctx.reply("🔄 Запрос принят! Ищем информацию, пожалуйста, подождите...");
            const nameItem = (0, validator_1.normalizeInput)(artikul);
            const checkItem = { name: nameItem, qty, brand };
            try {
                const skladItems = this.stockService.getStock();
                const { messages } = await (0, comparator_textMsg_1.compareItemTextHandler)(checkItem, skladItems);
                await ctx.reply(messages);
                const durationSec = ((performance.now() - start) / 1000).toFixed(2);
                await ctx.reply(`⏱ Операция заняла ${durationSec} секунд.`);
            }
            catch (error) {
                console.error("Ошибка при запросе цены и наличия:", error);
                await ctx.reply("❌ Произошла ошибка при получении информации о товаре. Попробуйте снова позже.");
            }
            ctx.session.step = undefined;
            console.log(performance.now() - start, "----verjnakan text------");
            await ctx.reply("📄 Отправьте текст или Excel-файл, и мы его обработаем.\n\n" +
                "📌 Также можете отправить вручную в одном из следующих форматов:\n\n" +
                "✅ Полный формат: 12345, 1, CAT\n" +
                "✅ Без бренда: 12345, 1\n" +
                "✅ Без количества: 12345, CAT\n" +
                "✅ Только артикул: 12345\n\n" +
                "🔁 Порядок: артикул, количество, бренд\n" +
                "❗️ Разделяйте значения запятой и соблюдайте порядок.");
        }
    }
};
exports.TextHandler = TextHandler;
exports.TextHandler = TextHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        stock_service_1.StockService])
], TextHandler);
//# sourceMappingURL=text.handler.js.map
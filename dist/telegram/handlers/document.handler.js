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
const generator_createResultExcel_1 = require("../exel/generator.createResultExcel");
const manu_1 = require("../utils/manu");
const users_service_1 = require("../authorization/users.service");
const stock_service_1 = require("../../stock/stock.service");
const cache_service_1 = require("../cache/cache.service");
const validator_1 = require("../utils/validator");
const telegram_service_1 = require("../telegram.service");
let DocumentHandler = class DocumentHandler {
    userService;
    stockService;
    excelCacheLoaderService;
    constructor(userService, stockService, excelCacheLoaderService) {
        this.userService = userService;
        this.stockService = stockService;
        this.excelCacheLoaderService = excelCacheLoaderService;
    }
    async handle(ctx) {
        const message = ctx.message;
        if (!message || !("document" in message)) {
            return ctx.reply("❌ Пожалуйста, отправьте Excel‑файл.");
        }
        const { document } = message;
        const fileName = document.file_name ?? "";
        if (!/\.xlsx?$/.test(fileName)) {
            return ctx.reply("❌ Загрузите файл с расширением `.xlsx` или `.xls`");
        }
        try {
            await ctx.reply("🔍 Идёт проверка по складу...");
            const inputItems = await (0, parse_and_read_1.parseExcelFromTelegram)(document.file_id, ctx.telegram);
            const start = performance.now();
            if (!inputItems.length) {
                return ctx.reply("Ваш файл Excel пустой.");
            }
            const skladItems = this.stockService.getStock();
            console.log(skladItems.length > 0 ? "sklad is done !" : "sklad dont loaded");
            await ctx.reply("🌐 Идёт поиск по сайтам поставщиков. Пожалуйста, подождите...");
            const finalResult = [];
            console.log(inputItems);
            inputItems.forEach((element) => {
                let article = element["кат.номер"];
                const qtyStr = element["кол-во"] || 1;
                article = (0, validator_1.normalizeInput)(article);
                const data = this.excelCacheLoaderService.getExcelData();
                let combinedDataBySource = {
                    Sklad: data.Sklad[article] || [],
                    Solid: data.Solid[article] || [],
                    Seltex: data.Seltex[article] || [],
                    SeventyFour: data.SeventyFour[article] || [],
                    IstkDeutz: data.IstkDeutz[article] || [],
                    Voltag: data.Voltag[article] || [],
                    Shtren: data.Shtren[article] || [],
                    UdtTexnika: data.UdtTexnika[article] || [],
                    Camspart: data.Camspart[article] || [],
                    Dvpt: data.Dvpt[article] || [],
                    Pcagroup: data.Pcagroup[article] || [],
                    Imachinery: data.Imachinery[article] || [],
                };
                combinedDataBySource = filterValidPriceProducts(combinedDataBySource);
                const best = (0, telegram_service_1.getLowestPriceProduct)(combinedDataBySource);
                const lowestPrice = best ? best.product.price : 0;
                const total = lowestPrice * qtyStr;
                finalResult.push({
                    name: article,
                    kalichestvo: qtyStr,
                    luchshayaCena: lowestPrice,
                    summa: total,
                    luchshiyPostavshik: best?.shop,
                });
            });
            console.log(finalResult);
            const filePath = (0, generator_createResultExcel_1.createResultExcelBuffer)(finalResult);
            await ctx.replyWithDocument({
                source: filePath,
                filename: "seltex-products.xlsx",
            });
            const durationSec = ((performance.now() - start) / 1000).toFixed(2);
            await ctx.reply(`⏱ Операция заняла ${durationSec} секунд.`);
            ctx.session.step = undefined;
            const x = await (0, manu_1.getMainMenuKeyboard)(ctx.from?.username || "", this.userService);
            await ctx.reply("👇 Выберите, что хотите сделать дальше:", {
                parse_mode: "MarkdownV2",
                ...x,
            });
        }
        catch (err) {
            console.error("Ошибка при обработке Excel:", err);
            await ctx.reply("❌ Не удалось обработать файл.");
        }
    }
};
exports.DocumentHandler = DocumentHandler;
exports.DocumentHandler = DocumentHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        stock_service_1.StockService,
        cache_service_1.ExcelCacheLoaderService])
], DocumentHandler);
function filterValidPriceProducts(dataBySource) {
    const result = {};
    for (const source in dataBySource) {
        const products = dataBySource[source];
        result[source] = products
            .map((product) => {
            const rawPrice = product.price;
            if (rawPrice > 0) {
                return {
                    ...product,
                    price: rawPrice,
                };
            }
            return null;
        })
            .filter((p) => p !== null);
    }
    return result;
}
//# sourceMappingURL=document.handler.js.map
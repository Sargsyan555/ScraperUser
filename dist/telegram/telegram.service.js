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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
exports.getLowestPriceProduct = getLowestPriceProduct;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const start_handler_1 = require("./handlers/start.handler");
const text_handler_1 = require("./handlers/text.handler");
const help_handler_1 = require("./handlers/help.handler");
const document_handler_1 = require("./handlers/document.handler");
const users_service_1 = require("./authorization/users.service");
const user_handleer_1 = require("./handlers/user.handleer");
const fs_1 = require("fs");
const path_1 = require("path");
const cache_service_1 = require("./cache/cache.service");
const validator_1 = require("./utils/validator");
const camsarts_1 = require("./exel/camsarts");
let TelegramService = class TelegramService {
    bot;
    startHandler;
    textHandler;
    helpHandler;
    documentHandler;
    userHandler;
    usersService;
    camspart;
    excelCacheLoaderService;
    constructor(bot, startHandler, textHandler, helpHandler, documentHandler, userHandler, usersService, camspart, excelCacheLoaderService) {
        this.bot = bot;
        this.startHandler = startHandler;
        this.textHandler = textHandler;
        this.helpHandler = helpHandler;
        this.documentHandler = documentHandler;
        this.userHandler = userHandler;
        this.usersService = usersService;
        this.camspart = camspart;
        this.excelCacheLoaderService = excelCacheLoaderService;
    }
    async onStart(ctx) {
        await this.startHandler.handle(ctx);
    }
    async onHelp(ctx) {
        await this.helpHandler.handle(ctx);
    }
    async onMessage(ctx) {
        const message = ctx.message;
        if (!message) {
            await ctx.reply("⚠️ Не удалось прочитать сообщение.");
            return;
        }
        if (ctx.session.step === "add_user" || ctx.session.step === "delete_user") {
            await ctx.sendChatAction("typing");
            await ctx.reply("⌛ Пожалуйста, подождите, идет обработка...");
            await this.textHandler.handle(ctx);
            return;
        }
        if ("document" in message) {
            ctx.session.step = "document";
            await ctx.reply("📂 Вы отправили файл. Пожалуйста, подождите, идет обработка...");
            await this.documentHandler.handle(ctx);
        }
        else if ("text" in message) {
            ctx.session.step = "single_part_request";
            const textMessage = message?.text?.trim();
            if (!textMessage) {
                await ctx.reply("❌ Пожалуйста, отправьте текстовое сообщение.");
                return;
            }
            console.log("esiaaaa anummmmm");
            const parts = textMessage.split(",").map((part) => part.trim());
            let artikul = "";
            let qtyStr = "1";
            let brand = "";
            if (parts.length === 3) {
                [artikul, qtyStr, brand] = parts;
                const num = Number(qtyStr);
                if (!isNaN(num) && isFinite(num) && num > 0) {
                    await ctx.reply("❌ Неверный формат. Пример: 1979322, 1, CAT");
                }
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
            const articul = (0, validator_1.normalizeInput)(artikul);
            await ctx.reply("✉️ Вы отправили текст. Пожалуйста, подождите, идет обработка...");
            const article = articul;
            const data = this.excelCacheLoaderService.getExcelData();
            const combinedDataBySource = {
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
            const validPriceData = filterValidPriceProducts(combinedDataBySource);
            let lowestPrice = null;
            let resultToTelegram = "";
            console.error(brand);
            if (brand) {
                const { matchedBrand } = filterProductsByBrand(validPriceData, brand);
                lowestPrice = getLowestPriceProduct(matchedBrand);
                if (!lowestPrice) {
                    resultToTelegram += `❌ ${article}: не найдено ни одной цены с этим брендом`;
                }
            }
            else {
                lowestPrice = getLowestPriceProduct(validPriceData);
            }
            if (!lowestPrice || lowestPrice.product.price === 0) {
                resultToTelegram += `❌ ${article}: не найдено ни одной цены`;
            }
            else {
                const totalPrice = lowestPrice.product.price * qty;
                resultToTelegram += `✅ Кат.номер: ${article} | 🏷️ Цена: ${lowestPrice.product.price}₽ | 🏪 Магазин: "${lowestPrice.shop}" | 💰 Итог: ${totalPrice}₽ | 🏷️ Бренд: ${lowestPrice.product.brand}`;
            }
            await ctx.reply(resultToTelegram);
        }
        else {
            await ctx.reply("⚠️ Неподдерживаемый тип сообщения.");
        }
    }
    async onTemplateExcelDownload(ctx) {
        let filePath = (0, path_1.join)(process.cwd(), "dist", "assets", "template.xlsx");
        if (!(0, fs_1.existsSync)(filePath)) {
            filePath = (0, path_1.join)(process.cwd(), "src", "assets", "template.xlsx");
        }
        try {
            await ctx.replyWithDocument({
                source: (0, fs_1.createReadStream)(filePath),
                filename: "Шаблон.xlsx",
            });
        }
        catch (error) {
            console.error("Ошибка при отправке шаблона Excel:", error);
            await ctx.reply("❌ Не удалось отправить файл шаблона.");
        }
    }
    async onScrapPages(ctx) {
        try {
            await ctx.answerCbQuery("Starting to scrape pages...");
            const filepath = await this.camspart.scrapeAndExport();
            console.log(filepath);
            await ctx.replyWithDocument({
                source: filepath,
            });
        }
        catch (error) {
            console.error("Error during scraping:", error.message);
            try {
                await ctx.reply("❌ An error occurred during scraping.");
            }
            catch (e) {
                console.error("Failed to send reply:", e.message);
            }
        }
    }
};
exports.TelegramService = TelegramService;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onStart", null);
__decorate([
    (0, nestjs_telegraf_1.Help)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onHelp", null);
__decorate([
    (0, nestjs_telegraf_1.On)("message"),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onMessage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)("template_excel_download"),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onTemplateExcelDownload", null);
__decorate([
    (0, nestjs_telegraf_1.Action)("scrape_seltex"),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onScrapPages", null);
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Update)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        start_handler_1.StartHandler,
        text_handler_1.TextHandler,
        help_handler_1.HelpHandler,
        document_handler_1.DocumentHandler,
        user_handleer_1.UserHandler,
        users_service_1.UsersService,
        camsarts_1.ScraperCamspartService,
        cache_service_1.ExcelCacheLoaderService])
], TelegramService);
function filterProductsByBrand(combinedDataBySource, userBrend) {
    const matchedBrand = {};
    for (const source in combinedDataBySource) {
        const products = combinedDataBySource[source];
        matchedBrand[source] = [];
        for (const product of products) {
            const isMatch = userBrend.toLowerCase().trim() === product.brand?.toLowerCase().trim();
            console.log("userBrend.toLowerCase().trim() === product.brand?.toLowerCase().trim()", userBrend.toLowerCase().trim(), product.brand?.toLowerCase().trim());
            if (isMatch) {
                matchedBrand[source].push(product);
            }
            else {
                const slicedTitle = product.title.split(" ");
                const bool = slicedTitle.some((b) => {
                    if (b.toLowerCase() === userBrend.toLowerCase()) {
                        product.brand = b;
                        return b.toLowerCase() === userBrend.toLowerCase();
                    }
                });
                if (bool) {
                    matchedBrand[source].push(product);
                }
            }
        }
    }
    return {
        matchedBrand,
    };
}
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
function getLowestPriceProduct(data) {
    let bestProduct = null;
    let bestShop = null;
    for (const shop in data) {
        const products = data[shop];
        for (const product of products) {
            if (!bestProduct || product.price < bestProduct.price) {
                bestProduct = product;
                bestShop = shop;
            }
        }
    }
    if (bestProduct && bestShop) {
        return { shop: bestShop, product: bestProduct };
    }
    return null;
}
function getLowestPriceNotMatchProduct(data) {
    let bestProduct = null;
    let bestShop = null;
    for (const shop in data) {
        const products = data[shop];
        for (const product of products) {
            if (!bestProduct || product.price < bestProduct.price) {
                bestProduct = product;
                bestShop = shop;
            }
        }
    }
    if (bestProduct && bestShop) {
        return { shop: bestShop, product: bestProduct };
    }
    return null;
}
//# sourceMappingURL=telegram.service.js.map
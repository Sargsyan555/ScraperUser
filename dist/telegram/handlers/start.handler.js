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
exports.StartHandler = void 0;
const common_1 = require("@nestjs/common");
const manu_1 = require("../utils/manu");
const users_service_1 = require("../authorization/users.service");
let StartHandler = class StartHandler {
    userService;
    templateLink = process.env.YANDEX_LINK || "";
    scraperService;
    constructor(userService) {
        this.userService = userService;
    }
    async handle(ctx) {
        const telegramUsername = ctx.from?.username;
        if (!telegramUsername) {
            await ctx.reply("❌ Не удалось определить ваш Telegram username.");
            return;
        }
        const isAdmin = await this.userService.isAdmin(telegramUsername);
        if (!isAdmin) {
            return;
        }
        const x = await (0, manu_1.getMainMenuKeyboard)(ctx.from?.username || "", this.userService);
        await ctx.reply("👋 *Добро пожаловать в бота по поиску цен на запчасти\\!*", {
            parse_mode: "MarkdownV2",
            ...x,
        });
        await ctx.reply("📄 Отправьте текст или Excel-файл, и мы его обработаем.\n\n" +
            "📌 Также можете отправить вручную в одном из следующих форматов:\n\n" +
            "✅ Полный формат: 12345, 1, CAT\n" +
            "✅ Без бренда: 12345, 1\n" +
            "✅ Без количества: 12345, CAT\n" +
            "✅ Только артикул: 12345\n\n" +
            "🔁 Порядок: артикул, количество, бренд\n" +
            "❗️ Разделяйте значения запятой и соблюдайте порядок.");
    }
};
exports.StartHandler = StartHandler;
exports.StartHandler = StartHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], StartHandler);
//# sourceMappingURL=start.handler.js.map
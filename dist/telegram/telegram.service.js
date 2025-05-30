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
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const start_handler_1 = require("./handlers/start.handler");
const text_handler_1 = require("./handlers/text.handler");
const help_handler_1 = require("./handlers/help.handler");
const axios_1 = require("@nestjs/axios");
const document_handler_1 = require("./handlers/document.handler");
const users_service_1 = require("./authorization/users.service");
const user_handleer_1 = require("./handlers/user.handleer");
const manu_1 = require("./utils/manu");
const fs_1 = require("fs");
const path_1 = require("path");
let TelegramService = class TelegramService {
    bot;
    httpService;
    startHandler;
    textHandler;
    helpHandler;
    documentHandler;
    userHandler;
    usersService;
    constructor(bot, httpService, startHandler, textHandler, helpHandler, documentHandler, userHandler, usersService) {
        this.bot = bot;
        this.httpService = httpService;
        this.startHandler = startHandler;
        this.textHandler = textHandler;
        this.helpHandler = helpHandler;
        this.documentHandler = documentHandler;
        this.userHandler = userHandler;
        this.usersService = usersService;
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
            await ctx.reply("✉️ Вы отправили текст. Пожалуйста, подождите, идет обработка...");
            await this.textHandler.handle(ctx);
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
    async onAddUser(ctx) {
        ctx.session.step = "add_user";
        await ctx.answerCbQuery();
        await ctx.reply("Пожалуйста, введите Username(James123) пользователя.");
    }
    async onDeleteUser(ctx) {
        ctx.session.step = "delete_user";
        await ctx.answerCbQuery();
        await ctx.reply("Пожалуйста, введите Username(James123)  пользователя.");
    }
    async onAllUsers(ctx) {
        await this.userHandler.handle(ctx);
        await ctx.reply("Пожалуйста, выберите, что вы хотите сделать:\n— ✍️ Написать сообщение пользователю\n— 📎 Отправить файл пользователю\n— 👥 Работать с несколькими пользователями", {
            parse_mode: "MarkdownV2",
            ...(await (0, manu_1.getMainMenuKeyboard)(ctx.from?.username || "", this.usersService)),
        });
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
    (0, nestjs_telegraf_1.Action)("add_user"),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onAddUser", null);
__decorate([
    (0, nestjs_telegraf_1.Action)("delete_user"),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onDeleteUser", null);
__decorate([
    (0, nestjs_telegraf_1.Action)("all_users"),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramService.prototype, "onAllUsers", null);
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Update)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        axios_1.HttpService,
        start_handler_1.StartHandler,
        text_handler_1.TextHandler,
        help_handler_1.HelpHandler,
        document_handler_1.DocumentHandler,
        user_handleer_1.UserHandler,
        users_service_1.UsersService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map
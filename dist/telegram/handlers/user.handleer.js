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
exports.UserHandler = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../authorization/users.service");
let UserHandler = class UserHandler {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async handle(ctx) {
        const users = await this.userService.getAllUsers();
        if (!users.length) {
            await ctx.reply('ℹ️ Пока нет зарегистрированных пользователей.');
        }
        else {
            const message = users
                .map((u, i) => `${i + 1}. 🆔 ${u.telegramUsername}` +
                (u.telegramUsername ? ` | 👤 @${u.telegramUsername}` : ''))
                .join('\n');
            await ctx.reply(`📋 Зарегистрированные пользователи:\n\n${message}`);
        }
        ctx.session.step = undefined;
    }
};
exports.UserHandler = UserHandler;
exports.UserHandler = UserHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UserHandler);
//# sourceMappingURL=user.handleer.js.map
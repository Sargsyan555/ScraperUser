"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const telegram_service_1 = require("./telegram.service");
const axios_1 = require("@nestjs/axios");
const start_handler_1 = require("./handlers/start.handler");
const text_handler_1 = require("./handlers/text.handler");
const help_handler_1 = require("./handlers/help.handler");
const document_handler_1 = require("./handlers/document.handler");
const users_service_1 = require("./authorization/users.service");
const mongoose_1 = require("@nestjs/mongoose");
const schema_1 = require("./authorization/schema/schema");
const user_handleer_1 = require("./handlers/user.handleer");
const cache_service_1 = require("./cache/cache.service");
const schedule_1 = require("@nestjs/schedule");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                useFactory: () => ({
                    token: "7080107656:AAEnyCl5SAt7EyvFSI-wR8z-V4bByx98VDg",
                    middlewares: [(0, telegraf_1.session)()],
                }),
            }),
            axios_1.HttpModule,
            mongoose_1.MongooseModule.forFeature([{ name: schema_1.User.name, schema: schema_1.UserSchema }]),
            schedule_1.ScheduleModule.forRoot(),
        ],
        providers: [
            telegram_service_1.TelegramService,
            start_handler_1.StartHandler,
            help_handler_1.HelpHandler,
            text_handler_1.TextHandler,
            document_handler_1.DocumentHandler,
            user_handleer_1.UserHandler,
            users_service_1.UsersService,
            cache_service_1.ExcelCacheLoaderService,
        ],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map
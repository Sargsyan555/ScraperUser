"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const telegram_module_1 = require("./telegram/telegram.module");
const dotenv = require("dotenv");
const mongoose_1 = require("@nestjs/mongoose");
const schema_1 = require("./telegram/authorization/schema/schema");
dotenv.config();
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot("mongodb+srv://eriktoros:210621Er$@bot.jrpaust.mongodb.net/?retryWrites=true&w=majority&appName=bot"),
            mongoose_1.MongooseModule.forFeature([{ name: schema_1.User.name, schema: schema_1.UserSchema }]),
            telegram_module_1.TelegramModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
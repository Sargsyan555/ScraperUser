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
const stock_module_1 = require("../stock/stock.module");
const scraperService_1 = require("./exel/scraperService");
const voltag_1 = require("./exel/voltag");
const truckdrive_1 = require("./exel/truckdrive");
const shtern_1 = require("./exel/shtern");
const udtTexnika_1 = require("./exel/udtTexnika");
const recamgr_1 = require("./exel/recamgr");
const imachinery_1 = require("./exel/imachinery");
const pcagroup_1 = require("./exel/pcagroup");
const camsarts_1 = require("./exel/camsarts");
const intertrek_1 = require("./exel/intertrek");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            stock_module_1.StockModule,
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                useFactory: () => ({
                    token: "7720246807:AAEWSZ63-s2m8bhOIhlN2hsy6NkuWAkM6Dg",
                    middlewares: [(0, telegraf_1.session)()],
                }),
            }),
            axios_1.HttpModule,
            mongoose_1.MongooseModule.forFeature([{ name: schema_1.User.name, schema: schema_1.UserSchema }]),
        ],
        providers: [
            stock_module_1.StockModule,
            telegram_service_1.TelegramService,
            start_handler_1.StartHandler,
            help_handler_1.HelpHandler,
            text_handler_1.TextHandler,
            document_handler_1.DocumentHandler,
            user_handleer_1.UserHandler,
            users_service_1.UsersService,
            voltag_1.VoltagService,
            scraperService_1.ScraperService,
            truckdrive_1.TruckdriveService,
            shtern_1.ProductScraperService,
            udtTexnika_1.ScraperServiceUdt,
            recamgr_1.ScraperRecamgrService,
            imachinery_1.ScraperImachineryService,
            pcagroup_1.ScraperPcaGroupService,
            camsarts_1.ScraperCamspartService,
            intertrek_1.CrawlerService,
        ],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map
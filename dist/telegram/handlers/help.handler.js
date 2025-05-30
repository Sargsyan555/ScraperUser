"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpHandler = void 0;
const common_1 = require("@nestjs/common");
let HelpHandler = class HelpHandler {
    async handle(ctx) {
        await ctx.reply('Напишите артикул детали или загрузите Excel‑файл, содержащий артикулы и количество деталей.');
    }
};
exports.HelpHandler = HelpHandler;
exports.HelpHandler = HelpHandler = __decorate([
    (0, common_1.Injectable)()
], HelpHandler);
//# sourceMappingURL=help.handler.js.map
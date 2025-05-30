"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainMenuKeyboard = getMainMenuKeyboard;
const telegraf_1 = require("telegraf");
async function getMainMenuKeyboard(username, usersService) {
    const buttons = [
        [
            telegraf_1.Markup.button.callback("📥 Скачать шаблон Excel", "template_excel_download"),
        ],
    ];
    return telegraf_1.Markup.inlineKeyboard(buttons);
}
//# sourceMappingURL=manu.js.map
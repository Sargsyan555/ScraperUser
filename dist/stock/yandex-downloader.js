"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFromYandexDisk = downloadFromYandexDisk;
const axios_1 = require("axios");
async function downloadFromYandexDisk() {
    const fileUrl = 'https://disk.yandex.ru/i/FE5LjEWujhR0Xg';
    const response = await axios_1.default.get(fileUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}
//# sourceMappingURL=yandex-downloader.js.map
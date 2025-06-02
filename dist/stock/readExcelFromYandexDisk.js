"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readExcelFromYandexDisk = readExcelFromYandexDisk;
const XLSX = require("xlsx");
async function readExcelFromYandexDisk(publicUrl) {
    const yandexApiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicUrl)}`;
    const res = await fetch(yandexApiUrl);
    const data = await res.json();
    if (!data.href) {
        throw new Error("Failed to get Yandex Disk download link");
    }
    const fileResponse = await fetch(data.href);
    const arrayBuffer = await fileResponse.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const rows = json
        .slice(1)
        .filter((row) => Array.isArray(row))
        .map((row) => ({
        "кат.номер": row[0] !== undefined ? String(row[0]).trim() : "",
        "название детали": row[1] !== undefined ? String(row[1]).trim() : "",
        "кол-во": row[2] !== undefined ? Number(row[2]) : 0,
        "цена, RUB": row[3] !== undefined ? Number(row[3]) : 0,
        "сумма, RUB": row[4] !== undefined ? Number(row[4]) : 0,
    }))
        .filter((row) => row["кат.номер"] !== "");
    return rows;
}
//# sourceMappingURL=readExcelFromYandexDisk.js.map
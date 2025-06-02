"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResultExcelBuffer = createResultExcelBuffer;
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
function createResultExcelBuffer(rows) {
    const headers = [
        "кат.номер",
        "кол-во",
        "лучшая цена",
        "сумма",
        "лучший поставщик",
    ];
    const data = rows.map((row) => {
        return [
            row.name,
            row.kalichestvo,
            row.luchshayaCena,
            row.summa,
            row.luchshiyPostavshik,
        ];
    });
    const sheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const outputDir = path.join(__dirname, "..", "..", "exports");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const filePath = path.join(outputDir, `report-${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, filePath);
    return filePath;
}
//# sourceMappingURL=generator.createResultExcel.js.map
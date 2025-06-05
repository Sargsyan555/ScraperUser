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
        "sklad",
        "seltex",
        "solid-t",
        "imachinery",
        "74parts",
        "b2b.ixora-auto",
        "vip.blumaq",
        "pcagroup",
        "spb.camsparts",
        "voltag",
        "dv-pt",
        "istk-deutz",
        "shtern",
        "udtTechnika",
    ];
    const data = rows.map((row) => {
        return [
            row.name,
            row.kalichestvo,
            row.luchshayaCena,
            row.summa,
            row.luchshiyPostavshik,
            formatSuppliers(row.sklad),
            formatSuppliers(row.seltex),
            formatSuppliers(row["solid-t"]),
            formatSuppliers(row.imachinery),
            formatSuppliers(row["74parts"]),
            formatSuppliers(row["b2b.ixora-auto"]),
            formatSuppliers(row["vip.blumaq"]),
            formatSuppliers(row["solid-t"]),
            formatSuppliers(row.pcagroup),
            formatSuppliers(row["spb.camsparts"]),
            formatSuppliers(row.voltag),
            formatSuppliers(row["dv-pt"]),
            formatSuppliers(row["istk-deutz"]),
            formatSuppliers(row.shtern),
            formatSuppliers(row.udtTechnika),
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
function formatSuppliers(value) {
    if (Array.isArray(value)) {
        if (value.length === 0)
            return "";
        if (typeof value[0] === "object" && value[0] !== null) {
            return value
                .map((entry) => {
                const brand = entry.brand ? `${entry.brand}` : "NoBrand";
                const price = entry.price ?? "-";
                return `${brand}: ${price}₽`;
            })
                .join(" || ");
        }
        if (value.length === 2) {
            return value.join(", ");
        }
        return String(value);
    }
    return String(value ?? "");
}
//# sourceMappingURL=generator.createResultExcel.js.map
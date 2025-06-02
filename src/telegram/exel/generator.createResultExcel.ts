import * as XLSX from "xlsx";
import { ResultRowTest } from "./exel.types";
import * as fs from "fs";
import * as path from "path";
/** Build an Excel workbook entirely in memory and return it as a Buffer. */
export function createResultExcelBuffer(rows: ResultRowTest[]): string {
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

import * as XLSX from 'xlsx';

type ExcelRow = {
  Articul?: string;
  Name?: string;
  Price?: string | number;
  Brand?: string;
};

type ProductData = {
  Articul?: string;
  Name?: string;
  Price?: string | number;
  Brand?: string;
};

const productsByArticle: Record<string, ProductData> = {};

function loadExcelData() {
  const workbook = XLSX.readFile('src/telegram/scraper/shtren.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const sheetData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  for (const row of sheetData) {
    if (row.Articul) {
      const key = String(row.Articul).trim();
      productsByArticle[key] = {
        Name: row.Name || '-',
        Price:
          typeof row.Price === 'string'
            ? parseInt(row.Price.replace(/[^\d]/g, ''), 10) || 0
            : row.Price || 0,
        Brand: row.Brand || '-',
      };
    }
  }
}

loadExcelData();
console.log('Shtren Exel db is Done ');

export function findProductByShtren(article: string): ProductData | null {
  const key = article.trim();
  return productsByArticle[key] || null;
}

export { productsByArticle };

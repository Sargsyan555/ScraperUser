import * as XLSX from 'xlsx';

type ExcelRow = {
  article?: string;
  name?: string;
  price?: string | number;
  brand?: string;
};

type ProductData = {
  Articul?: string;
  Name?: string;
  Price?: string | number;
  Brand?: string;
};

const productsByArticle: Record<string, ProductData> = {};

function loadExcelData() {
  const workbook = XLSX.readFile('src/telegram/scraper/voltag.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const sheetData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  for (const row of sheetData) {
    if (row.article) {
      const key = String(row.article).trim();
      productsByArticle[key] = {
        Name: row.name || '-',
        Price:
          typeof row.price === 'string'
            ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
            : row.price || 0,
        Brand: row.brand || '-',
      };
    }
  }
}

loadExcelData();
console.log('Voltag Exel db is Done ');

export function findProductByVoltag(article: string): ProductData | null {
  const key = article.trim();
  return productsByArticle[key] || null;
}

export { productsByArticle };

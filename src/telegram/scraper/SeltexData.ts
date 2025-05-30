import * as XLSX from 'xlsx';

type ExcelRow = {
  name?: string;
  brand?: string;
  articul?: string;
  'all numbers'?: string;
  price?: number | string;
  stock?: string | number;
  'stock msk'?: string;
  'stock mpb'?: string;
};

type ProductData = {
  name?: string;
  'all numbers'?: string;
  title?: string;
  price?: number | string;
  stock?: string | number;
  brand?: string;
  'stock msk'?: string;
  'stock mpb'?: string;
  articul?: string;
};

const productsByArticle: Record<string, ProductData> = {};

function loadExcelData() {
  const workbook = XLSX.readFile('src/telegram/scraper/SeltexPrice.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const sheetData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  for (const row of sheetData) {
    if (row['all numbers']) {
      // Разбиваем по `/`, очищаем пробелы, удаляем пустые строки
      const articles = String(row['all numbers'])
        .split('/')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      for (const key of articles) {
        productsByArticle[key] = {
          name: row.name || '-',
          price:
            typeof row.price === 'string'
              ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
              : row.price || 0,
          stock: row.stock || '-',
          brand: row.brand || '-',
          'stock msk': row['stock msk'] || '-',
          'stock mpb': row['stock mpb'] || '-',
        };
      }
    }
  }
}

loadExcelData();
console.log('Seltex Exel db is Done ');

export function findProductBySeltex(article: string): ProductData | null {
  const key = article.trim();
  return productsByArticle[key] || null;
}

export { productsByArticle };

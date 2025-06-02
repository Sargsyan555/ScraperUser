import * as XLSX from 'xlsx';

type ExcelRow = {
  articul?: string;
  title?: string;
  price?: number | string;
  stock?: string | number;
};

type ProductData = {
  title: string;
  price: number;
  stock: string | number;
};

const productsByArticul: Record<string, ProductData[]> = {};

function loadExcelData() {
  const workbook = XLSX.readFile('src/telegram/scraper/istk-deutzZ.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const sheetData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  for (const row of sheetData) {
    if (row.articul) {
      const key = String(row.articul).trim();

      const product: ProductData = {
        title: row.title || '-',
        price:
          typeof row.price === 'string'
            ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
            : row.price || 0,
        stock: row.stock || '-',
      };

      if (!productsByArticul[key]) {
        productsByArticul[key] = [];
      }

      productsByArticul[key].push(product);
    }
  }
}

loadExcelData();
console.log('istd Exel db is Done ');

export function findProductsByistkDeutz(articul: string): ProductData[] {
  const key = articul.trim();
  return productsByArticul[key] || [];
}

export { productsByArticul };

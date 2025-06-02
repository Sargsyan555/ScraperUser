import * as XLSX from 'xlsx';

type ExcelRow = {
  article?: string;
  title?: string;
  price?: number | string;
  availability?: string | number;
};

type ProductData = {
  article?: string;
  title?: string;
  price?: number | string;
  availability?: string | number;
};

const productsByArticle: Record<string, ProductData[]> = {};

function loadExcelData() {
  const workbook = XLSX.readFile('src/telegram/scraper/74PartBase.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const sheetData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  for (const row of sheetData) {
    if (row.article) {
      const key = String(row.article).trim();

      const product: ProductData = {
        article: key,
        title: row.title || '-',
        price:
          typeof row.price === 'string'
            ? parseInt(row.price.replace(/[^\d]/g, ''), 10) || 0
            : row.price || 0,
        availability: row.availability || '-',
      };

      if (!productsByArticle[key]) {
        productsByArticle[key] = [];
      }

      productsByArticle[key].push(product);
    }
  }
}

loadExcelData();
console.log('74Part Exel db is Done ');

export function findProductsBy74Part(article: string): ProductData[] {
  const key = article.trim();
  return productsByArticle[key] || [];
}

export { productsByArticle };

// seventy-four-part.service.ts
import { Injectable } from '@nestjs/common';
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

@Injectable()
export class SeventyFourPartService {
  private productsByArticle: Record<string, ProductData[]> = {};

  loadExcelData() {
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

        if (!this.productsByArticle[key]) {
          this.productsByArticle[key] = [];
        }

        this.productsByArticle[key].push(product);
      }
    }

    console.log('✅ 74Part Excel DB loaded and cached.');
  }

  findProductsByArticle(article: string): ProductData[] {
    const key = article.trim();
    return this.productsByArticle[key] || [];
  }
}

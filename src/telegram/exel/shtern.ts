import { Injectable } from '@nestjs/common';
import { Worker } from 'worker_threads';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

export interface ProductShtern {
  name: string;
  price: string;
  brand: string;
  article: string;
}

@Injectable()
export class ProductScraperService {
  private readonly categories = [
    'https://xn--e1aqig3a.com/product-category/volvo/',
    'https://xn--e1aqig3a.com/product-category/deutz/',
    'https://xn--e1aqig3a.com/product-category/perkins/',
    'https://xn--e1aqig3a.com/product-category/cat/',
  ];

  async scrapeAllCategories() {
    console.log('stexa');

    const promises = this.categories.map((categoryUrl) => {
      console.log(categoryUrl);
      return this.runWorker(categoryUrl);
    });

    const results = await Promise.all(promises);
    const allProducts = results.flat();

    const excelPath = await this.saveToExcel(allProducts);
    return { products: allProducts, filePath: excelPath };
  }

  private runWorker(categoryUrl: string): Promise<ProductShtern[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, './scrape-worker.js'), {
        workerData: { baseUrl: categoryUrl },
      });

      worker.on('message', (data) => {
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  private async saveToExcel(
    products: ProductShtern[],
    filename = 'products.xlsx',
  ) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      { header: 'Articul', key: 'article', width: 20 },
      { header: 'Name', key: 'name', width: 50 },
      { header: 'Price', key: 'price', width: 20 },
      { header: 'Brand', key: 'brand', width: 20 },
    ];

    products.forEach((product) => sheet.addRow(product));

    const fullPath = path.join(__dirname, filename);
    await workbook.xlsx.writeFile(fullPath);
    console.log(`✅ Excel saved: ${fullPath}`);

    return fullPath;
  }
}

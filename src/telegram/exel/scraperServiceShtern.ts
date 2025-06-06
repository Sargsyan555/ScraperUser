import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; // 👈 импортируем Cron
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
export class ScraperServiceShtren {
  private readonly logger = new Logger(ScraperServiceShtren.name);

  private readonly categories = [
    'https://xn--e1aqig3a.com/product-category/volvo/',
    'https://xn--e1aqig3a.com/product-category/deutz/',
    'https://xn--e1aqig3a.com/product-category/perkins/',
    'https://xn--e1aqig3a.com/product-category/cat/',
  ];

  /**
   * ⏰ Запускается каждые 3 часа автоматически
   */
  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('⏰ Scheduled scraping started...');
    try {
      const { filePath } = await this.scrapeAllCategories();
      this.logger.log(`✅ Scheduled scraping finished. File: ${filePath}`);
    } catch (error) {
      this.logger.error('❌ Scheduled scraping failed:', error);
    }
  }

  constructor() {
    this.scrapeAllCategories().catch((err) =>
      this.logger.error('Initial download failed:', err),
    );
  }

  async scrapeAllCategories() {
    this.logger.log('📦 Starting scraping of all categories...');
    try {
      const promises = this.categories.map((categoryUrl) => {
        this.logger.log(`🔍 Scraping category: ${categoryUrl}`);
        return this.runWorker(categoryUrl);
      });

      const results = await Promise.all(promises);
      const allProducts = results.flat();

      const fileName = 'shtren.xlsx';
      const filePath = await this.saveToExcel(allProducts, fileName);

      this.logger.log(`✅ Scraping completed. Excel saved at: ${filePath}`);

      return { products: allProducts, filePath };
    } catch (error) {
      this.logger.error('❌ Error during scraping:', error);
      throw error;
    }
  }

  private runWorker(categoryUrl: string): Promise<ProductShtern[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        path.resolve(__dirname, './scrape-workerShtern.js'),
        {
          workerData: { baseUrl: categoryUrl },
        },
      );

      worker.on('message', (data) => {
        data.error ? reject(new Error(data.error)) : resolve(data);
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker exited with code ${code}`));
        }
      });
    });
  }

  private async saveToExcel(
    products: ProductShtern[],
    filename: string,
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      { header: 'Articul', key: 'article', width: 20 },
      { header: 'Name', key: 'name', width: 50 },
      { header: 'Price', key: 'price', width: 20 },
      { header: 'Brand', key: 'brand', width: 20 },
    ];

    products.forEach((product) => sheet.addRow(product));

    const filePath = path.join(
      process.cwd(),
      'src',
      'telegram',
      'scraper',
      filename,
    );
    await workbook.xlsx.writeFile(filePath);

    this.logger.log(`📁 Excel saved to: ${filePath}`);
    return filePath;
  }
}

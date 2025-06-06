import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as XLSX from 'xlsx';
import { parseStringPromise } from 'xml2js';
import { Worker } from 'worker_threads';

interface Product {
  brand?: string;
  article?: string;
  name?: string;
  region?: string;
  days?: number;
  price?: number;
}

@Injectable()
export class ScraperServiceVoltag {
  private readonly logger = new Logger(ScraperServiceVoltag.name);
  private readonly sitemapUrl = 'https://voltag.ru/sitemap.xml';
  private readonly outputDir = path.join(
    process.cwd(),
    '/src/telegram/scraper',
  );

  constructor() {
    this.scrapeAndSave().catch((err) =>
      this.logger.error('Initial scraping failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Running scheduled scraping...');
    try {
      await this.scrapeAndSave();
      this.logger.log('Scraping completed successfully.');
    } catch (error) {
      this.logger.error('Scheduled scraping failed:', error);
    }
  }

  private async scrapeAndSave(): Promise<void> {
    this.logger.log(`Fetching sitemap: ${this.sitemapUrl}`);

    try {
      const { data: sitemapXml } = await axios.get(this.sitemapUrl);
      const sitemapIndex = (await parseStringPromise(sitemapXml)) as {
        sitemapindex: { sitemap: { loc: string[] }[] };
      };

      const sitemapUrls = sitemapIndex.sitemapindex.sitemap.map(
        (s) => s.loc[0],
      );
      const allCatalogUrls: string[] = [];

      for (const sitemapUrl of sitemapUrls) {
        const { data: subXml } = await axios.get(sitemapUrl);
        const subResult = (await parseStringPromise(subXml)) as {
          urlset?: { url: { loc: string[] }[] };
        };

        const catalogUrls = (subResult.urlset?.url || [])
          .map((u) => u.loc[0])
          .filter((url) => url.includes('/catalog/group/'));

        allCatalogUrls.push(...catalogUrls);
      }

      const allPriceUrls = allCatalogUrls.map((url) =>
        url.replace('/catalog/group/', '/price/group/'),
      );

      const chunks = this.chunkArray(allPriceUrls, 5);
      const allProducts: Product[] = [];

      const workerPromises = chunks.map((chunk) => {
        return new Promise<Product[]>((resolve, reject) => {
          const worker = new Worker(path.join(__dirname, 'voltag.worker.js'), {
            workerData: chunk,
          });

          worker.on('message', (products: Product[]) => resolve(products));
          worker.on('error', reject);
          worker.on('exit', (code) => {
            if (code !== 0)
              reject(new Error(`Worker exited with code ${code}`));
          });
        });
      });

      const results = await Promise.all(workerPromises);
      for (const products of results) {
        allProducts.push(...products);
      }

      this.saveToExcel(allProducts);
    } catch (err) {
      this.logger.error('Error during scraping:', err.message || err);
    }
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    const chunkSize = Math.ceil(arr.length / size);
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  private saveToExcel(data: Product[]): void {
    if (!data.length) {
      this.logger.warn('No data to save to Excel.');
      return;
    }

    const sheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'VoltagProducts');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const filePath = path.join(this.outputDir, 'VoltagPrice.xlsx');
    XLSX.writeFile(workbook, filePath);
    this.logger.log(`✅ Excel saved: ${filePath}`);
  }
}

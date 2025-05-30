// voltag.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
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
export class VoltagService {
  async scrapeAllProducts(): Promise<string | undefined> {
    try {
      // 1. Get all sitemap group URLs
      const { data: sitemapXml } = await axios.get(
        'https://voltag.ru/sitemap.xml',
      );
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

      // 2. Split into 5 chunks and assign to workers
      const chunks = this.chunkArray(allPriceUrls, 5);
      const results: Product[] = [];

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

      const workerResults = await Promise.all(workerPromises);
      for (const res of workerResults) {
        results.push(...res);
      }

      // 3. Save to Excel
      return this.saveToExcel(results);
    } catch (err) {
      console.error('Error in main scraping thread:', err);
      return undefined;
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

  private saveToExcel(data: Product[]): string | undefined {
    if (!data.length) return;

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const dir = path.join(__dirname, '..', 'excels');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, 'products.xlsx');
    xlsx.writeFile(workbook, filePath);
    console.log(`✅ Excel written to ${filePath}`);
    return filePath;
  }
}

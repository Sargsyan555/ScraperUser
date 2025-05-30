import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import { Worker } from 'worker_threads';

interface ProductUdt {
  name: string;
  articul: string;
  price: string | number;
  brand: string;
}

function runWorker(url: string): Promise<ProductUdt | null> {
  return new Promise((resolve) => {
    const worker = new Worker(path.join(__dirname, 'scraper.workerUdt.js'), {
      workerData: url,
    });

    worker.on('message', (msg) => {
      if (msg.success) resolve(msg.data);
      else resolve(null);
    });

    worker.on('error', () => resolve(null));
    worker.on('exit', (code) => {
      if (code !== 0) console.warn(`Worker stopped with exit code ${code}`);
    });
  });
}

@Injectable()
export class ScraperServiceUdt {
  async scrapeAndExport(): Promise<{
    filePath: string;
    products: ProductUdt[];
  }> {
    const sitemapIndexUrl = 'https://www.udt-technika.ru/sitemap.xml';
    const sitemapXml = await axios.get(sitemapIndexUrl).then((res) => res.data);
    const sitemapParsed = await parseStringPromise(sitemapXml);

    const sitemapUrls = sitemapParsed.sitemapindex.sitemap.map(
      (s: any) => s.loc[0],
    );

    const productUrls: string[] = [];
    for (const sitemapUrl of sitemapUrls) {
      const sitemapContent = await axios
        .get(sitemapUrl)
        .then((res) => res.data);
      const urlSet = await parseStringPromise(sitemapContent);
      console.log(urlSet);
      
      const urls = urlSet.urlset.url
        .map((u: any) => u.loc[0])
        .filter((e) => e.includes('itemid'));
        console.log(urls);
        
      productUrls.push(...urls);
    }

    // Parallel scraping using worker threads
    const chunkSize = 10; // number of parallel workers per batch
    const products: ProductUdt[] = [];
    for (let i = 0; i < productUrls.length; i += chunkSize) {
      const batch = productUrls.slice(i, i + chunkSize);
      const results = await Promise.all(batch.map((url) => runWorker(url)));
      products.push(...(results.filter(Boolean) as ProductUdt[]));
    }

    // Write to Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    worksheet.columns = [
      { header: 'Артикул', key: 'articul', width: 25 },
      { header: 'Название', key: 'name', width: 40 },
      { header: 'Цена', key: 'price', width: 15 },
      { header: 'Производитель', key: 'brand', width: 30 },
    ];
    worksheet.addRows(products);

    const filePath = path.join(__dirname, '../../products.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return { filePath, products };
  }
}

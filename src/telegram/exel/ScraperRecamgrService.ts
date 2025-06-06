// src/scraper/scraper-recamgr.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as zlib from 'zlib';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

interface ProductData {
  articul: string;
  name: string;
  price: string;
  brand: string;
  url: string;
}

@Injectable()
export class ScraperRecamgrService {
  private readonly logger = new Logger(ScraperRecamgrService.name);

  constructor() {
    // Run once when the service starts
    this.scrapeAndSave().catch((err) =>
      this.logger.error('Initial scrape failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running scheduled scrape for recamgr...');
    try {
      await this.scrapeAndSave();
      this.logger.log('✅ Scheduled scrape completed successfully.');
    } catch (error) {
      this.logger.error('❌ Scheduled scrape failed:', error);
    }
  }

  private isProductUrl(url: string): boolean {
    return /\/p\/[0-9]+-/.test(url);
  }

  private async getUrlsFromGzSitemap(gzUrl: string): Promise<string[]> {
    const response = await axios.get(gzUrl, { responseType: 'arraybuffer' });
    const xmlBuffer = zlib.gunzipSync(response.data);
    const xml = xmlBuffer.toString('utf8');
    const parsed = await parseStringPromise(xml);
    return parsed.urlset.url
      .map((entry: any) => entry.loc[0])
      .filter(this.isProductUrl)
      .slice(1, 10); // you can increase limit if needed
  }

  private extractArticul(nameText: string): string {
    const parts = nameText.split(/\s|\//).reverse();
    return parts.find((p) => /[0-9\-]{5,}/.test(p)) || '';
  }

  private extractBrand($: cheerio.Root): string {
    const brandTag = $('a[title*="Запчасти"]');
    const title = brandTag.attr('title');
    if (!title) return '';
    const match = title.match(/Запчасти\s+(.*)/);
    return match ? match[1].trim() : title.trim();
  }

  private extractPrice($: cheerio.Root): string {
    const priceText = $('.goods-card__price .price__value').first().text();
    return priceText.replace(/[^\d.,]/g, '').replace(/\s/g, '');
  }

  private async scrapeAndSave(): Promise<void> {
    try {
      const sitemapUrl =
        'https://recamgr.ru/sitemap_storage__firms__28__31__31705__sitemap2.xml.gz';
      const productUrls = await this.getUrlsFromGzSitemap(sitemapUrl);

      const products: ProductData[] = [];

      for (const url of productUrls) {
        try {
          const { data } = await axios.get(url);
          const $ = cheerio.load(data);

          const nameText = $('.title.section__title h1').first().text().trim();
          const articul = this.extractArticul(nameText);
          const brand = this.extractBrand($);
          const price = this.extractPrice($);

          products.push({ articul, name: nameText, brand, price, url });
        } catch (err) {
          this.logger.warn(`Failed to scrape: ${url}`);
        }
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Products');
      worksheet.columns = [
        { header: 'Articul', key: 'articul', width: 20 },
        { header: 'Name', key: 'name', width: 50 },
        { header: 'Brand', key: 'brand', width: 30 },
        { header: 'Price', key: 'price', width: 20 },
        { header: 'URL', key: 'url', width: 50 },
      ];
      worksheet.addRows(products);

      const filePath = path.join(
        process.cwd(),
        '/src/telegram/scraper',
        'RecamgrPrice.xlsx',
      );
      await workbook.xlsx.writeFile(filePath);
      this.logger.log(`✅ Processed Excel saved: ${filePath}`);
    } catch (error) {
      this.logger.error(
        'Failed to scrape and save Excel:',
        error.message || error,
      );
    }
  }
}

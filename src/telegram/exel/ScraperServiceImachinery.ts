import axios from 'axios';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

interface Product {
  name: string;
  price: number;
  articule: string;
  brand: string;
  url: string;
}

@Injectable()
export class ScraperImachineryService {
  private readonly logger = new Logger(ScraperImachineryService.name);
  private readonly baseUrl = 'https://imachinery.ru/specialoffers/';
  private readonly maxPages = 122;
  private readonly outputFilePath = path.join(
    process.cwd(),
    'src/telegram/scraper',
    'imachinery.xlsx',
  );

  constructor() {
    this.scrapeAndExport().catch((err) =>
      this.logger.error('Initial scrape failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Running scheduled scraping for Imachinery...');
    try {
      await this.scrapeAndExport();
      this.logger.log('Scheduled scraping completed successfully.');
    } catch (error) {
      this.logger.error('Scheduled scraping failed:', error);
    }
  }

  async scrapeAndExport(): Promise<string | null> {
    try {
      const allProducts: Product[] = [];

      for (let page = 1; page <= this.maxPages; page++) {
        this.logger.log(`Scraping page ${page}...`);
        const products = await this.scrapePage(page);
        allProducts.push(...products);
      }

      this.saveToExcel(allProducts);
      this.logger.log(`✅ Excel file saved: ${this.outputFilePath}`);
      return this.outputFilePath;
    } catch (error) {
      this.logger.error(
        'Failed to scrape and export Imachinery data:',
        error.message || error,
      );
      return null;
    }
  }

  private async scrapePage(page: number): Promise<Product[]> {
    const url = page === 1 ? this.baseUrl : `${this.baseUrl}?PAGEN_2=${page}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const products: Product[] = [];

    $('div[id^="bx_"]').each((_, element) => {
      const name = $(element).find('h3.kart_name a').text().trim();
      const articule = name.split(' ')[0];
      const priceText = $(element).find('.price').text().trim();
      const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

      const tagLinks = $(element).find('.sk-tags-inner a');
      let brand = '';
      if (tagLinks.length > 0) {
        const firstText = $(tagLinks[0]).text().trim();
        const isRussian = /^[а-яА-ЯЁё\s]+$/.test(firstText);
        if (isRussian && tagLinks[1]) {
          brand = $(tagLinks[1]).text().trim();
        } else {
          brand = firstText;
        }
      }

      const link = $(element).find('h3.kart_name a').attr('href')?.trim() || '';
      const fullUrl = link ? new URL(link, this.baseUrl).href : this.baseUrl;

      products.push({ name, price, articule, brand, url: fullUrl });
    });

    return products;
  }

  private saveToExcel(products: Product[]): void {
    const worksheetData = products.map((p) => ({
      Артикул: p.articule,
      Название: p.name,
      Цена: p.price,
      Бренд: p.brand,
      Ссылка: p.url,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ImachineryProducts');
    XLSX.writeFile(workbook, this.outputFilePath);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

type ScrapedProduct = {
  url: string;
  title: string;
  price: string;
  article: string;
};

@Injectable()
export class ScraperServiceDvPt {
  private readonly sitemapUrl = 'https://dv-pt.ru/sitemap.xml';
  private readonly logger = new Logger(ScraperServiceDvPt.name);

  constructor() {
    this.fetchAndSaveUrls().catch((err) =>
      this.logger.error('Initial download failed:', err),
    );
    this.scrapeAndExport().catch((err) =>
      this.logger.error('Initial scrap from .json  failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Запущен плановый парсинг dv-pt');
    try {
      await this.fetchAndSaveUrls();
      await this.scrapeAndExport();
      this.logger.log('✅ Парсинг и экспорт завершены успешно.');
    } catch (error) {
      this.logger.error('❌ Ошибка во время планового парсинга:', error);
    }
  }

  private async fetchAndSaveUrls(): Promise<void> {
    this.logger.log(`Получение ссылок из sitemap: ${this.sitemapUrl}`);
    const response = await axios.get(this.sitemapUrl);
    const parser = new XMLParser();
    const parsed = parser.parse(response.data);
    const allUrls = parsed.urlset.url.map((item) => item.loc);

    const productUrls = allUrls.filter((url) => url.includes('/shop/goods/'));

    const filePath = path.join(process.cwd(), 'dv-pt.json');
    fs.writeFileSync(filePath, JSON.stringify(productUrls, null, 2), 'utf-8');

    this.logger.log(`Сохранено ${productUrls.length} ссылок в ${filePath}`);
  }

  private async scrapeAndExport(): Promise<void> {
    const filePath = path.join(process.cwd(), 'dv-pt.json');
    const urls: string[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const results = await this.processAll(urls, 8, 500, 300);

    const worksheet = xlsx.utils.json_to_sheet(results);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const outputFilePath = path.join(
      process.cwd(),
      '/src/telegram/scraper',
      'dvpt.xlsx',
    );
    xlsx.writeFile(workbook, outputFilePath);

    this.logger.log(`📦 Данные сохранены в файл: ${outputFilePath}`);
  }

  private async scrapePage(url: string, attempt = 1): Promise<any> {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          Referer: 'https://dv-pt.ru/',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const title = $('h1').first().text().trim();
      const price = $('.price .strong').first().text().trim();
      const article = $('.values span').first().text().trim();

      return { url, title, price, article };
    } catch (error) {
      if (error.response?.status === 403 && attempt < 3) {
        this.logger.warn(
          `⚠️ 403 Forbidden. Повтор (${attempt + 1}) для: ${url}`,
        );
        await delay(50000);
        return this.scrapePage(url, attempt + 1);
      }

      this.logger.error(`❌ Ошибка при парсинге ${url}: ${error.message}`);
      return { url, title: '', price: '', article: '', error: error.message };
    }
  }

  private async processAll(
    urls: string[],
    concurrency = 7,
    perRequestDelay = 500,
    startDelayStep = 300,
  ): Promise<any[]> {
    const results: ScrapedProduct[] = [];
    let index = 0;
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    async function worker(workerId: number) {
      await delay(workerId * startDelayStep);

      while (true) {
        const currentIndex = index++;
        if (currentIndex >= urls.length) break;

        const url = urls[currentIndex];
        console.log(
          `🔄 [Worker ${workerId + 1}] ${currentIndex + 1}/${urls.length}: ${url}`,
        );

        const result = await this.scrapePage(url);
        results.push(result);

        await delay(perRequestDelay);
      }
    }

    const boundWorker = worker.bind(this); // важный момент!
    const workers = Array.from({ length: concurrency }, (_, i) =>
      boundWorker(i),
    );

    await Promise.all(workers);
    return results;
  }
}

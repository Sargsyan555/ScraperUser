import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as path from 'path';
import axios from 'axios';
import * as xlsx from 'xlsx';
import puppeteer, { Browser } from 'puppeteer';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class ScraperService74Parts {
  private readonly logger = new Logger(ScraperService74Parts.name);

  private readonly sitemapUrls = [
    'https://74parts.ru/sitemap-files.xml',
    'https://74parts.ru/sitemap-iblock-3.xml',
    'https://74parts.ru/sitemap-iblock-8.xml',
    'https://74parts.ru/sitemap-iblock-9.xml',
    'https://74parts.ru/sitemap-iblock-10.xml',
    'https://74parts.ru/sitemap-iblock-11.xml',
    'https://74parts.ru/sitemap-iblock-12.xml',
    'https://74parts.ru/sitemap-iblock-13.xml',
    'https://74parts.ru/sitemap-iblock-14.xml',
    'https://74parts.ru/sitemap-iblock-15.xml',
    'https://74parts.ru/sitemap-iblock-16.xml',
    'https://74parts.ru/sitemap-iblock-17.xml',
    'https://74parts.ru/sitemap-iblock-18.xml',
    'https://74parts.ru/sitemap-iblock-19.xml',
    'https://74parts.ru/sitemap-iblock-22.xml',
  ];

  private readonly parser = new XMLParser();

  constructor() {
    this.init().catch((err) =>
      this.logger.error('Failed to initialize ScraperService', err),
    );
  }

  private async init() {
    // Не импортируем p-limit здесь
    await this.handleScraping();
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCron() {
    this.logger.log('Running scheduled 74Parts scraping...');
    try {
      await this.handleScraping();
      this.logger.log('✅ Scheduled scraping finished.');
    } catch (err) {
      this.logger.error('❌ Scheduled scraping failed:', err);
    }
  }

  private async fetchSitemapLinks(url: string): Promise<string[]> {
    const { data } = await axios.get(url);
    const parsed = this.parser.parse(data);
    const urls = parsed.urlset.url;
    const urlsArray = Array.isArray(urls) ? urls : [urls];
    return urlsArray.map((entry: any) => entry.loc);
  }

  private async scrapeProductPage(browser: Browser, url: string) {
    try {
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      const data = await page.evaluate(() => {
        const checkPart =
          document.querySelector('.block_title')?.textContent || '';
        if (!checkPart) return {};

        const title = document.querySelector('#pagetitle')?.textContent || '';
        const price = document.querySelector('.price_value')?.textContent || '';
        const article = document.querySelector('.value')?.textContent || '';
        const availability =
          document.querySelector('.item-stock')?.textContent || '';

        return {
          title: title.trim(),
          price: price.trim(),
          article: article.trim(),
          availability: availability.trim(),
        };
      });

      await page.close();
      return { url, ...data };
    } catch (err: any) {
      this.logger.error(`❌ Error scraping ${url}: ${err.message}`);
      return {
        url,
        title: '',
        price: '',
        article: '',
        availability: '',
        error: err.message,
      };
    }
  }

  private async handleScraping(): Promise<void> {
    this.logger.log('🔍 Fetching sitemap links...');

    const allLinks: string[] = [];

    for (const sitemap of this.sitemapUrls) {
      try {
        const links = await this.fetchSitemapLinks(sitemap);
        allLinks.push(...links);
      } catch (err: any) {
        this.logger.warn(`⚠️ Failed to fetch ${sitemap}: ${err.message}`);
      }
    }

    const productLinks = allLinks
      .filter((url) => url.includes('/catalog/'))
      .filter(
        (url) =>
          !url.includes('/blog') &&
          !url.includes('/sale') &&
          !url.includes('/landings') &&
          !url.includes('/about') &&
          !url.includes('/news') &&
          !url.includes('/service'),
      );

    this.logger.log(
      `✅ Found ${productLinks.length} product links. Starting scraping...`,
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Динамический импорт p-limit только здесь
    const pLimitModule = await import('p-limit');
    const limit = pLimitModule.default(4);

    const tasks = productLinks.map((url, i) =>
      limit(async () => {
        this.logger.log(
          `📦 (${i + 1}/${productLinks.length}) Scraping: ${url}`,
        );
        return await this.scrapeProductPage(browser, url);
      }),
    );

    const results = await Promise.all(tasks);
    await browser.close();

    this.saveToExcel(results);
  }

  private saveToExcel(data: any[]) {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '74Parts');

    const timestamp = new Date().toISOString().split('T')[0];
    const filePath = path.join(process.cwd(), `74Parts-${timestamp}.xlsx`);
    xlsx.writeFile(workbook, filePath);

    this.logger.log(`💾 Excel file saved: ${filePath}`);
  }
}

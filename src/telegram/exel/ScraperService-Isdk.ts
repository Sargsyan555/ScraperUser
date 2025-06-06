import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';
import * as path from 'path';

@Injectable()
export class ScraperServiceIstkDeutz {
  private readonly logger = new Logger(ScraperServiceIstkDeutz.name);
  private readonly sitemapUrl = 'https://istk-deutz.ru/sitemap.xml';
  private readonly outputFilePath = path.join(
    process.cwd(),
    'src/telegram/scraper',
    'istk-deutzZ.xlsx',
  );

  constructor() {
    this.main().catch((err) =>
      this.logger.error('Initial scraping failed', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Running scheduled istk-deutz scraper...');
    try {
      await this.main();
      this.logger.log('Scheduled scraping completed.');
    } catch (error) {
      this.logger.error('Scheduled scraping failed:', error);
    }
  }

  private delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  private async fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
    const response = await axios.get(sitemapUrl);
    const parser = new XMLParser();
    const parsed = parser.parse(response.data);

    if (parsed.sitemapindex?.sitemap) {
      const sitemapUrls = parsed.sitemapindex.sitemap.map((item) => item.loc);
      const nestedUrls: string[] = [];

      for (const url of sitemapUrls) {
        this.logger.log(`📂 Reading nested sitemap: ${url}`);
        const nested = await this.fetchSitemapUrls(url);
        nestedUrls.push(...nested);
        await this.delay(300);
      }

      return nestedUrls;
    }

    if (parsed.urlset?.url) {
      return parsed.urlset.url.map((item) => item.loc);
    }

    return [];
  }

  private async scrapeData(url: string) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $('h1').first().text().trim();
      const price = $('.price_noauth .price').first().text().trim();
      const stock = $('.product-quantity ul li').first().text().trim();

      return { url, title, price, stock };
    } catch (error) {
      this.logger.error(`❌ Error scraping ${url}: ${error.message}`);
      return null;
    }
  }

  private async main() {
    const allUrls = await this.fetchSitemapUrls(this.sitemapUrl);

    const filtered = allUrls.filter((url) => url.includes('/zapchasti/'));
    this.logger.log(`🔎 Found ${filtered.length} URLs with /zapchasti/`);

    const results: {
      url: string;
      title: string;
      price: string;
      stock: string;
    }[] = [];
    for (const [i, url] of filtered.entries()) {
      this.logger.log(`📄 Processing ${i + 1}/${filtered.length}: ${url}`);
      const data = await this.scrapeData(url);
      if (data) results.push(data);
      await this.delay(200);
    }

    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zapchasti');
    XLSX.writeFile(workbook, this.outputFilePath);

    this.logger.log(`✅ Saved to ${this.outputFilePath}`);
  }
}

// import axios from "axios";
// import { XMLParser } from "fast-xml-parser";
// import * as cheerio from "cheerio";
// import * as XLSX from "xlsx";

// const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// async function fetchSitemapUrls(sitemapUrl) {
//   const response = await axios.get(sitemapUrl);
//   const parser = new XMLParser();
//   const parsed = parser.parse(response.data);

//   if (parsed.sitemapindex) {
//     const sitemapUrls = parsed.sitemapindex.sitemap.map((item) => item.loc);
//     const nestedUrls = [];

//     for (const url of sitemapUrls) {
//       console.log(`📂 Чтение вложенного sitemap: ${url}`);
//       const nested = await fetchSitemapUrls(url);
//       nestedUrls.push(...nested);
//       await delay(300);
//     }

//     return nestedUrls;
//   }

//   if (parsed.urlset) {
//     const urls = parsed.urlset.url.map((item) => item.loc);
//     return urls;
//   }

//   return [];
// }

// async function scrapeData(url) {
//   try {
//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);

//     const title = $("h1").first().text().trim();
//     // Настраиваемые селекторы — можно поменять при необходимости
//     const price = $(".price_noauth .price").first().text().trim();
//     const stock = $(".product-quantity ul li").first().text().trim();

//     return { url, title, price, stock };
//   } catch (error) {
//     console.error(`❌ Ошибка при парсинге ${url}:`, error.message);
//     return null;
//   }
// }

// async function main() {
//   const sitemapUrl = "https://istk-deutz.ru/sitemap.xml";
//   const allUrls = await fetchSitemapUrls(sitemapUrl);

//   const filtered = allUrls.filter((url) => url.includes("/zapchasti/"));
//   console.log(`🔎 Найдено ${filtered.length} URL с /zapchasti/`);

//   const sampleUrls = filtered;

//   const results = [];
//   for (const [i, url] of sampleUrls.entries()) {
//     console.log(`📄 Обработка ${i + 1}/${sampleUrls.length}: ${url}`);
//     const data = await scrapeData(url);
//     if (data) results.push(data);
//     await delay(200);
//   }

//   const worksheet = XLSX.utils.json_to_sheet(results);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Zapchasti");

//   XLSX.writeFile(workbook, "istk-deutzZ.xlsx");
//   console.log("✅ Сохранено в istk-deutzZ.xlsx");
// }

// main();

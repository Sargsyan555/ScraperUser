import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs/promises';
import * as path from 'path';

type Product = {
  articul: string;
  name: string;
  brand: string;
  price: string;
};

@Injectable()
export class ScraperServiceUdtTechnika {
  private readonly logger = new Logger(ScraperServiceUdtTechnika.name);
  private readonly sitemapUrl = 'https://www.udt-technika.ru/sitemap.xml';

  constructor() {
    this.scrapeAndExport().catch((err) =>
      this.logger.error('Initial run failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('⏰ Scheduled run started...');
    try {
      await this.scrapeAndExport();
      this.logger.log('✅ Scheduled run completed successfully.');
    } catch (error) {
      this.logger.error('❌ Scheduled run failed:', error.message || error);
    }
  }

  private async getProductUrls(): Promise<string[]> {
    const sitemapXml = await axios.get(this.sitemapUrl).then((res) => res.data);
    const sitemapParsed = await parseStringPromise(sitemapXml);
    const sitemapUrls = sitemapParsed.sitemapindex.sitemap.map((s) => s.loc[0]);

    const productUrls: string[] = [];
    for (const url of sitemapUrls) {
      const sitemapContent = await axios.get(url).then((res) => res.data);
      const parsed = await parseStringPromise(sitemapContent);

      const urls = parsed.urlset.url
        .map((u) => u.loc[0])
        .filter((u: string) => u.includes('itemid'));

      productUrls.push(...urls);
    }

    return productUrls;
  }

  private async scrapeProduct(url: string) {
    try {
      const { data } = await axios.get(url, { timeout: 5000 });
      const $ = cheerio.load(data);

      const name = $('li:contains("Название")')
        .text()
        .replace('Название:', '')
        .trim();
      const brand = $('li:contains("Производитель")')
        .text()
        .replace('Производитель:', '')
        .trim();
      const articul = $('li')
        .filter((_, el) => $(el).text().trim().startsWith('Артикул:'))
        .text()
        .replace('Артикул:', '')
        .trim()
        .split('/')[0];

      const priceText = $('#cenabasket2').text().trim();
      const price = priceText.replace(/[^\d]/g, '');

      if (!name || !articul) return null;
      return { articul, name, brand, price };
    } catch (e) {
      this.logger.warn(`⚠️ Failed to scrape ${url}: ${e.message}`);
      return null;
    }
  }

  private async scrapeAndExport(): Promise<void> {
    this.logger.log('🔍 Starting scrape...');

    const productUrls = await this.getProductUrls();
    this.logger.log(`📦 Found ${productUrls.length} product URLs`);

    const products: Product[] = [];

    for (let i = 0; i < productUrls.length; i++) {
      const url = productUrls[i];
      this.logger.log(`Scraping (${i + 1}/${productUrls.length}): ${url}`);
      const product = await this.scrapeProduct(url);
      if (product) products.push(product);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
      { header: 'Артикул', key: 'articul', width: 25 },
      { header: 'Название', key: 'name', width: 40 },
      { header: 'Цена', key: 'price', width: 15 },
      { header: 'Производитель', key: 'brand', width: 30 },
    ];

    worksheet.addRows(products);

    const outputPath = path.join(
      process.cwd(),
      '/src/telegram/scraper',
      'udttechnika.xlsx',
    );
    await workbook.xlsx.writeFile(outputPath);

    this.logger.log(`✅ Excel file saved: ${outputPath}`);
  }
}

// import axios from "axios";
// import { parseStringPromise } from "xml2js";
// import fs from "fs/promises";
// import path from "path";

// async function getProductUrls() {
//   const sitemapIndexUrl = "https://www.udt-technika.ru/sitemap.xml";

//   const sitemapXml = await axios.get(sitemapIndexUrl).then((res) => res.data);
//   const sitemapParsed = await parseStringPromise(sitemapXml);

//   const sitemapUrls = sitemapParsed.sitemapindex.sitemap.map((s) => s.loc[0]);

//   const productUrls = [];

//   for (const sitemapUrl of sitemapUrls) {
//     const sitemapContent = await axios.get(sitemapUrl).then((res) => res.data);
//     const urlSet = await parseStringPromise(sitemapContent);

//     const urls = urlSet.urlset.url
//       .map((u) => u.loc[0])
//       .filter((url) => url.includes("itemid"));

//     productUrls.push(...urls);
//   }

//   return productUrls;
// }

// (async () => {
//   const urls = await getProductUrls();
//   console.log("Всего product URL-ов:", urls.length);

//   // Путь к файлу productUrls.json в текущей папке
//   const filePath = path.join(process.cwd(), "udt-technika.json");

//   // Сохраняем в JSON-файл
//   await fs.writeFile(filePath, JSON.stringify(urls, null, 2), "utf-8");
//   console.log(`Сохранено в файл: ${filePath}`);
// })();

// import axios from "axios";
// import * as cheerio from "cheerio";
// import ExcelJS from "exceljs";
// import fs from "fs/promises";
// import path from "path";

// async function scrapeProduct(url) {
//   try {
//     const { data } = await axios.get(url, { timeout: 5000 });
//     const $ = cheerio.load(data);

//     const name = $('li:contains("Название")')
//       .text()
//       .replace("Название:", "")
//       .trim();
//     const brand = $('li:contains("Производитель")')
//       .text()
//       .replace("Производитель:", "")
//       .trim();
//     const articul = $("li")
//       .filter((_, el) => $(el).text().trim().startsWith("Артикул:"))
//       .text()
//       .replace("Артикул:", "")
//       .trim()
//       .split("/")[0];
//     if (!name || !articul) return null;

//     const priceText = $("#cenabasket2").text().trim();
//     const price = priceText.replace(/[^\d]/g, "");

//     return { articul, name, brand, price };
//   } catch (e) {
//     console.warn(`Ошибка при скрапинге ${url}:`, e.message);
//     return null;
//   }
// }

// async function main() {
//   const filePath = path.join(process.cwd(), "udt-technika.json");
//   const urlsJson = await fs.readFile(filePath, "utf-8");
//   const productUrls = JSON.parse(urlsJson);

//   const products = [];

//   // Для примера возьмем первые 50 URL (чтобы не перегружать)
//   const limit = 10;

//   for (let i = 0; i < Math.min(limit, productUrls.length); i++) {
//     const url = productUrls[i];
//     console.log(`Обрабатываю (${i + 1}/${limit}): ${url}`);
//     const product = await scrapeProduct(url);
//     if (product) products.push(product);
//   }

//   // Создаем Excel
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Products");

//   worksheet.columns = [
//     { header: "Артикул", key: "articul", width: 25 },
//     { header: "Название", key: "name", width: 40 },
//     { header: "Цена", key: "price", width: 15 },
//     { header: "Производитель", key: "brand", width: 30 },
//   ];

//   worksheet.addRows(products);

//   const excelFilePath = path.join(process.cwd(), "products.xlsx");
//   await workbook.xlsx.writeFile(excelFilePath);

//   console.log(`Готово! Данные сохранены в ${excelFilePath}`);
// }

// main();

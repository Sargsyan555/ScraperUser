import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';
import * as path from 'path';

@Injectable()
export class ScraperServicePcagroup {
  private readonly logger = new Logger(ScraperServicePcagroup.name);
  private readonly outputFilePath = path.join(
    process.cwd(),
    '/src/telegram/scraper',
    'pcagroup.xlsx',
  );

  constructor() {
    this.scrapeAllPages().catch((err) =>
      this.logger.error('Initial scraping failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Running scheduled scraping for pcagroup...');
    try {
      await this.scrapeAllPages();
      this.logger.log('Scheduled scraping completed successfully.');
    } catch (error) {
      this.logger.error('Scheduled scraping failed:', error);
    }
  }

  private async saveToExcel(products: any[], filePath: string): Promise<void> {
    const worksheetData = products.map((p) => ({
      Articul: p.articul,
      Name: p.name,
      Price: p.price,
      Brand: p.brand,
      URL: p.url,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, filePath);
    this.logger.log(`✅ Excel file saved to: ${filePath}`);
  }

  private async scrapeAllPages(): Promise<void> {
    const products: any[] = [];

    for (let page = 1; page <= 235; page++) {
      const url = `https://pcagroup.ru/search/?search=&_paged=${page}`;

      try {
        const res = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
          },
        });

        const $ = cheerio.load(res.data);

        $('.card').each((_, element) => {
          const card = $(element);

          const link = card.find('a.card__image').attr('href')?.trim() || '';
          const name = card.find('.card__title').text().trim();
          const artText = card.find('.card__art').first().text().trim();
          const brandText = card.find('.card__art').last().text().trim();
          const priceText = card.find('.price').text().trim();

          const articulMatch = artText.match(/Артикул:\s*(\S+)/);
          const articul = articulMatch ? articulMatch[1] : '';

          const brandMatch = brandText.match(/Производитель:\s*(.*)/);
          const brand = brandMatch ? brandMatch[1] : 'Неизвестно';

          const price = priceText.replace(/\D/g, '') || '0';

          products.push({
            articul,
            brand,
            name,
            price,
            url: link,
          });
        });

        this.logger.log(`✅ Page ${page} scraped`);
      } catch (error) {
        this.logger.error(`❌ Error on page ${page}: ${error.message}`);
      }
    }

    await this.saveToExcel(products, this.outputFilePath);
  }
}

// const axios = require("axios");
// const cheerio = require("cheerio");
// const XLSX = require("xlsx");
// const path = require("path");
// const fs = require("fs");

// const outputFilePath = path.join(__dirname, "pcagroup.xlsx");

// async function saveToExcel(products, filePath) {
//   const worksheetData = products.map((p) => ({
//     Articul: p.articul,
//     Name: p.name,
//     Price: p.price,
//     Brand: p.brand,
//     URL: p.url,
//   }));

//   const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
//   XLSX.writeFile(workbook, filePath);
//   console.log(`✅ Excel file saved to: ${filePath}`);
// }

// async function scrapeAllPages() {
//   const products = [];

//   for (let page = 1; page <= 235; page++) {
//     const url = `https://pcagroup.ru/search/?search=&_paged=${page}`;

//     try {
//       const res = await axios.get(url, {
//         headers: {
//           "User-Agent":
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
//         },
//       });

//       const $ = cheerio.load(res.data);

//       $(".card").each((_, element) => {
//         const card = $(element);

//         const link = card.find("a.card__image").attr("href")?.trim() || "";
//         const name = card.find(".card__title").text().trim();
//         const artText = card.find(".card__art").first().text().trim();
//         const brandText = card.find(".card__art").last().text().trim();
//         const priceText = card.find(".price").text().trim();

//         const articulMatch = artText.match(/Артикул:\s*(\S+)/);
//         const articul = articulMatch ? articulMatch[1] : "";

//         const brandMatch = brandText.match(/Производитель:\s*(.*)/);
//         const brand = brandMatch ? brandMatch[1] : "Неизвестно";

//         const price = priceText.replace(/\D/g, "") || "0";

//         products.push({
//           articul,
//           brand,
//           name,
//           price,
//           url: link,
//         });
//       });

//       console.log(`✅ Page ${page} scraped`);
//     } catch (error) {
//       console.error(`❌ Error on page ${page}: ${error.message}`);
//     }
//   }

//   await saveToExcel(products, outputFilePath);
// }

// // Start scraping when the script runs
// scrapeAllPages().then(() => {
//   console.log("🎉 Scraping finished!");
// });

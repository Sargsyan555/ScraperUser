import axios from "axios";
import * as cheerio from "cheerio";
import * as XLSX from "xlsx";
import * as path from "path";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

interface Product {
  name: string;
  price: number | string;
  article: string;
  brand: string;
  url: string;
  availability: string | number;
}

@Injectable()
export class ScraperSolidService {
  private readonly logger = new Logger(ScraperSolidService.name);
  private readonly baseUrl =
    "https://solid-t.ru/catalog/?code=&sort=price&PAGEN_1";
  private readonly outputFilePath = path.join(
    process.cwd(),
    "src/telegram/scraper",
    "SolidPrice.xlsx"
  );

  constructor() {
    this.scrapeAllPages().catch((err) =>
      this.logger.error("Initial scrape failed:", err)
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log("⏰ Running scheduled Solid scraper...");
    try {
      await this.scrapeAllPages();
      this.logger.log("✅ Scheduled Solid scrape completed.");
    } catch (error) {
      this.logger.error("❌ Scheduled Solid scrape failed:", error);
    }
  }

  async scrapePage(page: number): Promise<Product[]> {
    const url = page === 1 ? this.baseUrl : `${this.baseUrl}=${page}`;
    this.logger.log(`Scraping page: ${url}`);

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const products: Product[] = [];

      $(".catalog-block__item").each((_, element) => {
        const $el = $(element);

        const name = $el.find(".product-thumbs__name a").text().trim();
        const relativeUrl =
          $el.find(".product-thumbs__name a").attr("href") || "";
        const fullUrl = `https://solid-t.ru${relativeUrl}`;
        const article = $el
          .find('.product-thumbs__params-item:contains("Артикул:")')
          .text()
          .replace("Артикул:", "")
          .trim();
        const brand = $el
          .find('.product-thumbs__params-item:contains("Производитель:")')
          .text()
          .replace("Производитель:", "")
          .trim();
        const availability = $el
          .find('.product-thumbs__params-item:contains("Наличие:")')
          .text()
          .replace("Наличие:", "")
          .trim();
        const price = $el.find(".product-item-price-current").text().trim();

        products.push({
          name,
          url: fullUrl,
          article,
          brand,
          availability,
          price,
        });
      });

      return products;
    } catch (error) {
      this.logger.error(
        `Failed to scrape page ${page}:`,
        error.message || error
      );
      return [];
    }
  }

  async scrapeAllPages(maxPages: number = 241): Promise<void> {
    const allProducts: Product[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const products = await this.scrapePage(page);
      if (products.length === 0) break; // stop if no products found (optional)
      allProducts.push(...products);
    }

    this.saveToExcel(allProducts);
  }

  private saveToExcel(products: Product[]) {
    const worksheetData = products.map((p) => ({
      Article: p.article,
      Name: p.name,
      Price: p.price,
      Brand: p.brand,
      URL: p.url,
      Availability: p.availability,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SolidProducts");

    XLSX.writeFile(workbook, this.outputFilePath);
    this.logger.log(`✅ Excel file saved: ${this.outputFilePath}`);
  }
}

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as puppeteer from "puppeteer";
import * as fs from "fs/promises";
import * as XLSX from "xlsx";
import * as path from "path";

interface Product {
  articul: string;
  title: string;
  brand: string;
  price: string;
}

@Injectable()
export class ScraperServiceZipteh {
  private readonly logger = new Logger(ScraperServiceZipteh.name);
  private readonly loginUrl = "https://zipteh.online/site/login";
  private readonly homeUrl = "https://zipteh.online/";
  private readonly username = "bmingazov@arhat.pro";
  private readonly password = "45124f";
  private readonly artikulFile = path.join(
    process.cwd(),
    "/src/telegram/scraper",
    "articelFromSklad.txt"
  );

  private readonly resultJsonFile = "./resultsZipteh.json";
  private readonly resultExcelFile = path.join(
    process.cwd(),
    "/src/telegram/scraper",
    "zipteh.xlsx"
  );

  constructor() {
    this.scrape().catch((err) => this.logger.error("Initial run failed:", err));
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log("⏰ Запущен плановый парсинг Zipteh...");
    try {
      await this.scrape();
      this.logger.log("✅ Плановый парсинг завершён успешно.");
    } catch (err) {
      this.logger.error("❌ Ошибка при плановом парсинге:", err);
    }
  }

  private async scrape() {
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(this.loginUrl, { waitUntil: "networkidle2" });

    await page.type("#loginform-username", this.username);
    await page.type("#loginform-password", this.password);
    await Promise.all([
      page.click('button[name="login-button"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    this.logger.log("✅ Успешно авторизовались на сайте Zipteh");

    const data = await fs.readFile(this.artikulFile, "utf-8");
    const artikuls = data
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const results: Product[] = [];
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (const articul of artikuls) {
      this.logger.log(`🔍 Поиск артикула: ${articul}`);
      try {
        await page.goto(this.homeUrl, { waitUntil: "networkidle2" });
        await page.waitForSelector("#vendorCode");

        await page.evaluate(() => {
          const input = document.querySelector<HTMLInputElement>("#vendorCode");
          if (input) input.value = "";
        });

        await page.type("#vendorCode", articul);
        await page.click('button[type="submit"].btn-warning');

        await page.waitForSelector("table tbody tr, .empty-message", {
          timeout: 10000,
        });

        const products = await page.$$eval("table tbody tr", (rows) =>
          rows.map((row) => {
            const cells = row.querySelectorAll("td");
            return {
              articul: cells[3]?.innerText.trim() || "",
              title: cells[4]?.innerText.trim() || "",
              brand: cells[7]?.innerText.trim() || "",
              price: cells[10]?.innerText.trim() || "",
            };
          })
        );

        results.push(...products);
      } catch (error) {
        this.logger.warn(
          `⚠️ Проблема при поиске артикула ${articul}: ${error.message}`
        );
        continue;
      }

      await delay(1500);
    }

    await browser.close();
    this.logger.log(`📦 Найдено всего товаров: ${results.length}`);

    await fs.writeFile(
      this.resultJsonFile,
      JSON.stringify(results, null, 2),
      "utf-8"
    );
    this.logger.log(`💾 Данные сохранены в JSON: ${this.resultJsonFile}`);

    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Zipteh");
    XLSX.writeFile(workbook, this.resultExcelFile);

    this.logger.log(`📊 Excel файл создан: ${this.resultExcelFile}`);
  }
}

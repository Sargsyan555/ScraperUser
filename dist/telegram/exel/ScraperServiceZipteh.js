"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScraperServiceZipteh_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceZipteh = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const XLSX = require("xlsx");
const path = require("path");
let ScraperServiceZipteh = ScraperServiceZipteh_1 = class ScraperServiceZipteh {
    logger = new common_1.Logger(ScraperServiceZipteh_1.name);
    loginUrl = "https://zipteh.online/site/login";
    homeUrl = "https://zipteh.online/";
    username = "bmingazov@arhat.pro";
    password = "45124f";
    artikulFile = path.join(process.cwd(), "/src/telegram/scraper", "articelFromSklad.txt");
    resultJsonFile = "./resultsZipteh.json";
    resultExcelFile = path.join(process.cwd(), "/src/telegram/scraper", "zipteh.xlsx");
    constructor() {
        this.scrape().catch((err) => this.logger.error("Initial run failed:", err));
    }
    async handleCron() {
        this.logger.log("⏰ Запущен плановый парсинг Zipteh...");
        try {
            await this.scrape();
            this.logger.log("✅ Плановый парсинг завершён успешно.");
        }
        catch (err) {
            this.logger.error("❌ Ошибка при плановом парсинге:", err);
        }
    }
    async scrape() {
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
        const results = [];
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        for (const articul of artikuls) {
            this.logger.log(`🔍 Поиск артикула: ${articul}`);
            try {
                await page.goto(this.homeUrl, { waitUntil: "networkidle2" });
                await page.waitForSelector("#vendorCode");
                await page.evaluate(() => {
                    const input = document.querySelector("#vendorCode");
                    if (input)
                        input.value = "";
                });
                await page.type("#vendorCode", articul);
                await page.click('button[type="submit"].btn-warning');
                await page.waitForSelector("table tbody tr, .empty-message", {
                    timeout: 10000,
                });
                const products = await page.$$eval("table tbody tr", (rows) => rows.map((row) => {
                    const cells = row.querySelectorAll("td");
                    return {
                        articul: cells[3]?.innerText.trim() || "",
                        title: cells[4]?.innerText.trim() || "",
                        brand: cells[7]?.innerText.trim() || "",
                        price: cells[10]?.innerText.trim() || "",
                    };
                }));
                results.push(...products);
            }
            catch (error) {
                this.logger.warn(`⚠️ Проблема при поиске артикула ${articul}: ${error.message}`);
                continue;
            }
            await delay(1500);
        }
        await browser.close();
        this.logger.log(`📦 Найдено всего товаров: ${results.length}`);
        await fs.writeFile(this.resultJsonFile, JSON.stringify(results, null, 2), "utf-8");
        this.logger.log(`💾 Данные сохранены в JSON: ${this.resultJsonFile}`);
        const worksheet = XLSX.utils.json_to_sheet(results);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Zipteh");
        XLSX.writeFile(workbook, this.resultExcelFile);
        this.logger.log(`📊 Excel файл создан: ${this.resultExcelFile}`);
    }
};
exports.ScraperServiceZipteh = ScraperServiceZipteh;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperServiceZipteh.prototype, "handleCron", null);
exports.ScraperServiceZipteh = ScraperServiceZipteh = ScraperServiceZipteh_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperServiceZipteh);
//# sourceMappingURL=ScraperServiceZipteh.js.map
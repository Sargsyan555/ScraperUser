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
var ScraperService74Parts_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService74Parts = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const path = require("path");
const axios_1 = require("axios");
const xlsx = require("xlsx");
const puppeteer_1 = require("puppeteer");
const fast_xml_parser_1 = require("fast-xml-parser");
let ScraperService74Parts = ScraperService74Parts_1 = class ScraperService74Parts {
    logger = new common_1.Logger(ScraperService74Parts_1.name);
    sitemapUrls = [
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
    parser = new fast_xml_parser_1.XMLParser();
    constructor() {
        this.init().catch((err) => this.logger.error('Failed to initialize ScraperService', err));
    }
    async init() {
        await this.handleScraping();
    }
    async handleCron() {
        this.logger.log('Running scheduled 74Parts scraping...');
        try {
            await this.handleScraping();
            this.logger.log('✅ Scheduled scraping finished.');
        }
        catch (err) {
            this.logger.error('❌ Scheduled scraping failed:', err);
        }
    }
    async fetchSitemapLinks(url) {
        const { data } = await axios_1.default.get(url);
        const parsed = this.parser.parse(data);
        const urls = parsed.urlset.url;
        const urlsArray = Array.isArray(urls) ? urls : [urls];
        return urlsArray.map((entry) => entry.loc);
    }
    async scrapeProductPage(browser, url) {
        try {
            const page = await browser.newPage();
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 15000,
            });
            const data = await page.evaluate(() => {
                const checkPart = document.querySelector('.block_title')?.textContent || '';
                if (!checkPart)
                    return {};
                const title = document.querySelector('#pagetitle')?.textContent || '';
                const price = document.querySelector('.price_value')?.textContent || '';
                const article = document.querySelector('.value')?.textContent || '';
                const availability = document.querySelector('.item-stock')?.textContent || '';
                return {
                    title: title.trim(),
                    price: price.trim(),
                    article: article.trim(),
                    availability: availability.trim(),
                };
            });
            await page.close();
            return { url, ...data };
        }
        catch (err) {
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
    async handleScraping() {
        this.logger.log('🔍 Fetching sitemap links...');
        const allLinks = [];
        for (const sitemap of this.sitemapUrls) {
            try {
                const links = await this.fetchSitemapLinks(sitemap);
                allLinks.push(...links);
            }
            catch (err) {
                this.logger.warn(`⚠️ Failed to fetch ${sitemap}: ${err.message}`);
            }
        }
        const productLinks = allLinks
            .filter((url) => url.includes('/catalog/'))
            .filter((url) => !url.includes('/blog') &&
            !url.includes('/sale') &&
            !url.includes('/landings') &&
            !url.includes('/about') &&
            !url.includes('/news') &&
            !url.includes('/service'));
        this.logger.log(`✅ Found ${productLinks.length} product links. Starting scraping...`);
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const pLimitModule = await Promise.resolve().then(() => require('p-limit'));
        const limit = pLimitModule.default(4);
        const tasks = productLinks.map((url, i) => limit(async () => {
            this.logger.log(`📦 (${i + 1}/${productLinks.length}) Scraping: ${url}`);
            return await this.scrapeProductPage(browser, url);
        }));
        const results = await Promise.all(tasks);
        await browser.close();
        this.saveToExcel(results);
    }
    saveToExcel(data) {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, '74Parts');
        const timestamp = new Date().toISOString().split('T')[0];
        const filePath = path.join(process.cwd(), `74Parts-${timestamp}.xlsx`);
        xlsx.writeFile(workbook, filePath);
        this.logger.log(`💾 Excel file saved: ${filePath}`);
    }
};
exports.ScraperService74Parts = ScraperService74Parts;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperService74Parts.prototype, "handleCron", null);
exports.ScraperService74Parts = ScraperService74Parts = ScraperService74Parts_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperService74Parts);
//# sourceMappingURL=ScraperService74Part.js.map
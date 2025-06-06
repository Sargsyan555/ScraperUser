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
var ScraperCamspartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperCamspartService = void 0;
const axios_1 = require("axios");
const path = require("path");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const xml2js = require("xml2js");
let ScraperCamspartService = ScraperCamspartService_1 = class ScraperCamspartService {
    sitemapUrl = 'https://spb.camsparts.ru/sitemap.xml';
    logger = new common_1.Logger(ScraperCamspartService_1.name);
    constructor() {
        this.scrapeAndExport().catch((err) => this.logger.error('Initial scraping failed:', err));
    }
    async handleCron() {
        this.logger.log('Running scheduled scraping...');
        try {
            await this.scrapeAndExport();
            this.logger.log('✅ Scheduled scraping completed.');
        }
        catch (error) {
            this.logger.error('Scheduled scraping failed:', error);
        }
    }
    async scrapeAndExport() {
        this.logger.log(`Fetching sitemap: ${this.sitemapUrl}`);
        const productUrls = await this.getProductUrlsFromSitemap(this.sitemapUrl);
        const filteredUrls = productUrls.filter((url) => {
            if (!url.includes('katalog-cummins'))
                return false;
            const lastSegment = url.split('/').filter(Boolean).pop();
            if (!lastSegment)
                return false;
            const digitCount = (lastSegment.match(/\d/g) || []).length;
            return digitCount > 6;
        });
        this.logger.log(`Found ${filteredUrls.length} valid product URLs.`);
        const products = [];
        let count = 0;
        for (const url of filteredUrls) {
            count++;
            this.logger.log(`[${count}/${filteredUrls.length}] Scraping: ${url}`);
            try {
                const product = await this.getProductData(url);
                if (product) {
                    products.push(product);
                }
            }
            catch (error) {
                this.logger.warn(`❌ Failed to scrape ${url}`, error.message || error);
            }
        }
        if (products.length === 0) {
            this.logger.warn('No products were scraped. Exiting.');
            return null;
        }
        const filePath = path.join(process.cwd(), 'src', 'telegram', 'scraper', 'camsparts.xlsx');
        this.saveProductsToExcel(filePath, products);
        this.logger.log(`✅ Excel file saved: ${filePath}`);
        return filePath;
    }
    async getProductUrlsFromSitemap(sitemapUrl) {
        try {
            const response = await axios_1.default.get(sitemapUrl);
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(response.data);
            if (!result.urlset || !result.urlset.url) {
                throw new Error('Invalid sitemap structure');
            }
            return result.urlset.url.map((urlObj) => urlObj.loc[0]);
        }
        catch (error) {
            this.logger.error('Failed to fetch or parse sitemap.', error.message || error);
            return [];
        }
    }
    async getProductData(url) {
        try {
            const { data: html } = await axios_1.default.get(url);
            const $ = cheerio.load(html);
            const titleRaw = $('.shop_product__title[itemprop="name"]').text().trim();
            const title = titleRaw.toUpperCase();
            if (!title)
                return null;
            const articulRaw = $('.shop_product__article span[itemprop="productID"]').text();
            const articul = articulRaw.replace(/Артикул:\s*/i, '').trim();
            const price = $('.price__new [itemprop="price"]').text().trim();
            const brandMatch = title.match(/\b[A-ZА-Я]{3,}\b/);
            const brand = brandMatch ? brandMatch[0] : '';
            return { title, articul, price, brand, url };
        }
        catch (error) {
            this.logger.warn(`Failed to scrape product data from: ${url}`, error.message || error);
            return null;
        }
    }
    saveProductsToExcel(filePath, products) {
        const worksheetData = products.map((p) => ({
            Articule: p.articul,
            Name: p.title,
            Price: p.price,
            Brand: p.brand,
            URL: p.url,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, filePath);
    }
};
exports.ScraperCamspartService = ScraperCamspartService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperCamspartService.prototype, "handleCron", null);
exports.ScraperCamspartService = ScraperCamspartService = ScraperCamspartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScraperCamspartService);
//# sourceMappingURL=scraperServiceCamsarts.js.map
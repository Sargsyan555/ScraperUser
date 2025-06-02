"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperCamspartService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const xml2js = require("xml2js");
const cheerio = require("cheerio");
const path = require("path");
const XLSX = require("xlsx");
let ScraperCamspartService = class ScraperCamspartService {
    sitemapUrl = 'https://spb.camsparts.ru/sitemap.xml';
    async scrapeAndExport() {
        const productUrls = await this.getProductUrlsFromSitemap(this.sitemapUrl);
        const filtered = productUrls.filter((url) => {
            if (!url.includes('katalog-cummins'))
                return false;
            const lastSegment = url.split('/').filter(Boolean).pop();
            if (!lastSegment)
                return false;
            const digitCount = (lastSegment.match(/\d/g) || []).length;
            return digitCount > 6;
        });
        const products = [];
        let count = 0;
        for (const url of filtered) {
            count++;
            console.log(url, count);
            try {
                const product = await this.getProductData(url);
                if (product) {
                    products.push(product);
                }
            }
            catch (error) {
                console.error(`Failed to scrape ${url}`, error);
            }
        }
        const filePath = path.resolve(__dirname, '../products.xlsx');
        this.saveProductsToExcel(filePath, products);
        return filePath;
    }
    async getProductUrlsFromSitemap(sitemapUrl) {
        const response = await axios_1.default.get(sitemapUrl);
        const xml = response.data;
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);
        if (!result.urlset || !result.urlset.url) {
            throw new Error('Invalid sitemap structure');
        }
        return result.urlset.url.map((urlObj) => urlObj.loc[0]);
    }
    async getProductData(url) {
        const { data: html } = await axios_1.default.get(url);
        const $ = cheerio.load(html);
        const titleRaw = $('.shop_product__title[itemprop="name"]').text().trim();
        const title = titleRaw.toUpperCase();
        if (!title) {
            return null;
        }
        const articulRaw = $('.shop_product__article span[itemprop="productID"]').text();
        const articul = articulRaw.replace(/Артикул:\s*/i, '').trim();
        const price = $('.price__new [itemprop="price"]').text().trim();
        const brandMatch = title.match(/\b[A-ZА-Я]{3,}\b/);
        const brand = brandMatch ? brandMatch[0] : '';
        return { title, articul, price, brand, url };
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
exports.ScraperCamspartService = ScraperCamspartService = __decorate([
    (0, common_1.Injectable)()
], ScraperCamspartService);
//# sourceMappingURL=camsarts.js.map
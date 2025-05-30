"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperServiceUdt = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const xml2js_1 = require("xml2js");
const ExcelJS = require("exceljs");
const path = require("path");
const worker_threads_1 = require("worker_threads");
function runWorker(url) {
    return new Promise((resolve) => {
        const worker = new worker_threads_1.Worker(path.join(__dirname, 'scraper.workerUdt.js'), {
            workerData: url,
        });
        worker.on('message', (msg) => {
            if (msg.success)
                resolve(msg.data);
            else
                resolve(null);
        });
        worker.on('error', () => resolve(null));
        worker.on('exit', (code) => {
            if (code !== 0)
                console.warn(`Worker stopped with exit code ${code}`);
        });
    });
}
let ScraperServiceUdt = class ScraperServiceUdt {
    async scrapeAndExport() {
        const sitemapIndexUrl = 'https://www.udt-technika.ru/sitemap.xml';
        const sitemapXml = await axios_1.default.get(sitemapIndexUrl).then((res) => res.data);
        const sitemapParsed = await (0, xml2js_1.parseStringPromise)(sitemapXml);
        const sitemapUrls = sitemapParsed.sitemapindex.sitemap.map((s) => s.loc[0]);
        const productUrls = [];
        for (const sitemapUrl of sitemapUrls) {
            const sitemapContent = await axios_1.default
                .get(sitemapUrl)
                .then((res) => res.data);
            const urlSet = await (0, xml2js_1.parseStringPromise)(sitemapContent);
            console.log(urlSet);
            const urls = urlSet.urlset.url
                .map((u) => u.loc[0])
                .filter((e) => e.includes('itemid'));
            console.log(urls);
            productUrls.push(...urls);
        }
        const chunkSize = 10;
        const products = [];
        for (let i = 0; i < productUrls.length; i += chunkSize) {
            const batch = productUrls.slice(i, i + chunkSize);
            const results = await Promise.all(batch.map((url) => runWorker(url)));
            products.push(...results.filter(Boolean));
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
        const filePath = path.join(__dirname, '../../products.xlsx');
        await workbook.xlsx.writeFile(filePath);
        return { filePath, products };
    }
};
exports.ScraperServiceUdt = ScraperServiceUdt;
exports.ScraperServiceUdt = ScraperServiceUdt = __decorate([
    (0, common_1.Injectable)()
], ScraperServiceUdt);
//# sourceMappingURL=udtTexnika.js.map
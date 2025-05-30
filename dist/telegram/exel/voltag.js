"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoltagService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const xml2js_1 = require("xml2js");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const worker_threads_1 = require("worker_threads");
let VoltagService = class VoltagService {
    async scrapeAllProducts() {
        try {
            const { data: sitemapXml } = await axios_1.default.get('https://voltag.ru/sitemap.xml');
            const sitemapIndex = (await (0, xml2js_1.parseStringPromise)(sitemapXml));
            const sitemapUrls = sitemapIndex.sitemapindex.sitemap.map((s) => s.loc[0]);
            const allCatalogUrls = [];
            for (const sitemapUrl of sitemapUrls) {
                const { data: subXml } = await axios_1.default.get(sitemapUrl);
                const subResult = (await (0, xml2js_1.parseStringPromise)(subXml));
                const catalogUrls = (subResult.urlset?.url || [])
                    .map((u) => u.loc[0])
                    .filter((url) => url.includes('/catalog/group/'));
                allCatalogUrls.push(...catalogUrls);
            }
            const allPriceUrls = allCatalogUrls.map((url) => url.replace('/catalog/group/', '/price/group/'));
            const chunks = this.chunkArray(allPriceUrls, 5);
            const results = [];
            const workerPromises = chunks.map((chunk) => {
                return new Promise((resolve, reject) => {
                    const worker = new worker_threads_1.Worker(path.join(__dirname, 'voltag.worker.js'), {
                        workerData: chunk,
                    });
                    worker.on('message', (products) => resolve(products));
                    worker.on('error', reject);
                    worker.on('exit', (code) => {
                        if (code !== 0)
                            reject(new Error(`Worker exited with code ${code}`));
                    });
                });
            });
            const workerResults = await Promise.all(workerPromises);
            for (const res of workerResults) {
                results.push(...res);
            }
            return this.saveToExcel(results);
        }
        catch (err) {
            console.error('Error in main scraping thread:', err);
            return undefined;
        }
    }
    chunkArray(arr, size) {
        const result = [];
        const chunkSize = Math.ceil(arr.length / size);
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }
    saveToExcel(data) {
        if (!data.length)
            return;
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
        const dir = path.join(__dirname, '..', 'excels');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, 'products.xlsx');
        xlsx.writeFile(workbook, filePath);
        console.log(`✅ Excel written to ${filePath}`);
        return filePath;
    }
};
exports.VoltagService = VoltagService;
exports.VoltagService = VoltagService = __decorate([
    (0, common_1.Injectable)()
], VoltagService);
//# sourceMappingURL=voltag.js.map
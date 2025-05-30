"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductScraperService = void 0;
const common_1 = require("@nestjs/common");
const worker_threads_1 = require("worker_threads");
const path = require("path");
const ExcelJS = require("exceljs");
let ProductScraperService = class ProductScraperService {
    categories = [
        'https://xn--e1aqig3a.com/product-category/volvo/',
        'https://xn--e1aqig3a.com/product-category/deutz/',
        'https://xn--e1aqig3a.com/product-category/perkins/',
        'https://xn--e1aqig3a.com/product-category/cat/',
    ];
    async scrapeAllCategories() {
        console.log('stexa');
        const promises = this.categories.map((categoryUrl) => {
            console.log(categoryUrl);
            return this.runWorker(categoryUrl);
        });
        const results = await Promise.all(promises);
        const allProducts = results.flat();
        const excelPath = await this.saveToExcel(allProducts);
        return { products: allProducts, filePath: excelPath };
    }
    runWorker(categoryUrl) {
        return new Promise((resolve, reject) => {
            const worker = new worker_threads_1.Worker(path.resolve(__dirname, './scrape-worker.js'), {
                workerData: { baseUrl: categoryUrl },
            });
            worker.on('message', (data) => {
                if (data.error) {
                    reject(new Error(data.error));
                }
                else {
                    resolve(data);
                }
            });
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }
    async saveToExcel(products, filename = 'products.xlsx') {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Products');
        sheet.columns = [
            { header: 'Articul', key: 'article', width: 20 },
            { header: 'Name', key: 'name', width: 50 },
            { header: 'Price', key: 'price', width: 20 },
            { header: 'Brand', key: 'brand', width: 20 },
        ];
        products.forEach((product) => sheet.addRow(product));
        const fullPath = path.join(__dirname, filename);
        await workbook.xlsx.writeFile(fullPath);
        console.log(`✅ Excel saved: ${fullPath}`);
        return fullPath;
    }
};
exports.ProductScraperService = ProductScraperService;
exports.ProductScraperService = ProductScraperService = __decorate([
    (0, common_1.Injectable)()
], ProductScraperService);
//# sourceMappingURL=shtern.js.map
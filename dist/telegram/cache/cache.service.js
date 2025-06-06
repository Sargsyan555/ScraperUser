"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelCacheLoaderService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
const readExcelFromYandexDisk_1 = require("../utils/readExcelFromYandexDisk");
let ExcelCacheLoaderService = class ExcelCacheLoaderService {
    data = {
        Sklad: {},
        Solid: {},
        Seltex: {},
        SeventyFour: {},
        IstkDeutz: {},
        Voltag: {},
        Shtren: {},
        UdtTexnika: {},
        Camspart: {},
        Dvpt: {},
        Pcagroup: {},
        Imachinery: {},
        Zipteh: {},
        Ixora: {},
        Recamgr: {},
    };
    onModuleInit() {
        this.loadSklad();
        this.loadSolid();
        this.loadSeltex();
        this.loadSeventyFour();
        this.loadIstkDeutz();
        this.loadVoltag();
        this.loadUdtTexnika();
        this.loadShtren();
        this.loadCamspart();
        this.loadDvpt();
        this.loadPcagroup();
        this.loadImachinery();
        this.loadZipteh();
        this.loadIxora();
        this.loadRecamgr();
        console.log("✅ All Excel data loaded and cached.");
    }
    async loadSklad() {
        const skladItems = await (0, readExcelFromYandexDisk_1.readExcelFromYandexDisk)("https://disk.yandex.ru/i/FE5LjEWujhR0Xg");
        for (const row of skladItems) {
            if (!row["кат.номер"])
                continue;
            const key = row["кат.номер"].trim();
            const priceValue = row["цена, RUB"];
            const product = {
                title: row["название детали"] || "-",
                price: typeof priceValue === "string"
                    ? parseInt(priceValue.replace(/[^\d]/g, ""), 10) || 0
                    : priceValue || 0,
            };
            if (!this.data.Sklad[key]) {
                this.data.Sklad[key] = [];
            }
            this.data.Sklad[key].push(product);
        }
        console.log("✅ Sklad loaded");
    }
    loadRecamgr() {
        const workbook = XLSX.readFile("src/telegram/scraper/RecamgrPrice.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const key = row.articul?.trim();
            if (!key)
                continue;
            const priceValue = row.price;
            const product = {
                title: row.title || "-",
                price: typeof priceValue === "string"
                    ? parseInt(priceValue.replace(/[^\d]/g, ""), 10) || 0
                    : priceValue || 0,
                brand: row.brand || "-",
            };
            if (!this.data.Recamgr[key])
                this.data.Recamgr[key] = [];
            this.data.Recamgr[key].push(product);
        }
        console.log("✅ RecamgrPrice loaded");
    }
    loadIxora() {
        const workbook = XLSX.readFile("src/telegram/scraper/ixora.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const key = row.artikul?.trim();
            if (!key)
                continue;
            const priceValue = row.price;
            const product = {
                title: row.title || "-",
                price: typeof priceValue === "string"
                    ? parseInt(priceValue.replace(/[^\d]/g, ""), 10) || 0
                    : priceValue || 0,
                brand: row.brand || "-",
            };
            if (!this.data.Ixora[key])
                this.data.Ixora[key] = [];
            this.data.Ixora[key].push(product);
        }
        console.log("✅ Ixora loaded");
    }
    loadZipteh() {
        const workbook = XLSX.readFile("src/telegram/scraper/zipteh.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const key = row.articul?.trim();
            if (!key)
                continue;
            const priceValue = row.price;
            const product = {
                title: row.title || "-",
                price: typeof priceValue === "string"
                    ? parseInt(priceValue.replace(/[^\d]/g, ""), 10) || 0
                    : priceValue || 0,
                brand: row.brand || "-",
            };
            if (!this.data.Zipteh[key])
                this.data.Zipteh[key] = [];
            this.data.Zipteh[key].push(product);
        }
        console.log("✅ Zipteh loaded");
    }
    loadSolid() {
        const workbook = XLSX.readFile("src/telegram/scraper/solid.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const key = row.Article?.trim();
            if (!key)
                continue;
            const product = {
                title: row.Name || "-",
                price: typeof row.Price === "string"
                    ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
                    : row.Price || 0,
                stock: row.availability || "-",
                brand: row.Brand || "-",
            };
            if (!this.data.Solid[key])
                this.data.Solid[key] = [];
            this.data.Solid[key].push(product);
        }
        console.log("✅ Solid loaded");
    }
    loadShtren() {
        const workbook = XLSX.readFile("src/telegram/scraper/shtren.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            if (!row.Articul)
                continue;
            const key = row.Articul.trim();
            const product = {
                title: row.Name || "-",
                price: typeof row.Price === "string"
                    ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
                    : row.Price || 0,
                brand: row.Brand || "-",
            };
            if (!this.data.Shtren[key]) {
                this.data.Shtren[key] = [];
            }
            this.data.Shtren[key].push(product);
        }
        console.log("✅ Shtren loaded");
    }
    loadSeltex() {
        const workbook = XLSX.readFile("src/telegram/scraper/SeltexPrice.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const key = row.articul?.trim();
            if (!key)
                continue;
            const product = {
                title: row.name || "-",
                price: typeof row.price === "string"
                    ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
                    : row.price || 0,
                stock: row.stock || "-",
                brand: row.brand || "-",
            };
            if (!this.data.Seltex[key])
                this.data.Seltex[key] = [];
            this.data.Seltex[key].push(product);
        }
        console.log("✅ Seltex loaded");
    }
    loadSeventyFour() {
        const workbook = XLSX.readFile("src/telegram/scraper/74PartBase.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const rawArticle = row.article?.trim();
            if (!rawArticle)
                continue;
            const keys = rawArticle
                .split(/[,/]\s*/)
                .map((k) => k.trim())
                .filter(Boolean);
            const product = {
                title: row.title || "-",
                price: typeof row.price === "string"
                    ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
                    : row.price || 0,
                stock: row.availability || "-",
            };
            for (const key of keys) {
                if (!this.data.SeventyFour[key])
                    this.data.SeventyFour[key] = [];
                this.data.SeventyFour[key].push(product);
            }
        }
        console.log("✅ 74Part loaded");
    }
    loadIstkDeutz() {
        const workbook = XLSX.readFile("src/telegram/scraper/istk-deutzZ.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const key = row.articul?.trim();
            if (!key)
                continue;
            const product = {
                title: row.title || "-",
                price: typeof row.price === "string"
                    ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
                    : row.price || 0,
                stock: row.stock || "-",
            };
            if (!this.data.IstkDeutz[key])
                this.data.IstkDeutz[key] = [];
            this.data.IstkDeutz[key].push(product);
        }
        console.log("✅ IstkDeutz loaded");
    }
    loadVoltag() {
        const workbook = XLSX.readFile("src/telegram/scraper/voltag.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            if (!row.article)
                continue;
            const key = row.article.trim();
            const product = {
                title: row.name || "-",
                price: typeof row.price === "string"
                    ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
                    : row.price || 0,
                brand: row.brand || "-",
                stock: "-",
            };
            if (!this.data.Voltag[key]) {
                this.data.Voltag[key] = [];
            }
            this.data.Voltag[key].push(product);
        }
        console.log("✅ Voltag loaded");
    }
    loadUdtTexnika() {
        const workbook = XLSX.readFile("src/telegram/scraper/udttechnika.xlsx");
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        for (const row of sheetData) {
            if (!row["Артикул"])
                continue;
            const key = row["Артикул"].trim();
            const product = {
                title: row["Название"] || "-",
                price: typeof row["Цена"] === "string"
                    ? parseInt(row["Цена"].replace(/[^\d]/g, ""), 10) || 0
                    : row["Цена"] || 0,
                brand: row["Производитель"] || "-",
                stock: "-",
            };
            if (!this.data.UdtTexnika[key]) {
                this.data.UdtTexnika[key] = [];
            }
            this.data.UdtTexnika[key].push(product);
        }
        console.log("✅ Udt Texnika Excel loaded----");
    }
    loadCamspart() {
        const workbook = XLSX.readFile("src/telegram/scraper/camspart.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            if (!row.Articule)
                continue;
            const key = row.Articule.trim();
            const product = {
                title: row.Name || "-",
                price: typeof row.Price === "string"
                    ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
                    : row.Price || 0,
                brand: row.Brand || "-",
            };
            if (!this.data.Camspart[key]) {
                this.data.Camspart[key] = [];
            }
            this.data.Camspart[key].push(product);
        }
        console.log("✅ Camspart loaded");
    }
    loadDvpt() {
        const workbook = XLSX.readFile("src/telegram/scraper/dvpt.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            if (!row.article)
                continue;
            const key = row.article.trim();
            const product = {
                title: row.title || "-",
                price: typeof row.price === "string"
                    ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
                    : row.price || 0,
            };
            if (!this.data.Dvpt[key]) {
                this.data.Dvpt[key] = [];
            }
            this.data.Dvpt[key].push(product);
        }
        console.log("✅ DvPt loaded");
    }
    loadPcagroup() {
        const workbook = XLSX.readFile("src/telegram/scraper/pcagroup.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            if (!row.Articul)
                continue;
            const key = row.Articul.trim();
            const product = {
                title: row.Name || "-",
                price: typeof row.Price === "string"
                    ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
                    : row.Price || 0,
                brand: row.Brand || "-",
            };
            if (!this.data.Pcagroup[key]) {
                this.data.Pcagroup[key] = [];
            }
            this.data.Pcagroup[key].push(product);
        }
        console.log("✅ Pcagroup loaded");
    }
    loadImachinery() {
        const workbook = XLSX.readFile("src/telegram/scraper/imachinery.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            if (!row.Articule)
                continue;
            const key = row.Articule.trim();
            const product = {
                title: row.Name || "-",
                price: typeof row.Price === "string"
                    ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
                    : row.Price || 0,
                brand: row.Brand || "-",
            };
            if (!this.data.Imachinery[key]) {
                this.data.Imachinery[key] = [];
            }
            this.data.Imachinery[key].push(product);
        }
        console.log("✅ Imachery loaded");
    }
    getExcelData() {
        return this.data;
    }
};
exports.ExcelCacheLoaderService = ExcelCacheLoaderService;
exports.ExcelCacheLoaderService = ExcelCacheLoaderService = __decorate([
    (0, common_1.Injectable)()
], ExcelCacheLoaderService);
//# sourceMappingURL=cache.service.js.map
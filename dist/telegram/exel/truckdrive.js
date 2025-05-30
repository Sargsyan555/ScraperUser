"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruckdriveService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const xml2js_1 = require("xml2js");
let TruckdriveService = class TruckdriveService {
    async scrapeAllProducts() {
        const priceGroupUrls = [];
        console.log('@@@@@@@@@@@@@@@@@@@@');
        try {
            const response = await axios_1.default.get('http://truckdrive.ru/sitemap.xml');
            const result = await (0, xml2js_1.parseStringPromise)(response.data);
            console.log(result);
            console.log(result.urlset.url);
            const tmp = result.urlset.url.map((entry) => entry.loc[0].trim());
            console.log(tmp);
        }
        catch (error) {
            console.error('Failed to fetch or parse sitemaps:', error?.message || error);
        }
    }
};
exports.TruckdriveService = TruckdriveService;
exports.TruckdriveService = TruckdriveService = __decorate([
    (0, common_1.Injectable)()
], TruckdriveService);
//# sourceMappingURL=truckdrive.js.map
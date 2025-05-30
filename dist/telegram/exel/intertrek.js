"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const cheerio = require("cheerio");
let CrawlerService = class CrawlerService {
    baseUrl = 'http://intertrek.info/engines';
    async scrapeProductPage(url) {
        const { data } = await axios_1.default.get(url);
        const $ = cheerio.load(data);
        const dl = $('dl.dl-horizontal');
        const name = dl.find('dt:contains("описание")').next('dd').text().trim();
        const articul = dl.find('dt:contains("аналоги")').next('dd').text().trim();
        const model = dl.find('dt:contains("модель")').next('dd').text().trim();
        let price = '';
        $('td').each((_, td) => {
            const text = $(td).text().trim();
            if (/^\d[\d\s]*,\d{2}$/.test(text)) {
                price = text;
            }
        });
        return {
            name,
            articul,
            model,
            price,
            url,
        };
    }
    async extractThirdLevelLinks(startUrl, collector) {
        const visitedPages = new Set();
        const visitPage = async (url) => {
            if (visitedPages.has(url))
                return;
            visitedPages.add(url);
            try {
                const { data } = await axios_1.default.get(url);
                const $ = cheerio.load(data);
                const productLinks = [];
                $('tbody a[href]').each((_, el) => {
                    const href = $(el).attr('href');
                    if (href &&
                        !href.startsWith('javascript:') &&
                        !href.startsWith('mailto:') &&
                        !href.startsWith('#')) {
                        const fullUrl = href.startsWith('http')
                            ? href
                            : new URL(href, url).href;
                        productLinks.push(fullUrl);
                    }
                });
                for (const productUrl of productLinks) {
                    try {
                        const productData = await this.scrapeProductPage(productUrl);
                        collector.push(productData);
                    }
                    catch (err) {
                        console.warn(`Error scraping product ${productUrl}:`, err.message);
                    }
                }
                $('ul.pagination a[href]').each((_, el) => {
                    const href = $(el).attr('href');
                    if (href) {
                        const nextPageUrl = new URL(href, url).href;
                        visitPage(nextPageUrl);
                    }
                });
            }
            catch (err) {
                console.warn(`Error visiting ${url}:`, err.message);
            }
        };
        await visitPage(startUrl);
    }
    async getAllUrls() {
        try {
            const { data: html } = await axios_1.default.get(this.baseUrl);
            const $ = cheerio.load(html);
            const firstLevelLinks = [];
            $('a').each((_, element) => {
                const href = $(element).attr('href');
                if (href &&
                    !href.startsWith('javascript:') &&
                    !href.startsWith('mailto:') &&
                    !href.startsWith('#')) {
                    const fullUrl = href.startsWith('http')
                        ? href
                        : new URL(href, this.baseUrl).href;
                    firstLevelLinks.push(fullUrl);
                }
            });
            const secondLevelLinks = new Set();
            for (const url of firstLevelLinks) {
                try {
                    const { data: innerHtml } = await axios_1.default.get(url);
                    const $$ = cheerio.load(innerHtml);
                    $$('.panel-body a').each((_, element) => {
                        const href = $$(element).attr('href');
                        if (href &&
                            !href.startsWith('javascript:') &&
                            !href.startsWith('mailto:') &&
                            !href.startsWith('#')) {
                            const fullUrl = href.startsWith('http')
                                ? href
                                : new URL(href, url).href;
                            secondLevelLinks.add(fullUrl);
                        }
                    });
                }
                catch (innerError) {
                    console.warn(`Failed to fetch or parse inner page ${url}:`, innerError.message);
                }
            }
            const thirdLevelLinks = new Set();
            const collector = [];
            let s = 0;
            for (const link of secondLevelLinks) {
                s = s + 1;
                if (s === 5) {
                    break;
                }
                console.log(`➡ Visiting second-level page: ${link}`);
                await this.extractThirdLevelLinks(link, collector);
            }
            console.log('end', thirdLevelLinks);
            return Array.from(secondLevelLinks);
        }
        catch (error) {
            console.error('Error crawling:', error.message);
            return [];
        }
    }
};
exports.CrawlerService = CrawlerService;
exports.CrawlerService = CrawlerService = __decorate([
    (0, common_1.Injectable)()
], CrawlerService);
//# sourceMappingURL=intertrek.js.map
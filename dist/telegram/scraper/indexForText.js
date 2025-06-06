"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAllForText = scrapeAllForText;
const puppeteer_cluster_1 = require("puppeteer-cluster");
const seltex_1 = require("./sites/seltex");
const _74parts_1 = require("./sites/74parts");
const istk_deutz_1 = require("./sites/istk-deutz");
const camsparts_1 = require("./sites/camsparts");
const imachinery_1 = require("./sites/imachinery");
const pcagroup_1 = require("./sites/pcagroup");
const recamgr_1 = require("./sites/recamgr");
const voltag_1 = require("./sites/voltag");
const shtren_1 = require("./sites/shtren");
const scrapers = [
    { name: 'Seltex', fn: seltex_1.scrapeSeltex, exelova: true },
    { name: 'Voltag', fn: voltag_1.scrapeVoltag, exelova: true },
    { name: 'Shtren', fn: shtren_1.scrapeShtren, exelova: true },
    { name: '74Parts', fn: _74parts_1.scrape74Parts, exelova: true },
    { name: 'istk-deutz', fn: istk_deutz_1.scrapeIstkDeutz, exelova: true },
    { name: 'Spb.camsparts', fn: camsparts_1.scrapeCamsParts, usePuppeteer: false },
    { name: 'Pcagroup', fn: pcagroup_1.scrapePcaGroup, usePuppeteer: false },
    { name: 'Imachinery', fn: imachinery_1.scrapeIMachinery, usePuppeteer: false },
    { name: 'Recamgr', fn: recamgr_1.scrapeRecamgr, usePuppeteer: false },
];
async function scrapeAllForText(productNames) {
    const puppeteerScrapers = scrapers.filter((s) => s.usePuppeteer &&
        s.name !== 'istk-deutz' &&
        s.name !== '74Parts' &&
        s.name !== 'Shtren' &&
        s.name !== 'Seltex' &&
        s.name !== 'Voltag');
    const axiosScrapers = scrapers.filter((s) => !s.usePuppeteer &&
        s.name !== 'istk-deutz' &&
        s.name !== '74Parts' &&
        s.name !== 'Shtren' &&
        s.name !== 'Seltex' &&
        s.name !== 'Voltag');
    const fromExcelScrapers = scrapers.filter((e) => e.exelova === true);
    const puppeteerResults = [];
    const axiosResults = [];
    const fromExcelResults = [];
    for (const scraper of fromExcelScrapers) {
        const res = await scraper.fn([productNames.name]);
        fromExcelResults.push(...res);
    }
    if (puppeteerScrapers.length) {
        const cluster = await puppeteer_cluster_1.Cluster.launch({
            concurrency: puppeteer_cluster_1.Cluster.CONCURRENCY_PAGE,
            maxConcurrency: 4,
            puppeteerOptions: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });
        await Promise.all(puppeteerScrapers.map(async (scraper) => {
            try {
                const result = await cluster.execute(async ({ page }) => {
                    return scraper.fn([productNames.name], page);
                });
                puppeteerResults.push(...result);
            }
            catch (err) {
                console.error(`❌ ${scraper.name} failed`, err);
                puppeteerResults.push({ shop: scraper.name, found: false });
            }
        }));
        await cluster.idle();
        await cluster.close();
    }
    const start = performance.now();
    await Promise.all(axiosScrapers.map(async (scraper) => {
        try {
            const result = await scraper.fn([productNames.name]);
            axiosResults.push(...result);
        }
        catch (err) {
            console.error(`❌ Axios scraper failed: ${scraper.name}`, err.message);
            axiosResults.push({ shop: scraper.name, found: false });
        }
    }));
    const allResults = [
        ...puppeteerResults,
        ...axiosResults,
        ...fromExcelResults,
    ];
    console.log('==', allResults);
    return allResults;
}
//# sourceMappingURL=indexForText.js.map
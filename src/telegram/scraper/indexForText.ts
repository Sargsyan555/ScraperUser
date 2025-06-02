import { ScrapedProduct } from 'src/types/context.interface';
import { Cluster } from 'puppeteer-cluster';

import { scrapeSeltex } from './sites/seltex'; // done 100% ++++++++++++++++++
import { scrape74Parts } from './sites/74parts'; // done 100% ++++++++++++++++++
import { scrapeIstkDeutz } from './sites/istk-deutz'; // done 100% ++++++++++++++++++
import { scrapeCamsParts } from './sites/camsparts'; // done 100% ++++++++++++++++++
import { scrapeIMachinery } from './sites/imachinery'; // done 100% ++++++++++++++++++
import { scrapePcaGroup } from './sites/pcagroup'; // done 100% ++++++++++++++++++
import { scrapeRecamgr } from './sites/recamgr'; // done 100% ++++++++++++++++++
// import { intertrek } from './sites/intertrek.info'; // done 100% ++++++++++++++++++
// import { scrapeIxora } from './sites/ixora'; // done 100% ++++++++++++++++++  hamapatasxanox brand chka
// import { udtTechnika } from './sites/udtTechnika';
// import { scrapeImpart } from './sites/impart'; // done 100% ++++++++++++++++++
// import { scrapeDvPt } from './sites/dv-pt'; //
// import { scrapeVoltag } from './sites/voltag'; //
// import { scrapeTruckdrive } from './sites/truckdrive'; //piti nayvi errora qcum u chisht artikul dnenq toshni chi
// import { scrapeMirDiesel } from './sites/mirdiesel'; // done 100% ++++++++++++++++++
// import { scrapeTruckmir } from './sites/truckmir'; // dandax
import { scrapeVoltag } from './sites/voltag';
import { scrapeShtren } from './sites/shtren'; // done 100% ++++++++++++++++++   miqich dandaxacnuma
import { InputText } from '../textMsg/comparator.textMsg';

// Scrapers config
const scrapers: {
  name: string;
  fn: (productNames: string[], page?: any) => Promise<ScrapedProduct[]>;
  usePuppeteer?: boolean;
  exelova?: boolean;
}[] = [
  { name: 'Seltex', fn: scrapeSeltex, exelova: true }, //+ fast
  { name: 'Voltag', fn: scrapeVoltag, exelova: true }, //+ fast
  { name: 'Shtren', fn: scrapeShtren, exelova: true }, // + dandax 5000
  { name: '74Parts', fn: scrape74Parts, exelova: true }, // + dandax
  { name: 'istk-deutz', fn: scrapeIstkDeutz, exelova: true }, // + dandax // exelova
  { name: 'Spb.camsparts', fn: scrapeCamsParts, usePuppeteer: false }, // + fast
  { name: 'Pcagroup', fn: scrapePcaGroup, usePuppeteer: false }, // + fast
  { name: 'Imachinery', fn: scrapeIMachinery, usePuppeteer: false }, //+ fast
  { name: 'Recamgr', fn: scrapeRecamgr, usePuppeteer: false }, // + fast
  // { name: 'udtTechnika', fn: udtTechnika, usePuppeteer: false ,exelova: true}, // +  dandax
  // { name: 'Dv-Pt', fn: scrapeDvPt, usePuppeteer: false,exelova: true }, // + dandax
  // { name: 'b2b.ixora-auto', fn: scrapeIxora, usePuppeteer: false,exelova: true }, // +
  // { name: 'Intertrek.info', fn: intertrek, usePuppeteer: false }, // + dandax
  // { name: 'Truckdrive', fn: scrapeTruckdrive, usePuppeteer: false,exelova: true }, // + dandax // exelova

  // { name: 'Impart', fn: scrapeImpart, usePuppeteer: false ,exelova: true}, // + dandax
  //{ name: 'Truckmir', fn: scrapeTruckmir, usePuppeteer: false,exelova: true }, // shaaaaat dandaxa
];

export async function scrapeAllForText(
  productNames: InputText,
): Promise<ScrapedProduct[]> {
  const puppeteerScrapers = scrapers.filter(
    (s) =>
      s.usePuppeteer &&
      s.name !== 'istk-deutz' &&
      s.name !== '74Parts' &&
      s.name !== 'Shtren' &&
      s.name !== 'Seltex' &&
      s.name !== 'Voltag',
  );
  const axiosScrapers = scrapers.filter(
    (s) =>
      !s.usePuppeteer &&
      s.name !== 'istk-deutz' &&
      s.name !== '74Parts' &&
      s.name !== 'Shtren' &&
      s.name !== 'Seltex' &&
      s.name !== 'Voltag',
  );

  const fromExcelScrapers = scrapers.filter((e) => e.exelova === true);

  const puppeteerResults: ScrapedProduct[] = [];
  const axiosResults: ScrapedProduct[] = [];
  const fromExcelResults: ScrapedProduct[] = [];

  for (const scraper of fromExcelScrapers) {
    const res = await scraper.fn([productNames.name]);

    fromExcelResults.push(...res);
  }

  if (puppeteerScrapers.length) {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 4,
      puppeteerOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // Individual scraper tasks
    await Promise.all(
      puppeteerScrapers.map(async (scraper) => {
        try {
          const result = await cluster.execute(async ({ page }) => {
            return scraper.fn([productNames.name], page);
          });
          puppeteerResults.push(...result);
        } catch (err) {
          console.error(`❌ ${scraper.name} failed`, err);
          puppeteerResults.push({ shop: scraper.name, found: false });
        }
      }),
    );

    await cluster.idle();
    await cluster.close();
  }

  // Run axios scrapers normally
  const start = performance.now();

  await Promise.all(
    axiosScrapers.map(async (scraper) => {
      try {
        const result = await scraper.fn([productNames.name]);
        axiosResults.push(...result);
      } catch (err: any) {
        console.error(`❌ Axios scraper failed: ${scraper.name}`, err.message);
        axiosResults.push({ shop: scraper.name, found: false });
      }
    }),
  );

  const allResults = [
    ...puppeteerResults,
    ...axiosResults,
    ...fromExcelResults,
  ];
  console.log('==', allResults);

  return allResults;
}

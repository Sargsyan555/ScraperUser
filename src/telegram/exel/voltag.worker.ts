// voltag.worker.ts
import { parentPort, workerData } from 'worker_threads';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Product {
  brand?: string;
  article?: string;
  name?: string;
  region?: string;
  days?: number;
  price?: number;
}

async function fetchOneProductPerBrand(
  url: string,
): Promise<Product[] | undefined> {
  try {
    console.log(url);

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const products: Product[] = [];
    const brandsSeen = new Set();

    $('table.search-list tbody tr').each((_, tr) => {
      const row = $(tr);
      const brand = row.find('td').eq(0).text().trim();
      if (brandsSeen.has(brand)) return;

      const article = row.find('td').eq(1).find('a.highslide').text().trim();
      const name = row.find('td').eq(2).text().trim();

      let priceText = row.find('td.amount b').text().trim();
      priceText = priceText.replace(/\s/g, '').replace(',', '.');
      const price = parseFloat(priceText) || 0;

      products.push({ article, name, brand, price });
      brandsSeen.add(brand);
    });

    return products;
  } catch (err) {
    console.error(`Worker failed on URL ${url}`);
    return undefined;
  }
}

(async () => {
  const urls: string[] = workerData;
  const results: Product[] = [];
  let count = 0;
  for (const url of urls) {
    console.log(count++, urls.length);
    
    const products = await fetchOneProductPerBrand(url);
    if (products) results.push(...products);
  }

  parentPort?.postMessage(results);
})();

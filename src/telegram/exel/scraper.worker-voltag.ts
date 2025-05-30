// scraper.worker.ts
import { parentPort, workerData } from 'worker_threads';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Product {
  brand?: string;
  article?: string;
  name?: string;
  price?: number;
}

async function fetchOneProductPerBrand(url: string): Promise<Product[]> {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

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
}

(async () => {
  try {
    const products = await fetchOneProductPerBrand(workerData.url);
    parentPort?.postMessage(products);
  } catch (error) {
    parentPort?.postMessage([]);
  }
})();

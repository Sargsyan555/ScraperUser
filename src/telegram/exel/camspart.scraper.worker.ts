// scraper.worker.ts
import { parentPort, workerData } from 'worker_threads';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ProductData {
  title: string;
  articul: string;
  price: string;
  brand: string;
  url: string;
}

async function getProductData(
  url: string,
): Promise<ProductData | null | undefined> {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const titleRaw = $('.shop_product__title[itemprop="name"]').text().trim();
    const title = titleRaw.toUpperCase();
    if (!title) return null;

    const articulRaw = $(
      '.shop_product__article span[itemprop="productID"]',
    ).text();
    console.log(articulRaw);

    const articul = articulRaw.replace(/Артикул:\s*/i, '').trim();

    const price = $('.price__new [itemprop="price"]').text().trim();

    const brandMatch = title.match(/\b[A-ZА-Я]{3,}\b/);
    const brand = brandMatch ? brandMatch[0] : '';

    parentPort?.postMessage({ title, articul, price, brand, url });
  } catch (error) {
    parentPort?.postMessage(null);
  }
}

getProductData(workerData.url);

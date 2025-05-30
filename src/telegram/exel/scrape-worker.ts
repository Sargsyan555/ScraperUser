// scrape-worker.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parentPort, workerData } from 'worker_threads';

interface ProductShtern {
  name: string;
  price: string;
  brand: string;
  article: string;
}

async function scrapeCategory(baseUrl: string): Promise<ProductShtern[]> {
  const brand = baseUrl.split('/product-category/')[1].replace('/', '');
  const products: ProductShtern[] = [];
  let currentPage = 1;

  while (true) {
    const url = currentPage === 1 ? baseUrl : `${baseUrl}?paged=${currentPage}`;

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const productItems = $('li.product.type-product');
      if (productItems.length === 0) break;

      productItems.each((_, elem) => {
        const name = $(elem)
          .find('h2.woocommerce-loop-product__title')
          .text()
          .trim();
        const price = $(elem)
          .find('span.woocommerce-Price-amount')
          .text()
          .trim();
        console.log(name, url);

        const articleMatch = name.match(/(\d{3,}-\d{3,}|\d{6,})/);
        const article = articleMatch ? articleMatch[1] : '';

        if (name && price) {
          products.push({ name, price, brand, article });
        }
      });

      const nextPageLink = $('ul.page-numbers li a.next.page-numbers');
      if (nextPageLink.length === 0) break;

      currentPage++;
    } catch (err) {
      break;
    }
  }
  return products;
}

scrapeCategory(workerData.baseUrl)
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch((err) => {
    parentPort?.postMessage({ error: err.message });
  });

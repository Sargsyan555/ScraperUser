import axios from 'axios';
import * as cheerio from 'cheerio';
import { parentPort, workerData } from 'worker_threads';

(async () => {
  const url: string = workerData;
  console.log(url);

  try {
    const { data } = await axios.get(url, { timeout: 500 }); // timeout for fast skip
    const $ = cheerio.load(data);

    const name = $('li:contains("Название")')
      .text()
      .replace('Название:', '')
      .trim();
    const brand = $('li:contains("Производитель")')
      .text()
      .replace('Производитель:', '')
      .trim();
    const articul = $('li')
      .filter((_, el) => $(el).text().trim().startsWith('Артикул:'))
      .text()
      .replace('Артикул:', '')
      .trim()
      .split('/')[0];
    console.log(articul);
    if (!name || !articul) {
      parentPort?.postMessage({
        success: false,
        url,
        error: 'Empty or invalid content',
      });
      return;
    }
    const priceText = $('#cenabasket2').text().trim();
    const price = priceText.replace(/[^\d]/g, '');

    parentPort?.postMessage({
      success: true,
      data: { articul, name, brand, price },
    });
  } catch (err) {
    parentPort?.postMessage({ success: false, url });
  }
})();

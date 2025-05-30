import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

interface Product {
  brand?: string;
  article?: string;
  description?: string;
  region?: string;
  days?: number;
  price?: number;
}

@Injectable()
export class TruckdriveService {
  async scrapeAllProducts() {
    const priceGroupUrls: string[] = [];
    console.log('@@@@@@@@@@@@@@@@@@@@');

    try {
      const response = await axios.get('http://truckdrive.ru/sitemap.xml');
      const result = await parseStringPromise(response.data);
      console.log(result);

      console.log(result.urlset.url);

      const tmp: string[] = result.urlset.url.map((entry: any) =>
        entry.loc[0].trim(),
      );
      // const urls = tmp.filter((url) =>
      //   url.includes('/details/catalog/product/'),
      // );
      console.log(tmp);

      // const { data: sitemapXml }: AxiosResponse<string> = await axios.get(
      //   'https://truckdrive.ru/sitemap.xml',
      // );
      // const sitemapIndex = (await parseStringPromise(sitemapXml)) as {
      //   urlset: { url: { loc: string[] }[] };
      // };
      // const sitemapUrls: string[] = sitemapIndex.urlset.url.map(
      //   (s) => s.loc[0],
      // );
      // console.log(9, sitemapUrls);
      // const validUrls = sitemapUrls.filter((item) => item.includes('search'));
      // // 2. Fetch each child sitemap and get catalog URLs
      // const allCatalogUrls: string[] = [];
      // for (const sitemapUrl of validUrls) {
      //   console.log(2, sitemapUrl.trim());

      //   const data: AxiosResponse<string> = await axios.get(sitemapUrl);
      // console.log(data);

      // const subResult = (await parseStringPromise(subXml)) as {
      //   urlset?: { url: { loc: string[] }[] };
      // };

      // const catalogUrls: string[] = (subResult.urlset?.url || [])
      //   .map((u) => u.loc[0])
      //   .filter((url) => url.includes('/catalog/group/'));

      // allCatalogUrls.push(...catalogUrls);

      // console.log('@@@@@', allCatalogUrls);

      // const catalogUrls: string[] = (subResult.urlset?.url || [])
      //   .map((u) => u.loc[0])
      //   .filter((url) => url.includes('/catalog/group/'));

      // allCatalogUrls.push(...subResult);
      // }
      // console.log(allCatalogUrls);

      // 3. Convert catalog URLs to price URLs
      // const allCatalogUrls = allCatalogUrls.map((url) =>
      //   url.replace('/catalog/group/', '/price/group/'),
      // );

      // console.log('prcav');
      // const filePath = await runAndSaveToExcel(allCatalogUrls);
      // return filePath; // You can return as array or string depending on your bot
    } catch (error: any) {
      console.error(
        'Failed to fetch or parse sitemaps:',
        error?.message || error,
      );
    }
  }
}

// async function fetchOneProductPerBrand(url) {
//   try {
//     const response: AxiosResponse<string> = await axios.get(url);
//     const html: string = response.data;

//     const $ = cheerio.load(html);

//     const products: Product[] = [];
//     const brandsSeen = new Set();

//     $('table.search-list tbody tr').each((_, tr) => {
//       const row = $(tr);
//       const brand = row.find('td').eq(0).text().trim();
//       if (brandsSeen.has(brand)) return;

//       const article = row.find('td').eq(1).find('a.highslide').text().trim();
//       const description = row.find('td').eq(2).text().trim();
//       const region = row.find('td').eq(3).text().trim();
//       const daysText = row.find('td.wh_days').text().trim();
//       const days = parseInt(daysText, 10) || 0;

//       let priceText = row.find('td.amount b').text().trim();
//       priceText = priceText.replace(/\s/g, '').replace(',', '.');
//       const price = parseFloat(priceText) || 0;

//       products.push({ brand, article, description, region, days, price });
//       brandsSeen.add(brand);
//     });

//     return products;
//   } catch {
//     console.error('url during is error');
//   }
// }

// // Function to scrape all URLs and save products to Excel
// async function runAndSaveToExcel(urls: string[]): Promise<string | undefined> {
//   const allProducts: Product[] = [];

//   for (let i = 0; i < urls.length / 10000; i++) {
//     try {
//       console.log(`Scraping URL ${i + 1} of ${urls.length}: ${urls[i]}`);

//       const products = await fetchOneProductPerBrand(urls[i]);
//       if (products) {
//         allProducts.push(...products);
//       }
//     } catch (err) {
//       console.error(`Error scraping URL ${urls[i]}:`, err);
//     }
//   }
//   if (allProducts.length === 0) {
//     console.log('No products found. Excel file will not be created.');
//     return;
//   }

//   // Convert JSON data to Excel worksheet

//   const worksheet = xlsx.utils.json_to_sheet(allProducts);
//   const workbook = xlsx.utils.book_new();
//   xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

//   // Write the workbook to file
//   const dir = path.join(__dirname, '..', 'excels'); // Adjust path as needed
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
//   const filePath = path.join(dir, 'products.xlsx');
//   xlsx.writeFile(workbook, filePath);
//   console.log(`✅ Data saved to ${filePath}`);
//   return filePath;
// }

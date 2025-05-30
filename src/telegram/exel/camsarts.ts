import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as xml2js from 'xml2js';
import * as cheerio from 'cheerio';
import ExcelJS from 'exceljs';
import * as path from 'path';
import * as XLSX from 'xlsx';

interface ProductData {
  title: string;
  articul: string;
  price: string;
  brand: string;
  url: string;
}

@Injectable()
export class ScraperCamspartService {
  private sitemapUrl = 'https://spb.camsparts.ru/sitemap.xml';

  async scrapeAndExport(): Promise<string> {
    console.log(`Starting scraping from sitemap: ${this.sitemapUrl}`);

    // Step 1: Get all product URLs from sitemap
    const productUrls = await this.getProductUrlsFromSitemap(this.sitemapUrl);
    const filtered = productUrls.filter((url) => {
      if (!url.includes('katalog-cummins')) return false;

      // Get the last part of the URL path (after the last '/')
      const lastSegment = url.split('/').filter(Boolean).pop(); // filter(Boolean) removes empty strings

      if (!lastSegment) return false;

      // Count digits in the last segment
      const digitCount = (lastSegment.match(/\d/g) || []).length;

      return digitCount > 6;
    });
    console.log(filtered);
    const products: ProductData[] = [];
    let count = 0;
    // Step 2: Scrape each product page
    for (const url of filtered) {
      count++;
      console.log(count);

      if (count > 100) {
        break;
      }
      try {
        console.log(`Scraping product page: ${url}`);
        const product = await this.getProductData(url);
        console.log(product);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.error(`Failed to scrape ${url}`, error);
      }
    }

    // Step 3: Save data to Excel
    const filePath = path.resolve(__dirname, '../products.xlsx');
    this.saveProductsToExcel(filePath, products);

    console.log(`Excel file saved to ${filePath}`);
    return filePath;
  }

  private async getProductUrlsFromSitemap(
    sitemapUrl: string,
  ): Promise<string[]> {
    const response = await axios.get(sitemapUrl);
    const xml = response.data;

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    console.log('steaxa', result);

    // Assuming sitemap structure: urlset > url[] > loc
    if (!result.urlset || !result.urlset.url) {
      throw new Error('Invalid sitemap structure');
    }

    return result.urlset.url.map((urlObj: any) => urlObj.loc[0]);
  }

  private async getProductData(url: string): Promise<ProductData | null> {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Title uppercased
    const titleRaw = $('.shop_product__title[itemprop="name"]').text().trim();
    const title = titleRaw.toUpperCase();
    if (!title) {
      return null;
    }
    // Articul extraction
    const articulRaw = $(
      '.shop_product__article span[itemprop="productID"]',
    ).text();
    const articul = articulRaw.replace(/Артикул:\s*/i, '').trim();

    // Price extraction
    const price = $('.price__new [itemprop="price"]').text().trim();

    // Brand extraction (heuristic: first uppercase word >=3 letters in title)
    const brandMatch = title.match(/\b[A-ZА-Я]{3,}\b/);
    const brand = brandMatch ? brandMatch[0] : '';
    console.log(title, articul, price, brand, url);

    return { title, articul, price, brand, url };
  }

  private saveProductsToExcel(filePath: string, products: ProductData[]) {
    const worksheetData = products.map((p) => ({
      Articule: p.articul,
      Name: p.title,
      Price: p.price,
      Brand: p.brand,
      URL: p.url,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    XLSX.writeFile(workbook, filePath);
    console.log(`Excel file saved to: ${filePath}`);
  }
}

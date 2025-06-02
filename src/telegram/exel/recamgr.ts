// src/scraper/scraper.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as zlib from 'zlib';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

interface ProductData {
  articul: string;
  name: string;
  price: string;
  brand: string;
  url: string;
}

@Injectable()
export class ScraperRecamgrService {
  private isProductUrl(url: string): boolean {
    return /\/p\/[0-9]+-/.test(url);
  }

  private async getUrlsFromGzSitemap(gzUrl: string): Promise<string[]> {
    const response = await axios.get(gzUrl, { responseType: 'arraybuffer' });
    const xmlBuffer = zlib.gunzipSync(response.data);
    const xml = xmlBuffer.toString('utf8');
    const parsed = await parseStringPromise(xml);
    return parsed.urlset.url
      .map((entry: any) => entry.loc[0])
      .filter(this.isProductUrl)
      .slice(1, 10);
  }

  private extractArticul(nameText: string): string {
    const parts = nameText.split(/\s|\//).reverse();
    return parts.find((p) => /[0-9\-]{5,}/.test(p)) || '';
  }

  private extractBrand($: cheerio.Root): string {
    const brandTag = $('a[title*="Запчасти"]');
    const title = brandTag.attr('title');
    if (!title) return '';
    const match = title.match(/Запчасти\s+(.*)/);
    return match ? match[1].trim() : title.trim();
  }

  private extractPrice($: cheerio.Root): string {
    const priceText = $('.goods-card__price .price__value').first().text();
    return priceText.replace(/[^\d.,]/g, '').replace(/\s/g, '');
  }

  async scrape(): Promise<{ filePath: string; products: ProductData[] }> {
    // const sitemapIndexUrl = 'https://recamgr.ru/sitemap.xml';
    // const sitemapXml = await axios.get(sitemapIndexUrl).then((res) => res.data);
    // const sitemapParsed = await parseStringPromise(sitemapXml);
    // const sitemapUrls: string[] = sitemapParsed.sitemapindex.sitemap.map(
    //   (s: any) => s.loc[0],
    // );

    // const allProductUrls: string[] = [];
    // for (const sitemapUrl of sitemapUrls) {
    //   if (sitemapUrl.endsWith('.gz')) {
    //     const productUrls = await this.getUrlsFromGzSitemap(sitemapUrl);
    //     allProductUrls.push(...productUrls);
    //   }
    // }
    const allProductUrls = await this.getUrlsFromGzSitemap(
      'https://recamgr.ru/sitemap_storage__firms__28__31__31705__sitemap2.xml.gz',
    );

    const products: ProductData[] = [];
    for (const url of allProductUrls) {
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const nameText = $('.title.section__title h1').first().text().trim();
        const articul = this.extractArticul(nameText);
        const brand = this.extractBrand($);
        const price = this.extractPrice($);

        products.push({ articul, name: nameText, brand, price, url });
      } catch (err) {
        console.warn(`Failed to scrape: ${url}`);
      }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    worksheet.columns = [
      { header: 'Articul', key: 'articul', width: 20 },
      { header: 'Name', key: 'name', width: 50 },
      { header: 'Brand', key: 'brand', width: 30 },
      { header: 'Price', key: 'price', width: 20 },
      { header: 'URL', key: 'url', width: 50 },
    ];
    worksheet.addRows(products);

    const filePath = path.join(__dirname, '../../products.xlsx');
    await workbook.xlsx.writeFile(filePath);
    console.log('prcccc');
    
    return { filePath, products };
  }
}

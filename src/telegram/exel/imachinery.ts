import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface Product {
  name: string;
  price: number;
  articule: string;
  brand: string;
  url: string;
}

@Injectable()
export class ScraperImachineryService {
  private baseUrl = 'https://imachinery.ru/specialoffers/';
  private outputFilePath = path.join(__dirname, '..', '..', 'products.xlsx');

  async scrapePage(page: number): Promise<Product[]> {
    const url = page === 1 ? this.baseUrl : `${this.baseUrl}?PAGEN_2=${page}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const products: Product[] = [];

    $('div[id^="bx_"]').each((_, element) => {
      const name = $(element).find('h3.kart_name a').text().trim();
      const articule = name.split(' ')[0];
      const priceText = $(element).find('.price').text().trim();
      const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);

      const tagLinks = $(element).find('.sk-tags-inner a');
      let brand = '';
      if (tagLinks.length > 0) {
        const firstText = $(tagLinks[0]).text().trim();
        const isRussian = /^[а-яА-ЯЁё\s]+$/.test(firstText);
        if (isRussian && tagLinks[1]) {
          brand = $(tagLinks[1]).text().trim();
        } else {
          brand = firstText;
        }
      }

      const link = $(element).find('h3.kart_name a').attr('href')?.trim() || '';
      const fullUrl = link ? new URL(link, this.baseUrl).href : this.baseUrl;

      products.push({ name, price, articule, brand, url: fullUrl });
    });

    return products;
  }

  async scrapeAllPages(maxPages: number = 122): Promise<{
    products: Product[];
    excelFilePath: string;
  }> {
    const allProducts: Product[] = [];

    for (let page = 1; page <= maxPages; page++) {
      console.log(`Scraping page ${page}...`);
      const products = await this.scrapePage(page);
      allProducts.push(...products);
    }

    this.saveToExcel(allProducts, this.outputFilePath);

    return {
      products: allProducts,
      excelFilePath: this.outputFilePath,
    };
  }

  private saveToExcel(products: Product[], filePath: string) {
    const worksheetData = products.map((p) => ({
      Articule: p.articule,
      Name: p.name,
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

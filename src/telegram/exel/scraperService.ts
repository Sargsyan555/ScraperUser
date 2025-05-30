import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ProductData {
  name: string;
  brand: string;
  article: string;
  price: number;
  feature: string;
}

@Injectable()
export class ScraperService {
  private readonly baseUrl = 'https://www.seltex.ru';

  async scrapeCatalog(): Promise<void> {

    const catalogUrl = `${this.baseUrl}/catalog`;
    try {
      const response: AxiosResponse<string> = await axios.get(catalogUrl);
      const data = response.data;
      const $ = cheerio.load(data);

      const productLinks: string[] = [];

      $('a.btn.btn-primary.btn-xs').each((_, el) => {
        const link = $(el).attr('href');
        console.log(link);

        const priceTd = $(el).closest('td').nextAll('td').eq(1);
        const priceText = priceTd.text().trim();
        const price = parseFloat(priceText);

        if (!isNaN(price) && price > 0 && link) {
          productLinks.push(this.baseUrl + link);
        }
      });
      console.log('!!!!!!!!!!!!!!!', productLinks);

      const products: ProductData[] = [];
      let count = 0;
      for (const link of productLinks) {
        if (count > 10) {
          break;
        }
        count++;
        const product = await this.scrapeProduct(link);
        if (product) products.push(product);
      }
      console.log(products);

      this.saveToExcel(products);
    } catch (error) {
      console.error('Error scraping catalog:', error.message);
    }
  }

  private async scrapeProduct(url: string): Promise<ProductData | null> {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const container = $('.jumbotron.my-part-description.container');

      const name = container.find('h1').text().trim();
      const priceText = container
        .find('div:contains("Цена") span')
        .first()
        .text()
        .trim();
      const price = parseFloat(priceText);

      const brand = container
        .find('div:contains("Производитель") span')
        .first()
        .text()
        .trim();

      const article = container.find('#partNumber').text().trim();

      return {
        name,
        brand,
        article,
        price,
        feature: article,
      };
    } catch (error) {
      console.error(`Failed to scrape product page: ${url}`, error.message);
      return null;
    }
  }

  private saveToExcel(data: ProductData[]): void {
    const sheet = XLSX.utils.json_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Products');

    const outputDir = path.resolve(__dirname, '..', '..', 'output');
    const filePath = path.join(outputDir, 'seltex_products.xlsx');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    XLSX.writeFile(book, filePath);
    console.log(`✅ Excel file saved: ${filePath}`);
  }
}

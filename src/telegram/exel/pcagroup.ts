import axios from 'axios';
import * as cheerio from 'cheerio';
import * as ExcelJS from 'exceljs';
import { writeFile } from 'fs/promises';
import * as XLSX from 'xlsx';
import * as path from 'path';

import { Injectable } from '@nestjs/common';
interface Product {
  name: string;
  price: number | string;
  articul: string;
  brand: string;
  url: string;
}
@Injectable()
export class ScraperPcaGroupService {
  private outputFilePath = path.join(__dirname, '..', '..', 'products.xlsx');

  private saveToExcel(products: Product[], filePath: string) {
    const worksheetData = products.map((p) => ({
      Articule: p.articul,
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
  async scrapeAllPages(): Promise<{
    products: Product[];
    excelFilePath: string;
  }> {
    const res = await axios.get('https://pcagroup.ru/search/?search=');
    const $ = cheerio.load(res.data);

    const products: Product[] = [];

    for (let page = 1; page <= 235; page++) {
      const url = `https://pcagroup.ru/search/?search=&_paged=${page}`;
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      $('.card').each((_, element) => {
        const card = $(element);

        const link = card.find('a.card__image').attr('href')?.trim() ?? '';
        const name = card.find('.card__title').text().trim();
        const artText = card.find('.card__art').first().text().trim(); // Артикул
        const brandText = card.find('.card__art').last().text().trim(); // Производитель
        const priceText = card.find('.price').text().trim();

        const articulMatch = artText.match(/Артикул:\s*(\S+)/);
        const articul = articulMatch ? articulMatch[1] : '';

        const brandMatch = brandText.match(/Производитель:\s*(.*)/);
        const brand = brandMatch ? brandMatch[1] : 'Неизвестно';

        const price = priceText.replace(/\D/g, '') || '0';

        products.push({
          articul,
          brand,
          name,
          price,
          url: link,
        });
      });
    }
    this.saveToExcel(products, this.outputFilePath);

    // const workbook = new ExcelJS.Workbook();
    // const worksheet = workbook.addWorksheet('Products');

    // worksheet.columns = [
    //   { header: 'Articul', key: 'articul' },
    //   { header: 'Brand', key: 'brand' },
    //   { header: 'Name', key: 'name' },
    //   { header: 'Price', key: 'price' },
    //   { header: 'URL', key: 'url' },
    // ];

    // worksheet.addRows(products);

    // const filePath = './public/products.xlsx';
    // await workbook.xlsx.writeFile(filePath);

    return { products, excelFilePath: this.outputFilePath };
  }
}

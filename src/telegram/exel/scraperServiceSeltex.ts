import axios from 'axios';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';

@Injectable()
export class ScraperServiceSeltex {
  private readonly baseUrl = 'https://www.seltex.ru';
  private readonly catalogUrl = `${this.baseUrl}/catalog`;
  private readonly logger = new Logger(ScraperServiceSeltex.name);

  constructor() {
    this.downloadAndProcessExcel().catch((err) =>
      this.logger.error('Initial download failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Running scheduled Excel download...');
    try {
      await this.downloadAndProcessExcel();
      this.logger.log('Scheduled Excel download completed successfully.');
    } catch (error) {
      this.logger.error('Scheduled Excel download failed:', error);
    }
  }

  private async downloadAndProcessExcel(): Promise<void> {
    this.logger.log(`Fetching catalog page: ${this.catalogUrl}`);
    try {
      const response = await axios.get(this.catalogUrl);
      const $ = cheerio.load(response.data);

      // Находим ссылку по тексту "ЗАГРУЗИТЬ ПРАЙС"
      const excelUrl = $('a')
        .filter((_, el) => $(el).text().trim() === 'ЗАГРУЗИТЬ ПРАЙС')
        .attr('href');

      if (!excelUrl) {
        this.logger.error('Excel download link not found on catalog page!');
        return;
      }

      this.logger.log(`Found Excel link: ${excelUrl}`);

      // Скачиваем файл в память (buffer)
      const fileResponse = await axios.get(excelUrl, {
        responseType: 'arraybuffer',
      });

      // Читаем Excel из буфера
      const workbook = XLSX.read(fileResponse.data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Конвертируем в JSON для удобной обработки
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      // Маппинг старых названий в новые
      const columnMap: Record<string, string> = {
        name: 'name',
        manufacturer: 'brand',
        'main number': 'articul',
        'all numbers': 'all numbers',
        price: 'price',
        'stock msk': 'stock msk',
        'stock spb': 'stock spb',
      };

      // Преобразуем данные с переименованием ключей
      const processedData = jsonData.map((row) => {
        const newRow: Record<string, any> = {};
        for (const oldKey in row) {
          const lowerKey = oldKey.toLowerCase();
          if (columnMap[lowerKey]) {
            newRow[columnMap[lowerKey]] = row[oldKey];
          }
        }
        return newRow;
      });

      // Создаём новый лист и книгу
      const newSheet = XLSX.utils.json_to_sheet(processedData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'ProcessedProducts');

      // Сохраняем только итоговый файл
      const newFilePath = path.join(
        process.cwd(),
        '/src/telegram/scraper',
        'SeltexPrice.xlsx',
      );
      XLSX.writeFile(newWorkbook, newFilePath);
      this.logger.log(`✅ Processed Excel saved: ${newFilePath}`);
    } catch (error) {
      this.logger.error(
        'Failed to download/process Excel:',
        error.message || error,
      );
    }
  }
}

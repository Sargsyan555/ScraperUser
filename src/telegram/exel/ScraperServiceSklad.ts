import axios from 'axios';
import * as XLSX from 'xlsx';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

interface ProductData {
  title: string;
  price: number;
}

@Injectable()
export class SkladService {
  private readonly logger = new Logger(SkladService.name);
  private readonly yandexDiskUrl = 'https://disk.yandex.ru/i/FE5LjEWujhR0Xg';

  // Your existing data structure
  data: {
    Sklad: Record<string, ProductData[]>;
  } = { Sklad: {} };

  constructor() {
    this.loadSkladExcel().catch((e) =>
      this.logger.error('Initial Sklad load failed', e),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Scheduled Sklad Excel load started');
    try {
      await this.loadSkladExcel();
      this.logger.log('Scheduled Sklad Excel load finished');
    } catch (e) {
      this.logger.error('Scheduled Sklad Excel load failed', e);
    }
  }

  private async loadSkladExcel() {
    this.logger.log(
      `Downloading Excel from Yandex Disk: ${this.yandexDiskUrl}`,
    );
    const response = await axios.get(this.yandexDiskUrl, {
      responseType: 'arraybuffer',
    });

    const workbook = XLSX.read(response.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const skladItems: any[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    });

    // Clear previous data
    this.data.Sklad = {};

    for (const row of skladItems) {
      if (!row['кат.номер']) continue;

      const key = String(row['кат.номер']).trim();

      const priceValue = row['цена, RUB'];
      let price: number;

      if (typeof priceValue === 'string') {
        price = parseInt(priceValue.replace(/[^\d]/g, ''), 10) || 0;
      } else if (typeof priceValue === 'number') {
        price = priceValue;
      } else {
        price = 0;
      }

      const product: ProductData = {
        title: row['название детали'] || '-',
        price,
      };

      if (!this.data.Sklad[key]) {
        this.data.Sklad[key] = [];
      }
      this.data.Sklad[key].push(product);
    }

    this.logger.log('✅ Sklad loaded and processed');
  }
}

import { Injectable, OnModuleInit } from "@nestjs/common";
import { readExcelFromYandexDisk } from "src/stock/readExcelFromYandexDisk";
import { StockService } from "src/stock/stock.service";
import * as XLSX from "xlsx";

type ProductData = {
  title: string;
  price: number;
  stock?: string | number;
  brand?: string;
};
type UdtRow = {
  Артикул?: string;
  Название?: string;
  Цена?: string | number;
  Производитель?: string;
};
type SeltexRow = {
  name?: string;
  brand?: string;
  articul?: string;
  "all numbers"?: string;
  price?: number | string;
  stock?: string | number;
  "stock msk"?: string;
  "stock mpb"?: string;
};

type SeventyFourRow = {
  article?: string;
  title?: string;
  price?: number | string;
  availability?: string | number;
};
type IstkDeutzRow = {
  articul?: string;
  title?: string;
  price?: number | string;
  stock?: string | number;
};
// type VoltagProductData = {
//   Articul: string;
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };

// type UdtProductData = {
//   Articul: string;
//   Name: string;
//   Price: number;
//   Brand: string;
// };

// Different sheet row types

// type ShtrenProductData = {
//   Articul: string;
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };
// type PcagroupProductData = {
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };
// type ImachineryProductData = {
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };

// type CamspartProductData = {
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };
// type DvptProductData = {
//   Name: string;
//   Price: string | number;
//   Brand?: string;
// };
type ExcelDataMap = {
  Sklad: Record<string, ProductData[]>;
  Seltex: Record<string, ProductData[]>;
  SeventyFour: Record<string, ProductData[]>;
  IstkDeutz: Record<string, ProductData[]>;
  Voltag: Record<string, ProductData[]>;
  Shtren: Record<string, ProductData[]>;
  UdtTexnika: Record<string, ProductData[]>;
  Camspart: Record<string, ProductData[]>;
  Dvpt: Record<string, ProductData[]>;
  Pcagroup: Record<string, ProductData[]>;
  Imachinery: Record<string, ProductData[]>;
};

@Injectable()
export class ExcelCacheLoaderService implements OnModuleInit {
  private data: ExcelDataMap = {
    Sklad: {},
    Seltex: {},
    SeventyFour: {},
    IstkDeutz: {},
    Voltag: {},
    Shtren: {},
    UdtTexnika: {},
    Camspart: {},
    Dvpt: {},
    Pcagroup: {},
    Imachinery: {},
  };

  onModuleInit() {
    this.loadSklad();
    this.loadSeltex();
    this.loadSeventyFour();
    this.loadIstkDeutz();
    this.loadVoltag();
    this.loadUdtTexnika();
    this.loadShtren();
    this.loadCamspart();
    this.loadDvpt();
    this.loadPcagroup();
    this.loadImachinery();
    console.log("✅ All Excel data loaded and cached.");
  }

  private async loadSklad() {
    const skladItems = await readExcelFromYandexDisk(
      "https://disk.yandex.ru/i/FE5LjEWujhR0Xg"
    );

    for (const row of skladItems) {
      if (!row["кат.номер"]) continue;
      const key = row["кат.номер"].trim();

      const priceValue = row["цена, RUB"] as string | number;

      const product: ProductData = {
        title: row["название детали"] || "-",
        price:
          typeof priceValue === "string"
            ? parseInt(priceValue.replace(/[^\d]/g, ""), 10) || 0
            : priceValue || 0,
      };

      if (!this.data.Sklad[key]) {
        this.data.Sklad[key] = [];
      }

      this.data.Sklad[key].push(product);
    }

    console.log("✅ Sklad loaded");
  }

  private loadShtren() {
    const workbook = XLSX.readFile("src/telegram/scraper/shtren.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articul?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
    }>(sheet);

    for (const row of rows) {
      if (!row.Articul) continue;
      const key = row.Articul.trim();

      const product: ProductData = {
        title: row.Name || "-",
        price:
          typeof row.Price === "string"
            ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
            : row.Price || 0,
        brand: row.Brand || "-",
      };

      if (!this.data.Shtren[key]) {
        this.data.Shtren[key] = [];
      }

      this.data.Shtren[key].push(product);
    }

    console.log("✅ Shtren loaded");
  }

  private loadSeltex() {
    const workbook = XLSX.readFile("src/telegram/scraper/SeltexPrice.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: SeltexRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.articul?.trim();
      if (!key) continue;

      const product: ProductData = {
        title: row.name || "-",
        price:
          typeof row.price === "string"
            ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
            : row.price || 0,
        stock: row.stock || "-",
        brand: row.brand || "-",
      };

      if (!this.data.Seltex[key]) this.data.Seltex[key] = [];
      this.data.Seltex[key].push(product);
    }

    console.log("✅ Seltex loaded");
  }

  private loadSeventyFour() {
    const workbook = XLSX.readFile("src/telegram/scraper/74PartBase.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: SeventyFourRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const rawArticle = row.article?.trim();
      if (!rawArticle) continue;

      // Split by comma, slash, or both with optional whitespace
      const keys = rawArticle
        .split(/[,/]\s*/)
        .map((k) => k.trim())
        .filter(Boolean);

      const product: ProductData = {
        title: row.title || "-",
        price:
          typeof row.price === "string"
            ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
            : row.price || 0,
        stock: row.availability || "-",
        //ToDo add brand
      };

      for (const key of keys) {
        if (!this.data.SeventyFour[key]) this.data.SeventyFour[key] = [];
        this.data.SeventyFour[key].push(product);
      }
    }

    console.log("✅ 74Part loaded");
  }

  private loadIstkDeutz() {
    const workbook = XLSX.readFile("src/telegram/scraper/istk-deutzZ.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: IstkDeutzRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.articul?.trim();
      if (!key) continue;

      const product: ProductData = {
        title: row.title || "-",
        price:
          typeof row.price === "string"
            ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
            : row.price || 0,
        stock: row.stock || "-",
      };

      if (!this.data.IstkDeutz[key]) this.data.IstkDeutz[key] = [];
      this.data.IstkDeutz[key].push(product);
    }

    console.log("✅ IstkDeutz loaded");
  }
  private loadVoltag() {
    const workbook = XLSX.readFile("src/telegram/scraper/voltag.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      article?: string;
      name?: string;
      price?: string | number;
      brand?: string;
    }>(sheet);

    for (const row of rows) {
      if (!row.article) continue;
      const key = row.article.trim();

      const product: ProductData = {
        title: row.name || "-",
        price:
          typeof row.price === "string"
            ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
            : row.price || 0,
        brand: row.brand || "-",
        stock: "-",
      };

      if (!this.data.Voltag[key]) {
        this.data.Voltag[key] = [];
      }

      this.data.Voltag[key].push(product);
    }

    console.log("✅ Voltag loaded");
  }
  private loadUdtTexnika() {
    const workbook = XLSX.readFile("src/telegram/scraper/udttechnika.xlsx");
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetData: UdtRow[] = XLSX.utils.sheet_to_json(worksheet);

    for (const row of sheetData) {
      if (!row["Артикул"]) continue;
      const key = row["Артикул"].trim();

      const product: ProductData = {
        title: row["Название"] || "-",
        price:
          typeof row["Цена"] === "string"
            ? parseInt(row["Цена"].replace(/[^\d]/g, ""), 10) || 0
            : row["Цена"] || 0,
        brand: row["Производитель"] || "-",
        stock: "-",
      };

      if (!this.data.UdtTexnika[key]) {
        this.data.UdtTexnika[key] = [];
      }

      this.data.UdtTexnika[key].push(product);
    }

    console.log("✅ Udt Texnika Excel loaded----");
  }
  private loadCamspart() {
    const workbook = XLSX.readFile("src/telegram/scraper/camspart.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articule?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
      URL?: string; // Present in Excel but ignored
    }>(sheet);
    // console.log(rows);

    for (const row of rows) {
      if (!row.Articule) continue;
      const key = row.Articule.trim();

      const product: ProductData = {
        title: row.Name || "-",
        price:
          typeof row.Price === "string"
            ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
            : row.Price || 0,
        brand: row.Brand || "-",
      };

      if (!this.data.Camspart[key]) {
        this.data.Camspart[key] = [];
      }

      this.data.Camspart[key].push(product);
    }

    console.log("✅ Camspart loaded");
  }
  private loadDvpt() {
    const workbook = XLSX.readFile("src/telegram/scraper/dvpt.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      article?: string;
      title?: string;
      price?: string | number;
    }>(sheet);

    for (const row of rows) {
      if (!row.article) continue;
      const key = row.article.trim();

      const product: ProductData = {
        title: row.title || "-",
        price:
          typeof row.price === "string"
            ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
            : row.price || 0,
      };

      if (!this.data.Dvpt[key]) {
        this.data.Dvpt[key] = [];
      }

      this.data.Dvpt[key].push(product);
    }

    console.log("✅ DvPt loaded");
  }
  private loadPcagroup() {
    const workbook = XLSX.readFile("src/telegram/scraper/pcagroup.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articul?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
    }>(sheet);

    for (const row of rows) {
      if (!row.Articul) continue;
      const key = row.Articul.trim();

      const product: ProductData = {
        title: row.Name || "-",
        price:
          typeof row.Price === "string"
            ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
            : row.Price || 0,
        brand: row.Brand || "-",
      };

      if (!this.data.Pcagroup[key]) {
        this.data.Pcagroup[key] = [];
      }

      this.data.Pcagroup[key].push(product);
    }

    console.log("✅ Pcagroup loaded");
  }
  private loadImachinery() {
    const workbook = XLSX.readFile("src/telegram/scraper/imachinery.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articule?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
    }>(sheet);
    // console.log(rows);

    for (const row of rows) {
      if (!row.Articule) continue;
      const key = row.Articule.trim();

      const product: ProductData = {
        title: row.Name || "-",
        price:
          typeof row.Price === "string"
            ? parseInt(row.Price.replace(/[^\d]/g, ""), 10) || 0
            : row.Price || 0,
        brand: row.Brand || "-",
      };

      if (!this.data.Imachinery[key]) {
        this.data.Imachinery[key] = [];
      }

      this.data.Imachinery[key].push(product);
    }

    console.log("✅ Imachery loaded");
  }
  public getExcelData(): ExcelDataMap {
    return this.data;
  }
}

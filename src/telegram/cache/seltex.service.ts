import { Injectable } from "@nestjs/common";
import * as XLSX from "xlsx";

type ExcelRow = {
  name?: string;
  brand?: string;
  articul?: string;
  "all numbers"?: string;
  price?: number | string;
  stock?: string | number;
  "stock msk"?: string;
  "stock mpb"?: string;
};

type ProductData = {
  name?: string;
  "all numbers"?: string;
  title?: string;
  price?: number | string;
  stock?: string | number;
  brand?: string;
  "stock msk"?: string;
  "stock mpb"?: string;
  articul?: string;
};

@Injectable()
export class SeltexService {
  private productsByArticle: Record<string, ProductData[]> = {};

  loadExcelData() {
    const workbook = XLSX.readFile("src/telegram/scraper/SeltexPrice.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    for (const row of sheetData) {
      if (row["articul"]) {
        const product: ProductData = {
          name: row.name || "-",
          price:
            typeof row.price === "string"
              ? parseInt(row.price.replace(/[^\d]/g, ""), 10) || 0
              : row.price || 0,
          stock: row.stock || "-",
          brand: row.brand || "-",
          "stock msk": row["stock msk"] || "-",
          "stock mpb": row["stock mpb"] || "-",
          articul: row["articul"],
        };

        if (!this.productsByArticle[row["articul"]]) {
          this.productsByArticle[row["articul"]] = [];
        }

        this.productsByArticle[row["articul"]].push(product);
      }
    }

    console.log("✅ Seltex Excel DB loaded and cached.");
  }

  findProductsBySeltex(article: string): ProductData[] {
    const key = article.trim();
    return this.productsByArticle[key] || [];
  }
}

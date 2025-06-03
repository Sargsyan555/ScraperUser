import { Injectable } from "@nestjs/common";
import {
  InjectBot,
  Start,
  Help,
  On,
  Ctx,
  Update,
  Action,
} from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { Context } from "src/types/context.interface";
import { StartHandler } from "./handlers/start.handler";
import { TextHandler } from "./handlers/text.handler";
import { HelpHandler } from "./handlers/help.handler";
import { DocumentHandler } from "./handlers/document.handler";
import { UsersService } from "./authorization/users.service";
import { UserHandler } from "./handlers/user.handleer";
import { getMainMenuKeyboard } from "./utils/manu";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { ExcelCacheLoaderService } from "./cache/cache.service";
import { normalizeInput } from "./utils/validator";
import { ScraperCamspartService } from "./exel/camsarts";

type ProductData = {
  title: string;
  price: number;
  stock?: string | number;
  brand?: string;
};

type ExcelData = {
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
@Update()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly startHandler: StartHandler,
    private readonly textHandler: TextHandler,
    private readonly helpHandler: HelpHandler,
    private readonly documentHandler: DocumentHandler,
    private readonly userHandler: UserHandler,
    private readonly usersService: UsersService, // ✅ inject it
    private readonly camspart: ScraperCamspartService,
    private readonly excelCacheLoaderService: ExcelCacheLoaderService
  ) {}
  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.startHandler.handle(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await this.helpHandler.handle(ctx);
  }
  @On("message")
  async onMessage(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (!message) {
      await ctx.reply("⚠️ Не удалось прочитать сообщение.");
      return;
    }
    if (ctx.session.step === "add_user" || ctx.session.step === "delete_user") {
      await ctx.sendChatAction("typing");
      await ctx.reply("⌛ Пожалуйста, подождите, идет обработка...");
      await this.textHandler.handle(ctx);
      return;
    }
    if ("document" in message) {
      ctx.session.step = "document";
      await ctx.reply(
        "📂 Вы отправили файл. Пожалуйста, подождите, идет обработка..."
      );
      await this.documentHandler.handle(ctx);
    } else if ("text" in message) {
      ctx.session.step = "single_part_request";
      const textMessage = message?.text?.trim();
      if (!textMessage) {
        await ctx.reply("❌ Пожалуйста, отправьте текстовое сообщение.");
        return;
      }

      const parts = textMessage.split(",").map((part) => part.trim());

      let artikul = "";
      let qtyStr = "1"; // по умолчанию 1
      let brand = "";

      if (parts.length === 3) {
        [artikul, qtyStr, brand] = parts;
        const num = Number(qtyStr);
        if (!isNaN(num) && isFinite(num) && num > 0) {
          await ctx.reply("❌ Неверный формат. Пример: 1979322, 1, CAT");
        }
      } else if (parts.length === 2) {
        let second: string;
        [artikul, second] = parts;
        if (!isNaN(Number(second))) {
          qtyStr = second;
        } else {
          brand = second;
        }
      } else if (parts.length === 1) {
        artikul = parts[0];
      } else {
        await ctx.reply("❌ Неверный формат. Пример: 1979322, 1, CAT");
        return;
      }

      const qty = Number(qtyStr);

      if (!artikul || isNaN(qty) || qty < 1) {
        await ctx.reply("❌ Неверные данные. Пример: 1979322, 1, CAT");
        return;
      }

      await ctx.reply(
        "🔄 Запрос принят! Ищем информацию, пожалуйста, подождите..."
      );

      const articul = normalizeInput(artikul);

      await ctx.reply(
        "✉️ Вы отправили текст. Пожалуйста, подождите, идет обработка..."
      );
      const article = articul;
      const data: ExcelData = this.excelCacheLoaderService.getExcelData();

      const combinedDataBySource: Record<keyof ExcelData, ProductData[]> = {
        Sklad: data.Sklad[article] || [],
        Seltex: data.Seltex[article] || [],
        SeventyFour: data.SeventyFour[article] || [],
        IstkDeutz: data.IstkDeutz[article] || [],
        Voltag: data.Voltag[article] || [],
        Shtren: data.Shtren[article] || [],
        UdtTexnika: data.UdtTexnika[article] || [],
        Camspart: data.Camspart[article] || [],
        Dvpt: data.Dvpt[article] || [],
        Pcagroup: data.Pcagroup[article] || [],
        Imachinery: data.Imachinery[article] || [],
      };
      const validPriceData = filterValidPriceProducts(combinedDataBySource);
      console.log("val = ", validPriceData);

      // const { matchedBrand, notMatchedBrand } =
      //   filterProductsByBrand(validPriceData);
      // console.log('=====', matchedBrand, notMatchedBrand);
      let lowestPrice: {
        shop: keyof ExcelData;
        product: ProductData;
      } | null = null;
      let resultToTelegram = "";
      console.error(brand);

      if (brand) {
        const { matchedBrand } = filterProductsByBrand(validPriceData, brand);
        lowestPrice = getLowestPriceProduct(matchedBrand);
        if (!lowestPrice) {
          resultToTelegram += `❌ ${article}: не найдено ни одной цены с этим брендом`;
          // return;
        }
      } else {
        lowestPrice = getLowestPriceProduct(validPriceData);
      }

      // const resultOfNotMatch = getLowestPriceNotMatchProduct(notMatchedBrand);

      if (!lowestPrice || lowestPrice.product.price === 0) {
        resultToTelegram += `❌ ${article}: не найдено ни одной цены`;
      } else {
        const totalPrice: any = lowestPrice.product.price * qty;
        resultToTelegram += `✅ Кат.номер: ${article} | 🏷️ Цена: ${lowestPrice.product.price}₽ | 🏪 Магазин: "${lowestPrice.shop}" | 💰 Итог: ${totalPrice}₽ | 🏷️ Бренд: ${lowestPrice.product.brand}`;
      }

      await ctx.reply(resultToTelegram);
    } else {
      await ctx.reply("⚠️ Неподдерживаемый тип сообщения.");
    }
  }

  @Action("template_excel_download")
  async onTemplateExcelDownload(@Ctx() ctx: Context) {
    let filePath = join(process.cwd(), "dist", "assets", "template.xlsx");

    if (!existsSync(filePath)) {
      filePath = join(process.cwd(), "src", "assets", "template.xlsx");
    }
    try {
      await ctx.replyWithDocument({
        source: createReadStream(filePath),
        filename: "Шаблон.xlsx",
      });
    } catch (error) {
      console.error("Ошибка при отправке шаблона Excel:", error);
      await ctx.reply("❌ Не удалось отправить файл шаблона.");
    }
  }

  @Action("scrape_seltex")
  async onScrapPages(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery("Starting to scrape pages...");

      const filepath = await this.camspart.scrapeAndExport();
      console.log(filepath);

      // await ctx.reply(`✅ Scraped ${products.length} products successfully.`);

      // ✅ Send the Excel file
      await ctx.replyWithDocument({
        source: filepath,
        // filename: 'seltex-products.xlsx',
      });
    } catch (error) {
      console.error("Error during scraping:", error.message);

      try {
        await ctx.reply("❌ An error occurred during scraping.");
      } catch (e) {
        console.error("Failed to send reply:", e.message);
      }
    }
  }
}

// Main function to filter products by brand
function filterProductsByBrand(
  combinedDataBySource: Record<keyof ExcelData, ProductData[]>,
  userBrend: string
): {
  matchedBrand: Record<keyof ExcelData, ProductData[]>;
  // notMatchedBrand: Record<keyof ExcelData, ProductData[]>;
} {
  const matchedBrand = {} as Record<keyof ExcelData, ProductData[]>;
  // const notMatchedBrand = {} as Record<keyof ExcelData, ProductData[]>;

  for (const source in combinedDataBySource) {
    const products = combinedDataBySource[source as keyof ExcelData];

    matchedBrand[source as keyof ExcelData] = [];
    // notMatchedBrand[source as keyof ExcelData] = [];

    for (const product of products) {
      // const normalizedBrand = product.brand?.trim().toLowerCase();
      // let brand = '';
      const isMatch =
        userBrend.toLowerCase().trim() === product.brand?.toLowerCase().trim();
      console.log(
        "userBrend.toLowerCase().trim() === product.brand?.toLowerCase().trim()",
        userBrend.toLowerCase().trim(),
        product.brand?.toLowerCase().trim()
      );

      // const isMatch =
      //   normalizedBrand && normalizedBrand !== '-'
      //     ? BRANDS.some((b) => b.toLowerCase() === normalizedBrand)
      //     : BRANDS.some((b) => {
      //         brand = b;
      //         console.error(b, normalizedBrand);

      //         return product.title?.toLowerCase().includes(b.toLowerCase());
      //       });

      if (isMatch) {
        // product.brand = brand;
        matchedBrand[source as keyof ExcelData].push(product);
      } else {
        const slicedTitle = product.title.split(" ");
        const bool = slicedTitle.some((b) => {
          if (b.toLowerCase() === userBrend.toLowerCase()) {
            product.brand = b;
            return b.toLowerCase() === userBrend.toLowerCase();
          }
        });
        if (bool) {
          matchedBrand[source as keyof ExcelData].push(product);
        }
      }
    }
  }

  return {
    matchedBrand,
    // notMatchedBrand,
  };
}

function filterValidPriceProducts(
  dataBySource: Record<keyof ExcelData, ProductData[]>
): Record<keyof ExcelData, ProductData[]> {
  const result = {} as Record<keyof ExcelData, ProductData[]>;

  for (const source in dataBySource) {
    const products = dataBySource[source as keyof ExcelData];

    result[source as keyof ExcelData] = products
      .map((product) => {
        const rawPrice: number = product.price;

        if (rawPrice > 0) {
          return {
            ...product,
            price: rawPrice, // ✅ store the cleaned number
          };
        }

        return null;
      })
      .filter((p): p is ProductData => p !== null);
  }

  return result;
}
export function getLowestPriceProduct(
  data: Record<keyof any, ProductData[]>
): { shop: keyof ExcelData; product: ProductData } | null {
  let bestProduct: ProductData | null = null;
  let bestShop: keyof ExcelData | null = null;

  for (const shop in data) {
    const products = data[shop as keyof ExcelData];
    for (const product of products) {
      if (!bestProduct || product.price < bestProduct.price) {
        bestProduct = product;
        bestShop = shop as keyof ExcelData;
      }
    }
  }

  if (bestProduct && bestShop) {
    return { shop: bestShop, product: bestProduct };
  }

  return null;
}
function getLowestPriceNotMatchProduct(
  data: Record<keyof ExcelData, ProductData[]>
): { shop: keyof ExcelData; product: ProductData } | null {
  let bestProduct: ProductData | null = null;
  let bestShop: keyof ExcelData | null = null;

  for (const shop in data) {
    const products = data[shop as keyof ExcelData];
    for (const product of products) {
      if (!bestProduct || product.price < bestProduct.price) {
        bestProduct = product;
        bestShop = shop as keyof ExcelData;
      }
    }
  }

  if (bestProduct && bestShop) {
    return { shop: bestShop, product: bestProduct };
  }

  return null;
}

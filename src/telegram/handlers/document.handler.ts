import { Injectable } from "@nestjs/common";
import { Context } from "src/types/context.interface";
import { Message } from "telegraf/typings/core/types/typegram";
import { parseExcelFromTelegram } from "../exel/parse.and.read";
import { createResultExcelBuffer } from "../exel/generator.createResultExcel";
import { InputExelFile, ParsedRow, ResultRowTest } from "../exel/exel.types";
import { getMainMenuKeyboard } from "../utils/manu";
import { UsersService } from "../authorization/users.service";
import { StockService } from "src/stock/stock.service";
import { ExcelCacheLoaderService } from "../cache/cache.service";
import { normalizeInput } from "../utils/validator";
import { getLowestPriceProduct } from "../telegram.service";
type ExcelData = {
  Sklad: Record<string, ProductData[]>;
  Solid: Record<string, ProductData[]>;
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
type ProductData = {
  title: string;
  price: number;
  stock?: string | number;
  brand?: string;
};
@Injectable()
export class DocumentHandler {
  // stockService: ParsedRow[];
  constructor(
    private readonly userService: UsersService,
    private readonly stockService: StockService,
    private readonly excelCacheLoaderService: ExcelCacheLoaderService
  ) {}

  async handle(ctx: Context) {
    const message = ctx.message;
    if (!message || !("document" in message)) {
      return ctx.reply("❌ Пожалуйста, отправьте Excel‑файл.");
    }

    const { document } = message as Message.DocumentMessage;
    const fileName = document.file_name ?? "";

    if (!/\.xlsx?$/.test(fileName)) {
      return ctx.reply("❌ Загрузите файл с расширением `.xlsx` или `.xls`");
    }

    try {
      await ctx.reply("🔍 Идёт проверка по складу...");

      const inputItems: InputExelFile[] = await parseExcelFromTelegram(
        document.file_id,
        ctx.telegram
      );
      const start = performance.now();

      if (!inputItems.length) {
        return ctx.reply("Ваш файл Excel пустой.");
      }

      const skladItems: ParsedRow[] = this.stockService.getStock();

      console.log(
        skladItems.length > 0 ? "sklad is done !" : "sklad dont loaded"
      );

      await ctx.reply(
        "🌐 Идёт поиск по сайтам поставщиков. Пожалуйста, подождите..."
      );
      const finalResult: ResultRowTest[] = [];
      console.log(inputItems);
      inputItems.forEach((element: InputExelFile) => {
        let article = element["кат.номер"];
        const qtyStr = element["кол-во"] || 1;
        // let brand = '';

        // await ctx.reply(
        //   '🔄 Запрос принят! Ищем информацию, пожалуйста, подождите...',
        // );
        article = normalizeInput(article);

        const data: ExcelData = this.excelCacheLoaderService.getExcelData();

        let combinedDataBySource: Record<keyof ExcelData, ProductData[]> = {
          Sklad: data.Sklad[article] || [],
          Solid: data.Solid[article] || [],
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
        combinedDataBySource = filterValidPriceProducts(combinedDataBySource);
        const best = getLowestPriceProduct(combinedDataBySource);
        const lowestPrice = best ? best.product.price : 0;
        const total = lowestPrice * qtyStr;
        finalResult.push({
          name: article,
          kalichestvo: qtyStr,
          luchshayaCena: lowestPrice,
          summa: total,
          luchshiyPostavshik: best?.shop,
        });
      });
      console.log(finalResult);
      const filePath = createResultExcelBuffer(finalResult);
      await ctx.replyWithDocument({
        source: filePath,
        filename: "seltex-products.xlsx",
      });
      // const { messages, rows } = await compareItems(inputItems, skladItems);
      // console.log('000', rows);

      const durationSec = ((performance.now() - start) / 1000).toFixed(2);
      // const resultBuffer = createResultExcelBuffer(rows);
      await ctx.reply(`⏱ Операция заняла ${durationSec} секунд.`);

      // for (const msg of messages) await ctx.reply(msg);

      // await ctx.replyWithDocument({
      //   // source: resultBuffer,
      //   // filename: 'result.xlsx',
      // });

      ctx.session.step = undefined;
      const x = await getMainMenuKeyboard(
        ctx.from?.username || "",
        this.userService
      );
      // x);

      await ctx.reply("👇 Выберите, что хотите сделать дальше:", {
        parse_mode: "MarkdownV2",
        ...x,
      });
    } catch (err) {
      console.error("Ошибка при обработке Excel:", err);
      await ctx.reply("❌ Не удалось обработать файл.");
    }
  }
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

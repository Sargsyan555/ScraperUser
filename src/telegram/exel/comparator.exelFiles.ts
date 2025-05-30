import { ScrapedProduct } from "src/types/context.interface";
import { InputExelFile, ParsedRow, ResultRow } from "./exel.types";
import { Worker } from "worker_threads";

type PriceInfo = {
  price: number | string;
  shopName: string | undefined;
  brand: string | undefined;
};

function runScrapeWorker(partNumber: string): Promise<ScrapedProduct[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + "/scrapeWorker.js");

    worker.postMessage(partNumber);
    worker.on("message", (msg) => {
      if (msg.success) {
        resolve(msg.result);
      } else {
        reject(
          new Error(`Ошибка скрапинга для ${msg.partNumber}: ${msg.error}`)
        );
      }
      worker.terminate();
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Воркер остановился с кодом выхода ${code}`));
    });
  });
}

export async function compareItems(
  inputItems: InputExelFile[],
  skladItems: ParsedRow[]
): Promise<{ messages: string[]; notFound: string[]; rows: ResultRow[] }> {
  const messages: string[] = [];
  const notFound: string[] = [];
  const resultRows: ResultRow[] = [];

  const concurrencyLimit = 8;
  let running = 0;
  let index = 0;

  async function runNext() {
    if (index >= inputItems.length) return;

    const inputItem = inputItems[index++];

    const partNumber = inputItem["кат.номер"];
    const inputQty = inputItem["кол-во"] ?? 0;

    if (!partNumber) return runNext();

    running++;
    try {
      // Запускаем воркер для скрапинга
      let resultFromScrap: ScrapedProduct[] = await runScrapeWorker(
        String(partNumber).trim()
      );
      resultFromScrap = resultFromScrap.filter(
        (e) => e.price && !isNaN(Number(e.price)) && +e.price
      );
      // Ищем цену на складе
      const skladMatch = skladItems.find((s) => s["кат.номер"] === partNumber);
      const brandSklad = skladMatch?.["название детали"] ?? "нет бренда";
      const priceSklad = skladMatch?.["цена, RUB"] ?? "-";

      // Инициализируем цены магазинов
      let seltexPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "seltex",
      };
      let imachineryPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "imachinery",
      };
      let parts74Price: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "parts74",
      };
      let impartPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "impart",
      };
      let pcagroupPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "pcagroup",
      };
      let camspartsPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "camsparts",
      };
      let shtrenPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "shtern",
      };
      let recamgrPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "recamgr",
      };
      let istkiDeutzPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "istk-deutz",
      };
      let intertrekPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "Intertrek.info",
      };
      let ixoraPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "b2b.ixora-auto",
      };
      let udtTechnikaPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "udtTechnika",
      };
      let dvPtPrice: PriceInfo = { brand: "", price: "-", shopName: "dvpt" };
      let voltagPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "voltag",
      };
      let mirDieselPrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "mirdiesel",
      };
      let truckdrivePrice: PriceInfo = {
        brand: "",
        price: "-",
        shopName: "truckdrive",
      };

      const allPrices: PriceInfo[] = [
        { price: priceSklad, shopName: "sklad", brand: brandSklad },
      ];

      // Обрабатываем результаты скрапинга
      resultFromScrap.forEach((r: ScrapedProduct) => {
        let { price } = r;
        const { shop, brand } = r;

        if (price) {
          const cleaned = String(price)
            .replace(/[\s\u00A0]/g, "")
            .replace(/,/g, ".");
          price = Number.isFinite(Number(cleaned)) ? Number(cleaned) : 0;
          // const shopPriceMutQty = inputQty * price;
          const entry = { price, shopName: shop, brand };

          switch (shop) {
            case "seltex":
              seltexPrice = entry;
              allPrices.push(entry);
              break;
            case "imachinery":
              imachineryPrice = entry;
              allPrices.push(entry);
              break;
            case "parts74":
              parts74Price = entry;
              allPrices.push(entry);
              break;
            case "impart":
              impartPrice = entry;
              allPrices.push(entry);
              break;
            case "pcagroup":
              pcagroupPrice = entry;
              allPrices.push(entry);
              break;
            case "camsparts":
              camspartsPrice = entry;
              allPrices.push(entry);
              break;
            case "shtern":
              shtrenPrice = entry;
              allPrices.push(entry);
              break;
            case "recamgr":
              recamgrPrice = entry;
              allPrices.push(entry);
              break;
            case "istk":
              istkiDeutzPrice = entry;
              allPrices.push(entry);
              break;
            case "Intertrek.info":
              intertrekPrice = entry;
              allPrices.push(entry);
              break;
            case "b2b.ixora-auto":
              ixoraPrice = entry;
              allPrices.push(entry);
              break;
            case "udtTechnika":
              udtTechnikaPrice = entry;
              allPrices.push(entry);
              break;
            case "mirdiesel":
              mirDieselPrice = entry;
              allPrices.push(entry);
              break;
            case "voltag":
              voltagPrice = entry;
              allPrices.push(entry);
              break;
            case "dvpt":
              dvPtPrice = entry;
              allPrices.push(entry);
              break;
            case "truckdrive":
              truckdrivePrice = entry;
              allPrices.push(entry);
              break;
            default:
              break;
          }
        }
      });

      let bestPrice: PriceInfo = { price: "-", shopName: "", brand: "" };
      let totalPrice = 0;
      // Выбираем лучшую цену (минимальную > 0
      if (allPrices.length > 0) {
        const sorted: PriceInfo[] = [...allPrices]
          .filter((a) => typeof a.price == "number")
          .sort((a, b) => Number(a.price) - Number(b.price));

        const firstNonZero = sorted.find((p) => Number(p.price) > 0);
        bestPrice = firstNonZero ?? sorted[0];
        totalPrice = Number(bestPrice.price) * inputQty;
      }

      if (bestPrice.price === 0) {
        messages.push(`❌ ${partNumber}: не найдено ни одной цены`);
        notFound.push(partNumber);
      } else {
        messages.push(
          `✅ ${partNumber}: лучшая цена ${bestPrice.price}₽ в ${bestPrice.shopName}`
        );
      }

      // Формируем строку результата

      resultRows.push({
        name: partNumber,
        kalichestvo: inputQty,
        luchshayaCena: bestPrice.price,
        summa: totalPrice,
        luchshiyPostavshik: bestPrice.shopName || "",
        sklad: [priceSklad, brandSklad],
        // seltex: 0,
        seltex: [seltexPrice.price, seltexPrice.brand],
        // imachinery: 0,
        imachinery: [imachineryPrice.price, imachineryPrice.brand],
        // '74parts': 0,
        "74parts": [parts74Price.price, parts74Price.brand],
        // impart: 0,
        impart: [impartPrice.price, impartPrice.brand],
        // pcagroup: 0,
        pcagroup: [pcagroupPrice.price, pcagroupPrice.brand],
        // 'spb.camsparts': 0,
        "spb.camsparts": [camspartsPrice.price, camspartsPrice.brand],
        // shtern: 0,
        shtern: [shtrenPrice.price, shtrenPrice.brand],
        // recamgr: 0,
        recamgr: [recamgrPrice.price, recamgrPrice.brand],
        // 'istk-deutz': 0,
        "istk-deutz": [istkiDeutzPrice.price, istkiDeutzPrice.brand],
        // intertrek: 0,
        intertrek: [intertrekPrice.price, intertrekPrice.brand],
        // 'b2b.ixora-auto': 0,
        "b2b.ixora-auto": [ixoraPrice.price, ixoraPrice.brand],
        // "udtTechnika": 0,
        udtTechnika: [udtTechnikaPrice.price, udtTechnikaPrice.brand],
        // voltag: 0,
        voltag: [voltagPrice.price, voltagPrice.brand],
        // 'dv-pt': 0,
        dvpt: [dvPtPrice.price, dvPtPrice.brand],
        // truckdrive: 0,
        truckdrive: [truckdrivePrice.price, truckdrivePrice.brand],
        // mirdiesel: 0,
        mirdiesel: [mirDieselPrice.price, mirDieselPrice.brand],
        "vip.blumaq": [],
        // 'vip.blumaq': vipBlumaqPrice.price,
        kta50: [],
        zipteh: [],
        truckmir: [],
        "solid-t": [],
      });
    } catch {
      // messages.push(`❌ Ошибка при поиске ${partNumber}: ${error.message}`);
      notFound.push(partNumber);
    } finally {
      running--;
      await runNext();
    }
  }

  // Запускаем несколько воркеров одновременно с ограничением
  const runners: Promise<void>[] = [];
  for (let i = 0; i < concurrencyLimit; i++) {
    runners.push(runNext());
  }

  await Promise.all(runners);

  return { messages, notFound, rows: resultRows };
}

import { ScrapedProduct } from 'src/types/context.interface';
import { InputExelFile, ParsedRow, ResultRow } from './exel.types';
import { Worker } from 'worker_threads';

type PriceInfo = {
  price: number | string;
  shopName: string | undefined;
  brand: string | undefined;
};

function runScrapeWorker(partNumber: string): Promise<ScrapedProduct[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + '/scrapeWorker.js');

    worker.postMessage(partNumber);
    worker.on('message', (msg) => {
      if (msg.success) {
        resolve(msg.result);
      } else {
        reject(
          new Error(`Ошибка скрапинга для ${msg.partNumber}: ${msg.error}`),
        );
      }
      worker.terminate();
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Воркер остановился с кодом выхода ${code}`));
    });
  });
}

export async function compareItems(
  inputItems: InputExelFile[],
  skladItems: ParsedRow[],
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

    const partNumber = inputItem['кат.номер'];
    const inputQty = inputItem['кол-во'] ?? 0;

    if (!partNumber) return runNext();

    running++;
    try {
      // Запускаем воркер для скрапинга
      let resultFromScrap: ScrapedProduct[] = await runScrapeWorker(
        String(partNumber).trim(),
      );
      resultFromScrap = resultFromScrap.filter(
        (e) => e.price && !isNaN(Number(e.price)) && +e.price,
      );

      // Ищем цену на складе
      const skladMatch = skladItems.find((s) => s['кат.номер'] === partNumber);
      const brandSklad = skladMatch?.['название детали'] ?? 'нет бренда';
      const priceSklad = skladMatch?.['цена, RUB'] ?? '-';

      // Инициализируем все цены как массивы, чтобы хранить несколько значений
      const seltexPrice: PriceInfo[] = [];
      const imachineryPrice: PriceInfo[] = [];
      const parts74Price: PriceInfo[] = [];
      const impartPrice: PriceInfo[] = [];
      const pcagroupPrice: PriceInfo[] = [];
      const camspartsPrice: PriceInfo[] = [];
      const shtrenPrice: PriceInfo[] = [];
      const recamgrPrice: PriceInfo[] = [];
      const istkiDeutzPrice: PriceInfo[] = [];
      const intertrekPrice: PriceInfo[] = [];
      const ixoraPrice: PriceInfo[] = [];
      const udtTechnikaPrice: PriceInfo[] = [];
      const dvPtPrice: PriceInfo[] = [];
      const voltagPrice: PriceInfo[] = [];
      const mirDieselPrice: PriceInfo[] = [];
      const truckdrivePrice: PriceInfo[] = [];

      const allPrices: PriceInfo[] = [
        { price: priceSklad, shopName: 'sklad', brand: brandSklad },
      ];

      // Обрабатываем результаты скрапинга
      resultFromScrap.forEach((r: ScrapedProduct) => {
        let { price } = r;
        const { shop, brand } = r;

        if (price) {
          const cleaned = String(price)
            .replace(/[\s\u00A0]/g, '')
            .replace(/,/g, '.');
          price = Number.isFinite(Number(cleaned)) ? Number(cleaned) : 0;
          const entry = { price, shopName: shop, brand };

          switch (shop) {
            case 'seltex':
              seltexPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'imachinery':
              imachineryPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'parts74':
              parts74Price.push(entry);
              allPrices.push(entry);
              break;
            case 'impart':
              impartPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'pcagroup':
              pcagroupPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'camsparts':
              camspartsPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'shtern':
              shtrenPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'recamgr':
              recamgrPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'istk':
              istkiDeutzPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'Intertrek.info':
              intertrekPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'b2b.ixora-auto':
              ixoraPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'udtTechnika':
              udtTechnikaPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'mirdiesel':
              mirDieselPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'voltag':
              voltagPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'dvpt':
              dvPtPrice.push(entry);
              allPrices.push(entry);
              break;
            case 'truckdrive':
              truckdrivePrice.push(entry);
              allPrices.push(entry);
              break;
            default:
              break;
          }
        }
      });

      let bestPrice: PriceInfo = { price: '-', shopName: '', brand: '' };
      let totalPrice = 0;
      // Выбираем лучшую цену (минимальную > 0)
      if (allPrices.length > 0) {
        const sorted: PriceInfo[] = [...allPrices]
          .filter((a) => typeof a.price == 'number')
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
          `✅ ${partNumber}: лучшая цена ${bestPrice.price}₽ в ${bestPrice.shopName}`,
        );
      }

      // Формируем строку результата, теперь для каждого магазина - массив цен и брендов
      resultRows.push({
        name: partNumber,
        kalichestvo: inputQty,
        luchshayaCena: bestPrice.price,
        summa: totalPrice,
        luchshiyPostavshik: bestPrice.shopName || '',
        sklad: [priceSklad, brandSklad],
        seltex: seltexPrice,
        imachinery: imachineryPrice,
        '74parts': parts74Price,
        impart: impartPrice,
        pcagroup: pcagroupPrice,
        'spb.camsparts': camspartsPrice,
        shtern: shtrenPrice,
        recamgr: recamgrPrice,
        'istk-deutz': istkiDeutzPrice,
        intertrek: intertrekPrice,
        'b2b.ixora-auto': ixoraPrice,
        udtTechnika: udtTechnikaPrice,
        voltag: voltagPrice,
        dvpt: dvPtPrice,
        truckdrive: truckdrivePrice,
        mirdiesel: mirDieselPrice,
        'vip.blumaq': [],
        kta50: [],
        zipteh: [],
        truckmir: [],
        'solid-t': [],
      });
      console.log(resultRows);
    } catch {
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareItems = compareItems;
const worker_threads_1 = require("worker_threads");
function runScrapeWorker(partNumber) {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads_1.Worker(__dirname + '/scrapeWorker.js');
        worker.postMessage(partNumber);
        worker.on('message', (msg) => {
            if (msg.success) {
                resolve(msg.result);
            }
            else {
                reject(new Error(`Ошибка скрапинга для ${msg.partNumber}: ${msg.error}`));
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
async function compareItems(inputItems, skladItems) {
    const messages = [];
    const notFound = [];
    const resultRows = [];
    const concurrencyLimit = 8;
    let running = 0;
    let index = 0;
    async function runNext() {
        if (index >= inputItems.length)
            return;
        const inputItem = inputItems[index++];
        const partNumber = inputItem['кат.номер'];
        const inputQty = inputItem['кол-во'] ?? 0;
        if (!partNumber)
            return runNext();
        running++;
        try {
            let resultFromScrap = await runScrapeWorker(String(partNumber).trim());
            resultFromScrap = resultFromScrap.filter((e) => e.price && !isNaN(Number(e.price)) && +e.price);
            const skladMatch = skladItems.find((s) => s['кат.номер'] === partNumber);
            const brandSklad = skladMatch?.['название детали'] ?? 'нет бренда';
            const priceSklad = skladMatch?.['цена, RUB'] ?? '-';
            const seltexPrice = [];
            const imachineryPrice = [];
            const parts74Price = [];
            const impartPrice = [];
            const pcagroupPrice = [];
            const camspartsPrice = [];
            const shtrenPrice = [];
            const recamgrPrice = [];
            const istkiDeutzPrice = [];
            const intertrekPrice = [];
            const ixoraPrice = [];
            const udtTechnikaPrice = [];
            const dvPtPrice = [];
            const voltagPrice = [];
            const mirDieselPrice = [];
            const truckdrivePrice = [];
            const allPrices = [
                { price: priceSklad, shopName: 'sklad', brand: brandSklad },
            ];
            resultFromScrap.forEach((r) => {
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
            let bestPrice = { price: '-', shopName: '', brand: '' };
            let totalPrice = 0;
            if (allPrices.length > 0) {
                const sorted = [...allPrices]
                    .filter((a) => typeof a.price == 'number')
                    .sort((a, b) => Number(a.price) - Number(b.price));
                const firstNonZero = sorted.find((p) => Number(p.price) > 0);
                bestPrice = firstNonZero ?? sorted[0];
                totalPrice = Number(bestPrice.price) * inputQty;
            }
            if (bestPrice.price === 0) {
                messages.push(`❌ ${partNumber}: не найдено ни одной цены`);
                notFound.push(partNumber);
            }
            else {
                messages.push(`✅ ${partNumber}: лучшая цена ${bestPrice.price}₽ в ${bestPrice.shopName}`);
            }
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
        }
        catch {
            notFound.push(partNumber);
        }
        finally {
            running--;
            await runNext();
        }
    }
    const runners = [];
    for (let i = 0; i < concurrencyLimit; i++) {
        runners.push(runNext());
    }
    await Promise.all(runners);
    return { messages, notFound, rows: resultRows };
}
//# sourceMappingURL=comparator.exelFiles.js.map
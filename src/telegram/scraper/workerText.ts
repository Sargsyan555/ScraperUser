// scraper-worker.ts
import { workerData, parentPort } from 'worker_threads';

(async () => {
  const { scraperPath, fnName, productName, scraperName } = workerData;

  try {
    const scraperModule = await import(scraperPath);
    const result = await scraperModule[fnName]([productName]);
    parentPort?.postMessage(result);
  } catch (err: any) {
    console.error(`❌ Failed in worker: ${scraperName}`, err.message);
    parentPort?.postMessage([{ shop: scraperName, found: false, error: err.message }]);
  }
})();

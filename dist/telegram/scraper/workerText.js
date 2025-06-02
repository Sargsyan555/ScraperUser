"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
(async () => {
    const { scraperPath, fnName, productName, scraperName } = worker_threads_1.workerData;
    try {
        const scraperModule = await Promise.resolve(`${scraperPath}`).then(s => require(s));
        const result = await scraperModule[fnName]([productName]);
        worker_threads_1.parentPort?.postMessage(result);
    }
    catch (err) {
        console.error(`❌ Failed in worker: ${scraperName}`, err.message);
        worker_threads_1.parentPort?.postMessage([{ shop: scraperName, found: false, error: err.message }]);
    }
})();
//# sourceMappingURL=workerText.js.map
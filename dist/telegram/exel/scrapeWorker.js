"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const scraper_1 = require("../scraper");
worker_threads_1.parentPort?.on('message', async (partNumber) => {
    try {
        const result = await (0, scraper_1.scrapeAll)([partNumber.trim()]);
        if (worker_threads_1.parentPort) {
            worker_threads_1.parentPort.postMessage({ success: true, result, partNumber });
        }
    }
    catch (err) {
        if (worker_threads_1.parentPort) {
            worker_threads_1.parentPort.postMessage({
                success: false,
                error: err.message,
                partNumber,
            });
        }
    }
});
//# sourceMappingURL=scrapeWorker.js.map
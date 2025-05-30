"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const indexForText_1 = require("../scraper/indexForText");
worker_threads_1.parentPort?.on('message', async (InputItem) => {
    try {
        const result = await (0, indexForText_1.scrapeAllForText)(InputItem);
        if (worker_threads_1.parentPort) {
            worker_threads_1.parentPort.postMessage({ success: true, result, InputItem });
        }
    }
    catch (err) {
        if (worker_threads_1.parentPort) {
            worker_threads_1.parentPort.postMessage({
                success: false,
                error: err.message,
                InputItem,
            });
        }
    }
});
//# sourceMappingURL=scrapeWorkerForText.js.map
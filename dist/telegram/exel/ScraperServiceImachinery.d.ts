export declare class ScraperImachineryService {
    private readonly logger;
    private readonly baseUrl;
    private readonly maxPages;
    private readonly outputFilePath;
    constructor();
    handleCron(): Promise<void>;
    scrapeAndExport(): Promise<string | null>;
    private scrapePage;
    private saveToExcel;
}

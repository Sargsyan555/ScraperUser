export declare class ScraperServicePcagroup {
    private readonly logger;
    private readonly outputFilePath;
    constructor();
    handleCron(): Promise<void>;
    private saveToExcel;
    private scrapeAllPages;
}

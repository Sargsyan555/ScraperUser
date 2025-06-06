export declare class ScraperServiceVoltag {
    private readonly logger;
    private readonly sitemapUrl;
    private readonly outputDir;
    constructor();
    handleCron(): Promise<void>;
    private scrapeAndSave;
    private chunkArray;
    private saveToExcel;
}

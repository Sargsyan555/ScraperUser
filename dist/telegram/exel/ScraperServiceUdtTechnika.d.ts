export declare class ScraperServiceUdtTechnika {
    private readonly logger;
    private readonly sitemapUrl;
    constructor();
    handleCron(): Promise<void>;
    private getProductUrls;
    private scrapeProduct;
    private scrapeAndExport;
}

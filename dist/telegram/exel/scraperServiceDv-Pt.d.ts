export declare class ScraperServiceDvPt {
    private readonly sitemapUrl;
    private readonly logger;
    constructor();
    handleCron(): Promise<void>;
    private fetchAndSaveUrls;
    private scrapeAndExport;
    private scrapePage;
    private processAll;
}

export declare class ScraperService74Parts {
    private readonly logger;
    private readonly sitemapUrls;
    private readonly parser;
    constructor();
    private init;
    handleCron(): Promise<void>;
    private fetchSitemapLinks;
    private scrapeProductPage;
    private handleScraping;
    private saveToExcel;
}

export declare class ScraperServiceIstkDeutz {
    private readonly logger;
    private readonly sitemapUrl;
    private readonly outputFilePath;
    constructor();
    handleCron(): Promise<void>;
    private delay;
    private fetchSitemapUrls;
    private scrapeData;
    private main;
}

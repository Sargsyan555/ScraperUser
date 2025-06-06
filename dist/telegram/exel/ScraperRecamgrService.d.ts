export declare class ScraperRecamgrService {
    private readonly logger;
    constructor();
    handleCron(): Promise<void>;
    private isProductUrl;
    private getUrlsFromGzSitemap;
    private extractArticul;
    private extractBrand;
    private extractPrice;
    private scrapeAndSave;
}

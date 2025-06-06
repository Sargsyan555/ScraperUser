export declare class ScraperCamspartService {
    private readonly sitemapUrl;
    private readonly logger;
    constructor();
    handleCron(): Promise<void>;
    scrapeAndExport(): Promise<string | null>;
    private getProductUrlsFromSitemap;
    private getProductData;
    private saveProductsToExcel;
}

export interface ProductShtern {
    name: string;
    price: string;
    brand: string;
    article: string;
}
export declare class ScraperServiceShtren {
    private readonly logger;
    private readonly categories;
    handleCron(): Promise<void>;
    constructor();
    scrapeAllCategories(): Promise<{
        products: ProductShtern[];
        filePath: string;
    }>;
    private runWorker;
    private saveToExcel;
}

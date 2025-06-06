interface Product {
    name: string;
    price: number | string;
    article: string;
    brand: string;
    url: string;
    availability: string | number;
}
export declare class ScraperSolidService {
    private readonly logger;
    private readonly baseUrl;
    private readonly outputFilePath;
    constructor();
    handleCron(): Promise<void>;
    scrapePage(page: number): Promise<Product[]>;
    scrapeAllPages(maxPages?: number): Promise<void>;
    private saveToExcel;
}
export {};

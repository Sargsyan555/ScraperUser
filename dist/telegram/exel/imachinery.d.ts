interface Product {
    name: string;
    price: number;
    articule: string;
    brand: string;
    url: string;
}
export declare class ScraperImachineryService {
    private baseUrl;
    private outputFilePath;
    scrapePage(page: number): Promise<Product[]>;
    scrapeAllPages(maxPages?: number): Promise<{
        products: Product[];
        excelFilePath: string;
    }>;
    private saveToExcel;
}
export {};

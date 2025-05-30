export interface ProductShtern {
    name: string;
    price: string;
    brand: string;
    article: string;
}
export declare class ProductScraperService {
    private readonly categories;
    scrapeAllCategories(): Promise<{
        products: ProductShtern[];
        filePath: string;
    }>;
    private runWorker;
    private saveToExcel;
}

interface ProductUdt {
    name: string;
    articul: string;
    price: string | number;
    brand: string;
}
export declare class ScraperServiceUdt {
    scrapeAndExport(): Promise<{
        filePath: string;
        products: ProductUdt[];
    }>;
}
export {};

interface ProductData {
    articul: string;
    name: string;
    price: string;
    brand: string;
    url: string;
}
export declare class ScraperRecamgrService {
    private isProductUrl;
    private getUrlsFromGzSitemap;
    private extractArticul;
    private extractBrand;
    private extractPrice;
    scrape(): Promise<{
        filePath: string;
        products: ProductData[];
    }>;
}
export {};

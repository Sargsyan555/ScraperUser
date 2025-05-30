interface Product {
    name: string;
    price: number | string;
    articul: string;
    brand: string;
    url: string;
}
export declare class ScraperPcaGroupService {
    private outputFilePath;
    private saveToExcel;
    scrapeAllPages(): Promise<{
        products: Product[];
        excelFilePath: string;
    }>;
}
export {};

type ProductData = {
    name?: string;
    "all numbers"?: string;
    title?: string;
    price?: number | string;
    stock?: string | number;
    brand?: string;
    "stock msk"?: string;
    "stock mpb"?: string;
    articul?: string;
};
export declare class SeltexService {
    private productsByArticle;
    loadExcelData(): void;
    findProductsBySeltex(article: string): ProductData[];
}
export {};

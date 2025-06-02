type ProductData = {
    article?: string;
    title?: string;
    price?: number | string;
    availability?: string | number;
};
export declare class SeventyFourPartService {
    private productsByArticle;
    loadExcelData(): void;
    findProductsByArticle(article: string): ProductData[];
}
export {};

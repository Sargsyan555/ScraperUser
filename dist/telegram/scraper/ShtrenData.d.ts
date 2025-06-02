type ProductData = {
    Articul?: string;
    Name?: string;
    Price?: string | number;
    Brand?: string;
};
declare const productsByArticle: Record<string, ProductData[]>;
export declare function findProductsByShtren(article: string): ProductData[];
export { productsByArticle };

type ProductData = {
    Articul?: string;
    Name?: string;
    Price?: string | number;
    Brand?: string;
};
declare const productsByArticle: Record<string, ProductData>;
export declare function findProductByShtren(article: string): ProductData | null;
export { productsByArticle };

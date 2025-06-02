type ProductData = {
    article?: string;
    title?: string;
    price?: number | string;
    availability?: string | number;
};
declare const productsByArticle: Record<string, ProductData[]>;
export declare function findProductsBy74Part(article: string): ProductData[];
export { productsByArticle };

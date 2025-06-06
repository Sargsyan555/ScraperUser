type ProductData = {
    name?: string;
    'all numbers'?: string;
    title?: string;
    price?: number | string;
    stock?: string | number;
    brand?: string;
    'stock msk'?: string;
    'stock mpb'?: string;
    articul?: string;
};
declare const productsByArticle: Record<string, ProductData[]>;
export declare function findProductsBySeltex(article: string): ProductData[];
export { productsByArticle };

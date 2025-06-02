type ProductData = {
    title: string;
    price: number;
    stock: string | number;
};
declare const productsByArticul: Record<string, ProductData[]>;
export declare function findProductsByistkDeutz(articul: string): ProductData[];
export { productsByArticul };

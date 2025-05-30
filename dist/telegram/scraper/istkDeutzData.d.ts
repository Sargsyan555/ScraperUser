type ProductData = {
    title: string;
    price: number;
    stock: string | number;
};
declare const productsByArticul: Record<string, ProductData>;
export declare function findProductByistkDeutz(articul: string): ProductData | null;
export { productsByArticul };

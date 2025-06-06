interface ProductData {
    title: string;
    price: number;
}
export declare class SkladService {
    private readonly logger;
    private readonly yandexDiskUrl;
    data: {
        Sklad: Record<string, ProductData[]>;
    };
    constructor();
    handleCron(): Promise<void>;
    private loadSkladExcel;
}
export {};

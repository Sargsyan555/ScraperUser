import { OnModuleInit } from "@nestjs/common";
type ProductData = {
    title: string;
    price: number;
    stock?: string | number;
    brand?: string;
    articul?: string;
    artikul?: string;
};
type ExcelDataMap = {
    Sklad: Record<string, ProductData[]>;
    Solid: Record<string, ProductData[]>;
    Seltex: Record<string, ProductData[]>;
    SeventyFour: Record<string, ProductData[]>;
    IstkDeutz: Record<string, ProductData[]>;
    Voltag: Record<string, ProductData[]>;
    Shtren: Record<string, ProductData[]>;
    UdtTexnika: Record<string, ProductData[]>;
    Camspart: Record<string, ProductData[]>;
    Dvpt: Record<string, ProductData[]>;
    Pcagroup: Record<string, ProductData[]>;
    Imachinery: Record<string, ProductData[]>;
    Zipteh: Record<string, ProductData[]>;
    Ixora: Record<string, ProductData[]>;
    Recamgr: Record<string, ProductData[]>;
};
export declare class ExcelCacheLoaderService implements OnModuleInit {
    private data;
    onModuleInit(): void;
    private loadSklad;
    private loadRecamgr;
    private loadIxora;
    private loadZipteh;
    private loadSolid;
    private loadShtren;
    private loadSeltex;
    private loadSeventyFour;
    private loadIstkDeutz;
    private loadVoltag;
    private loadUdtTexnika;
    private loadCamspart;
    private loadDvpt;
    private loadPcagroup;
    private loadImachinery;
    getExcelData(): ExcelDataMap;
}
export {};

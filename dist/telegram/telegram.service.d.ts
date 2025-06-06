import { Telegraf } from "telegraf";
import { Context } from "src/types/context.interface";
import { StartHandler } from "./handlers/start.handler";
import { TextHandler } from "./handlers/text.handler";
import { HelpHandler } from "./handlers/help.handler";
import { DocumentHandler } from "./handlers/document.handler";
import { UsersService } from "./authorization/users.service";
import { UserHandler } from "./handlers/user.handleer";
import { ExcelCacheLoaderService } from "./cache/cache.service";
type ProductData = {
    title: string;
    price: number;
    stock?: string | number;
    brand?: string;
};
type ExcelData = {
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
};
export declare class TelegramService {
    private readonly bot;
    private readonly startHandler;
    private readonly textHandler;
    private readonly helpHandler;
    private readonly documentHandler;
    private readonly userHandler;
    private readonly usersService;
    private readonly excelCacheLoaderService;
    constructor(bot: Telegraf<Context>, startHandler: StartHandler, textHandler: TextHandler, helpHandler: HelpHandler, documentHandler: DocumentHandler, userHandler: UserHandler, usersService: UsersService, excelCacheLoaderService: ExcelCacheLoaderService);
    onStart(ctx: Context): Promise<void>;
    onHelp(ctx: Context): Promise<void>;
    onMessage(ctx: Context): Promise<void>;
    onTemplateExcelDownload(ctx: Context): Promise<void>;
}
export declare function getLowestPriceProduct(data: Record<keyof any, ProductData[]>): {
    shop: keyof ExcelData;
    product: ProductData;
} | null;
export {};

import { Context } from "src/types/context.interface";
import { Message } from "telegraf/typings/core/types/typegram";
import { UsersService } from "../authorization/users.service";
import { StockService } from "src/stock/stock.service";
import { ExcelCacheLoaderService } from "../cache/cache.service";
export declare class DocumentHandler {
    private readonly userService;
    private readonly stockService;
    private readonly excelCacheLoaderService;
    constructor(userService: UsersService, stockService: StockService, excelCacheLoaderService: ExcelCacheLoaderService);
    handle(ctx: Context): Promise<Message.TextMessage | undefined>;
}

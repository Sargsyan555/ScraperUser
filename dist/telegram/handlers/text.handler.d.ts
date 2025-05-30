import { Context } from "src/types/context.interface";
import { UsersService } from "../authorization/users.service";
import { StockService } from "src/stock/stock.service";
export declare class TextHandler {
    private readonly usersService;
    private readonly stockService;
    constructor(usersService: UsersService, stockService: StockService);
    handle(ctx: Context): Promise<void>;
}

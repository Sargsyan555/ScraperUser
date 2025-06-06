import { Context } from "src/types/context.interface";
import { UsersService } from "../authorization/users.service";
export declare class TextHandler {
    private readonly usersService;
    constructor(usersService: UsersService);
    handle(ctx: Context): Promise<void>;
}

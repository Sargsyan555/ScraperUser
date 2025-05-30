import { Context } from "src/types/context.interface";
import { UsersService } from "../authorization/users.service";
export declare class StartHandler {
    private readonly userService;
    private readonly templateLink;
    private readonly adminUsername;
    constructor(userService: UsersService);
    handle(ctx: Context): Promise<void>;
}

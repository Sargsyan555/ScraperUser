import { Context } from 'src/types/context.interface';
import { UsersService } from '../authorization/users.service';
export declare class UserHandler {
    private readonly userService;
    constructor(userService: UsersService);
    handle(ctx: Context): Promise<void>;
}

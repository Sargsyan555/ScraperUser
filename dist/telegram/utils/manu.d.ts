import { Markup } from "telegraf";
import { UsersService } from "../authorization/users.service";
export declare function getMainMenuKeyboard(username: string, usersService: UsersService): Promise<Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>>;

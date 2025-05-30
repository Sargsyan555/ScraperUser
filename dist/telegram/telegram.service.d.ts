import { Telegraf } from "telegraf";
import { Context } from "src/types/context.interface";
import { StartHandler } from "./handlers/start.handler";
import { TextHandler } from "./handlers/text.handler";
import { HelpHandler } from "./handlers/help.handler";
import { HttpService } from "@nestjs/axios";
import { DocumentHandler } from "./handlers/document.handler";
import { UsersService } from "./authorization/users.service";
import { UserHandler } from "./handlers/user.handleer";
export declare class TelegramService {
    private readonly bot;
    private readonly httpService;
    private readonly startHandler;
    private readonly textHandler;
    private readonly helpHandler;
    private readonly documentHandler;
    private readonly userHandler;
    private readonly usersService;
    constructor(bot: Telegraf<Context>, httpService: HttpService, startHandler: StartHandler, textHandler: TextHandler, helpHandler: HelpHandler, documentHandler: DocumentHandler, userHandler: UserHandler, usersService: UsersService);
    onStart(ctx: Context): Promise<void>;
    onHelp(ctx: Context): Promise<void>;
    onMessage(ctx: Context): Promise<void>;
    onTemplateExcelDownload(ctx: Context): Promise<void>;
    onAddUser(ctx: Context): Promise<void>;
    onDeleteUser(ctx: Context): Promise<void>;
    onAllUsers(ctx: Context): Promise<void>;
}

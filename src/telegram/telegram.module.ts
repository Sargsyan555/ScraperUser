import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { session } from "telegraf";
import { TelegramService } from "./telegram.service";
import { HttpModule } from "@nestjs/axios";
import { StartHandler } from "./handlers/start.handler";
import { TextHandler } from "./handlers/text.handler";
import { HelpHandler } from "./handlers/help.handler";
import { DocumentHandler } from "./handlers/document.handler";
import { UsersService } from "./authorization/users.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./authorization/schema/schema";
import { UserHandler } from "./handlers/user.handleer";
import { ExcelCacheLoaderService } from "./cache/cache.service";
import { ScheduleModule } from "@nestjs/schedule";
import { ScraperServiceUdtTechnika } from "./exel/ScraperServiceUdtTechnika";
import { ScraperServiceVoltag } from "./exel/ScraperServiceVoltag";
import { ScraperServiceDvPt } from "./exel/scraperServiceDv-Pt";
import { ScraperImachineryService } from "./exel/ScraperServiceImachinery";
import { ScraperServiceIstkDeutz } from "./exel/ScraperService-Isdk";
import { ScraperCamspartService } from "./exel/scraperServiceCamsarts";
import { ScraperServiceSeltex } from "./exel/scraperServiceSeltex";
import { ScraperServiceShtren } from "./exel/scraperServiceShtern";
import { ScraperServicePcagroup } from "./exel/scraperServicePcagroup";
import { ScraperRecamgrService } from "./exel/ScraperRecamgrService";
import { ScraperServiceZipteh } from "./exel/ScraperServiceZipteh";
import { ScraperSolidService } from "./exel/scraperServiceSolid";
import { ScraperService74Parts } from "./exel/ScraperService74Part";

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: "7080107656:AAEnyCl5SAt7EyvFSI-wR8z-V4bByx98VDg",
        middlewares: [session()],
      }),
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅
    ScheduleModule.forRoot(),
  ],
  providers: [
    TelegramService,
    StartHandler,
    HelpHandler,
    TextHandler,
    DocumentHandler,
    UserHandler,
    UsersService,
    ExcelCacheLoaderService,
    // StockService, // slkadna mnace
    // ScraperService74Parts, // ++ done
    // ScraperServiceIxora, // ++ done
    // ScraperServiceZipteh, // ++done
    // ScraperServiceDvPt, // ++done
    // ScraperServiceUdtTechnika, //++ done
    // ScraperImachineryService, //++ done
    // ScraperRecamgrService, // chilnum  interestik.info
    // ScraperServicePcagroup, //++ done
    // ScraperCamspartService, //++ done
    // ScraperServiceIstkDeutz, // ++done
    // ScraperService74Parts, // -- chilnum xuyewo xi
    // ScraperServiceShtren, //++ done
    // ScraperServiceVoltag, //++ done
    // ScraperSolidService, //++done
    // ScraperRecamgrService,
  ],
})
export class TelegramModule {}

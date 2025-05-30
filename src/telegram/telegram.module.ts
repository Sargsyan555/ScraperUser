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
import { StockModule } from "src/stock/stock.module";
import { ScraperService } from "./exel/scraperService";
import { VoltagService } from "./exel/voltag";
import { TruckdriveService } from "./exel/truckdrive";
import { ProductScraperService } from "./exel/shtern";
import { ScraperServiceUdt } from "./exel/udtTexnika";
import { ScraperRecamgrService } from "./exel/recamgr";
import { ScraperImachineryService } from "./exel/imachinery";
import { ScraperPcaGroupService } from "./exel/pcagroup";
import { ScraperCamspartService } from "./exel/camsarts";
import { CrawlerService } from "./exel/intertrek";

@Module({
  imports: [
    StockModule,
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: "7720246807:AAEWSZ63-s2m8bhOIhlN2hsy6NkuWAkM6Dg",
        middlewares: [session()],
      }),
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅
  ],
  providers: [
    StockModule,
    TelegramService,
    StartHandler,
    HelpHandler,
    TextHandler,
    DocumentHandler,
    UserHandler,
    UsersService,
    VoltagService,
    ScraperService,
    TruckdriveService,
    ProductScraperService,
    ScraperServiceUdt,
    ScraperRecamgrService,
    ScraperImachineryService,
    ScraperPcaGroupService,
    ScraperCamspartService,
    CrawlerService,
  ],
})
export class TelegramModule {}

import { Injectable } from "@nestjs/common";
import { Context } from "src/types/context.interface";
import { UsersService } from "../authorization/users.service";
import { Markup } from "telegraf";
@Injectable()
export class StartHandler {
  private readonly templateLink = process.env.YANDEX_LINK || "";
  private readonly adminUsername = "torosyann1";

  constructor(private readonly userService: UsersService) {}
  async handle(ctx: Context) {
    const telegramUsername = ctx.from?.username;
    if (!telegramUsername) {
      await ctx.reply("❌ Не удалось определить ваш Telegram username.");
      return;
    }
    const buttons: any[][] = [
      [
        Markup.button.callback(
          "📥 Скачать шаблон Excel",
          "template_excel_download",
        ),
      ],
    ];
    const x = Markup.inlineKeyboard(buttons);

    await ctx.reply(
      "👋 *Добро пожаловать в бота по поиску цен на запчасти\\!*",
      {
        parse_mode: "MarkdownV2",
        ...x,
      },
    );

    await ctx.reply(
      "📄 Отправьте текст или Excel-файл, и мы его обработаем.\n\n" +
        "📌 Также можете отправить вручную в одном из следующих форматов:\n\n" +
        "✅ Полный формат: 12345, 1, CAT\n" +
        "✅ Без бренда: 12345, 1\n" +
        "✅ Без количества: 12345, CAT\n" +
        "✅ Только артикул: 12345\n\n" +
        "🔁 Порядок: артикул, количество, бренд\n" +
        "❗️ Разделяйте значения запятой и соблюдайте порядок.",
    );
  }
}

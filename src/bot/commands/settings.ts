import { Markup, Telegraf } from "telegraf";
import { logger } from "../../logger";
import { NOTIFICATION_LEVEL, ExtendedContextMessageUpdate } from "../../types";
import { userInfo } from "os";

const allNotificationLevels = [
  NOTIFICATION_LEVEL.ALL,
  NOTIFICATION_LEVEL.IMPORTANT,
  NOTIFICATION_LEVEL.NONE
]

const getTextForNotificationLevel = (level: NOTIFICATION_LEVEL) => {
  switch(level) {
    case NOTIFICATION_LEVEL.ALL:
      return `All`
    case NOTIFICATION_LEVEL.IMPORTANT:
      return `Important`
    case NOTIFICATION_LEVEL.NONE:
      return `None`
  }
}

export default function setupSettings(
  bot: Telegraf<ExtendedContextMessageUpdate>
) {
  bot.action(allNotificationLevels.map(l => `settings/notifications/${l}`), async ctx => {
    try {
      const level = Number.parseInt(ctx.callbackQuery.data.split(`/`).pop(), 10) as NOTIFICATION_LEVEL

      ctx.user.dacNotificationLevel = level;
      ctx.user.save()

      await ctx.editMessageText(`🗣️ Notifications changed to "${getTextForNotificationLevel(level)}"`, {
        reply_markup: Markup.inlineKeyboard(
          []
        )
      });
    } catch (error) {
      logger.error(`setupSettings failed with: `, error.message)
      return ctx.editMessageText(`Failed.`)
    }
  });

  bot.action("settings/notifications", async ctx => {
    await ctx.editMessageText(`🗣️ Receive Notifications`, {
      reply_markup: Markup.inlineKeyboard(
        allNotificationLevels.map(level =>
          Markup.callbackButton(`${getTextForNotificationLevel(level)}${level === ctx.user.dacNotificationLevel ? ` ✅` : ``}`, `settings/notifications/${level}`)
        )
      )
    });
  });
 
  bot.command("settings", async ctx => {
    await ctx.reply(
      "⚙️ Change settings",
      Markup.inlineKeyboard([
        Markup.callbackButton("🗣️ Notifications", "settings/notifications")
      ]).extra()
    );
  });
}

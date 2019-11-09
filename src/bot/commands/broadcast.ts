import { Telegraf } from 'telegraf'
import Config from '../../entity/Config'
import { ExtendedContextMessageUpdate, NOTIFICATION_LEVEL } from '../../types'
import { fetchHeadBlockNumber } from '../../eos/fetch'
import { formatTimeDifference } from '../../utils'
import { getUsersToNotify, sendToUsers } from '../utils'
import { logger } from '../../logger'

export default function setupBroadcast(bot: Telegraf<ExtendedContextMessageUpdate>) {
  bot.command(`broadcast`, async (ctx) => {
    const users = await getUsersToNotify(NOTIFICATION_LEVEL.IMPORTANT);
    if(ctx.user.telegramHandle !== process.env.ADMIN_TELEGRAM_HANDLE) {
      return ctx.replyWithMarkdown(`Unauthorized to broadcast`)
    }

    const message = ctx.message.text.replace(`/broadcast`, ``)
    // const messageOptions = ctx.message.
    await sendToUsers(users, message)
  })
}
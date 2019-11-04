import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { NOTIFICATION_LEVEL } from '../../types';
import { User } from '../../entity/User';
import { logger } from '../../logger';
import { getHelpMessage } from './help';

export const getWelcomeMessage = (user:User) => `Hello _${user.firstName}_ 👋 I'll notify you on new VigorDAC proposals.` 

export default function setupStart(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('start', async ctx => {
    const telegramId = ctx.from.id;
    let user = await User.findOne(telegramId)
    if (!user) {
      user = new User()
      user.telegramId = telegramId
    }
    user.telegramHandle = ctx.from.username
    user.telegramChatId = ctx.chat.id
    user.firstName = ctx.from.first_name
    user.lastName = ctx.from.last_name
    user.languageCode = ctx.from.language_code
    user.dacNotificationLevel = NOTIFICATION_LEVEL.IMPORTANT
    await user.save()
  
    logger.verbose(`new user:`, user)
  
    return ctx.replyWithMarkdown(`${getWelcomeMessage(user)}\n${getHelpMessage()}`, { disable_web_page_preview: true })
  })
}
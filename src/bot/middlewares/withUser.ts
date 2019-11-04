import { ContextMessageUpdate } from 'telegraf'
import { User } from '../../entity/User';
import { NOTIFICATION_LEVEL } from '../../types';
import { logger } from '../../logger';

export type withUserType = {
  user: User
}

export async function withUser(ctx: ContextMessageUpdate, next) {
  try {
    const telegramId = ctx.from.id;
    let user = await User.findOne(telegramId)
    if (!user) {
      user = new User()
      user.telegramId = telegramId
      user.telegramHandle = ctx.from.username
      user.telegramChatId = ctx.chat.id
      user.firstName = ctx.from.first_name
      user.lastName = ctx.from.last_name
      user.languageCode = ctx.from.language_code
      user.dacNotificationLevel = NOTIFICATION_LEVEL.IMPORTANT
      await user.save()
    
      logger.verbose(`new user:`, user)
    }
  
    // @ts-ignore
    ctx.user = user
    next()
  } catch (err) {
    logger.error(`withUser middleware:`, err.message)
    ctx.replyWithMarkdown(`Could not find and create your user. Please contact support`)
  }
}
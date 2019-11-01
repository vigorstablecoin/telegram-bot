import Telegraf from 'telegraf'
import { User } from '../entity/User'
import { logger } from '../logger'
import { NOTIFICATION_LEVEL } from '../types'

const { WEBHOOK_DOMAIN, WEBHOOK_PATH } = process.env
logger.info(`WEBHOOK config`, { WEBHOOK_DOMAIN, WEBHOOK_PATH })

const bot = new Telegraf(process.env.BOT_TOKEN)

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

  return ctx.replyWithMarkdown(`Hello _${user.firstName}_! I'll update you on new VigorDAC proposals.`)
})
bot.on('text', ({ replyWithHTML }) => replyWithHTML('<b>test</b>'))

export const initBot = async () => {
  if (!WEBHOOK_DOMAIN) {
    logger.verbose(`Not using webhooks`)
    bot.launch()
    return
  } else {
    if (!WEBHOOK_PATH) throw new Error(`Must set WEBHOOK_PATH env var`)
    // npm install -g localtunnel && lt --port 3000
    // for testing invoke with `WEBHOOK_DOMAIN=https://----.localtunnel.me npm start`
    const webhookUrl = `${WEBHOOK_DOMAIN}/${WEBHOOK_PATH}`
    try {
      const success = await bot.telegram.setWebhook(webhookUrl)
      // const success = true
      if (success) {
        logger.info(`New webhook set to ${webhookUrl}`)
        return logger.info(await bot.telegram.getWebhookInfo())
      }
      throw Error(`Failed to update webhook`)
    } catch (error) {
      logger.error(error.message)
    }
  }
}

export default bot;

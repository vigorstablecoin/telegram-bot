import Telegraf from 'telegraf'
import { User } from '../entity/User'
import { logger } from '../logger'

const { WEBHOOK_DOMAIN, WEBHOOK_PATH } = process.env
if (!WEBHOOK_PATH) throw new Error(`Must set WEBHOOK_PATH env var`)

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
  await user.save()
  logger.verbose(`New user: `, user)

  return ctx.reply('Hey')
})
bot.on('text', ({ replyWithHTML }) => replyWithHTML('<b>Hello</b>'))

export const initBot = async () => {
  if (!WEBHOOK_DOMAIN) {
    logger.verbose(`Not updating webhook`)
    return
  }

  // npm install -g localtunnel && lt --port 3000
  // for testing invoke with `WEBHOOK_DOMAIN=https://----.localtunnel.me npm start`
  const webhookUrl = `${WEBHOOK_DOMAIN}/${WEBHOOK_PATH}`
  try {
    const success = await bot.telegram.setWebhook(webhookUrl)
    if (success) {
      logger.info(`New webhook set to ${webhookUrl}`)
      return logger.info(await bot.telegram.getWebhookInfo())
    }
    throw Error(`Failed to update webhook`)
  } catch (error) {
    logger.error(error.message)
  }
}

export default bot;

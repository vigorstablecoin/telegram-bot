import { Telegraf, ContextMessageUpdate } from 'telegraf'

export const getHelpMessage = () => `Current bot commands are "/settings", "/help".
For feature requests and bug reports please [open an issue in GitHub](https://github.com/vigorstablecoin/telegram-bot).`

export default function setupHelp(bot: Telegraf<ContextMessageUpdate>) {
  bot.command(['help'], (ctx) => {
    
    return ctx.replyWithMarkdown(getHelpMessage(), { disable_web_page_preview: true     })
  })
}
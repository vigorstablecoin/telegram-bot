# Vigor Telegram Bot 🤖

## Development

Telegram uses webhooks to notify you on new messages.
To run this bot locally, use `ngrok` or npm's `localtunnel`:

```bash
ngrok http 3000 # inspect on http://localhost:4040/inspect/http
# https://123456.ngrok.io -> http://localhost:3000
# set https://123456.ngrok.io as WEBHOOK_DOMAIN in .env
npm start
```

> This should no be done with the official bot as it changes the webhook URL. You can create a new Telegram bot just for testing

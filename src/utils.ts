export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
export const isProduction = () => process.env.NODE_ENV === `production` || Boolean(process.env.DOKKU_APP_NAME)
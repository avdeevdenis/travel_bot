const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_API_TOKEN;
const AvdeevTravelBot = new TelegramBot(token, {
  polling: true
});

export default AvdeevTravelBot;
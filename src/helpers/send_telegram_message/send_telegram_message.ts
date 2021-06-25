import { debug_console } from '../debug_console/debug_console';
import AvdeevTravelBot from '../get_telegram_bot/get_telegram_bot';
import { sleep } from '../sleep/sleep';

/**
 * Отправляет сообщения в телеграме
 */
export const sendTelegramMessage = async (messageDataArray) => {
  if (!messageDataArray || !messageDataArray.length) return;

  const chatId = process.env.TELEGRAM_AVDEEV_DENIS_ID;

  for (let i = 0; i < messageDataArray.length; i++) {
    const messageText = messageDataArray[i];

    debug_console(`Send telegram message ${i} `);

    /**
     * API https://core.telegram.org/bots/api#sendmessage
     */
    await AvdeevTravelBot.sendMessage(chatId, messageText, {
      /**
       * Включаем markdown-разметку
       */
      parse_mode: 'Markdown',

      /** 
       * Отключаем превью ссылок
       */
      disable_web_page_preview: true,

      /**
       * Делаем сообщения бесшумными
       */
      disable_notification: true,
    });

    await sleep(50);
  }
};
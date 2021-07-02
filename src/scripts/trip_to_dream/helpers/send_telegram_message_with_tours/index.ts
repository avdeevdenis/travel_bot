require('../../../../helpers/dotenv');
require('../../../../helpers/telegram_env');

import { getTripToDreamLogPath } from '../..';
import { debug_log } from '../../../../helpers/debug_log';
import AvdeevTravelBot from '../../../../helpers/get_telegram_bot/get_telegram_bot';
import { sleep } from '../../../../helpers/sleep/sleep';

export const sendTelegramMessageWithTours = async (telegramMessagesData: string[]) => {
  const chatId = process.env.TELEGRAM_AVDEEV_DENIS_ID;

  for (let i = 0, l = telegramMessagesData.length; i < l; i++) {
    const messageText = telegramMessagesData[i];

    await debug_log(getTripToDreamLogPath(), `[trip_to_dream_script] Send telegram message ${i + 1} of ${l}.`);

    try {
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
    } catch (error) {
      await debug_log(getTripToDreamLogPath(), `[trip_to_dream_script] Error to send telegram message ${i + 1} of ${l}. [messageText]='${messageText}', [error.message]='${error.message}'`, {
        isError: true,
      });
    }

    await debug_log(getTripToDreamLogPath(), `[trip_to_dream_script] Sended telegram message ${i + 1} of ${l}.`);

    /**
     * Не хотим отправлять много сообщений в секунду
     */
    await sleep(100);
  };
};
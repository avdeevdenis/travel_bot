require('../../../../helpers/dotenv');
require('../../../../helpers/telegram_env');

import { getTurscannerLogPath } from '../..';
import { debug_log } from '../../../../helpers/debug_log';
import AvdeevTravelBot from '../../../../helpers/get_telegram_bot/get_telegram_bot';
import { sleep } from '../../../../helpers/sleep/sleep';

export const sendTelegramMessageWithTours = async (telegramMessagesData: string[]) => {
  const chatId = process.env.TELEGRAM_AVDEEV_DENIS_ID;

  for (let i = 0, l = telegramMessagesData.length; i < l; i++) {
    const messageText = telegramMessagesData[i];

    await debug_log(getTurscannerLogPath(), `[turscanner_script] Send telegram message ${i + 1} of ${l}.`);

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

    await debug_log(getTurscannerLogPath(), `[turscanner_script] Sended telegram message ${i + 1} of ${l}.`);

    /**
     * Не хотим отправлять много сообщений в секунду
     */
    await sleep(100);
  };
};
require('dotenv').config();

// https://stackoverflow.com/questions/65289566/node-telegram-bot-api-deprecated-automatic-enabling-of-cancellation-of-promises
process.env.NTBA_FIX_319 = '1';

import { ajaxUrlParams, getAjaxUrl } from './helpers/get_ajax_url/get_ajax_url';
import { filterData } from './helpers/filter_data/filter_data';
import { filterSavedData } from './helpers/filter_saved_data/filter_saved_data';
import { getMessageDataArray } from './helpers/get_messages_data_array/get_messages_data_array';
import { getReponseData } from './helpers/get_response_data/get_respone_data';
import { sendTelegramMessage } from './helpers/send_telegram_message/send_telegram_message';
import { debug_console } from './helpers/debug_console/debug_console';
import { sleep } from './helpers/sleep/sleep';

export const checkTravelData = async (url = getAjaxUrl()) => {
  const responseData = await getReponseData(url);
  if (!responseData) return;

  const requiredData = filterData(responseData);
  if (!requiredData) return;

  const filteredData = await filterSavedData(requiredData);

  const messageDataArray = getMessageDataArray(filteredData);

  await sendTelegramMessage(messageDataArray);
};

/**
 * Последовательно обходит travel-сайты (один запрос за другим) с каждой страной отдельно
 */
export const checkTravelDataSeparately = async () => {
  const urls = ajaxUrlParams.map(urlParams => getAjaxUrl(urlParams));

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    debug_console('Start check travel "' + url + '"');

    await checkTravelData(url);

    /**
     * Ставим паузу, мы ведь не хотим отправлять 10 запросов в секунду?
     */
    await sleep(3000);
  }
};
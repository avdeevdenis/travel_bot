require('dotenv').config();

// https://stackoverflow.com/questions/65289566/node-telegram-bot-api-deprecated-automatic-enabling-of-cancellation-of-promises
process.env.NTBA_FIX_319 = '1';

import { filterData } from './helpers/filter_data/filter_data';
import { getMessageDataArray } from './helpers/get_messages_data_array/get_messages_data_array';
import { getReponseData } from './helpers/get_response_data/get_respone_data';
import { sendTelegramMessage } from './helpers/send_telegram_message/send_telegram_message';

export default async () => {
  const responseData = await getReponseData();
  if (!responseData) return;

  const requiredData = filterData(responseData);
  if (!requiredData) return;

  const messageDataArray = getMessageDataArray(requiredData);

  await sendTelegramMessage(messageDataArray);
};
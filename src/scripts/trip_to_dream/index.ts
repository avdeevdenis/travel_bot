import { debug_log } from '../../helpers/debug_log';
import { getToday } from '../../helpers/get_today';
import { filterToursData } from './helpers/filter_tours_data';
import { getAjaxData } from './helpers/get_ajax_data';
import { getHTMLTemplateData } from './helpers/get_HTML_data';
import { getTelegramMessagesData } from './helpers/get_telegram_messages_data';
import { saveFilteredToursDataToFile } from './helpers/save_filtered_tours_data_to_file';
import { sendTelegramMessageWithTours } from './helpers/send_telegram_message_with_tours';

export const PARTNER_URL = 'https://triptodream.ru/tag/na-more/';

/**
 * Путь, по которому пишутся логи выполнения скрипта
 */
export const getTripToDreamLogPath = () => {
  return './src/scripts/trip_to_dream/logs/' + getToday() + '.txt';
};

/**
 * Путь до файла с данными о турах
 */
export const SAVED_DATA_FILE_PATH = './src/scripts/trip_to_dream/data/tours_data.json';

/**
 * Обрабатываем результаты сайта 'https://triptodream.ru/'
 */
export const parseTripToDream = async () => {
  await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] Start.', {
    isFirstLogMessage: true,
  });

  /**
   * 1. Сначала получаем данные от партнера
   */
  const ajaxData = await getAjaxData(PARTNER_URL);
  if (!ajaxData) {
    await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] getAjaxData error', {
      isError: true
    });

    return;
  }

  /**
   * 2. Затем парсим html-разметку и преобразуем ее в данные
   */
  const toursData = getHTMLTemplateData(ajaxData);
  if (!toursData) {
  await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] getHTMLTemplateData nothing found', {
    isError: true
  });

  return;
  }

  /**
   * 3. Фильтруем полученные данные (исключаем уже имеющиеся)
   */
  const filteredToursData = await filterToursData(toursData);

  if (!filteredToursData || !filteredToursData.length) {
    await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] filterToursData nothing left.');

    return;
  }

  /**
   * 4. Записываем в файл новые/отфильтрованные данные о турах
   */
  await saveFilteredToursDataToFile(filteredToursData);

  /**
   * 5. Формируем массив сообщений, с найденными турами для дальнейшей отправки
   */
  const telegramMessagesData = getTelegramMessagesData(filteredToursData);

  /**
   * 6. Отправляем сообщения в телеграме
   */
  await sendTelegramMessageWithTours(telegramMessagesData);

  await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] End.');
};

parseTripToDream();
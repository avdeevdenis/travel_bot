import { debug_log } from '../../helpers/debug_log';
import { getToday } from '../../helpers/get_today';
import { filterToursData } from './helpers/filter_tours_data';
import { getHTMLTemplate } from './helpers/get_HTML_template';
import { getTelegramMessagesData } from './helpers/get_telegram_messages_data';
import { getToursDataFromHTML } from './helpers/get_tours_data_from_HTML';
import { sendTelegramMessageWithTours } from './helpers/send_telegram_message_with_tours';
import { saveFilteredToursDataToFile } from './helpers/save_filtered_tours_data_to_file';

/**
 * Путь, по которому пишутся логи выполнения скрипта
 */
export const getTurscannerLogPath = () => {
  return './src/scripts/turscanner/logs/' + getToday() + '.txt';
};


/**
 * Путь до файла с данными о турах
 */
export const SAVED_DATA_FILE_PATH = './src/scripts/turscanner/data/tours_data.json';

/**
 * Обрабатываем результаты сайта 'https://www.turscanner.ru/'
 */
export const parseTurscanner = async () => {
  await debug_log(getTurscannerLogPath(), '[turscanner_script] Start.', {
    isFirstLogMessage: true,
  });

  /**
   * 1. Сначала получаем html-разметку с информацией о турах
   */
  const HTMLTemplate = await getHTMLTemplate();

  if (HTMLTemplate instanceof Error) {
    await debug_log(getTurscannerLogPath(), '[turscanner_script] Error ' + HTMLTemplate.message, {
      isError: true
    });

    return;
  }

  /**
   * 2. Затем парсим html-разметку и преобразуем ее в данные
   */
  const toursData = getToursDataFromHTML(HTMLTemplate);

  if (!toursData.length) {
    await debug_log(getTurscannerLogPath(), '[turscanner_script] getToursDataFromHTML nothing found.');
    return;
  }

  /**
   * 3. Фильтруем полученные данные (исключаем уже имеющиеся)
   */
  const filteredToursData = await filterToursData(toursData);

  if (!filteredToursData.length) {
    await debug_log(getTurscannerLogPath(), '[turscanner_script] filterToursData nothing left.');
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

  await debug_log(getTurscannerLogPath(), '[turscanner_script] End.');
};
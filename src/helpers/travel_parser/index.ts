import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';

import { debug_log } from '../debug_log';
import { createFileIfNotExists } from '../create_file_is_not_exits';
import { getFileJSONContent } from '../get_file_json_content';
import AvdeevTravelBot from '../get_telegram_bot';
import { sleep } from '../sleep';

import {
  FileContentJSON,
  ProcessingTelegramMessage,
  StructuredTravelData,
  StructuredTravelDataItem,
  TelegramMessages,
  TravelAjaxResponseData,
  TravelFilterItemFields,
  TravelInput,
  TravelPartnerName,
  TravelSavedToursFilepath,
} from './typings';

/**
 * Путь к логу, в который записывается информация о ходе выполнения скрипта
 */
export const LOG_PATH = 'src/logs/realtime_execution_log.txt';

/**
 * Префикс записи в лог, например [travelParser:turscanner]
 */
export const getLogPrefix = (partnerName: TravelPartnerName) => `[travelParser:${partnerName}] `;

export let LOG_PREFIX = '';

/**
 * Основной класс, который включает в себя основные методы, необходимые для парсинга предложенного сайта
 */
export const travelParser = async (inputData: TravelInput) => {
  const {
    url,
    urlOptions,
    partnerName,
    processingAjaxResponseData,
    filterTravelItemFields,
    processingTelegramMessage,
  } = inputData;

  LOG_PREFIX = getLogPrefix(partnerName);

  await debug_log(LOG_PATH, LOG_PREFIX + 'Start.', { isFirstLogMessage: true });

  /**
   * Шаг 1️⃣. Отправляет AJAX-запрос на сайт партнера и дожидается результата
   */
  const ajaxResponseData: TravelAjaxResponseData = await sendAjaxRequest(url, urlOptions);

  /**
   * Шаг 2️⃣. Достаем из AJAX-ответа необходимые данные, возможные варианты:
   * - в ответе JSON, тогда забираем необходимые поля
   * - в ответе HTML, тогда парсим результаты и преобразовываем в структурированные данные
   */
  const travelData: StructuredTravelData = await processingAjaxResponseData(ajaxResponseData, processingAjaxResponseErrorHandler);
  if (!travelData || !travelData.length) {
    await debug_log(LOG_PATH, LOG_PREFIX + 'End. nothing left after processing.');
    return;
  }

  const savedToursFilepath = './src/raw_data/' + partnerName + '_data.json' as TravelSavedToursFilepath;

  /**
   * Шаг 3️⃣. Фильтруем полученные данные (исключаем уже имеющиеся), для этого
   * - считываем из файла содержимое имеющихся данных
   * - проверяем что информация из файла не дублируется с новой
   */
  const filteredTravelData: StructuredTravelData | undefined = await filterTravelDataByFile(travelData, savedToursFilepath, filterTravelItemFields);
  if (!filteredTravelData || !filteredTravelData.length) {
    await debug_log(LOG_PATH, LOG_PREFIX + 'End. nothing left after filter.');
    return;
  }

  /**
   * Шаг 4️⃣. Записываем в файл новые/отфильтрованные данные о турах
   */
  await saveFilteredTravelDataToFile(filteredTravelData, savedToursFilepath);

  /**
   * Шаг 5️⃣. Формируем массив сообщений, с найденными турами для дальнейшей отправки
   */
  const telegramMessagesData = getTelegramMessagesData(filteredTravelData, processingTelegramMessage);

  /**
   * Шаг 6️⃣. Отправляем сообщения с информацией о турах в телеграме
   */
  await sendTelegramMessagesWithTours(telegramMessagesData);

  await debug_log(LOG_PATH, LOG_PREFIX + 'End.');
}

/**
 * Метод, вызываемый в случае произошедшей ошибки во время обработки результатов AJAX-ответа
 */
export const processingAjaxResponseErrorHandler = async (errorData: Object) => {
  await debug_log(LOG_PATH, LOG_PREFIX + 'processingAjaxResponseErrorHandler error.', { data: errorData });
};

/**
 * Шаг 1️⃣. Отправляет AJAX-запрос на сайт партнера и дожидается результата
 */
const sendAjaxRequest = async (url: string, options?: AxiosRequestConfig) => {
  let ajaxResponse = null;

  await debug_log(LOG_PATH, LOG_PREFIX + 'sendAjaxRequest start.', {
    data: url,
  });

  try {
    ajaxResponse = await axios.get(url, options);
  } catch (error) {
    await debug_log(LOG_PATH, LOG_PREFIX + 'sendAjaxRequest ajax get error.', { isError: true, data: error.message });
    return;
  };

  const isSuccesedResponse = (
    ajaxResponse &&
    ajaxResponse.status === 200 &&
    ajaxResponse.statusText === 'OK'
  );

  if (!isSuccesedResponse) {
    await debug_log(LOG_PATH, LOG_PREFIX + 'sendAjaxRequest has no succesed response.', { isError: true, data: ajaxResponse.status });
    return;
  }

  const responseData = ajaxResponse.data;
  return responseData;
}

/**
 * Шаг 3️⃣. Фильтруем полученные данные (исключаем уже имеющиеся), для этого
 * - считываем из файла содержимое имеющихся данных
 * - проверяем что информация из файла не дублируется с новой
 */
export const filterTravelDataByFile = async (
  travelData: StructuredTravelData,
  filepath: TravelSavedToursFilepath,
  filterTravelItemFields: TravelFilterItemFields,
) => {
  await debug_log(LOG_PATH, LOG_PREFIX + 'filterTravelDataByFile start.');

  await createFileIfNotExists(filepath);

  const fileContentJSON = await getFileJSONContent(filepath, async (error) => {
    await debug_log(LOG_PATH, LOG_PREFIX + 'filterTravelDataByFile getFileJSONContent error.', {
      data: error.message,
      isError: true
    });
  });

  if (!fileContentJSON) return;

  if (!fileContentJSON.values) {
    fileContentJSON.values = {};
  }

  const filteredTravelData = travelData.filter(travelDataItem => filterTravelItemHandler(travelDataItem, fileContentJSON, filterTravelItemFields));

  if (!filteredTravelData.length) {
    await debug_log(LOG_PATH, LOG_PREFIX + 'filterTravelDataByFile nothing left.');
    return;
  }

  return filteredTravelData;
};

/**
 * Идет сравнение объекта с туром с объектом из файла на их идентичность, объекты считаются идентичными если значения всех перечисленных полей равны
 */
export const filterTravelItemHandler = (travelDataItem: StructuredTravelDataItem, fileContentJSON: FileContentJSON, filterTravelItemFields: string[]) => {
  if (!fileContentJSON.values.length) return true;

  const hasSameToursInFile = fileContentJSON.values.some(tourDataItemFromFile => {
    return filterTravelItemFields.every(filterTravelItemField => travelDataItem[filterTravelItemField] === tourDataItemFromFile[filterTravelItemField]);
  });

  return !hasSameToursInFile;
}

/**
 * Шаг 4️⃣. Записываем в файл новые/отфильтрованные данные о турах
 */
export const saveFilteredTravelDataToFile = async (filteredTravelData: StructuredTravelData, savedDataFilepath: TravelSavedToursFilepath) => {
  await debug_log(LOG_PATH, LOG_PREFIX + 'saveFilteredTravelDataToFile start.');

  const fileContentJSON = await getFileJSONContent(savedDataFilepath, async (error) => {
    await debug_log(LOG_PATH, LOG_PREFIX + 'saveFilteredTravelDataToFile getFileJSONContent error.', {
      isError: true,
      data: error.message,
    });
  });

  if (!fileContentJSON) return;

  filteredTravelData.forEach(travelItem => {
    if (!fileContentJSON.values) {
      fileContentJSON.values = [];
    }

    fileContentJSON.values.push(travelItem);
  });

  await fs.writeFileSync(savedDataFilepath, JSON.stringify(fileContentJSON), { encoding: 'utf8' });

  await debug_log(LOG_PATH, LOG_PREFIX + 'saveFilteredTravelDataToFile end.');
};

/**
 * Убираем из сообщения символы, которые телеграм не переваривает
 */
export const escapeMessage = (messageText: string) => {
  let escapedMessage = messageText;

  escapedMessage = escapedMessage.replace(/_/g, '\\_');

  return escapedMessage;
};

/**
 * Шаг 5️⃣. Формируем массив сообщений, с найденными турами для дальнейшей отправки
 */
export const getTelegramMessagesData = (filteredTravelData: StructuredTravelData, processingTelegramMessage: ProcessingTelegramMessage) => {
  return filteredTravelData.map(filteredTravelDataItem => {
    const processedMessage = processingTelegramMessage(filteredTravelDataItem);

    const escapedMessage = escapeMessage(processedMessage);

    return escapedMessage;
  })
};

/**
 * Шаг 6️⃣. Отправляем сообщения с информацией о турах в телеграме
 */
export const sendTelegramMessagesWithTours = async (messagesData: TelegramMessages) => {
  const chatId = process.env.TELEGRAM_AVDEEV_DENIS_ID;

  for (let i = 0, l = messagesData.length; i < l; i++) {
    const messageText = messagesData[i];

    await debug_log(LOG_PATH, LOG_PREFIX + `Send telegram message ${i + 1} of ${l}.`);

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

      await debug_log(LOG_PATH, LOG_PREFIX + `Sended telegram message ${i + 1} of ${l}.`, {
        data: messageText
      });
    } catch (error) {
      await debug_log(LOG_PATH, LOG_PREFIX + `Error to send telegram message ${i + 1} of ${l}.`, {
        isError: true,
        data: {
          errorText: error.message,
          messageText,
        }
      });
    }

    /**
     * Не хотим отправлять много сообщений в секунду
     */
    await sleep(100);
  };
};
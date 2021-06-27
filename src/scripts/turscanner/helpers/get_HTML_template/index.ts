import * as fs from 'fs';
import axios from 'axios';
import { debug_log } from '../../../../helpers/debug_log';
import { getTurscannerLogPath } from '../..';

const FormData = require('form-data');

/**
 * Путь до файла, в котором хранится тестовая html-разметка с турами
 */
const TEST_FILE_PATH = './src/scripts/turscanner/data/html_template_for_test.html';

/**
 * Ссылка по которой идем с ajax-запросом за разметкой
 */
const PARTNER_URL = 'https://www.turscanner.ru/search-tours/';

/**
 * Получаем HTML-разметку с информацией о возможных турах
 * 
 * ⚠️ В режиме разработки читаем из тестового файла
 * ⚠️ В обычном режиме отправляем запрос на сервер и получаем актуальный ответ
 */
export const getHTMLTemplate: () => Promise<string | Error> = async () => {
  const isDev = process.env.NODE_ENV === 'dev';

  await debug_log(getTurscannerLogPath(), '[turscanner_script] getHTMLTemplate isDev=' + isDev);

  return isDev ?
    getHTMLTemplateFromTestFile() :
    getHTMLTemplateFromRequest();
};

/**
 * В режиме разработки читаем из тестового файла
 */
const getHTMLTemplateFromTestFile: () => Promise<string | Error> = () => {
  return new Promise((resolve) => {
    fs.readFile(TEST_FILE_PATH, { encoding: 'utf8' }, (error, data) => {
      if (error) {
        resolve(error);
      }

      resolve(data);
    });
  });
};

/**
 * В обычном режиме отправляем запрос на сервер и получаем актуальный ответ
 */
const getHTMLTemplateFromRequest: () => Promise<string | Error> = async () => {
  const formData = new FormData();

  /**
   * 'City=1' - вылет из Москвы
   */
  formData.append('city', '1');

  /**
   * С визой и без
   */
  formData.append('is_visa_free', 'false');

  const response = await axios.get(PARTNER_URL, {
    headers: {
      'x-requested-with': 'XMLHttpRequest'
    },
    data: formData
  });

  const isSuccesedResponse = response && response.status === 200 && response.statusText === 'OK';

  if (!isSuccesedResponse) {
    return Promise.resolve(new Error('Ajax request error, response.status = ' + response.status));
  }

  const responseData = response.data;

  return responseData;
}
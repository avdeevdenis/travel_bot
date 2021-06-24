import * as fs from 'fs';

import { ResponseData, ResponseRow } from '../../typings';
import { createFileIfNotExists } from '../create_file_is_not_exits/create_file_is_not_exits';

const { DateTime } = require('luxon');

export const SAVED_ITEMS_FILE_PATH = './src/data/saved_items.json';

/**
 * Фильтруем полученные результаты, оставляем только те, которые видим первоначально и не отправляли ранее
 */
export const filterSavedData = async (requiredData: ResponseData) => {
  await createFileIfNotExists(SAVED_ITEMS_FILE_PATH);

  let fileContent;

  try {
    fileContent = await fs.readFileSync(SAVED_ITEMS_FILE_PATH, { encoding: 'utf8' });
  } catch (error) {
    console.log('Error to read file', error.message);
  }

  let fileContentJSON;

  if (!fileContent.length) {
    fileContentJSON = {};
  } else {
    try {
      fileContentJSON = JSON.parse(fileContent);
    } catch (error) {
      console.log('Error to parse JSON', error.message);
    }
  }

  const newDataRows = [...requiredData.rows].filter(row => {
    const { countryCode, nights, price, date, link, khot } = row;

    if (!fileContentJSON[countryCode]) {
      fileContentJSON[countryCode] = [];
    }

    /**
     * Проверяем, что два оффера идентичны
     */
    const areTheSameOffsers = (offer1: ResponseRow, offer2: ResponseRow): Boolean => {
      const areSameNights = offer1.nights === offer2.nights;
      if (!areSameNights) return false;

      const isSamePrice = offer1.price === offer2.price;
      if (!isSamePrice) return false;

      const isSameDate = offer1.date === offer2.date;
      if (!isSameDate) return false;

      const isSameLink = offer1.link === offer2.link;
      if (!isSameLink) return false;

      return true;
    };

    const hasTheSameData = fileContentJSON[countryCode].filter(offerFromFile => areTheSameOffsers(offerFromFile, row)).length > 0;
    if (hasTheSameData) return false;

    const saved = DateTime.now().setZone('Europe/Moscow').toString();

    fileContentJSON[countryCode].push({
      khot, price, nights, date, link: process.env.TRAVEL_SEARCHER_HOST + link, saved
    });

    return true;
  });


  /**
   * Записываем новые данные в файл, предварительно сортируя по 'khot'
   */
  const fileContentJSONSorted = Object.keys(fileContentJSON).reduce((result, countryCode) => {
    result[countryCode] = [...fileContentJSON[countryCode]].sort((offer1, offer2) => offer2.khot - offer1.khot);

    return result;
  }, {});

  await fs.writeFileSync(SAVED_ITEMS_FILE_PATH, JSON.stringify(fileContentJSONSorted), { encoding: 'utf8' });

  if (!newDataRows.length) return;

  return newDataRows;
};
import * as fs from 'fs';
import { getTurscannerLogPath } from '../../scripts/turscanner';

import { ResponseData, ResponseRow } from '../../typings';
import { createFileIfNotExists } from '../create_file_is_not_exits/create_file_is_not_exits';
import { debug_log } from '../debug_log';
import { getFileJSONContent } from '../get_file_json_content';

const { DateTime } = require('luxon');

export const SAVED_ITEMS_FILE_PATH = './src/data/saved_items.json';

const getLink = (linkPath) => {
  return process.env.TRAVEL_SEARCHER_HOST + linkPath;
};

/**
 * Фильтруем полученные результаты, оставляем только те, которые видим первоначально и не отправляли ранее
 */
export const filterSavedData = async (requiredData: ResponseData) => {
  await createFileIfNotExists(SAVED_ITEMS_FILE_PATH);

  const fileContentJSON = await getFileJSONContent(SAVED_ITEMS_FILE_PATH, async (error) => {
    await debug_log(getTurscannerLogPath(), '[turscanner_script] filterSavedData getFileJSONContent' + error.message, {
      isError: true
    });
  });

  if (!fileContentJSON) return;

  let code = '';

  const newDataRows: Partial<ResponseRow>[] = [...requiredData.rows].filter(row => {
    const { countryCode } = row;

    code = countryCode;

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

      const isSameLink = offer1.link === getLink(offer2.link);
      if (!isSameLink) return false;

      return true;
    };

    const hasTheSameDataInFile = fileContentJSON[countryCode].find(offerFromFile => areTheSameOffsers(offerFromFile, row));
    if (hasTheSameDataInFile) return false;

    return true;
  });

  if (newDataRows.length) {
    const savedData = newDataRows.map(({ link, date, khot, nights, price }) => {
      const saved = DateTime.now().setZone('Europe/Moscow').toString();

      return {
        khot,
        nights,
        price,
        date,
        link: getLink(link),
        saved,
      };
    });

    fileContentJSON[code].push(...savedData);

    /**
     * Записываем новые данные в файл, предварительно сортируя по 'khot'
     */
    fileContentJSON[code].sort((offer1, offer2) => offer2.khot - offer1.khot);

    // console.log('🌐 get uniq object', uniqObject(fileContentJSON[code]));

    await fs.writeFileSync(SAVED_ITEMS_FILE_PATH, JSON.stringify(fileContentJSON), { encoding: 'utf8' });
  }

  return newDataRows;
};

// export const uniqObject = (rows: ResponseRow[]) => {
//   return rows.reduce((result, item) => {
//     const itemPath = item.link + item.price + item.date + item.nights;

//     result[itemPath] = result[itemPath] ? result[itemPath] + 1 : 1;

//     return result;
//   }, {});
// };
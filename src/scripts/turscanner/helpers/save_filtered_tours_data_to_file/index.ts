import { ToursData } from '../../typings';

import * as fs from 'fs';
import { getTurscannerLogPath, SAVED_DATA_FILE_PATH } from '../..';
import { getFileJSONContent } from '../../../../helpers/get_file_json_content';
import { debug_log } from '../../../../helpers/debug_log';

/**
 * Сохраняем отфильтрованные новые данные о турах в файл
 */
export const saveFilteredToursDataToFile = async (filteredToursData: ToursData[]) => {
  await debug_log(getTurscannerLogPath(), '[turscanner_script] saveFilteredToursDataToFile start');

  const fileContentJSON = await getFileJSONContent(SAVED_DATA_FILE_PATH, async (error) => {
    await debug_log(getTurscannerLogPath(), '[turscanner_script] filterToursData getFileJSONContent' + error.message, {
      isError: true
    });
  });

  if (!fileContentJSON) return;

  filteredToursData.forEach(({ month, items }) => {
    if (!fileContentJSON[month]) {
      fileContentJSON[month] = [];
    }

    fileContentJSON[month].push(...items);
  });

  await fs.writeFileSync(SAVED_DATA_FILE_PATH, JSON.stringify(fileContentJSON), { encoding: 'utf8' });

  await debug_log(getTurscannerLogPath(), '[turscanner_script] saveFilteredToursDataToFile end');
};
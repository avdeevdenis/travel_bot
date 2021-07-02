import * as fs from 'fs';
import { getTripToDreamLogPath, SAVED_DATA_FILE_PATH } from '../..';
import { getFileJSONContent } from '../../../../helpers/get_file_json_content';
import { debug_log } from '../../../../helpers/debug_log';
import { ToursDataItem } from '../../typings';

/**
 * Сохраняем отфильтрованные новые данные о турах в файл
 */
export const saveFilteredToursDataToFile = async (filteredToursData: ToursDataItem[]) => {
  await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] saveFilteredToursDataToFile start');

  const fileContentJSON = await getFileJSONContent(SAVED_DATA_FILE_PATH, async (error) => {
    await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] filterToursData getFileJSONContent' + error.message, {
      isError: true
    });
  });

  if (!fileContentJSON) return;

  if (!fileContentJSON.values) {
    fileContentJSON.values = [];
  }

  fileContentJSON.values.push(...filteredToursData);

  await fs.writeFileSync(SAVED_DATA_FILE_PATH, JSON.stringify(fileContentJSON), { encoding: 'utf8' });

  await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] saveFilteredToursDataToFile end');
};
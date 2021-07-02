import { getTripToDreamLogPath, SAVED_DATA_FILE_PATH } from '../..';
import { debug_log } from '../../../../helpers/debug_log';
import { getFileJSONContent } from '../../../../helpers/get_file_json_content';
import { createFileIfNotExists } from '../../../../helpers/create_file_is_not_exits/create_file_is_not_exits';
import { ToursDataItem } from '../../typings';

/**
 * Фильтруем полученные данные (исключаем уже имеющиеся), для этого
 *
 * - считываем из файла содержимое имеющихся данных
 * - проверяем что информация из файла не дублируется с новой
 */
export const filterToursData: (toursData: ToursDataItem[]) => Promise<any> = async (toursData) => {
  await createFileIfNotExists(SAVED_DATA_FILE_PATH);

  const fileContentJSON = await getFileJSONContent(SAVED_DATA_FILE_PATH, async (error) => {
    await debug_log(getTripToDreamLogPath(), '[trip_to_dream_script] filterToursData getFileJSONContent' + error.message, {
      isError: true
    });
  });

  if (!fileContentJSON) return;

  const filteredToursData = getDifferenceTourItems(toursData, fileContentJSON.values);

  return filteredToursData;
};

/**
 * Сравнивает два массива и возвращает туры, которых нет в файле
 */
const getDifferenceTourItems = (tourDataItems: ToursDataItem[], toursDataItemsFromFile: ToursDataItem[]) => {
  /**
   * Если в файле ничего нет - значит данные точно новые
   */
  if (!toursDataItemsFromFile || !toursDataItemsFromFile.length) return tourDataItems;

  const differenceItems = tourDataItems.filter(tourItem => {
    const hasTourInFile = toursDataItemsFromFile.some(tourDataItemFromFile => {
      const areTheSameTitle = tourItem.title === tourDataItemFromFile.title;
      if (!areTheSameTitle) return false;

      const areTheSameText = tourItem.text === tourDataItemFromFile.text;
      if (!areTheSameText) return false;

      const areTheSameLinkUrl = tourItem.url === tourDataItemFromFile.url;
      if (!areTheSameLinkUrl) return false;

      const areTheSameDates = tourItem.date === tourDataItemFromFile.date;
      if (!areTheSameDates) return false;

      return true;
    });

    return !hasTourInFile;
  });

  return differenceItems;
};
import { ToursData, ToursDataItem } from '../get_tours_data_from_HTML/typings';
import { getTurscannerLogPath, SAVED_DATA_FILE_PATH } from '../..';
import { debug_log } from '../../../../helpers/debug_log';
import { getFileJSONContent } from '../../../../helpers/get_file_json_content';
import { createFileIfNotExists } from '../../../../helpers/create_file_is_not_exits/create_file_is_not_exits';

/**
 * Фильтруем полученные данные (исключаем уже имеющиеся), для этого
 *
 * - считываем из файла содержимое имеющихся данных
 * - проверяем что информация из файла не дублируется с новой
 */
export const filterToursData: (toursData: ToursData[]) => Promise<ToursData[]> = async (toursData) => {
  await createFileIfNotExists(SAVED_DATA_FILE_PATH);

  const fileContentJSON = await getFileJSONContent(SAVED_DATA_FILE_PATH, async (error) => {
    await debug_log(getTurscannerLogPath(), '[turscanner_script] filterToursData getFileJSONContent' + error.message, {
      isError: true
    });
  });

  if (!fileContentJSON) return;

  const filteredToursData = toursData.map(({ month, items: tourDataItems }) => {
    const differenceItems = getDifferenceTourItems(tourDataItems, fileContentJSON[month]);

    return {
      month,
      items: differenceItems
    };
  }).filter(({ items: tourDataItems }) => tourDataItems.length);

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
      const areTheSameNights = tourItem.nights === tourDataItemFromFile.nights;
      if (!areTheSameNights) return false;

      const areTheSamePrice = tourItem.price === tourDataItemFromFile.price;
      if (!areTheSamePrice) return false;

      const areTheSameCountry = tourItem.country === tourDataItemFromFile.country;
      if (!areTheSameCountry) return false;

      const areTheSameMeal = tourItem.meal === tourDataItemFromFile.meal;
      if (!areTheSameMeal) return false;

      const areTheSameSource = tourItem.source === tourDataItemFromFile.source;
      if (!areTheSameSource) return false;

      const areTheSameLinkUrl = tourItem.linkUrl === tourDataItemFromFile.linkUrl;
      if (!areTheSameLinkUrl) return false;

      const areTheSameDates = tourItem.date === tourDataItemFromFile.date;
      if (!areTheSameDates) return false;

      return true;
    });

    return !hasTourInFile;
  });

  return differenceItems;
};
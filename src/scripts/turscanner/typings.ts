/**
 * Вся возможная информация о туре
 */
export type ToursData = {
  /**
   * Месяц тура
   */
  month: string;

  /**
   * Массив с содержимым самих туров
   */
  items: ToursDataItem[];
};

/**
 * Содержимое одного тура
 */
export type ToursDataItem = {
  country: string;
  nights: string;
  date: string;
  meal: string;
  price: string;
  source: string;
  linkUrl: string;
};
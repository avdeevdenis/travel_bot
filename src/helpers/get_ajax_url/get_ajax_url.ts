const HOST = process.env.DEFAULT_HOST;

const DEFAULT_ACTION = 'getTours';
const DEFAULT_CITIES = 'Moscow';
/**
 * GR - Греция, CY - Кипр, CU - Куба, MV - Мальдивы, AE - ОАЭ, SC - Сейшелы
 */
const DEFAULT_COUNTRIES = ['GR', 'CY', 'CU', 'MV', 'AE', 'SC'];
const DEFAULT_KHOT = 20;
const DEFAULT_PRICE = process.env.DEFAULT_PRICE;
const DEFAULT_NIGHTS_FROM = process.env.DEFAULT_NIGHTS_FROM;
const DEFAULT_NIGHTS_TO = process.env.DEFAULT_NIGHTS_TO;
const DEFAULT_NO_VISA = false;
const HOTTEST_DEFAULT = false;
const DATE_FROM_DEFAULT = process.env.DATE_FROM_DEFAULT;
const DATE_TO_DEFAULT = process.env.DATE_TO_DEFAULT;
const SORT_DEFAULT = 'khot';
const SORT_DIR_DEFAULT = 0;

export type AjaxOptions = {
  /**
   * Действие - получить туры
   */
  action?: 'getTours';

  /**
   * Города вылета
   */
  cities?: 'Moscow';

  /**
   * Страны куда
   */
  countries?: typeof DEFAULT_COUNTRIES;

  /**
   * Коэффициент выгодности
   * ⚠️ от 0 до 100
   */
  kHot?: number;

  /**
   * Цена на человека ДО
   */
  price?: string;

  /**
   * Количество ночей ОТ
   * ⚠️ min 5
   */
  nightsFrom?: string;

  /**
   * Количество ночей ДО
   * ⚠️ max 15
   */
  nightsTo?: string;

  /**
   * С визой и без
   */
  novisa?: boolean;

  /**
   * Убрать ограничение - показывать только один самый выгодный тур в каждую страну
   */
  hottest?: boolean;

  /**
   * Дата, начиная с которой идет поиск туров
   */
  dateFrom?: string;

  /**
   * Дата, ДО которой идет поиск туров
   */
  dateTo?: string;

  /**
   * Сортировка
   * khot - по коэффициенту выгодности
   */
  sort?: 'khot';

  /**
   * Порядок сортировки
   * 0 - по убыванию,
   * 1 - по возрастанию
   */
  sortDir?: 0,
}

export const getAjaxUrl = (options?: AjaxOptions) => {
  const {
    action = DEFAULT_ACTION,
    cities = DEFAULT_CITIES,
    countries = DEFAULT_COUNTRIES,
    kHot = DEFAULT_KHOT,
    price = DEFAULT_PRICE,
    nightsFrom = DEFAULT_NIGHTS_FROM,
    nightsTo = DEFAULT_NIGHTS_TO,
    novisa = DEFAULT_NO_VISA,
    hottest = HOTTEST_DEFAULT,
    dateFrom = DATE_FROM_DEFAULT,
    dateTo = DATE_TO_DEFAULT,
    sort = SORT_DEFAULT,
    sortDir = SORT_DIR_DEFAULT,
  } = options || {};

  const countriesString = countries.map(country => `&countries[]=${country}`).join('');

  return HOST +

    /**
     * Действие
     */
    '?action=' + action +

    /**
     * Города вылета
     */
    '&cities[]=' + cities +

    /**
     * Страны куда
     */
    countriesString +

    /**
     * Коэффициент выгодности
     */
    '&kHot=' + kHot +

    /**
     * Цена на человека ДО
     */
    '&price=' + price +

    /**
     * Количество ночей ОТ
     */
    '&nightsFrom=' + nightsFrom +

    /**
     * Количество ночей ДО
     */
    '&nightsTo=' + nightsTo +

    /**
     * С визой и без
     */
    '&novisa=' + novisa +

    /**
     * Убрать ограничение - показывать только один самый выгодный тур в каждую страну
     */
    '&hottest=' + hottest +

    /**
     * Дата, начиная с которой ищем туры
     */
    '&dateFrom=' + dateFrom +

    /**
     * Дата, до которой ищем туры
     */
    '&dateTo=' + dateTo +

    /**
     * Сортировка
     */
    '&sort=' + sort +

    /**
     * Порядок сортировки
     */
    '&sortDir=' + sortDir;
};

/**
 * Установленные параметры для последовательных запросов за странами
 */
export const ajaxUrlParams: Partial<AjaxOptions>[] = [{
  countries: ['GR'],
  kHot: 40,
}, {
  countries: ['CY'],
  kHot: 40,
}, {
  countries: ['CU'],
  kHot: 40,
}, {
  countries: ['MV'],
  kHot: 40,
}, {
  countries: ['AE'],
  kHot: 50,
}, {
  countries: ['SC'],
  kHot: 20,
}]

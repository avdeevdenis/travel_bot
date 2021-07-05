import { AxiosRequestConfig } from 'axios';

/**
 * Ссылка на партнера, куда отправляется ajax-запрос
 */
export type TravelInputUrl = string;

/**
 * Файл с данными, где хранится информация о турах
 */
export type TravelSavedToursFilepath = (
  TravelSavedToursFilepath_Turscanner |
  TravelSavedToursFilepath_Shtourval |
  TravelSavedToursFilepath_TripToDream
);

export type TravelSavedToursFilepath_Turscanner = 'src/data/turscanner_data.json';
export type TravelSavedToursFilepath_Shtourval = 'src/data/shtourval_data.json';
export type TravelSavedToursFilepath_TripToDream = 'src/data/trip_to_dream_data.json';

/**
 * Тип содержимого файла, где хранится информация о турах
 */
export type FileContentJSON = {
  values: StructuredTravelDataItem[],
};

/**
 * Метод, который на вход принимает результат AJAX-ответа партнера, и преобразовывает его в структурированные данные
 */
export type ProcessingAjaxResponseData = (ajaxResponseData: TravelAjaxResponseData, errorHandler: (message: string) => void) => StructuredTravelData | undefined;

/**
 * Метод, который преобразует данные о туре в сообщение для отправки в телеграме
 */
export type ProcessingTelegramMessage = (travelDataItem: StructuredTravelDataItem) => TelegramMessage;

/**
 * Поля, по которым идет сравнение объекта с туром с объектом из файла на их идентичность, объекты считаются идентичными если значения всех перечисленных полей равны
 */
export type TravelFilterItemFields = (
  TravelFilterItemFields_Turscanner |
  TravelFilterItemFields_Shtourval |
  TravelFilterItemFields_TripToDream
);

export type TravelFilterItemFields_Turscanner = ['nights', 'price', 'country', 'meal', 'source', 'linkUrl', 'date'];
export type TravelFilterItemFields_Shtourval = ['city', 'country', 'date', 'nights', 'price', 'link'];
export type TravelFilterItemFields_TripToDream = ['title', 'text', 'url', 'date'];

export type TelegramMessage = string;
export type TelegramMessages = TelegramMessage[];

/**
 * Название партнера (для логов)
 */
export type TravelPartnerName = 'turscanner' | 'shtourval' | 'trip_to_dream';

export type TravelInput = {
  /**
   * Сайт партнера, ajax-запрос на который будет осуществлен
   */
  url: TravelInputUrl;

  /**
   * Дополнительные параметры для ajax-запроса
   */
  urlOptions?: AxiosRequestConfig;

  /**
   * Метод, который на вход принимает результат AJAX-ответа партнера, и преобразовывает его в структурированные данные
   */
  processingAjaxResponseData: ProcessingAjaxResponseData;

  /**
   * Путь, по которому будет записываться информация о турах
   */
  savedToursFilepath: TravelSavedToursFilepath;

  /**
   * Поля, по которым идет сравнение объекта с туром с объектом из файла на их идентичность, объекты считаются идентичными если значения всех перечисленных полей равны
   */
  filterTravelItemFields: TravelFilterItemFields;

  /**
   * Метод, который преобразует данные о туре в сообщение для отправки в телеграме
   */
  processingTelegramMessage: ProcessingTelegramMessage;

  /**
   * Название партнера (для логов)
   */
  partnerName: TravelPartnerName;
};

/**
 * Данные, которые вернулись от партнеров
 */
export type TravelAjaxResponseData = TravelAjaxReponseData_Turscanner | TravelAjaxReponseData_Shtourval | TravelAjaxReponseData_TripToDream;
export type TravelAjaxReponseData_Shtourval = {
  rows: StructuredTravelDataItem_Shtourval[];
};
export type TravelAjaxReponseData_Turscanner = string;
export type TravelAjaxReponseData_TripToDream = string;

/**
 * Структурированные данные, преобразованные из AJAX ответа
 */
export type StructuredTravelData = StructuredTravelDataItem[];

/**
 * Структурированный объект с информацией об одном конкретном туре
 */
export type StructuredTravelDataItem = StructuredTravelDataItem_Turscanner | StructuredTravelDataItem_Shtourval | StructuredTravelDataItem_TripToDream;
export type StructuredTravelDataItem_Shtourval = {
  city: string;
  country: string;
  date: string;
  nights: string;
  price: string;
  khot: number;
  link: string;
  updated: number;
  covidInfo: string;
  risk: string;
  countryCode: string;
};

export type StructuredTravelDataItem_Turscanner = {
  country: string;
  nights: string;
  date: string;
  meal: string;
  price: string;
  source: string;
  linkUrl: string;
};

export type StructuredTravelDataItem_TripToDream = {
  title: string;
  text: string;
  url: string;
  date: string;
};
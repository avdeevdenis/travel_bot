/**
 * AJAX-ответ тревел-оператора
 */
export type ResponseData = {
  count: string;
  rows: ResponseRow[];
}

/**
 * Одна позиция в ответе тревел-оператора
 */
export type ResponseRow = {
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
}
import { ResponseData } from '../../typings';

/**
 * Берем из ответа поля, которые явно используем
 */
export const filterData = (responseData: ResponseData) => {
  const responseDataRows = responseData.rows.map((responseRow) => {
    const {
      city,
      country,
      date,
      nights,
      price,
      khot,
      link,
      updated,
      covidInfo,
      risk,
      countryCode,
    } = responseRow;

    return {
      city,
      country,
      date,
      nights,
      price,
      khot,
      link,
      updated,
      covidInfo,
      risk,
      countryCode,
    };
  });

  return {
    ...responseData,
    rows: responseDataRows
  };
};
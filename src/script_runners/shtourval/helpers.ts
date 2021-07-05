import { ajaxUrlParams, getAjaxUrl } from '../../helpers/get_ajax_url';
import { sleep } from '../../helpers/sleep';
import { travelParser } from '../../helpers/travel_parser';
import {
  ProcessingAjaxResponseData,
  StructuredTravelData,
  StructuredTravelDataItem,
  StructuredTravelDataItem_Shtourval,
  TravelAjaxReponseData_Shtourval,
  TravelInput
} from '../../helpers/travel_parser/typings';

const { DateTime } = require('luxon');

export const parseShtourval = async () => {
  const travelInputArray = getTravelInputArray();

  for (let i = 0; i < travelInputArray.length; i++) {
    const travelInput_Shtourval = travelInputArray[i];

    await travelParser(travelInput_Shtourval);

    /**
     * Ставим паузу, мы ведь не хотим отправлять 10 запросов в секунду?
     */
    await sleep(1000);
  }
};

export const getTravelInput: (url: string) => TravelInput = (url) => {
  return {
    url,
    urlOptions: {
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      }
    },
    partnerName: 'shtourval',
    processingAjaxResponseData,
    filterTravelItemFields: ['city', 'country', 'date', 'nights', 'price', 'link'],
    processingTelegramMessage: getTelegramMessageItem,
  };
};

export const getTravelInputArray = () => {
  const urls = ajaxUrlParams.map(urlParams => getAjaxUrl(urlParams));

  return urls.map(url => getTravelInput(url));
}

export const processingAjaxResponseData: ProcessingAjaxResponseData = (ajaxResponseData) => {
  const ajaxResponse = ajaxResponseData as TravelAjaxReponseData_Shtourval;
  if (!ajaxResponse.rows || !ajaxResponse.rows.length) return;

  const responseDataRows: StructuredTravelData = ajaxResponse.rows.map((responseRow) => {
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

  return responseDataRows;
};



const getFlagIconByCountryName = (countryCode: string) => {
  switch (countryCode) {
    case 'gr':
      return '🇬🇷';

    case 'cy':
      return '🇨🇾';

    case 'cu':
      return '🇨🇺';

    case 'mv':
      return '🇲🇻';

    case 'ae':
      return '🇦🇪';

    case 'sc':
      return '🇸🇨';

    default:
      return '';
  }
};

const getDateTo = (date: string, nights: string) => {
  const [day, month, year] = date.split('.');

  const now = DateTime.fromObject({
    month,
    year,
    day,
    hour: 0,
    minutes: 0,
    zone: 'Europe/Moscow'
  });

  const dateTo = now.plus({ days: nights });

  const dateToFormatted = dateTo.toFormat('dd.MM.yyyy');

  return dateToFormatted;
};

/**
 * Округляем сумму до ближайших целых десятков
 */
// const getPriceHashtag = (price: string) => {
//   const priceStringNoSpaces = price.split(' ').join('');
//   const priceInt = parseInt(priceStringNoSpaces, 10);
//   const priceLength = priceInt.toString().length;
//   const firstDigitRounded = Math.round(priceInt / (10 ** (priceLength - 1)));

//   const priceRounded = firstDigitRounded + '0'.repeat(priceLength - 1);

//   return `#p${priceRounded}`;
// };

// const getKhotHashtag = (khot: number) => {
//   const khotRounded = Math.floor(khot);
//   const khotRoundedByDozens = khotRounded - khotRounded % 10;

//   return `#k${khotRoundedByDozens}`;
// };

export const getTelegramMessageItem = (travelDataItem: StructuredTravelDataItem) => {
  const {
    country,
    date,
    nights,
    price,
    khot,
    link,
    countryCode,
  } = travelDataItem as StructuredTravelDataItem_Shtourval;

  const NEW_LINE = '\n';

  const flag = getFlagIconByCountryName(countryCode);
  const flagString = flag ? ' ' + flag : '';
  const dateTo = getDateTo(date, nights);
  // const updatedTextI18N = getUpdatedTextI18N(updated);
  // const updatedDateTime = DateTime.now().setZone('Europe/Moscow').minus({ minutes: updated }).toFormat('HH:mm');

  const linkUrl = 'https://level.travel' + link;

  // const [day, month] = date.split('.');

  // const countryCodeHashtag = `#${countryCode.toLocaleUpperCase()}`;
  // const nightsHashtag = `#n${nights}`;
  // const priceHashtag = getPriceHashtag(price);
  // // const dateHashtag = `#d${date.replace(/\./g, '\\_')}`;
  // const khotHashtag = getKhotHashtag(khot);
  // const monthHashtag = `#m${month}`;
  // const dayHashtag = `#d${day}`;

  const hashtags = `#shtourval`;

  let messageString = '';

  messageString += `🌴 [${country}${flagString}](${linkUrl})${NEW_LINE}`;
  messageString += `Выгодность *${khot}%.*${NEW_LINE}`;
  messageString += `Стоимость *${price}*${NEW_LINE}`;
  messageString += `Даты *${date} - ${dateTo}* → *${nights}* ночей.${NEW_LINE}`;
  // messageString += `Обновлено ${updated} ${updatedTextI18N} назад.${NEW_LINE}`;
  messageString += `${hashtags}${NEW_LINE}`;

  return messageString;
};
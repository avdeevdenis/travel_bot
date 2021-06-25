import { ResponseRow } from '../../typings';

/**
 * На вход принимает массив travel-предложений
 * Возвращает массив с текстами сообщений для телеграма
 */
export const getMessageDataArray = (filteredData: Partial<ResponseRow>[]) => {
  if (!filteredData || !filteredData.length) return;

  return filteredData.map((filteredItem) => {
    const {
      country,
      date,
      nights,
      price,
      khot,
      link,
      updated,
      countryCode,
    } = filteredItem;

    const NEW_LINE = '\n';

    const flag = getFlagIconByCountryName(countryCode);
    const flagString = flag ? ' ' + flag : '';
    const dateTo = getDateTo(date, nights);
    // const updatedTextI18N = getUpdatedTextI18N(updated);
    const updatedDateTime = DateTime.now().setZone('Europe/Moscow').minus({ minutes: updated }).toFormat('HH:mm');

    const linkUrl = process.env.TRAVEL_SEARCHER_HOST + link;

    const [day, month] = date.split('.');

    const countryCodeHashtag = `#${countryCode.toLocaleUpperCase()}`;
    const nightsHashtag = `#n${nights}`;
    const priceHashtag = getPriceHashtag(price);
    // const dateHashtag = `#d${date.replace(/\./g, '\\_')}`;
    const khotHashtag = getKhotHashtag(khot);
    const monthHashtag = `#m${month}`;
    const dayHashtag = `#d${day}`;

    const hashtags = `${countryCodeHashtag} ${nightsHashtag} ${priceHashtag} ${khotHashtag} ${dayHashtag} ${monthHashtag}`;

    let messageString = '';

    messageString += `🆕 [${country}${flagString}](${linkUrl})${NEW_LINE}`;
    messageString += `Выгодность *${khot}%.*${NEW_LINE}`;
    messageString += `Стоимость *${price}*${NEW_LINE}`;
    messageString += `Даты *${date} - ${dateTo}* → *${nights}* ночей.${NEW_LINE}${NEW_LINE}`;
    // messageString += `Обновлено ${updated} ${updatedTextI18N} назад.${NEW_LINE}`;
    messageString += `Актуальность на ${updatedDateTime}.${NEW_LINE}`;
    messageString += `${hashtags}${NEW_LINE}`;

    return messageString;
  });
};

const { DateTime } = require('luxon');

const getFlagIconByCountryName = (countryCode) => {
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

const getDateTo = (date, nights) => {
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

// const getUpdatedTextI18N = (count) => {
//   const percentageOfSeparation = count % 10;

//   if (percentageOfSeparation === 0 || percentageOfSeparation >= 5 || (count >= 11 && count <= 20)) {
//     return 'минут';
//   }

//   if (percentageOfSeparation === 1) {
//     return 'минуту';
//   }

//   if (percentageOfSeparation >= 2 || percentageOfSeparation <= 4) {
//     return 'минуты';
//   }
// };

/**
 * Округляем сумму до ближайших целых десятков
 */
const getPriceHashtag = (price: string) => {
  const priceStringNoSpaces = price.split(' ').join('');
  const priceInt = parseInt(priceStringNoSpaces, 10);
  const priceLength = priceInt.toString().length;
  const firstDigitRounded = Math.round(priceInt / (10 ** (priceLength - 1)));

  const priceRounded = firstDigitRounded + '0'.repeat(priceLength - 1);

  return `#p${priceRounded}`;
};

const getKhotHashtag = (khot: number) => {
  const khotRounded = Math.floor(khot);
  const khotRoundedByDozens = khotRounded - khotRounded % 10;

  return `#k${khotRoundedByDozens}`;
};
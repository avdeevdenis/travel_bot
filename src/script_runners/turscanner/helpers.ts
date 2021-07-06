import { ProcessingAjaxResponseData, StructuredTravelData, StructuredTravelDataItem_Turscanner, TravelInput } from '../../helpers/travel_parser/typings';
import * as FormData from 'form-data';
import { parse } from 'node-html-parser';

export const getTravelInput: () => TravelInput = () => {
  return {
    url: 'https://www.turscanner.ru/search-tours/',
    urlOptions: getUrlOptions(),
    partnerName: 'turscanner',
    processingAjaxResponseData: getToursDataFromHTML,
    filterTravelItemFields: ['nights', 'price', 'country', 'meal', 'source', 'linkUrl', 'date'],
    processingTelegramMessage: getTelegramMessageItem,
  };
};

const getUrlOptions = () => {
  const formData = new FormData();

  /**
   * 'City=1' - вылет из Москвы
   */
  formData.append('city', '1');

  /**
   * С визой и без
   */
  formData.append('is_visa_free', 'false');

  const options = {
    headers: {
      'x-requested-with': 'XMLHttpRequest'
    },
    data: formData
  };

  return options;
};


/**
 * Считывает содержимое элемента внутри родетиля
 */
const getTextInsideChildElement = (parentNode, childClass: string) => {
  const child = parentNode.querySelector(childClass);
  const text = child && child.text;

  return text;
};

/**
 * Классы, используемые в текущем модуле для парсинга
 */
const classes = {
  BLOCK: '.tours__block',
  TITLE: '.tours__title',
  ITEM: '.tours__item',
  NAME: '.tours__name',
  NIGHTS: '.tours__nights',
  DATE: '.tours__date',
  MEAL: '.tours__meal',
  PRICE: '.tours__price',
  SOURCE: '.tours__source',
  LINK: '.tours__link',
} as const;

/**
 * Преобразуем урл для случаев:
 * - если есть параметр `&custom_url=` берем его значение
 */
const prepareUrl = (url: string) => {
  const preparedUrl = new URL(url);

  const customUrl = preparedUrl.searchParams.get('custom_url');

  if (customUrl) return customUrl;

  return url;
};

/**
 * Парсит html-разметку и формирует необходимые данные
 */
export const getToursDataFromHTML: ProcessingAjaxResponseData = (HTMLTemplate) => {
  const root = parse(HTMLTemplate as string);

  const tourBlockNodes = root.querySelectorAll(classes.BLOCK);
  if (!tourBlockNodes.length) return null;

  const toursData: StructuredTravelData = tourBlockNodes.reduce((result, tourBlockNode) => {
    const tourItemNodes = tourBlockNode.querySelectorAll(classes.ITEM);
    if (!tourItemNodes.length) return null;

    const items: StructuredTravelData = tourItemNodes.map(tourItemNode => {
      const country = getTextInsideChildElement(tourItemNode, classes.NAME);
      const nights = getTextInsideChildElement(tourItemNode, classes.NIGHTS);
      const date = getTextInsideChildElement(tourItemNode, classes.DATE);
      const meal = getTextInsideChildElement(tourItemNode, classes.MEAL);
      const price = getTextInsideChildElement(tourItemNode, classes.PRICE);
      const source = getTextInsideChildElement(tourItemNode, classes.SOURCE);

      const link = tourItemNode.querySelector(classes.LINK);
      const linkUrlDecoded = link ? decodeURIComponent(link.getAttribute('href')) : null;
      const linkUrl = linkUrlDecoded ? prepareUrl(linkUrlDecoded) : null;

      return {
        country,
        nights,
        date,
        meal,
        price,
        source,
        linkUrl,
      };
    });

    result.push(...items);

    return result;
  }, []);

  const filteredToursData = toursData.filter(Boolean);

  return filteredToursData;
}

export const getTelegramMessageItem = (tourItem: StructuredTravelDataItem_Turscanner) => {
  const NEW_LINE = '\n';
  const { country, price, date: dateFrom, nights, meal, linkUrl } = tourItem;
  const hashtags = `#turscanner`;

  let result = '';

  result += `🌴 [${country}](${linkUrl}) ${NEW_LINE}`;
  result += `Стоимость *${price}*. ${NEW_LINE}`;
  result += `Даты *${dateFrom}* → *${nights}*. ${NEW_LINE}`;
  result += `Питание *${meal}*. ${NEW_LINE}`;
  result += `${hashtags}`;

  return result;
};
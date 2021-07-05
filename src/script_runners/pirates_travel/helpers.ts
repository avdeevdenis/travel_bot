import { StructuredTravelDataItem_PiratesTravel, TravelAjaxReponseData_PiratesTravel, TravelInput } from '../../helpers/travel_parser/typings';
import { parse } from 'node-html-parser';

export const getTravelInput: () => TravelInput = () => {
  return {
    url: 'https://turs.sale/',
    partnerName: 'pirates_travel',
    processingAjaxResponseData: getToursDataFromHTML,
    filterTravelItemFields: ['dateFrom', 'dateTo', 'monthFrom', 'monthTo', 'price', 'title', 'subtitle'],
    processingTelegramMessage: getTelegramMessageItem,
  };
};

/**
 * Классы, используемые в текущем модуле для парсинга
 */
const classes = {
  ITEM: '.eventon_events_list .eventon_list_event',
  DATE_FROM: '.evo_start .date',
  MONTH_FROM: '.evo_start .month',
  DATE_TO: '.evo_end .date',
  MONTH_TO: '.evo_end .month',
  TITLE: '.evo_info .evcal_event_title',
  SUBTITLE: '.evo_info .evcal_event_subtitle',
  PRICE: '.evo_info .evocmd_button'
} as const;

export const getText = (parent, child) => parent.querySelector(child)?.text;

export const getToursDataFromHTML = (ajaxResponseData: TravelAjaxReponseData_PiratesTravel) => {
  const root = parse(ajaxResponseData);

  const articleItemNodes = root.querySelectorAll(classes.ITEM);
  if (!articleItemNodes.length) return null;

  const toursData = articleItemNodes.reduce((result, tourBlockNode) => {
    const dateFrom = getText(tourBlockNode, classes.DATE_FROM);
    const dateTo = getText(tourBlockNode, classes.DATE_TO);
    const monthFrom = getText(tourBlockNode, classes.MONTH_FROM);
    const monthTo = getText(tourBlockNode, classes.MONTH_TO);
    const title = getText(tourBlockNode, classes.TITLE);
    const subtitle = getText(tourBlockNode, classes.SUBTITLE);
    const price = getText(tourBlockNode, classes.PRICE);
    const url = tourBlockNode.querySelector(classes.PRICE)?.getAttribute('data-href');

    const hasRequiredData = title && url && dateFrom && monthFrom && dateTo && subtitle && price && url;

    if (hasRequiredData) {
      result.push({
        dateFrom,
        monthFrom,
        dateTo,
        monthTo: monthTo ? monthTo : monthFrom,
        title,
        subtitle,
        price,
        url,
      });
    }

    return result;
  }, []);

  if (!toursData.length) return;

  return toursData;
};

/**
 * 12000 -> 12 000
 */
export const numberWithSpaces = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const getTelegramMessageItem = (messageDataItem: StructuredTravelDataItem_PiratesTravel) => {
  const NEW_LINE = '\n';
  const { title, subtitle, url, price, dateFrom, monthFrom, dateTo, monthTo } = messageDataItem;
  const hashtags = `#pirates_travel`;

  let messageString = '';

  messageString += `🌴 [${title}, ${subtitle}](${url})${NEW_LINE}`;
  messageString += `Даты *${dateFrom} ${monthFrom} - ${dateTo} ${monthTo}*.${NEW_LINE}`;
  messageString += `Стоимость *${numberWithSpaces(price)}.*${NEW_LINE}`;
  messageString += `${hashtags}${NEW_LINE}`;

  return messageString;
};
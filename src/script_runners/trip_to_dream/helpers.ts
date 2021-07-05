import { StructuredTravelDataItem_TripToDream, TravelAjaxReponseData_TripToDream, TravelInput } from '../../helpers/travel_parser/typings';
import { parse } from 'node-html-parser';

export const getTravelInput: () => TravelInput = () => {
  return {
    url: 'https://triptodream.ru/tag/na-more/',
    partnerName: 'trip_to_dream',
    processingAjaxResponseData: getToursDataFromHTML,
    filterTravelItemFields: ['title', 'text', 'url', 'date'],
    processingTelegramMessage: getTelegramMessageItem,
  };
};

/**
 * Классы, используемые в текущем модуле для парсинга
 */
const classes = {
  ITEM: 'article .articles__box',
  TITLE_LINK: '.articles__text a',
  TEXT: 'p',
  DATE: 'span',
} as const;

export const getToursDataFromHTML = (ajaxResponseData: TravelAjaxReponseData_TripToDream) => {
  const root = parse(ajaxResponseData);

  const articleItemNodes = root.querySelectorAll(classes.ITEM);
  if (!articleItemNodes.length) return null;

  const toursData = articleItemNodes.reduce((result, tourBlockNode) => {
    const titleLinkNode = tourBlockNode.querySelector(classes.TITLE_LINK);
    const title = titleLinkNode?.text;
    const url = titleLinkNode?.getAttribute('href');

    const textNode = tourBlockNode.querySelector(classes.TEXT);
    const text = textNode?.text;

    const dateNode = tourBlockNode.querySelector(classes.DATE);
    const date = dateNode?.text;

    const MOSCOW_PART = 'Москв';
    const OLD_OFFER_PART = 'Архив';

    const isActualOffet = !(title || '').startsWith(OLD_OFFER_PART);
    const isMoscowOffer = (title || '').includes(MOSCOW_PART) || (text || '').includes(MOSCOW_PART);

    const hasRequiredData = title && url && text && date && isMoscowOffer && isActualOffet;

    if (hasRequiredData) {
      result.push({
        title,
        url,
        text,
        date,
      });
    }

    return result;
  }, []);

  if (!toursData.length) return;

  return toursData;
};

const prepareTelegramMessageEntities = (message) => {
  let prepared = message;

  prepared = prepared.replace(/\*/g, '☆');

  return prepared;
};

export const getTelegramMessageItem = (messageDataItem: StructuredTravelDataItem_TripToDream) => {
  const NEW_LINE = '\n';
  const { title, text, url, date } = messageDataItem;
  const hashtags = `#trip_to_dream`;

  let result = '';

  result += `🌴 [${prepareTelegramMessageEntities(title)}](${url}) ${NEW_LINE}`;
  result += `${prepareTelegramMessageEntities(text)} ${NEW_LINE}`;
  result += `Дата *${date}*. ${NEW_LINE}`;
  result += `${hashtags}`;

  return result;
};
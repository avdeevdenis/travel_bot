import { parse } from 'node-html-parser';

/**
 * Классы, используемые в текущем модуле для парсинга
 */
const classes = {
  ITEM: 'article .articles__box',
  TITLE_LINK: '.articles__text a',
  TEXT: 'p',
  DATE: 'span',
} as const;

/**
 * Парсит html-разметку и формирует необходимые данные
 */
export const getHTMLTemplateData = (ajaxData) => {
  const root = parse(ajaxData);

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
import { parse } from 'node-html-parser';
import { getTurscannerLogPath } from '../..';
import { debug_log } from '../../../../helpers/debug_log';
import { ToursData, ToursDataItem } from '../../typings';

/**
 * Считывает содержимое элемента внутри родетиля
 */
const getTextInsideChildElement = (parentNode, childClass: string) => {
  const child = parentNode.querySelector(childClass);
  const text = child && child.text;

  if (!text) {
    debug_log(getTurscannerLogPath(), '[turscanner_script] getTextInsideChildElement no text childClass=' + childClass, {
      isError: true
    });
  }

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
 * Парсит html-разметку и формирует необходимые данные
 */
export const getToursDataFromHTML: (HTMLTemplate: string) => ToursData[] = (HTMLTemplate) => {
  const root = parse(HTMLTemplate);

  const tourBlockNodes = root.querySelectorAll(classes.BLOCK);
  if (!tourBlockNodes.length) return null;

  const toursData: ToursData[] = tourBlockNodes.map(tourBlockNode => {
    const tourItemNodes = tourBlockNode.querySelectorAll(classes.ITEM);
    if (!tourItemNodes.length) return null;

    const items: ToursDataItem[] = tourItemNodes.map(tourItemNode => {
      const country = getTextInsideChildElement(tourItemNode, classes.NAME);
      const nights = getTextInsideChildElement(tourItemNode, classes.NIGHTS);
      const date = getTextInsideChildElement(tourItemNode, classes.DATE);
      const meal = getTextInsideChildElement(tourItemNode, classes.MEAL);
      const price = getTextInsideChildElement(tourItemNode, classes.PRICE);
      const source = getTextInsideChildElement(tourItemNode, classes.SOURCE);

      const link = tourItemNode.querySelector(classes.LINK);
      const linkUrl = link ? decodeURIComponent(link.getAttribute('href')) : null;

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

    const tourTitleNode = tourBlockNode.querySelector(classes.TITLE);
    const month = tourTitleNode.text;

    return {
      month,
      items,
    };
  });

  const filteredToursData = toursData.filter(Boolean);

  return filteredToursData;
}
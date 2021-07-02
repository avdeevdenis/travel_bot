import { ToursDataItem } from '../../typings';

/**
 * Формируем массив сообщений, с найденными турами для дальнейшей отправки
 */
export const getTelegramMessagesData = (toursData: ToursDataItem[]) => {
  const messagesData = toursData.map((tourItem) => {
    return getTelegramMessageItem(tourItem);
  });

  return messagesData;
};

const prepareTelegramMessageEntities = (message) => {
  let prepared = message;

  prepared = prepared.replace(/\*/g, '⭐');

  return prepared;
};

const getTelegramMessageItem = (tourItem: ToursDataItem) => {
  const NEW_LINE = '\n';
  const { title, text, url, date } = tourItem;
  const hashtags = `#trip\\_to\\_dream`;

  let result = '';

  result += `🆕 [${prepareTelegramMessageEntities(title)}](${url}) ${NEW_LINE}`;
  result += `${prepareTelegramMessageEntities(text)} ${NEW_LINE}`;
  result += `Дата *${date}*. ${NEW_LINE}`;
  result += `${hashtags}`;

  return result;
};
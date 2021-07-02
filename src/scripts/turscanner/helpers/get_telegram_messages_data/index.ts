import { ToursData, ToursDataItem } from '../../typings';

/**
 * Формируем массив сообщений, с найденными турами для дальнейшей отправки
 */
export const getTelegramMessagesData = (toursData: ToursData[]) => {
  const messagesData = toursData.reduce((messagesData, tourData) => {
    const messageDataItems = tourData.items.map(tourItem => {
      return getTelegramMessageItem(tourData.month, tourItem);
    });

    messagesData.push(...messageDataItems);

    return messagesData;
  }, []);

  return messagesData;
};

const getTelegramMessageItem = (month: string, tourItem: ToursDataItem) => {
  const NEW_LINE = '\n';
  const { country, price, date: dateFrom, nights, meal, linkUrl } = tourItem;
  const hashtags = `#turscanner #${month.toLocaleLowerCase()}`;

  let result = '';

  result += `🆕 [${country}](${linkUrl}) ${NEW_LINE}`;
  result += `Стоимость *${price}*. ${NEW_LINE}`;
  result += `Даты *${dateFrom}* → *${nights}*. ${NEW_LINE}`;
  result += `Питание *${meal}*. ${NEW_LINE}`;
  result += `${hashtags}`;

  return result;
};
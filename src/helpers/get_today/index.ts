const { DateTime } = require('luxon');

export const getToday = () => {
  const now = DateTime.now().setZone('Europe/Moscow');

  const value = (number) => {
    return number < 10 ? '0' + number : number;
  }

  const today = [
    value(now.c.day),
    value(now.c.month),
    value(now.c.year),
  ].join('_');

  return today;
};

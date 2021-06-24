/**
 * Выводит в консоль сообщения с текстом 'message'
 */
export const debug_console = (...messages) => {
  const colors = {
    cyan: '\x1b[36m%s\x1b[0m'
  };

  const color = colors.cyan;

  console.log(color, ...messages);
};
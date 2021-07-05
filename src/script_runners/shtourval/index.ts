require('../../helpers/dotenv')
require('../../helpers/telegram_env');

import { parseShtourval } from './helpers';

(async () => {
  await parseShtourval();
})();
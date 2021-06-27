import { checkTravelDataSeparately } from '../';
import { parseTurscanner } from '../scripts/turscanner';

const cron = require('node-cron');

/**
 * Every 10 minutes
 */
cron.schedule('*/10 * * * *', async () => {
  await checkTravelDataSeparately();

  await parseTurscanner();
});

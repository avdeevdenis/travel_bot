import { checkTravelDataSeparately } from '../';

const cron = require('node-cron');

/**
 * Every 10 minutes
 */
cron.schedule('*/10 * * * *', async () => {
  await checkTravelDataSeparately();
});

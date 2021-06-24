import { checkTravelDataSeparately } from '../';

const cron = require('node-cron');

/**
 * Every 5 minutes
 */
cron.schedule('*/5 * * * *', async () => {
  await checkTravelDataSeparately();
});

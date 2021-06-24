import checkTravelData from '../';

const cron = require('node-cron');

/**
 * Every 20 minutes
 */
cron.schedule('*/20 * * * *', async () => {
  await checkTravelData();
});

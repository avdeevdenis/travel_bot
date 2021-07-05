require('../helpers/dotenv')
require('../helpers/telegram_env');

import { travelParser } from '../helpers/travel_parser';
import { TravelInput } from '../helpers/travel_parser/typings';
import { parseShtourval } from '../script_runners/shtourval/helpers';
import { getTravelInput as getTravelInputTripToDream } from '../script_runners/trip_to_dream/helpers';
import { getTravelInput as getTravelInputTurscanner } from '../script_runners/turscanner/helpers';

const cron = require('node-cron');

/**
 * Every 10 minutes
 */
//  cron.schedule('*/5 * * * * *', async () => {
cron.schedule('*/10 * * * *', async () => {
  /**
   * Parse partner 'trip_to_dream'
   */
  const travelInput_TripToDream: TravelInput = getTravelInputTripToDream();
  await travelParser(travelInput_TripToDream);

  /**
   * Parse partner 'turscanner'
   */
  const travelInput_Turscanner: TravelInput = getTravelInputTurscanner();
  await travelParser(travelInput_Turscanner);

  /**
   * Parse partner 'shtourval'
   */
  await parseShtourval();
});

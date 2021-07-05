require('../../helpers/dotenv')
require('../../helpers/telegram_env');

import { travelParser } from '../../helpers/travel_parser';
import { TravelInput } from '../../helpers/travel_parser/typings';
import { getTravelInput } from './helpers';

(async () => {
  const travelInput_PiratesTravel: TravelInput = getTravelInput();

  await travelParser(travelInput_PiratesTravel);
})();
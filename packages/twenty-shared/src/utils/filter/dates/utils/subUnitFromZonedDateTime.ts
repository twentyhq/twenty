import { assertUnreachable, type DateTimePeriod } from '@/utils';
import { type Temporal } from 'temporal-polyfill';

export const subUnitFromZonedDateTime = (
  zonedDateTime: Temporal.ZonedDateTime,
  unit: DateTimePeriod,
  amount: number,
) => {
  switch (unit) {
    case 'DAY':
      return zonedDateTime.subtract({ days: amount });
    case 'WEEK': {
      return zonedDateTime.subtract({ weeks: amount });
    }
    case 'QUARTER': {
      return zonedDateTime.subtract({
        months: amount * 3,
      });
    }
    case 'MONTH':
      return zonedDateTime.subtract({
        months: amount,
      });
    case 'YEAR':
      return zonedDateTime.subtract({
        years: amount,
      });
    case 'SECOND':
      return zonedDateTime.subtract({
        seconds: amount,
      });
    case 'MINUTE':
      return zonedDateTime.subtract({
        minutes: amount,
      });
    case 'HOUR':
      return zonedDateTime.subtract({
        hours: amount,
      });
    default:
      return assertUnreachable(unit);
  }
};

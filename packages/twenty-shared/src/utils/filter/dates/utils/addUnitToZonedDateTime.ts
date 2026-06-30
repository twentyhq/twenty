import { assertUnreachable, type DateTimePeriod } from '@/utils';
import { type Temporal } from 'temporal-polyfill';

export const addUnitToZonedDateTime = (
  zonedDateTime: Temporal.ZonedDateTime,
  unit: DateTimePeriod,
  amount: number,
) => {
  switch (unit) {
    case 'DAY':
      return zonedDateTime.add({ days: amount });
    case 'WEEK': {
      return zonedDateTime.add({ weeks: amount });
    }
    case 'QUARTER': {
      return zonedDateTime.add({
        months: amount * 3,
      });
    }
    case 'MONTH':
      return zonedDateTime.add({
        months: amount,
      });
    case 'YEAR':
      return zonedDateTime.add({
        years: amount,
      });
    case 'SECOND':
      return zonedDateTime.add({
        seconds: amount,
      });
    case 'MINUTE':
      return zonedDateTime.add({
        minutes: amount,
      });
    case 'HOUR':
      return zonedDateTime.add({
        hours: amount,
      });
    default:
      return assertUnreachable(unit);
  }
};

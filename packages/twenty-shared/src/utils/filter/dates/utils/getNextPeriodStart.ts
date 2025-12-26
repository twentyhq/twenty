import { type Nullable } from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { type DateTimePeriod } from '@/utils/filter/dates/types/DateTimePeriod';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';
import { getPeriodStart } from '@/utils/filter/dates/utils/getPeriodStart';
import { type Temporal } from 'temporal-polyfill';

export const FIRST_DAY_OF_WEEK_ISO_8601_MONDAY = 1;

export const getNextPeriodStart = (
  dateTime: Temporal.ZonedDateTime,
  unit: DateTimePeriod,
  firstDayOfTheWeek?: Nullable<FirstDayOfTheWeek>,
) => {
  switch (unit) {
    case 'DAY':
      return getPeriodStart(dateTime, 'DAY').add({ days: 1 });
    case 'WEEK': {
      return getPeriodStart(dateTime, 'WEEK', firstDayOfTheWeek).add({
        weeks: 1,
      });
    }
    case 'MONTH':
      return getPeriodStart(dateTime, 'MONTH', firstDayOfTheWeek).add({
        months: 1,
      });
    case 'QUARTER':
      return getPeriodStart(dateTime, 'QUARTER', firstDayOfTheWeek).add({
        months: 3,
      });
    case 'YEAR':
      return getPeriodStart(dateTime, 'YEAR', firstDayOfTheWeek).add({
        years: 1,
      });
    case 'SECOND':
      return getPeriodStart(dateTime, 'SECOND').add({ seconds: 1 });
    case 'MINUTE':
      return getPeriodStart(dateTime, 'MINUTE').add({ minutes: 1 });
    case 'HOUR':
      return getPeriodStart(dateTime, 'HOUR').add({ hours: 1 });
    default:
      return assertUnreachable(unit);
  }
};

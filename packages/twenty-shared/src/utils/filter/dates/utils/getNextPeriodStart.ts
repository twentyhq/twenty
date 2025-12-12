import { type Nullable } from '@/types';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';
import {
  getPeriodStart,
  type DateTimePeriod,
} from '@/utils/filter/dates/utils/getPeriodStart';
import { type Temporal } from 'temporal-polyfill';

export const FIRST_DAY_OF_WEEK_ISO_8601_MONDAY = 1;

/**
 * Use this instead of endOfX, because in practice it is better to create half-open date time intervals than a closed interval that goes start period to next period minus 1 micro/nano second.
 */
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
  }
};

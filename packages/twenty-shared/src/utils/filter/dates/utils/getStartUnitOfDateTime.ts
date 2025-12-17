import { type Nullable } from '@/types';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';
import { getFirstDayOfTheWeekAsANumberForDateFNS } from '@/utils/filter/dates/utils/getFirstDayOfTheWeekAsANumberForDateFNS';
import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';
import { isDefined } from '@/utils/validation';
import {
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfWeek,
  startOfYear,
} from 'date-fns';

export const getStartUnitOfDateTime = (
  dateTime: Date,
  unit: RelativeDateFilterUnit,
  firstDayOfTheWeek?: Nullable<FirstDayOfTheWeek>,
) => {
  switch (unit) {
    case 'SECOND':
      return startOfSecond(dateTime);
    case 'MINUTE':
      return startOfMinute(dateTime);
    case 'HOUR':
      return startOfHour(dateTime);
    case 'DAY':
      return startOfDay(dateTime);
    case 'WEEK': {
      if (isDefined(firstDayOfTheWeek)) {
        const firstDayOfTheWeekAsDateFNSNumber =
          getFirstDayOfTheWeekAsANumberForDateFNS(firstDayOfTheWeek);

        return startOfWeek(dateTime, {
          weekStartsOn: firstDayOfTheWeekAsDateFNSNumber,
        });
      } else {
        return startOfWeek(dateTime);
      }
    }
    case 'MONTH':
      return startOfMonth(dateTime);
    case 'YEAR':
      return startOfYear(dateTime);
  }
};

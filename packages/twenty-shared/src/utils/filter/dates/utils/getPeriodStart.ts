import { type Nullable } from '@/types';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';
import { getFirstDayOfTheWeekAsISONumber } from '@/utils/filter/dates/utils/getFirstDayOfTheWeekAsISONumber';
import { FIRST_DAY_OF_WEEK_ISO_8601_MONDAY } from '@/utils/filter/dates/utils/getNextPeriodStart';
import { isDefined } from '@/utils/validation';
import { type Temporal } from 'temporal-polyfill';

export type DateTimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

export const getPeriodStart = (
  dateTime: Temporal.ZonedDateTime,
  unit: DateTimePeriod,
  firstDayOfTheWeek?: Nullable<FirstDayOfTheWeek>,
) => {
  switch (unit) {
    case 'DAY':
      return dateTime.startOfDay();
    case 'WEEK': {
      const firstDayOfTheWeekAsISONumber = isDefined(firstDayOfTheWeek)
        ? getFirstDayOfTheWeekAsISONumber(firstDayOfTheWeek)
        : FIRST_DAY_OF_WEEK_ISO_8601_MONDAY;

      const daysOffsetToSutract =
        (dateTime.dayOfWeek - firstDayOfTheWeekAsISONumber + 7) % 7;

      return dateTime.startOfDay().subtract({ days: daysOffsetToSutract });
    }
    case 'QUARTER': {
      const firstMonthOfTheQuarter = Math.floor((dateTime.month - 1) / 3);

      return dateTime
        .startOfDay()
        .with({ day: 1, month: firstMonthOfTheQuarter * 3 + 1 });
    }
    case 'MONTH':
      return dateTime.startOfDay().with({ day: 1 });
    case 'YEAR':
      return dateTime.startOfDay().with({ day: 1, month: 1 });
  }
};

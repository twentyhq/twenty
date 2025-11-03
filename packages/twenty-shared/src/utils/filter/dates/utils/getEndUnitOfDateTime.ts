import { type Nullable } from '@/types';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';
import { getFirstDayOfTheWeekAsANumberForDateFNS } from '@/utils/filter/dates/utils/getFirstDayOfTheWeekAsANumberForDateFNS';
import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';
import { isDefined } from '@/utils/validation';
import { endOfDay, endOfMonth, endOfWeek, endOfYear } from 'date-fns';

export const getEndUnitOfDateTime = (
  dateTime: Date,
  unit: RelativeDateFilterUnit,
  firstDayOfTheWeek?: Nullable<FirstDayOfTheWeek>,
) => {
  switch (unit) {
    case 'DAY':
      return endOfDay(dateTime);
    case 'WEEK': {
      if (isDefined(firstDayOfTheWeek)) {
        const firstDayOfTheWeekAsDateFNSNumber =
          getFirstDayOfTheWeekAsANumberForDateFNS(firstDayOfTheWeek);

        return endOfWeek(dateTime, {
          weekStartsOn: firstDayOfTheWeekAsDateFNSNumber,
        });
      } else {
        return endOfWeek(dateTime);
      }
    }
    case 'MONTH':
      return endOfMonth(dateTime);
    case 'YEAR':
      return endOfYear(dateTime);
  }
};

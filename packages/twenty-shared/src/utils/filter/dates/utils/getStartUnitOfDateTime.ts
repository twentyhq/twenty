import { type Nullable } from '@/types';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';
import { getFirstDayOfTheWeekAsANumberForDateFNS } from '@/utils/filter/dates/utils/getFirstDayOfTheWeekAsANumberForDateFNS';
import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';
import { isDefined } from '@/utils/validation';
import { startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns';

export const getStartUnitOfDateTime = (
  dateTime: Date,
  unit: RelativeDateFilterUnit,
  firstDayOfTheWeek?: Nullable<FirstDayOfTheWeek>,
) => {
  switch (unit) {
    case 'DAY':
      return startOfDay(dateTime);
    case 'WEEK': {
      if (isDefined(firstDayOfTheWeek)) {
        const firstDayOfTheWeekAsDateFNSNumber =
          getFirstDayOfTheWeekAsANumberForDateFNS(firstDayOfTheWeek);

        console.log({
          firstDayOfTheWeek,
          firstDayOfTheWeekAsDateFNSNumber,
          startOfWekk: startOfWeek(dateTime, {
            weekStartsOn: firstDayOfTheWeekAsDateFNSNumber,
          }),
        });

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

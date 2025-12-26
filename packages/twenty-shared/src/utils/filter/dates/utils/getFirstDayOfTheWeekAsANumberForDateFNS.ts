import { FirstDayOfTheWeek as FirstDayOfTheWeekEnum } from '@/types/FirstDayOfTheWeek';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';

export const getFirstDayOfTheWeekAsANumberForDateFNS = (
  firstDayOfTheWeek: FirstDayOfTheWeek,
): 0 | 1 | 6 => {
  switch (firstDayOfTheWeek) {
    case FirstDayOfTheWeekEnum.MONDAY:
      return 1;
    case FirstDayOfTheWeekEnum.SATURDAY:
      return 6;
    case FirstDayOfTheWeekEnum.SUNDAY:
      return 0;
    default:
      return assertUnreachable(firstDayOfTheWeek);
  }
};

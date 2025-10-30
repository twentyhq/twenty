import { assertUnreachable } from '@/utils/assertUnreachable';
import { type FirstDayOfTheWeek } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';

export const getFirstDayOfTheWeekAsANumberForDateFNS = (
  firstDayOfTheWeek: FirstDayOfTheWeek,
): 0 | 1 | 6 => {
  switch (firstDayOfTheWeek) {
    case 'MONDAY':
      return 1;
    case 'SATURDAY':
      return 6;
    case 'SUNDAY':
      return 0;
    default:
      return assertUnreachable(firstDayOfTheWeek);
  }
};

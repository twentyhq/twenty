import { CalendarStartDay } from '@/constants';
import { FirstDayOfTheWeek } from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';

export const convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek = (
  calendarStartDayNonIsoNumber: CalendarStartDay,
  systemCalendarStartDay: FirstDayOfTheWeek,
): FirstDayOfTheWeek => {
  switch (calendarStartDayNonIsoNumber) {
    case CalendarStartDay.MONDAY:
      return FirstDayOfTheWeek.MONDAY;
    case CalendarStartDay.SATURDAY:
      return FirstDayOfTheWeek.SATURDAY;
    case CalendarStartDay.SUNDAY:
      return FirstDayOfTheWeek.SUNDAY;
    case CalendarStartDay.SYSTEM:
      return systemCalendarStartDay;
    default:
      return assertUnreachable(calendarStartDayNonIsoNumber);
  }
};

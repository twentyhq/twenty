import { CalendarStartDay } from '@/constants';
import { FirstDayOfTheWeek } from '@/types';

export const convertFirstDayOfTheWeekToCalendarStartDayNumber = (
  firstDayOfTheWeek: FirstDayOfTheWeek,
): CalendarStartDay => {
  switch (firstDayOfTheWeek) {
    case FirstDayOfTheWeek.MONDAY:
      return CalendarStartDay.MONDAY;
    case FirstDayOfTheWeek.SATURDAY:
      return CalendarStartDay.SATURDAY;
    case FirstDayOfTheWeek.SUNDAY:
      return CalendarStartDay.SUNDAY;
  }
};

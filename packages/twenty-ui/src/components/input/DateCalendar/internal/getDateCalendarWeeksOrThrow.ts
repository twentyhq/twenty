import { isInteger } from '@sniptt/guards';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import { DATE_CALENDAR_CONSTANTS } from './dateCalendarConstants';
import { parseDateCalendarDate } from './parseDateCalendarDate';
import { shiftDateCalendarDate } from './shiftDateCalendarDate';

type GetDateCalendarWeeksOrThrowArgs = {
  viewedMonth: string;
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export const getDateCalendarWeeksOrThrow = ({
  viewedMonth,
  weekStart,
}: GetDateCalendarWeeksOrThrowArgs): (string | null)[][] => {
  if (
    !isInteger(weekStart) ||
    weekStart < 0 ||
    weekStart >= DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK
  ) {
    throw new RangeError(
      doNotTranslate('Calendar week start must be between 0 and 6.'),
    );
  }

  const monthStart = `${viewedMonth}-01`;
  const firstDateOfMonth = parseDateCalendarDate(monthStart);
  const leadingDayCount =
    (firstDateOfMonth.getUTCDay() -
      weekStart +
      DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK) %
    DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK;
  const lastDateOfMonth = new Date(firstDateOfMonth.getTime());

  lastDateOfMonth.setUTCMonth(firstDateOfMonth.getUTCMonth() + 1, 0);

  const weekCount = Math.ceil(
    (leadingDayCount + lastDateOfMonth.getUTCDate()) /
      DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK,
  );

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from(
      { length: DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK },
      (_, dayIndex) =>
        shiftDateCalendarDate({
          date: monthStart,
          days:
            weekIndex * DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK +
            dayIndex -
            leadingDayCount,
        }),
    ),
  );
};

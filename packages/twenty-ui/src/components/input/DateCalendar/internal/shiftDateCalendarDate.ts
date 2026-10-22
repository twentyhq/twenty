import { isInteger } from '@sniptt/guards';

import { DATE_CALENDAR_CONSTANTS } from './dateCalendarConstants';
import { formatDateCalendarDate } from './formatDateCalendarDate';
import { parseDateCalendarDate } from './parseDateCalendarDate';

type ShiftDateCalendarDateArgs = {
  date: string;
  days?: number;
  months?: number;
  years?: number;
};

export const shiftDateCalendarDate = ({
  date,
  days = 0,
  months = 0,
  years = 0,
}: ShiftDateCalendarDateArgs): string | null => {
  if (!isInteger(days) || !isInteger(months) || !isInteger(years)) {
    return null;
  }

  const sourceDate = parseDateCalendarDate(date);
  const shiftedMonthIndex =
    sourceDate.getUTCFullYear() * DATE_CALENDAR_CONSTANTS.MONTHS_PER_YEAR +
    sourceDate.getUTCMonth() +
    years * DATE_CALENDAR_CONSTANTS.MONTHS_PER_YEAR +
    months;
  const shiftedYear = Math.floor(
    shiftedMonthIndex / DATE_CALENDAR_CONSTANTS.MONTHS_PER_YEAR,
  );

  if (
    shiftedYear < DATE_CALENDAR_CONSTANTS.MIN_YEAR ||
    shiftedYear > DATE_CALENDAR_CONSTANTS.MAX_YEAR
  ) {
    return null;
  }

  const shiftedMonth =
    shiftedMonthIndex % DATE_CALENDAR_CONSTANTS.MONTHS_PER_YEAR;
  const lastDateOfShiftedMonth = new Date(0);

  lastDateOfShiftedMonth.setUTCFullYear(shiftedYear, shiftedMonth + 1, 0);

  const shiftedDay = Math.min(
    sourceDate.getUTCDate(),
    lastDateOfShiftedMonth.getUTCDate(),
  );
  const shiftedDate = new Date(0);

  shiftedDate.setUTCFullYear(shiftedYear, shiftedMonth, shiftedDay);
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() + days);

  const resultYear = shiftedDate.getUTCFullYear();

  if (
    !isInteger(resultYear) ||
    resultYear < DATE_CALENDAR_CONSTANTS.MIN_YEAR ||
    resultYear > DATE_CALENDAR_CONSTANTS.MAX_YEAR
  ) {
    return null;
  }

  return formatDateCalendarDate(shiftedDate);
};

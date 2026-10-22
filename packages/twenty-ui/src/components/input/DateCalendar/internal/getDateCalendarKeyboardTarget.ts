import { DATE_CALENDAR_CONSTANTS } from './dateCalendarConstants';
import { DATE_CALENDAR_KEYS } from './dateCalendarKeys';
import { parseDateCalendarDate } from './parseDateCalendarDate';
import { shiftDateCalendarDate } from './shiftDateCalendarDate';

type GetDateCalendarKeyboardTargetArgs = {
  date: string;
  key: string;
  shiftKey: boolean;
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  direction: 'ltr' | 'rtl';
};

export const getDateCalendarKeyboardTarget = ({
  date,
  key,
  shiftKey,
  weekStart,
  direction,
}: GetDateCalendarKeyboardTargetArgs): string | null => {
  const forwardDayOffset = direction === 'rtl' ? -1 : 1;

  if (key === DATE_CALENDAR_KEYS.PREVIOUS_DAY) {
    return shiftDateCalendarDate({ date, days: -forwardDayOffset });
  }

  if (key === DATE_CALENDAR_KEYS.NEXT_DAY) {
    return shiftDateCalendarDate({ date, days: forwardDayOffset });
  }

  if (key === DATE_CALENDAR_KEYS.PREVIOUS_WEEK) {
    return shiftDateCalendarDate({
      date,
      days: -DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK,
    });
  }

  if (key === DATE_CALENDAR_KEYS.NEXT_WEEK) {
    return shiftDateCalendarDate({
      date,
      days: DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK,
    });
  }

  if (key === DATE_CALENDAR_KEYS.PREVIOUS_PERIOD) {
    return shiftKey
      ? shiftDateCalendarDate({ date, years: -1 })
      : shiftDateCalendarDate({ date, months: -1 });
  }

  if (key === DATE_CALENDAR_KEYS.NEXT_PERIOD) {
    return shiftKey
      ? shiftDateCalendarDate({ date, years: 1 })
      : shiftDateCalendarDate({ date, months: 1 });
  }

  if (
    key !== DATE_CALENDAR_KEYS.WEEK_START &&
    key !== DATE_CALENDAR_KEYS.WEEK_END
  ) {
    return null;
  }

  const dayOfWeek = parseDateCalendarDate(date).getUTCDay();
  const dayOffset =
    (dayOfWeek - weekStart + DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK) %
    DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK;

  return shiftDateCalendarDate({
    date,
    days:
      key === DATE_CALENDAR_KEYS.WEEK_START
        ? -dayOffset
        : DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK - 1 - dayOffset,
  });
};

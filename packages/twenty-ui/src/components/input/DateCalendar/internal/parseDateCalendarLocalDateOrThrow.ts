import { parseDateCalendarDateOrThrow } from './parseDateCalendarDateOrThrow';

export const parseDateCalendarLocalDateOrThrow = (value: string): Date => {
  const parsedDate = parseDateCalendarDateOrThrow(value);
  const localDate = new Date(0);
  localDate.setFullYear(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
  );
  localDate.setHours(0, 0, 0, 0);

  return localDate;
};

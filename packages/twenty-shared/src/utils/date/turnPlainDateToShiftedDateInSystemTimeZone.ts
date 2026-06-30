import { type Temporal } from 'temporal-polyfill';

export const turnPlainDateToShiftedDateInSystemTimeZone = (
  plainDate: Temporal.PlainDate,
) => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateShiftedToISOString = plainDate
    .toZonedDateTime(systemTimeZone)
    .toInstant()
    .toString();

  const dateForDatePicker = new Date(dateShiftedToISOString);

  return dateForDatePicker;
};

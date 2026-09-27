import { Temporal } from 'temporal-polyfill';

import { parseToPlainDateOrThrow } from '@/utils/date/parseToPlainDateOrThrow';

// An offset or zone name after a time, e.g. "10:00Z", "10:00:00 +02:00", "GMT+2".
const EXPLICIT_TIME_ZONE_PATTERN =
  /(\d{1,2}:\d{2}(:\d{2}(\.\d+)?)?\s*(z|[+-]\d{2}(:?\d{2})?)\s*$)|\b(gmt|utc)\b/i;

// ECMAScript reads ISO dates without a time as UTC, not local time.
const ISO_DATE_ONLY_PATTERN = /^[+-]?\d{4,6}(-\d{2}(-\d{2})?)?$/;

// Reads a date the way `new Date(value)` would in a browser set to
// `timeZone`, so the server, which runs in UTC, imports the same instant the
// requester's browser would.
export const parseSpreadsheetImportDateTime = (
  value: string,
  timeZone: string,
): Date => {
  const date = new Date(value);

  if (
    isNaN(date.getTime()) ||
    EXPLICIT_TIME_ZONE_PATTERN.test(value) ||
    ISO_DATE_ONLY_PATTERN.test(value.trim())
  ) {
    return date;
  }

  const zonedDateTime = Temporal.PlainDateTime.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  }).toZonedDateTime(timeZone);

  return new Date(zonedDateTime.epochMilliseconds);
};

export const parseSpreadsheetImportPlainDate = (
  value: string,
  timeZone: string,
): string => {
  try {
    return parseToPlainDateOrThrow(value).toString();
  } catch {
    return Temporal.Instant.fromEpochMilliseconds(
      parseSpreadsheetImportDateTime(value, timeZone).getTime(),
    )
      .toZonedDateTimeISO(timeZone)
      .toPlainDate()
      .toString();
  }
};

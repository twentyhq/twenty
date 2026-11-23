import { Temporal } from 'temporal-polyfill';

export const toCalendarEventTemporalDateTime = (
  isoDateTime: string,
  isFullDay: boolean,
  timeZone: string,
): Temporal.PlainDate | Temporal.ZonedDateTime =>
  isFullDay
    ? Temporal.PlainDate.from(isoDateTime.slice(0, 10))
    : Temporal.Instant.from(isoDateTime).toZonedDateTimeISO(timeZone);

import { Temporal } from 'temporal-polyfill';

export const toCalendarEventTemporalDateTime = ({
  isoDateTime,
  isFullDay,
  timeZone,
}: {
  isoDateTime: string;
  isFullDay: boolean;
  timeZone: string;
}): Temporal.PlainDate | Temporal.ZonedDateTime => {
  if (isFullDay) {
    return Temporal.PlainDate.from(isoDateTime.slice(0, 10));
  }

  return Temporal.Instant.from(isoDateTime).toZonedDateTimeISO(timeZone);
};

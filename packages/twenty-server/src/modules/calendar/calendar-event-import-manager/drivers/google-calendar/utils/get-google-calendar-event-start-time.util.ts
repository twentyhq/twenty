import { isNonEmptyString } from '@sniptt/guards';
import { type calendar_v3 as calendarV3 } from 'googleapis';

export const getGoogleCalendarEventStartTime = (
  event: Pick<calendarV3.Schema$Event, 'start'>,
): number | null => {
  const start = event.start?.dateTime ?? event.start?.date;

  return isNonEmptyString(start) ? Date.parse(start) : null;
};

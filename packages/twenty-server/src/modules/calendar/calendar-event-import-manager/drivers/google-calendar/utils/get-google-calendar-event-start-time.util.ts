import { type calendar_v3 as calendarV3 } from 'googleapis';

export const getGoogleCalendarEventStartTime = (
  event: Pick<calendarV3.Schema$Event, 'start'>,
): number => Date.parse(event.start?.dateTime ?? event.start?.date ?? '');

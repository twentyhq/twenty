import { type calendar_v3 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { GOOGLE_CALENDAR_EVENTS_URL } from 'test/integration/google/mocks/google-calendar-events-url.constant';
import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const googleCalendarEventsHandlers = (
  events: calendar_v3.Schema$Event[],
  nextSyncToken: string,
): MswHandler[] => [
  http.get(GOOGLE_CALENDAR_EVENTS_URL, () =>
    HttpResponse.json<calendar_v3.Schema$Events>({
      items: events,
      nextSyncToken,
    }),
  ),
  ...events.map((event) =>
    http.get(`${GOOGLE_CALENDAR_EVENTS_URL}/${event.id}`, () =>
      HttpResponse.json<calendar_v3.Schema$Event>(event),
    ),
  ),
];

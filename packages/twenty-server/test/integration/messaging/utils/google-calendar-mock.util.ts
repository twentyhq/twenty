import { randomUUID } from 'node:crypto';

import { type calendar_v3 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock';

const GOOGLE_CALENDAR_EVENTS_URL =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export const googleCalendarEvent = (
  overrides: Partial<calendar_v3.Schema$Event> = {},
): calendar_v3.Schema$Event => {
  const id = overrides.id ?? `google-calendar-event-${randomUUID()}`;

  return {
    id,
    iCalUID: `${id}@google.com`,
    summary: `Calendar event ${id}`,
    status: 'confirmed',
    start: { dateTime: '2023-11-15T10:00:00Z' },
    end: { dateTime: '2023-11-15T11:00:00Z' },
    created: '2023-11-01T00:00:00.000Z',
    updated: '2023-11-01T00:00:00.000Z',
    attendees: [],
    ...overrides,
  };
};

export const googleCalendarEventsHandler = (
  events: calendar_v3.Schema$Event[],
  {
    nextSyncToken = 'mock-calendar-sync-token',
  }: { nextSyncToken?: string } = {},
): MswHandler =>
  http.get(GOOGLE_CALENDAR_EVENTS_URL, () =>
    HttpResponse.json<calendar_v3.Schema$Events>({
      items: events,
      nextSyncToken,
    }),
  );

export const rateLimitedGoogleCalendarEventList = (): MswHandler =>
  http.get(GOOGLE_CALENDAR_EVENTS_URL, () =>
    HttpResponse.json(
      {
        error: {
          code: 429,
          message: 'Rate Limit Exceeded',
          errors: [
            { reason: 'rateLimitExceeded', message: 'Rate Limit Exceeded' },
          ],
        },
      },
      { status: 429 },
    ),
  );

export const googleCalendarHandlers = (): MswHandler[] => [
  http.get(GOOGLE_CALENDAR_EVENTS_URL, () =>
    HttpResponse.json<calendar_v3.Schema$Events>({ items: [] }),
  ),
];

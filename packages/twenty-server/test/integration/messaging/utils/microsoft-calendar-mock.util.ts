import { randomUUID } from 'node:crypto';

import { type Event } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse, type RequestHandler } from 'msw';

export const microsoftCalendarEvent = (
  overrides: Partial<Event> = {},
): Event => {
  const id = overrides.id ?? `microsoft-calendar-event-${randomUUID()}`;

  return {
    id,
    iCalUId: `${id}@microsoft.com`,
    subject: `Calendar event ${id}`,
    isCancelled: false,
    isAllDay: false,
    start: { dateTime: '2023-11-15T10:00:00.000Z', timeZone: 'UTC' },
    end: { dateTime: '2023-11-15T11:00:00.000Z', timeZone: 'UTC' },
    createdDateTime: '2023-11-01T00:00:00.000Z',
    lastModifiedDateTime: '2023-11-01T00:00:00.000Z',
    attendees: [],
    ...overrides,
  };
};

export const microsoftCalendarEventsHandlers = (
  events: Event[],
  { deltaToken = 'mock-calendar-delta-token' }: { deltaToken?: string } = {},
): RequestHandler[] => [
  http.get('*/me/calendar/events/delta', () =>
    HttpResponse.json({
      value: events.map((event) => ({ id: event.id })),
      '@odata.deltaLink': `https://graph.microsoft.com/beta/me/calendar/events/delta?$deltatoken=${deltaToken}`,
    }),
  ),
  ...events.map((event) =>
    http.get(`*/me/calendar/events/${event.id}`, () =>
      HttpResponse.json(event),
    ),
  ),
];

import { type Event } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const microsoftCalendarEventsHandlers = (
  events: Event[],
  deltaToken: string,
  removedEventIds: string[] = [],
): MswHandler[] => [
  http.get('*/me/calendar/events/delta', () =>
    HttpResponse.json({
      value: [
        ...events.map((event) => ({ id: event.id })),
        ...removedEventIds.map((id) => ({
          id,
          '@removed': { reason: 'deleted' },
        })),
      ],
      '@odata.deltaLink': `https://graph.microsoft.com/beta/me/calendar/events/delta?$deltatoken=${deltaToken}`,
    }),
  ),
  ...events.map((event) =>
    http.get(`*/me/calendar/events/${event.id}`, () =>
      HttpResponse.json(event),
    ),
  ),
];

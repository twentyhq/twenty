import { type calendar_v3 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { GOOGLE_CALENDAR_EVENTS_URL } from 'test/integration/google/mocks/google-calendar-events-url.constant';
import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const googleCalendarRecurringEventInstancesHandlers = (
  recurringEventId: string,
  instances: calendar_v3.Schema$Event[],
): MswHandler[] => [
  http.get(`${GOOGLE_CALENDAR_EVENTS_URL}/${recurringEventId}/instances`, () =>
    HttpResponse.json<calendar_v3.Schema$Events>({ items: instances }),
  ),
  ...instances.map((instance) =>
    http.get(`${GOOGLE_CALENDAR_EVENTS_URL}/${instance.id}`, () =>
      HttpResponse.json<calendar_v3.Schema$Event>(instance),
    ),
  ),
];

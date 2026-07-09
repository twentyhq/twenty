import { type calendar_v3 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { GOOGLE_CALENDAR_EVENTS_URL } from 'test/integration/google/mocks/google-calendar-events-url.constant';
import { type MswHandler } from 'test/integration/utils/http-mock.util';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Connecting an account enqueues CreateWebhookSubscriptionJob in the
// background, which calls these endpoints. Without handlers, msw's "error"
// unhandled-request strategy leaves the request pending forever, so the job
// stays active and blocks waitForAllJobsToFinish and app shutdown.
export const googleWebhookSubscriptionHandlers = (): MswHandler[] => [
  http.post(`${GOOGLE_CALENDAR_EVENTS_URL}/watch`, () =>
    HttpResponse.json<calendar_v3.Schema$Channel>({
      resourceId: 'mock-calendar-watch-resource-id',
      expiration: String(Date.now() + ONE_DAY_MS),
    }),
  ),
  http.post('https://www.googleapis.com/calendar/v3/channels/stop', () =>
    HttpResponse.json({}),
  ),
  http.post('*/gmail/v1/users/me/watch', () =>
    HttpResponse.json({
      historyId: 'mock-history-id',
      expiration: String(Date.now() + ONE_DAY_MS),
    }),
  ),
  http.post('*/gmail/v1/users/me/stop', () => HttpResponse.json({})),
];

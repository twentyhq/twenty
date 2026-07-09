import { type calendar_v3, type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

const MOCK_WATCH_EXPIRATION_MS = '4102444800000';

export const googleWebhookSubscriptionHandlers = (): MswHandler[] => [
  http.post('*/gmail/v1/users/me/watch', () =>
    HttpResponse.json<gmail_v1.Schema$WatchResponse>({
      historyId: '1',
      expiration: MOCK_WATCH_EXPIRATION_MS,
    }),
  ),
  http.post(
    '*/gmail/v1/users/me/stop',
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post('*/calendar/v3/calendars/primary/events/watch', () =>
    HttpResponse.json<calendar_v3.Schema$Channel>({
      resourceId: 'mock-calendar-resource-id',
      expiration: MOCK_WATCH_EXPIRATION_MS,
    }),
  ),
  http.post(
    '*/calendar/v3/channels/stop',
    () => new HttpResponse(null, { status: 204 }),
  ),
];

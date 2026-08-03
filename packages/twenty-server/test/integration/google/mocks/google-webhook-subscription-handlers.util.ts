import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

const GOOGLE_CALENDAR_WATCH_URL =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events/watch';
const GOOGLE_CALENDAR_CHANNELS_STOP_URL =
  'https://www.googleapis.com/calendar/v3/channels/stop';
const GMAIL_WATCH_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/watch';
const GMAIL_STOP_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/stop';

const ONE_HOUR_MS = 60 * 60 * 1000;

export const googleWebhookSubscriptionHandlers = (): MswHandler[] => [
  http.post(GOOGLE_CALENDAR_WATCH_URL, () =>
    HttpResponse.json({
      resourceId: 'mock-calendar-resource-id',
      expiration: String(Date.now() + ONE_HOUR_MS),
    }),
  ),
  http.post(
    GOOGLE_CALENDAR_CHANNELS_STOP_URL,
    () =>
      new HttpResponse(null, {
        status: 204,
      }),
  ),
  http.post(GMAIL_WATCH_URL, () =>
    HttpResponse.json({
      historyId: '1',
      expiration: String(Date.now() + ONE_HOUR_MS),
    }),
  ),
  http.post(GMAIL_STOP_URL, () => new HttpResponse(null, { status: 204 })),
];

export const failGoogleCalendarWatchHandler = (
  status: number = 403,
): MswHandler =>
  http.post(GOOGLE_CALENDAR_WATCH_URL, () =>
    HttpResponse.json(
      {
        error: {
          code: status,
          message: 'Calendar watch permanently rejected',
        },
      },
      { status },
    ),
  );

export const failGmailWatchHandler = (status: number = 403): MswHandler =>
  http.post(GMAIL_WATCH_URL, () =>
    HttpResponse.json(
      {
        error: {
          code: status,
          message: 'Gmail watch permanently rejected',
        },
      },
      { status },
    ),
  );

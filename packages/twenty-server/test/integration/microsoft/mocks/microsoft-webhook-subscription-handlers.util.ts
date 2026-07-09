import { http, HttpResponse } from 'msw';
import { v4 } from 'uuid';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Connecting an account enqueues CreateWebhookSubscriptionJob in the
// background, which calls these endpoints. Without handlers, msw's "error"
// unhandled-request strategy leaves the request pending forever, so the job
// stays active and blocks waitForAllJobsToFinish and app shutdown.
export const microsoftWebhookSubscriptionHandlers = (): MswHandler[] => [
  http.post('https://graph.microsoft.com/v1.0/subscriptions', () =>
    HttpResponse.json({
      id: v4(),
      expirationDateTime: new Date(Date.now() + ONE_DAY_MS).toISOString(),
    }),
  ),
  http.patch(
    'https://graph.microsoft.com/v1.0/subscriptions/:subscriptionId',
    ({ params }) =>
      HttpResponse.json({
        id: params.subscriptionId,
        expirationDateTime: new Date(Date.now() + ONE_DAY_MS).toISOString(),
      }),
  ),
  http.delete(
    'https://graph.microsoft.com/v1.0/subscriptions/:subscriptionId',
    () => new HttpResponse(null, { status: 204 }),
  ),
];

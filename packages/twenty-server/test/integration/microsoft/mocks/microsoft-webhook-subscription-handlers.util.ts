import { type Subscription } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

const MOCK_SUBSCRIPTION_EXPIRATION_ISO = '2100-01-01T00:00:00.000Z';

export const microsoftWebhookSubscriptionHandlers = (): MswHandler[] => [
  http.post('*/subscriptions', () =>
    HttpResponse.json<Subscription>({
      id: 'mock-subscription-id',
      expirationDateTime: MOCK_SUBSCRIPTION_EXPIRATION_ISO,
    }),
  ),
  http.patch('*/subscriptions/*', () =>
    HttpResponse.json<Subscription>({
      id: 'mock-subscription-id',
      expirationDateTime: MOCK_SUBSCRIPTION_EXPIRATION_ISO,
    }),
  ),
  http.delete(
    '*/subscriptions/*',
    () => new HttpResponse(null, { status: 204 }),
  ),
];

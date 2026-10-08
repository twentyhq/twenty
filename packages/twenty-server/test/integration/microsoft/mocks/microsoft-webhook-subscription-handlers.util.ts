import { type Subscription } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

export type MicrosoftSubscriptionStore = {
  created: Subscription[];
  renewed: string[];
  deleted: string[];
  reset: () => void;
};

export const createMicrosoftSubscriptionStore =
  (): MicrosoftSubscriptionStore => {
    const store: MicrosoftSubscriptionStore = {
      created: [],
      renewed: [],
      deleted: [],
      reset: () => {
        store.created = [];
        store.renewed = [];
        store.deleted = [];
      },
    };

    return store;
  };

const subscriptionId = (request: Request) =>
  new URL(request.url).pathname.split('/').pop() ?? '';

const resourceNotFound = () =>
  HttpResponse.json(
    {
      error: {
        code: 'ResourceNotFound',
        message: 'The object was not found.',
      },
    },
    { status: 404 },
  );

export const microsoftWebhookSubscriptionHandlers = (
  store: MicrosoftSubscriptionStore,
  { renewalFails = false }: { renewalFails?: boolean } = {},
): MswHandler[] => [
  http.post('*/subscriptions', async ({ request }) => {
    const payload = (await request.json()) as Subscription;
    const subscription: Subscription = {
      ...payload,
      id: `subscription-${store.created.length + 1}`,
      expirationDateTime:
        payload.expirationDateTime ??
        new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    store.created.push(subscription);

    return HttpResponse.json(subscription);
  }),
  http.patch('*/subscriptions/*', async ({ request }) => {
    const id = subscriptionId(request);

    if (renewalFails) {
      return resourceNotFound();
    }

    store.renewed.push(id);

    const payload = (await request.json()) as Subscription;

    return HttpResponse.json<Subscription>({
      id,
      expirationDateTime:
        payload.expirationDateTime ??
        new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  }),
  http.delete('*/subscriptions/*', ({ request }) => {
    store.deleted.push(subscriptionId(request));

    return new HttpResponse(null, { status: 204 });
  }),
];

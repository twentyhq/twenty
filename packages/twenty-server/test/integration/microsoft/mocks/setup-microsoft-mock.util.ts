import { type Event, type MailFolder } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';

import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { microsoftAuthHandlers } from 'test/integration/microsoft/mocks/microsoft-auth-handlers.util';
import { microsoftCalendarEventsHandlers } from 'test/integration/microsoft/mocks/microsoft-calendar-events-handlers.util';
import { microsoftMailboxHandlers } from 'test/integration/microsoft/mocks/microsoft-mailbox-handlers.util';
import {
  createMicrosoftSubscriptionStore,
  microsoftWebhookSubscriptionHandlers,
  type MicrosoftSubscriptionStore,
} from 'test/integration/microsoft/mocks/microsoft-webhook-subscription-handlers.util';
import {
  createMockEntityStore,
  type MockEntityStore,
} from 'test/integration/utils/mock-entity-store.util';

const DEFAULT_FOLDERS: MailFolder[] = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'sentitems', displayName: 'Sent Items' },
];

export type MicrosoftMock = {
  folders: MockEntityStore<MailFolder>;
  subscriptions: MicrosoftSubscriptionStore;
  serveCalendarEvents: (
    events: Event[],
    options?: { deltaToken?: string },
  ) => void;
  failSubscriptionRenewal: () => void;
  failMessageDelta: (failure: MicrosoftGraphFailure) => void;
  failCalendarDelta: (failure: MicrosoftGraphFailure) => void;
};

export type MicrosoftGraphFailure = {
  status: number;
  code: string;
  message: string;
};

const microsoftGraphErrorResponse = ({
  status,
  code,
  message,
}: MicrosoftGraphFailure) =>
  HttpResponse.json({ error: { code, message } }, { status });

export const setupMicrosoftMock = ({
  handle,
  folders = DEFAULT_FOLDERS,
}: {
  handle: string;
  folders?: MailFolder[];
}): MicrosoftMock => {
  const folderStore = createMockEntityStore(
    folders,
    (folder) => folder.id ?? '',
  );

  const subscriptionStore = createMicrosoftSubscriptionStore();

  const httpMock = setupHttpMock(
    ...microsoftAuthHandlers(handle),
    ...microsoftMailboxHandlers(folderStore),
    ...microsoftWebhookSubscriptionHandlers(subscriptionStore),
  );

  return {
    folders: folderStore,
    subscriptions: subscriptionStore,
    serveCalendarEvents: (
      events,
      { deltaToken = 'mock-calendar-delta-token' } = {},
    ) => httpMock.use(...microsoftCalendarEventsHandlers(events, deltaToken)),
    failSubscriptionRenewal: () =>
      httpMock.use(
        ...microsoftWebhookSubscriptionHandlers(subscriptionStore, {
          renewalFails: true,
        }),
      ),
    // The driver issues the per-folder delta requests inside a /$batch POST, so
    // the failure has to come back as the status on each sub-response rather
    // than on the delta route itself.
    failMessageDelta: (failure) =>
      httpMock.use(
        http.post('*/$batch', async ({ request }) => {
          const { requests } = (await request.json()) as {
            requests: { id: string }[];
          };

          return HttpResponse.json({
            responses: requests.map(({ id }) => ({
              id,
              status: failure.status,
              body: {
                error: { code: failure.code, message: failure.message },
              },
            })),
          });
        }),
        http.get('*/messages/delta', () =>
          microsoftGraphErrorResponse(failure),
        ),
      ),
    failCalendarDelta: (failure) =>
      httpMock.use(
        http.get('*/me/calendar/events/delta', () =>
          microsoftGraphErrorResponse(failure),
        ),
      ),
  };
};

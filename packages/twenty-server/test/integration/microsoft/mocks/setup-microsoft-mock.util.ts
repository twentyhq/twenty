import { type Event, type MailFolder } from '@microsoft/microsoft-graph-types';

import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import {
  microsoftAuthHandlers,
  microsoftInvalidRefreshTokenHandler,
} from 'test/integration/microsoft/mocks/microsoft-auth-handlers.util';
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
  failSubscriptionRenewalTemporarily: () => void;
  failTokenRefresh: () => void;
};

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
    failSubscriptionRenewalTemporarily: () =>
      httpMock.use(
        ...microsoftWebhookSubscriptionHandlers(subscriptionStore, {
          renewalTemporarilyFails: true,
        }),
      ),
    failTokenRefresh: () => httpMock.use(microsoftInvalidRefreshTokenHandler()),
  };
};

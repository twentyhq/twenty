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
  createdMessages: Array<Record<string, unknown>>;
  patchedMessages: Array<Record<string, unknown>>;
  sentMessageIds: string[];
  createdCalendarEvents: Event[];
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
  messages = [],
}: {
  handle: string;
  folders?: MailFolder[];
  messages?: Array<Record<string, unknown>>;
}): MicrosoftMock => {
  const folderStore = createMockEntityStore(
    folders,
    (folder) => folder.id ?? '',
  );

  const subscriptionStore = createMicrosoftSubscriptionStore();
  const createdMessages: Array<Record<string, unknown>> = [];
  const patchedMessages: Array<Record<string, unknown>> = [];
  const sentMessageIds: string[] = [];
  const createdCalendarEvents: Event[] = [];

  const httpMock = setupHttpMock(
    ...microsoftAuthHandlers(handle),
    ...microsoftMailboxHandlers(folderStore, messages),
    ...microsoftWebhookSubscriptionHandlers(subscriptionStore),
    http.post('*/me/messages', async ({ request }) => {
      const message = (await request.json()) as Record<string, unknown>;
      const id = `microsoft-message-${createdMessages.length + 1}`;

      createdMessages.push(message);

      return HttpResponse.json({
        id,
        internetMessageId: `<${id}@example.com>`,
        conversationId: `microsoft-conversation-${createdMessages.length}`,
      });
    }),
    http.post('*/me/messages/:messageId/send', ({ params }) => {
      sentMessageIds.push(params.messageId as string);

      return new HttpResponse(null, { status: 202 });
    }),
    http.delete(
      '*/me/messages/:messageId',
      () => new HttpResponse(null, { status: 204 }),
    ),
    http.get('*/me/messages', () =>
      HttpResponse.json({
        value: [
          {
            id: 'microsoft-parent-message',
            internetMessageId: '<microsoft-parent@example.com>',
          },
        ],
      }),
    ),
    http.post('*/me/messages/:messageId/createReply', () =>
      HttpResponse.json({
        id: 'microsoft-reply-message',
        internetMessageId: '<microsoft-reply-message@example.com>',
        conversationId: 'microsoft-parent-conversation',
      }),
    ),
    http.patch('*/me/messages/:messageId', async ({ request }) => {
      const message = (await request.json()) as Record<string, unknown>;

      patchedMessages.push(message);

      return HttpResponse.json({
        internetMessageId: '<microsoft-reply-message@example.com>',
        conversationId: 'microsoft-parent-conversation',
      });
    }),
    http.post('*/me/calendar/events', async ({ request }) => {
      const event = (await request.json()) as Event;
      const id = `microsoft-created-calendar-event-${createdCalendarEvents.length + 1}`;
      const createdEvent: Event = {
        ...event,
        id,
        iCalUId: `${id}@microsoft.com`,
        isCancelled: false,
        createdDateTime: '2026-08-13T00:00:00.000Z',
        lastModifiedDateTime: '2026-08-13T00:00:00.000Z',
      };

      createdCalendarEvents.push(createdEvent);

      return HttpResponse.json(createdEvent);
    }),
  );

  return {
    folders: folderStore,
    subscriptions: subscriptionStore,
    createdMessages,
    patchedMessages,
    sentMessageIds,
    createdCalendarEvents,
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

import { type calendar_v3, type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { gmailHistoryHandler } from 'test/integration/google/mocks/gmail-history-handler.util';
import { gmailMailboxHandlers } from 'test/integration/google/mocks/gmail-mailbox-handlers.util';
import { gmailMessageListHandler } from 'test/integration/google/mocks/gmail-message-list-handler.util';
import { googleCalendarEventsHandlers } from 'test/integration/google/mocks/google-calendar-events-handlers.util';
import { GOOGLE_CALENDAR_EVENTS_URL } from 'test/integration/google/mocks/google-calendar-events-url.constant';
import { googleIdentityHandlers } from 'test/integration/google/mocks/google-identity-handlers.util';
import {
  GOOGLE_TOKEN_URLS,
  googleTokenHandlers,
} from 'test/integration/google/mocks/google-token-handlers.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import {
  createMockEntityStore,
  type MockEntityStore,
} from 'test/integration/utils/mock-entity-store.util';

const DEFAULT_LABELS: gmail_v1.Schema$Label[] = [
  { id: 'INBOX', name: 'INBOX', type: 'system' },
  { id: 'SENT', name: 'SENT', type: 'system' },
];

export type GoogleMock = {
  labels: MockEntityStore<gmail_v1.Schema$Label>;
  sentMessages: Array<{ raw: string; threadId?: string }>;
  draftMessages: Array<{ raw: string; threadId?: string }>;
  createdCalendarEvents: calendar_v3.Schema$Event[];
  actAsAccount: (handle: string) => void;
  serveMessageList: (messages: gmail_v1.Schema$Message[]) => void;
  serveHistory: (addedMessages: gmail_v1.Schema$Message[]) => void;
  serveCalendarEvents: (
    events: calendar_v3.Schema$Event[],
    options?: { nextSyncToken?: string },
  ) => void;
  rateLimitMessageList: (retryAfterIso: string) => void;
  rateLimitCalendarEventList: () => void;
  failMessageList: (failure: GoogleApiFailure) => void;
  failCalendarEventList: (failure: GoogleApiFailure) => void;
  declineTokenRefresh: () => void;
};

export type GoogleApiFailure = {
  status: number;
  reason: string;
  message: string;
};

const googleApiErrorResponse = ({
  status,
  reason,
  message,
}: GoogleApiFailure) =>
  HttpResponse.json(
    {
      error: {
        code: status,
        message,
        errors: [{ reason, message }],
      },
    },
    { status },
  );

export const setupGoogleMock = ({
  handle,
  inbox = [],
  labels = DEFAULT_LABELS,
}: {
  handle: string;
  inbox?: gmail_v1.Schema$Message[];
  labels?: gmail_v1.Schema$Label[];
}): GoogleMock => {
  const labelStore = createMockEntityStore(labels, (label) => label.id ?? '');
  const sentMessages: Array<{ raw: string; threadId?: string }> = [];
  const draftMessages: Array<{ raw: string; threadId?: string }> = [];
  const createdCalendarEvents: calendar_v3.Schema$Event[] = [];

  const httpMock = setupHttpMock(
    ...googleTokenHandlers(),
    ...googleIdentityHandlers(handle),
    ...googleCalendarEventsHandlers([], 'mock-calendar-sync-token'),
    ...gmailMailboxHandlers(inbox, labelStore),
    http.post('*/gmail/v1/users/me/messages/send', async ({ request }) => {
      const body = (await request.json()) as { raw: string; threadId?: string };

      sentMessages.push({
        raw: Buffer.from(body.raw, 'base64url').toString(),
        threadId: body.threadId,
      });

      const id = `gmail-sent-${sentMessages.length}`;

      return HttpResponse.json({ id, threadId: body.threadId ?? id });
    }),
    http.post('*/gmail/v1/users/me/drafts', async ({ request }) => {
      const body = (await request.json()) as {
        message: { raw: string; threadId?: string };
      };

      draftMessages.push({
        raw: Buffer.from(body.message.raw, 'base64url').toString(),
        threadId: body.message.threadId,
      });

      return HttpResponse.json({ id: `gmail-draft-${draftMessages.length}` });
    }),
    http.get('*/gmail/v1/users/me/drafts', () =>
      HttpResponse.json({
        drafts: [
          {
            id: 'gmail-synced-draft',
            message: { id: 'gmail-draft-message' },
          },
        ],
      }),
    ),
    http.delete(
      '*/gmail/v1/users/me/drafts/:draftId',
      () => new HttpResponse(null, { status: 204 }),
    ),
    http.post(GOOGLE_CALENDAR_EVENTS_URL, async ({ request }) => {
      const event = (await request.json()) as calendar_v3.Schema$Event;
      const id = `google-created-calendar-event-${createdCalendarEvents.length + 1}`;
      const createdEvent = {
        ...event,
        id,
        iCalUID: `${id}@google.com`,
        status: 'confirmed',
        created: '2026-08-13T00:00:00.000Z',
        updated: '2026-08-13T00:00:00.000Z',
      };

      createdCalendarEvents.push(createdEvent);

      return HttpResponse.json(createdEvent);
    }),
  );

  return {
    labels: labelStore,
    sentMessages,
    draftMessages,
    createdCalendarEvents,
    actAsAccount: (accountHandle) =>
      httpMock.use(...googleIdentityHandlers(accountHandle)),
    serveMessageList: (messages) =>
      httpMock.use(gmailMessageListHandler(messages)),
    serveHistory: (addedMessages) =>
      httpMock.use(gmailHistoryHandler(addedMessages)),
    serveCalendarEvents: (
      events,
      { nextSyncToken = 'mock-calendar-sync-token' } = {},
    ) => httpMock.use(...googleCalendarEventsHandlers(events, nextSyncToken)),
    rateLimitMessageList: (retryAfterIso) =>
      httpMock.use(
        http.get('*/gmail/v1/users/me/messages', () =>
          HttpResponse.json(
            {
              error: {
                code: 429,
                message: 'Rate Limit Exceeded',
                errors: [
                  {
                    reason: 'rateLimitExceeded',
                    message: `Rate Limit Exceeded. Retry after ${retryAfterIso}`,
                  },
                ],
              },
            },
            { status: 429 },
          ),
        ),
      ),
    rateLimitCalendarEventList: () =>
      httpMock.use(
        http.get(GOOGLE_CALENDAR_EVENTS_URL, () =>
          HttpResponse.json(
            {
              error: {
                code: 429,
                message: 'Rate Limit Exceeded',
                errors: [
                  {
                    reason: 'rateLimitExceeded',
                    message: 'Rate Limit Exceeded',
                  },
                ],
              },
            },
            { status: 429 },
          ),
        ),
      ),
    // A channel carrying a sync cursor fetches through the history endpoint
    // rather than the message list, so both have to fail for the failure to
    // surface regardless of which path the channel takes.
    failMessageList: (failure) =>
      httpMock.use(
        http.get('*/gmail/v1/users/me/messages', () =>
          googleApiErrorResponse(failure),
        ),
        http.get('*/gmail/v1/users/me/history', () =>
          googleApiErrorResponse(failure),
        ),
      ),
    failCalendarEventList: (failure) =>
      httpMock.use(
        http.get(GOOGLE_CALENDAR_EVENTS_URL, () =>
          googleApiErrorResponse(failure),
        ),
      ),
    declineTokenRefresh: () =>
      httpMock.use(
        ...GOOGLE_TOKEN_URLS.map((url) =>
          http.post(url, () =>
            HttpResponse.json(
              {
                error: 'invalid_grant',
                error_description: 'Token has been revoked',
              },
              { status: 400 },
            ),
          ),
        ),
      ),
  };
};

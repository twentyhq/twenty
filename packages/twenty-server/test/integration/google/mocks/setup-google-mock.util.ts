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
  actAsAccount: (handle: string) => void;
  serveMessageList: (messages: gmail_v1.Schema$Message[]) => void;
  serveHistory: (addedMessages: gmail_v1.Schema$Message[]) => void;
  serveCalendarEvents: (
    events: calendar_v3.Schema$Event[],
    options?: { nextSyncToken?: string },
  ) => void;
  rateLimitMessageList: (retryAfterIso: string) => void;
  rateLimitCalendarEventList: () => void;
  declineTokenRefresh: () => void;
};

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

  const httpMock = setupHttpMock(
    ...googleTokenHandlers(),
    ...googleIdentityHandlers(handle),
    ...googleCalendarEventsHandlers([], 'mock-calendar-sync-token'),
    ...gmailMailboxHandlers(inbox, labelStore),
  );

  return {
    labels: labelStore,
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

import { type calendar_v3, type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import {
  type MswHandler,
  setupHttpMock,
} from 'test/integration/mocks/http-mock.util';
import {
  createMockEntityStore,
  type MockEntityStore,
} from 'test/integration/mocks/mock-entity-store.util';

const GOOGLE_OAUTH_SCOPES = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/profile.emails.read',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
].join(' ');

const GOOGLE_TOKEN_URLS = [
  'https://oauth2.googleapis.com/token',
  'https://www.googleapis.com/oauth2/v4/token',
];

const GOOGLE_CALENDAR_EVENTS_URL =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';

const DEFAULT_LABELS: gmail_v1.Schema$Label[] = [
  { id: 'INBOX', name: 'INBOX', type: 'system' },
  { id: 'SENT', name: 'SENT', type: 'system' },
];

const tokenHandlers = (): MswHandler[] =>
  GOOGLE_TOKEN_URLS.map((url) =>
    http.post(url, () =>
      HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        scope: GOOGLE_OAUTH_SCOPES,
        token_type: 'Bearer',
      }),
    ),
  );

const identityHandlers = (handle: string): MswHandler[] => [
  http.get('https://www.googleapis.com/oauth2/v3/userinfo', () =>
    HttpResponse.json({
      sub: `google-user-id-${handle}`,
      email: handle,
      email_verified: true,
      name: 'Jane Austen',
      given_name: 'Jane',
      family_name: 'Austen',
    }),
  ),
  http.get('https://www.googleapis.com/oauth2/v3/tokeninfo', () =>
    HttpResponse.json({ scope: GOOGLE_OAUTH_SCOPES, email: handle }),
  ),
  http.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', () =>
    HttpResponse.json({ emailAddress: handle, messagesTotal: 0 }),
  ),
  http.get('*/gmail/v1/users/me/settings/sendAs', () =>
    HttpResponse.json({ sendAs: [{ sendAsEmail: handle, isPrimary: true }] }),
  ),
];

const messageListHandler = (
  messages: gmail_v1.Schema$Message[],
): MswHandler =>
  http.get('*/gmail/v1/users/me/messages', () =>
    HttpResponse.json<gmail_v1.Schema$ListMessagesResponse>({
      messages: messages.map((message) => ({
        id: message.id,
        threadId: message.threadId,
      })),
      resultSizeEstimate: messages.length,
    }),
  );

const historyHandler = (
  addedMessages: gmail_v1.Schema$Message[],
): MswHandler =>
  http.get('*/gmail/v1/users/me/history', () =>
    HttpResponse.json<gmail_v1.Schema$ListHistoryResponse>({
      history: [
        {
          messagesAdded: addedMessages.map((message) => ({
            message: { id: message.id, threadId: message.threadId },
          })),
        },
      ],
      historyId: '987654322',
    }),
  );

const calendarEventsHandlers = (
  events: calendar_v3.Schema$Event[],
  nextSyncToken: string,
): MswHandler[] => [
  http.get(GOOGLE_CALENDAR_EVENTS_URL, () =>
    HttpResponse.json<calendar_v3.Schema$Events>({
      items: events,
      nextSyncToken,
    }),
  ),
  ...events.map((event) =>
    http.get(`${GOOGLE_CALENDAR_EVENTS_URL}/${event.id}`, () =>
      HttpResponse.json<calendar_v3.Schema$Event>(event),
    ),
  ),
];

const buildBatchMultipartResponse = (
  messages: gmail_v1.Schema$Message[],
): { body: string; contentType: string } => {
  const boundary = 'batch_boundary';
  const subResponses = messages
    .map((message) =>
      [
        `--${boundary}`,
        'Content-Type: application/http',
        '',
        'HTTP/1.1 200 OK',
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(message),
      ].join('\r\n'),
    )
    .join('\r\n');

  return {
    body: `${subResponses}\r\n--${boundary}--`,
    contentType: `multipart/mixed; boundary=${boundary}`,
  };
};

const mailboxHandlers = (
  inbox: gmail_v1.Schema$Message[],
  labelStore: MockEntityStore<gmail_v1.Schema$Label>,
): MswHandler[] => [
  http.get('*/gmail/v1/users/me/labels', () =>
    HttpResponse.json<gmail_v1.Schema$ListLabelsResponse>({
      labels: labelStore.list(),
    }),
  ),
  messageListHandler(inbox),
  http.get('*/gmail/v1/users/me/history', () =>
    HttpResponse.json<gmail_v1.Schema$ListHistoryResponse>({
      history: [],
      historyId: inbox[0]?.historyId ?? '987654321',
    }),
  ),
  http.get('*/gmail/v1/users/me/messages/:messageId', ({ params }) => {
    const message = inbox.find(
      (candidate) => candidate.id === params.messageId,
    );

    if (!message) {
      return HttpResponse.json(
        { error: { code: 404, message: 'Not Found' } },
        { status: 404 },
      );
    }

    return HttpResponse.json<gmail_v1.Schema$Message>(message);
  }),
  http.post('*/batch', async ({ request }) => {
    const requestedIds = [
      ...(await request.text()).matchAll(/messages\/([\w-]+)/g),
    ].map((match) => match[1]);
    const requestedMessages = inbox.filter((message) =>
      requestedIds.includes(message.id ?? ''),
    );

    const { body, contentType } =
      buildBatchMultipartResponse(requestedMessages);

    return new HttpResponse(body, {
      headers: { 'Content-Type': contentType },
    });
  }),
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
    ...tokenHandlers(),
    ...identityHandlers(handle),
    ...calendarEventsHandlers([], 'mock-calendar-sync-token'),
    ...mailboxHandlers(inbox, labelStore),
  );

  return {
    labels: labelStore,
    actAsAccount: (accountHandle) =>
      httpMock.use(...identityHandlers(accountHandle)),
    serveMessageList: (messages) => httpMock.use(messageListHandler(messages)),
    serveHistory: (addedMessages) => httpMock.use(historyHandler(addedMessages)),
    serveCalendarEvents: (
      events,
      { nextSyncToken = 'mock-calendar-sync-token' } = {},
    ) => httpMock.use(...calendarEventsHandlers(events, nextSyncToken)),
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
        http.post('https://oauth2.googleapis.com/token', () =>
          HttpResponse.json(
            {
              error: 'invalid_grant',
              error_description: 'Token has been revoked',
            },
            { status: 400 },
          ),
        ),
      ),
  };
};

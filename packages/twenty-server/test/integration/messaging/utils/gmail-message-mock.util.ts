import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';
import { http, HttpResponse, type RequestHandler } from 'msw';

import { googleAuthHandlers } from 'test/integration/messaging/utils/google-auth-mock.util';
import { googleCalendarHandlers } from 'test/integration/messaging/utils/google-calendar-mock.util';
import { type HttpMock, setupHttpMock } from 'test/integration/utils/http-mock';

export const gmailMessage = (
  overrides: Partial<gmail_v1.Schema$Message> = {},
): gmail_v1.Schema$Message => {
  const id = overrides.id ?? `gmail-msg-${randomUUID()}`;

  return {
    id,
    threadId: id,
    historyId: '987654321',
    internalDate: '1700000000000',
    labelIds: ['INBOX'],
    payload: {
      mimeType: 'text/plain',
      headers: [
        { name: 'From', value: 'sender@example.com' },
        { name: 'To', value: 'recipient@example.com' },
        { name: 'Subject', value: `Subject ${id}` },
        { name: 'Message-ID', value: `<${id}@example.com>` },
        { name: 'Date', value: 'Wed, 15 Nov 2023 00:00:00 +0000' },
      ],
      body: {
        data: Buffer.from(`body ${id}`).toString('base64'),
        size: 10,
      },
    },
    ...overrides,
  };
};

export const getGmailMessageSubject = (
  message: gmail_v1.Schema$Message,
): string =>
  message.payload?.headers?.find((header) => header.name === 'Subject')
    ?.value ?? '';

const DEFAULT_LABELS: gmail_v1.Schema$Label[] = [
  { id: 'INBOX', name: 'INBOX', type: 'system' },
  { id: 'SENT', name: 'SENT', type: 'system' },
];

export type GmailLabelStore = {
  add: (label: gmail_v1.Schema$Label) => void;
  remove: (labelId: string) => void;
  reset: () => void;
  list: () => gmail_v1.Schema$Label[];
};

const createGmailLabelStore = (
  initialLabels: gmail_v1.Schema$Label[],
): GmailLabelStore => {
  let labels = [...initialLabels];

  return {
    add: (label) => {
      labels = [...labels, label];
    },
    remove: (labelId) => {
      labels = labels.filter((label) => label.id !== labelId);
    },
    reset: () => {
      labels = [...initialLabels];
    },
    list: () => labels,
  };
};

const buildBatchMultipartResponse = (
  inbox: gmail_v1.Schema$Message[],
): { body: string; contentType: string } => {
  const boundary = 'batch_boundary';
  const subResponses = inbox
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

export const rateLimitedGmailMessageList = (
  retryAfterIso: string,
): RequestHandler =>
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
  );

export const gmailHistoryHandler = (
  addedMessages: gmail_v1.Schema$Message[],
  { historyId = '987654322' }: { historyId?: string } = {},
): RequestHandler =>
  http.get('*/gmail/v1/users/me/history', () =>
    HttpResponse.json<gmail_v1.Schema$ListHistoryResponse>({
      history: [
        {
          messagesAdded: addedMessages.map((message) => ({
            message: { id: message.id, threadId: message.threadId },
          })),
        },
      ],
      historyId,
    }),
  );

const gmailMessageHandlers = ({
  inbox,
  labelStore,
}: {
  inbox: gmail_v1.Schema$Message[];
  labelStore: GmailLabelStore;
}): RequestHandler[] => [
  http.get('*/gmail/v1/users/me/labels', () =>
    HttpResponse.json<gmail_v1.Schema$ListLabelsResponse>({
      labels: labelStore.list(),
    }),
  ),
  http.get('*/gmail/v1/users/me/messages', () => {
    const messages: gmail_v1.Schema$Message[] = inbox.map((message) => ({
      id: message.id,
      threadId: message.threadId,
    }));

    return HttpResponse.json<gmail_v1.Schema$ListMessagesResponse>({
      messages,
      resultSizeEstimate: inbox.length,
    });
  }),
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

    return new HttpResponse(body, { headers: { 'Content-Type': contentType } });
  }),
];

export const setupGmailMock = ({
  inbox,
  labels = DEFAULT_LABELS,
  handle = 'me@example.com',
}: {
  inbox: gmail_v1.Schema$Message[];
  labels?: gmail_v1.Schema$Label[];
  handle?: string;
}): { labels: GmailLabelStore; use: HttpMock['use'] } => {
  const labelStore = createGmailLabelStore(labels);

  const httpMock = setupHttpMock(
    ...googleAuthHandlers(handle),
    ...googleCalendarHandlers(),
    ...gmailMessageHandlers({ inbox, labelStore }),
  );

  return { labels: labelStore, use: httpMock.use };
};

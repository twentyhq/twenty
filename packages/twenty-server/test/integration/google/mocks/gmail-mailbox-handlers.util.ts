import { type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { gmailMessageListHandler } from 'test/integration/google/mocks/gmail-message-list-handler.util';
import { type MswHandler } from 'test/integration/utils/http-mock.util';
import { type MockEntityStore } from 'test/integration/utils/mock-entity-store.util';

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

export const gmailMailboxHandlers = (
  inbox: gmail_v1.Schema$Message[],
  labelStore: MockEntityStore<gmail_v1.Schema$Label>,
): MswHandler[] => [
  http.get('*/gmail/v1/users/me/labels', () =>
    HttpResponse.json<gmail_v1.Schema$ListLabelsResponse>({
      labels: labelStore.list(),
    }),
  ),
  gmailMessageListHandler(inbox),
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

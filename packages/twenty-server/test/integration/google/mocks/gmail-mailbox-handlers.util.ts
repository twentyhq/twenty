import { type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { gmailBatchMultipartResponse } from 'test/integration/google/mocks/gmail-batch-multipart-response.util';
import { gmailMessageListHandler } from 'test/integration/google/mocks/gmail-message-list-handler.util';
import { type MswHandler } from 'test/integration/utils/http-mock.util';
import { type MockEntityStore } from 'test/integration/utils/mock-entity-store.util';

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

    return gmailBatchMultipartResponse(
      requestedMessages.map((message) => ({
        statusLine: '200 OK',
        body: message,
      })),
    );
  }),
];

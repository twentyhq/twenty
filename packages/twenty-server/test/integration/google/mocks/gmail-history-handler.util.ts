import { type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const gmailHistoryHandler = (
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

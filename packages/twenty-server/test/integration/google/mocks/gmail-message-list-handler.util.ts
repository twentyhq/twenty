import { type gmail_v1 } from 'googleapis';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const gmailMessageListHandler = (
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

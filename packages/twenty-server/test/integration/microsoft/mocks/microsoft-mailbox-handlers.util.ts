import { type MailFolder } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';
import { type MockEntityStore } from 'test/integration/utils/mock-entity-store.util';

export const microsoftMailboxHandlers = (
  folderStore: MockEntityStore<MailFolder>,
  messages: Array<Record<string, unknown>> = [],
): MswHandler[] => [
  http.get('*/me/mailFolders', () =>
    HttpResponse.json<{ value: MailFolder[] }>({ value: folderStore.list() }),
  ),
  http.get('*/messages/delta', () =>
    HttpResponse.json({
      value: [],
      '@odata.deltaLink':
        'https://graph.microsoft.com/beta/me/mailfolders/inbox/messages/delta?$deltatoken=mock-delta-token',
    }),
  ),
  http.post('*/$batch', async ({ request }) => {
    const { requests } = (await request.json()) as {
      requests: Array<{ id: string; url: string }>;
    };

    return HttpResponse.json({
      responses: requests.map(({ id, url }) => {
        if (url.includes('/messages/delta')) {
          const folderId = url.match(/mailfolders\/([^/]+)\//)?.[1];

          return {
            id,
            status: 200,
            body: {
              value: messages
                .filter((message) => message.parentFolderId === folderId)
                .map((message) => ({ id: message.id })),
              '@odata.deltaLink': `https://graph.microsoft.com/beta${url}`,
            },
          };
        }

        const messageId = url.match(/\/me\/messages\/([^?]+)/)?.[1];
        const message = messages.find(
          (candidate) => candidate.id === messageId,
        );

        return message
          ? { id, status: 200, body: message }
          : { id, status: 404, body: { error: { message: 'Not Found' } } };
      }),
    });
  }),
];

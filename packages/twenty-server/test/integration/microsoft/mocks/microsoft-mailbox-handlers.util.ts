import { type MailFolder } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';
import { isDefined } from 'twenty-shared/utils';

import { type MswHandler } from 'test/integration/utils/http-mock.util';
import { type MockEntityStore } from 'test/integration/utils/mock-entity-store.util';

export const microsoftMailboxHandlers = (
  folderStore: MockEntityStore<MailFolder>,
  messages: Array<Record<string, unknown>> = [],
  removedMessageIdsByFolderId: Record<string, string[]> = {},
  {
    unfetchableMessageIds = [],
    mailFolderPageSize = Infinity,
  }: { unfetchableMessageIds?: string[]; mailFolderPageSize?: number } = {},
): MswHandler[] => [
  http.get('*/me/mailFolders', ({ request }) => {
    const { searchParams } = new URL(request.url);
    const top = Number(searchParams.get('$top') ?? 10);
    const skip = Number(searchParams.get('$skip') ?? 0);
    const nextSkip = skip + Math.min(top, mailFolderPageSize);
    const folders = folderStore.list();

    return HttpResponse.json<{
      value: MailFolder[];
      '@odata.nextLink'?: string;
    }>({
      value: folders.slice(skip, nextSkip),
      ...(nextSkip < folders.length && {
        '@odata.nextLink': `https://graph.microsoft.com/beta/me/mailFolders?$top=${top}&$skip=${nextSkip}`,
      }),
    });
  }),
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
              value: [
                ...messages
                  .filter((message) => message.parentFolderId === folderId)
                  .map((message) => ({ id: message.id })),
                ...(removedMessageIdsByFolderId[folderId ?? ''] ?? []).map(
                  (removedMessageId) => ({
                    id: removedMessageId,
                    '@removed': { reason: 'deleted' },
                  }),
                ),
              ],
              '@odata.deltaLink': `https://graph.microsoft.com/beta${url}`,
            },
          };
        }

        const messageId = url.match(/\/me\/messages\/([^?]+)/)?.[1];
        const message = messages.find(
          (candidate) => candidate.id === messageId,
        );

        return isDefined(message) &&
          !unfetchableMessageIds.includes(messageId ?? '')
          ? { id, status: 200, body: message }
          : { id, status: 404, body: { error: { message: 'Not Found' } } };
      }),
    });
  }),
];

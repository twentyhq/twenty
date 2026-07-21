import { type MailFolder } from '@microsoft/microsoft-graph-types';
import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';
import { type MockEntityStore } from 'test/integration/utils/mock-entity-store.util';

export const microsoftMailboxHandlers = (
  folderStore: MockEntityStore<MailFolder>,
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
  http.post('*/$batch', () =>
    HttpResponse.json<{ responses: never[] }>({ responses: [] }),
  ),
];

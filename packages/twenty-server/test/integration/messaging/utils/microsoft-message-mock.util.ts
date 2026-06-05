import { randomUUID } from 'node:crypto';

import {
  type MailFolder,
  type Message,
} from '@microsoft/microsoft-graph-types';
import { http, HttpResponse, type RequestHandler } from 'msw';

import { microsoftAuthHandlers } from 'test/integration/messaging/utils/microsoft-auth-mock.util';
import { type HttpMock, setupHttpMock } from 'test/integration/utils/http-mock';

export const microsoftMessage = (overrides: Partial<Message> = {}): Message => {
  const id = overrides.id ?? `ms-msg-${randomUUID()}`;

  return {
    id,
    subject: `Subject ${id}`,
    internetMessageId: `<${id}@example.com>`,
    receivedDateTime: '2023-11-15T00:00:00Z',
    from: { emailAddress: { address: 'sender@example.com' } },
    toRecipients: [{ emailAddress: { address: 'recipient@example.com' } }],
    ccRecipients: [],
    bccRecipients: [],
    body: { contentType: 'text', content: `body ${id}` },
    ...overrides,
  };
};

export const getMicrosoftMessageSubject = (message: Message): string =>
  message.subject ?? '';

const DEFAULT_FOLDERS: MailFolder[] = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'sentitems', displayName: 'Sent Items' },
];

export type MicrosoftFolderStore = {
  add: (folder: MailFolder) => void;
  remove: (folderId: string) => void;
  reset: () => void;
  list: () => MailFolder[];
};

const createMicrosoftFolderStore = (
  initialFolders: MailFolder[],
): MicrosoftFolderStore => {
  let folders = [...initialFolders];

  return {
    add: (folder) => {
      folders = [...folders, folder];
    },
    remove: (folderId) => {
      folders = folders.filter((folder) => folder.id !== folderId);
    },
    reset: () => {
      folders = [...initialFolders];
    },
    list: () => folders,
  };
};

const microsoftMessageHandlers = ({
  inbox,
  folderStore,
}: {
  inbox: Message[];
  folderStore: MicrosoftFolderStore;
}): RequestHandler[] => [
  http.get('*/me/mailFolders', () =>
    HttpResponse.json<{ value: MailFolder[] }>({ value: folderStore.list() }),
  ),
  http.get('*/messages/delta', () =>
    HttpResponse.json<{ value: Message[]; '@odata.deltaLink': string }>({
      value: inbox.map((message) => ({ id: message.id })),
      '@odata.deltaLink':
        'https://graph.microsoft.com/beta/me/mailfolders/inbox/messages/delta?$deltatoken=mock-delta-token',
    }),
  ),
  http.post('*/$batch', () =>
    HttpResponse.json<{
      responses: { id: string; status: number; body: Message }[];
    }>({
      responses: inbox.map((message, index) => ({
        id: (index + 1).toString(),
        status: 200,
        body: message,
      })),
    }),
  ),
];

export const setupMicrosoftMock = ({
  inbox,
  folders = DEFAULT_FOLDERS,
  handle = 'me@example.com',
}: {
  inbox: Message[];
  folders?: MailFolder[];
  handle?: string;
}): {
  folders: MicrosoftFolderStore;
  use: HttpMock['use'];
} => {
  const folderStore = createMicrosoftFolderStore(folders);

  const httpMock = setupHttpMock(
    ...microsoftAuthHandlers(handle),
    ...microsoftMessageHandlers({ inbox, folderStore }),
  );

  return { folders: folderStore, use: httpMock.use };
};

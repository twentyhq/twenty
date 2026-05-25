import { type gmail_v1 as gmailV1 } from 'googleapis';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const mockConnectedAccount: Pick<
  ConnectedAccountEntity,
  'provider' | 'id' | 'handle' | 'handleAliases'
> = {
  id: 'connected-account-id',
  provider: ConnectedAccountProvider.GOOGLE,
  handle: 'me@gmail.com',
  handleAliases: [],
};

type SyncedFolderInput = {
  externalId: string;
  isSynced: boolean;
};

export const createMockMessageFolder = ({
  externalId,
  isSynced,
}: SyncedFolderInput) =>
  ({
    id: `folder-${externalId}`,
    externalId,
    isSynced,
  }) as never;

type RawGmailMessageInput = {
  id: string;
  threadId: string;
  labelIds: string[];
  from?: string;
  to?: string;
};

export const createRawGmailMessage = ({
  id,
  threadId,
  labelIds,
  from = 'sender@external.com',
  to = 'me@gmail.com',
}: RawGmailMessageInput): gmailV1.Schema$Message => ({
  id,
  threadId,
  historyId: '1',
  internalDate: '1700000000000',
  labelIds,
  payload: {
    headers: [
      { name: 'From', value: from },
      { name: 'To', value: to },
      { name: 'Message-ID', value: `<${id}@external.com>` },
      { name: 'Subject', value: `Subject ${id}` },
    ],
    mimeType: 'text/plain',
    body: { data: Buffer.from('body').toString('base64') },
  },
});

export const createThreadGetResponse = (
  threadMessages: { id: string; labelIds: string[] }[],
) => ({
  data: {
    messages: threadMessages.map((threadMessage) => ({
      id: threadMessage.id,
      labelIds: threadMessage.labelIds,
    })),
  },
});

import { type MailFolder } from '@microsoft/microsoft-graph-types';
import {
  ConnectedAccountProvider,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  type MessageFolderDto,
  queryMessageFolders,
} from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'microsoft-folder-discovery@apple.dev';

const FOLDERS: MailFolder[] = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'sentitems', displayName: 'Sent Items' },
  { id: 'projects', displayName: 'Projects' },
];

describe('Microsoft folder discovery (integration)', () => {
  const microsoft = setupMicrosoftMock({
    handle: HANDLE,
    folders: FOLDERS,
    mailFolderPageSize: 2,
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let discoveredFolders: MessageFolderDto[];
  let foldersAfterFailedDiscovery: MessageFolderDto[];

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);
    discoveredFolders = await queryMessageFolders(channel.channelId);

    // 500 rather than 503: the Graph client retries 503 with multi-second
    // backoff, which would outlast the job drain timeout.
    microsoft.failMailFolderNextPages({
      status: 500,
      code: 'InternalServerError',
      message: 'Internal error',
    });
    await runMessageChannelSync(channel.channelId);
    foldersAfterFailedDiscovery = await queryMessageFolders(channel.channelId);
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('discovers Microsoft mail folders from every Graph page', () => {
    expect(
      Object.fromEntries(
        discoveredFolders.map((folder) => [folder.name, folder.isSynced]),
      ),
    ).toEqual({
      Inbox: true,
      'Sent Items': true,
      Projects: true,
    });
  });

  it('keeps every folder when a later Graph page fails', () => {
    expect(
      Object.fromEntries(
        foldersAfterFailedDiscovery.map((folder) => [
          folder.name,
          folder.pendingSyncAction,
        ]),
      ),
    ).toEqual({
      Inbox: MessageFolderPendingSyncAction.NONE,
      'Sent Items': MessageFolderPendingSyncAction.NONE,
      Projects: MessageFolderPendingSyncAction.NONE,
    });
  });
});

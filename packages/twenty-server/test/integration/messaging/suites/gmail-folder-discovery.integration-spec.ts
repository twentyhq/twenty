import {
  ConnectedAccountProvider,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  queryMessageFolders,
  updateMessageChannel,
} from 'test/integration/messaging/utils/query-messaging.util';
import { setupGoogleMock } from 'test/integration/mocks/google/setup-google-mock.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { startChannelSyncAndAwait } from 'test/integration/utils/start-channel-sync-and-await.util';

const HANDLE = 'gmail-folder-discovery@apple.dev';

describe('Gmail folder discovery (integration)', () => {
  const gmail = setupGoogleMock({
    handle: HANDLE,
    labels: [
      { id: 'INBOX', name: 'INBOX' },
      { id: 'SENT', name: 'SENT' },
      { id: 'Label_Work', name: 'Work' },
    ],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
      skipChannelConfiguration: false,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('syncs every folder discovered at connect time under the default all-folders policy', async () => {
    await startChannelSyncAndAwait(channel.connectedAccountId);

    const folders = await queryMessageFolders(channel.channelId);

    expect(
      Object.fromEntries(folders.map((folder) => [folder.name, folder.isSynced])),
    ).toEqual({
      INBOX: true,
      SENT: true,
      Work: true,
    });
  }, 60000);

  it('leaves a folder discovered after switching to selected-folders unsynced', async () => {
    await updateMessageChannel(channel.channelId, {
      messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
    });

    gmail.labels.add({ id: 'Label_Archive', name: 'Archive' });

    await runMessageChannelSync(channel.channelId);

    const folders = await queryMessageFolders(channel.channelId);

    expect(
      Object.fromEntries(folders.map((folder) => [folder.name, folder.isSynced])),
    ).toEqual({
      INBOX: true,
      SENT: true,
      Work: true,
      Archive: false,
    });
  }, 60000);
});

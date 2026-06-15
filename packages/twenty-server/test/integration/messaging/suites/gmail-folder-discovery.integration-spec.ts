import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  queryMessageChannel,
  queryMessageFolders,
  updateMessageChannel,
} from 'test/integration/messaging/utils/query-messaging.util';
import {
  runMessageChannelSync,
  startChannelSyncAndAwait,
} from 'test/integration/utils/run-channel-sync.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'gmail-folder-discovery@apple.dev';

describe('Gmail folder discovery (integration)', () => {
  const gmail = setupGmailMock({
    inbox: [],
    labels: [
      { id: 'INBOX', name: 'INBOX' },
      { id: 'SENT', name: 'SENT' },
      { id: 'Label_Work', name: 'Work' },
    ],
    handle: HANDLE,
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const getSyncStateByFolderName = async () => {
    const folders = await queryMessageFolders(channel.channelId);

    return Object.fromEntries(
      folders.map((folder) => [folder.name, folder.isSynced]),
    );
  };

  const runSyncCycle = () => runMessageChannelSync(channel.channelId);

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
      skipChannelConfiguration: false,
    });

    await updateMessageChannel(channel.channelId, {
      messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('keeps the folders discovered at connect time synced under their original all-folders policy', async () => {
    await startChannelSyncAndAwait(channel.connectedAccountId);

    expect(await getSyncStateByFolderName()).toEqual({
      INBOX: true,
      SENT: true,
      Work: true,
    });
  }, 60000);

  it('leaves a folder discovered after switching to selected-folders unsynced', async () => {
    await pollUntil(
      () => queryMessageChannel(channel.connectedAccountId, channel.channelId),
      (channelState) =>
        channelState.syncStage ===
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );

    gmail.labels.add({ id: 'Label_Archive', name: 'Archive' });

    await runSyncCycle();

    const syncStateByFolderName = await pollUntil(
      getSyncStateByFolderName,
      (state) => Object.keys(state).length === 4,
    );

    expect(syncStateByFolderName).toEqual({
      INBOX: true,
      SENT: true,
      Work: true,
      Archive: false,
    });
  }, 60000);
});

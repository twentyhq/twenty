import {
  ConnectedAccountProvider,
  MessageFolderImportPolicy,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  queryMessageFolders,
  updateMessageChannel,
} from 'test/integration/utils/query-messaging.util';
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
      Object.fromEntries(
        folders.map((folder) => [folder.name, folder.isSynced]),
      ),
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
      Object.fromEntries(
        folders.map((folder) => [folder.name, folder.isSynced]),
      ),
    ).toEqual({
      INBOX: true,
      SENT: true,
      Work: true,
      Archive: false,
    });
  }, 60000);

  it('updates a renamed folder in place by id and marks a removed folder for deletion', async () => {
    const foldersBeforeChange = await queryMessageFolders(channel.channelId);
    const workFolderId = foldersBeforeChange.find(
      (folder) => folder.name === 'Work',
    )?.id;
    const sentFolderId = foldersBeforeChange.find(
      (folder) => folder.name === 'SENT',
    )?.id;

    if (!workFolderId || !sentFolderId) {
      throw new Error(
        'Expected the Work and SENT folders to already be synced from earlier in this suite',
      );
    }

    gmail.labels.remove('Label_Work');
    gmail.labels.add({ id: 'Label_Work', name: 'Engineering' });
    gmail.labels.remove('SENT');

    await runMessageChannelSync(channel.channelId);

    const foldersAfterChange = await queryMessageFolders(channel.channelId);

    const renamedFolder = foldersAfterChange.find(
      (folder) => folder.id === workFolderId,
    );
    const deletedFolder = foldersAfterChange.find(
      (folder) => folder.id === sentFolderId,
    );

    expect(renamedFolder?.name).toBe('Engineering');
    expect(renamedFolder?.isSynced).toBe(true);
    expect(deletedFolder?.pendingSyncAction).toBe(
      MessageFolderPendingSyncAction.FOLDER_DELETION,
    );
  }, 60000);
});

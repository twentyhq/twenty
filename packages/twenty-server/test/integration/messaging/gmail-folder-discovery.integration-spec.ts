import {
  MessageChannelSyncStage,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type MessagingMessageListFetchJobData,
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobResult,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-mock.util';
import { seedMessageChannel } from 'test/integration/messaging/utils/seed-message-channel.util';
import { enqueueJobAndAwait } from 'test/integration/utils/enqueue-job-and-await.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const runListFetch = (channelId: string) =>
  enqueueJobAndAwait<
    MessagingMessageListFetchJobData,
    MessagingMessageListFetchJobResult
  >(MessageQueue.messagingQueue, MessagingMessageListFetchJob, {
    messageChannelId: channelId,
    workspaceId: WORKSPACE_ID,
  });

const getSyncStateByFolderName = async (channelId: string) => {
  const folders = await getCoreRepository(MessageFolderEntity).find({
    where: { messageChannelId: channelId },
  });

  return Object.fromEntries(
    folders.map((folder) => [folder.name, folder.isSynced]),
  );
};

describe('Gmail folder discovery (integration)', () => {
  const gmail = setupGmailMock({
    inbox: [],
    labels: [
      { id: 'INBOX', name: 'INBOX' },
      { id: 'SENT', name: 'SENT' },
      { id: 'Label_Work', name: 'Work' },
    ],
  });

  let channel: Awaited<ReturnType<typeof seedMessageChannel>>;

  beforeAll(async () => {
    channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('rediscovers a folder appended after the first sync and leaves it unsynced under the selected-folders policy', async () => {
    await runListFetch(channel.channelId);

    expect(await getSyncStateByFolderName(channel.channelId)).toEqual({
      INBOX: false,
      SENT: false,
      Work: false,
    });

    gmail.labels.add({ id: 'Label_Archive', name: 'Archive' });

    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      { syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED },
    );

    await runListFetch(channel.channelId);

    expect(await getSyncStateByFolderName(channel.channelId)).toEqual({
      INBOX: false,
      SENT: false,
      Work: false,
      Archive: false,
    });
  }, 60000);
});

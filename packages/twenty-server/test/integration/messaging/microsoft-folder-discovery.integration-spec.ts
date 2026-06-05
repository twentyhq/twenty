import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type MessagingMessageListFetchJobData,
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobResult,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { setupMicrosoftMock } from 'test/integration/messaging/utils/microsoft-mock.util';
import { seedMessageChannel } from 'test/integration/messaging/utils/seed-message-channel.util';
import { enqueueJobAndAwait } from 'test/integration/utils/enqueue-job-and-await.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

describe('Microsoft folder discovery (integration)', () => {
  setupMicrosoftMock({ inbox: [] });

  let channel: Awaited<ReturnType<typeof seedMessageChannel>>;

  beforeAll(async () => {
    channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      provider: ConnectedAccountProvider.MICROSOFT,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('discovers Microsoft mail folders through the Graph delta sync', async () => {
    await enqueueJobAndAwait<
      MessagingMessageListFetchJobData,
      MessagingMessageListFetchJobResult
    >(MessageQueue.messagingQueue, MessagingMessageListFetchJob, {
      messageChannelId: channel.channelId,
      workspaceId: WORKSPACE_ID,
    });

    const folders = await getCoreRepository(MessageFolderEntity).find({
      where: { messageChannelId: channel.channelId },
    });

    expect(folders.map((folder) => folder.name).sort()).toEqual([
      'Inbox',
      'Sent Items',
    ]);
  }, 60000);
});

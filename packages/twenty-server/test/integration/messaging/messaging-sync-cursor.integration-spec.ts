import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type MessagingMessageListFetchJobData,
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobResult,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import {
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-mock.util';
import { getMessageChannel } from 'test/integration/messaging/utils/get-message-channel.util';
import { seedMessageChannel } from 'test/integration/messaging/utils/seed-message-channel.util';
import { enqueueJobAndAwait } from 'test/integration/utils/enqueue-job-and-await.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const HISTORY_ID = '987654321';

const runListFetch = (channelId: string) =>
  enqueueJobAndAwait<
    MessagingMessageListFetchJobData,
    MessagingMessageListFetchJobResult
  >(MessageQueue.messagingQueue, MessagingMessageListFetchJob, {
    messageChannelId: channelId,
    workspaceId: WORKSPACE_ID,
  });

describe('Messaging sync cursor (integration)', () => {
  // No history.list handler is registered, so MSW's 'error' strategy fails the test if the
  // sync wrongly takes the incremental path instead of a full sync.
  setupGmailMock({
    inbox: [
      gmailMessage({ historyId: HISTORY_ID }),
      gmailMessage({ historyId: HISTORY_ID }),
    ],
    handle: 'tim@apple.dev',
  });

  it('runs a full sync and seeds the cursor when the cursor is null', async () => {
    const channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      syncCursor: null,
    });

    try {
      const result = await runListFetch(channel.channelId);

      expect(result.messagesToImport).toBe(2);

      const channelAfter = await getMessageChannel(channel.channelId);
      expect(channelAfter.syncCursor).toBe(HISTORY_ID);
    } finally {
      await channel.cleanup();
    }
  }, 60000);

  it('runs a full sync when the cursor is an empty string', async () => {
    const channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      syncCursor: '',
    });

    try {
      const result = await runListFetch(channel.channelId);

      expect(result.messagesToImport).toBe(2);

      const channelAfter = await getMessageChannel(channel.channelId);
      expect(channelAfter.syncCursor).toBe(HISTORY_ID);
    } finally {
      await channel.cleanup();
    }
  }, 60000);
});

import { http, HttpResponse } from 'msw';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MESSAGING_THROTTLE_MAX_ATTEMPTS } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-max-attempts';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-mock.util';
import { getMessageChannel } from 'test/integration/messaging/utils/get-message-channel.util';
import { seedMessageChannel } from 'test/integration/messaging/utils/seed-message-channel.util';
import { enqueueJobAndAwait } from 'test/integration/utils/enqueue-job-and-await.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const RETRY_AFTER_ISO = '2099-12-31T10:30:00.000Z';

const rateLimitedMessageList = () =>
  http.get('*/gmail/v1/users/me/messages', () =>
    HttpResponse.json(
      {
        error: {
          code: 429,
          message: 'Rate Limit Exceeded',
          errors: [
            {
              reason: 'rateLimitExceeded',
              message: `Rate Limit Exceeded. Retry after ${RETRY_AFTER_ISO}`,
            },
          ],
        },
      },
      { status: 429 },
    ),
  );

const runListFetch = (channelId: string) =>
  enqueueJobAndAwait(
    MessageQueue.messagingQueue,
    MessagingMessageListFetchJob,
    { messageChannelId: channelId, workspaceId: WORKSPACE_ID },
  );

describe('Messaging rate-limit throttling (integration)', () => {
  const gmail = setupGmailMock({ inbox: [], handle: 'tim@apple.dev' });

  it('records the throttle backoff window on a 429 and keeps the channel active', async () => {
    const channel = await seedMessageChannel({ workspaceId: WORKSPACE_ID });

    try {
      gmail.use(rateLimitedMessageList());

      await runListFetch(channel.channelId);

      const channelAfter = await getMessageChannel(channel.channelId);
      expect(channelAfter.throttleFailureCount).toBe(1);
      expect(channelAfter.throttleRetryAfter?.toISOString()).toBe(
        RETRY_AFTER_ISO,
      );
      expect(channelAfter.syncStatus).not.toBe(
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );
    } finally {
      await channel.cleanup();
    }
  }, 60000);

  it('fails the channel as unknown once the throttle attempts are exhausted', async () => {
    const channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      throttleFailureCount: MESSAGING_THROTTLE_MAX_ATTEMPTS,
    });

    try {
      gmail.use(rateLimitedMessageList());

      await runListFetch(channel.channelId);

      const channelAfter = await getMessageChannel(channel.channelId);
      expect(channelAfter.syncStatus).toBe(
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );
      expect(channelAfter.syncStage).toBe(MessageChannelSyncStage.FAILED);
    } finally {
      await channel.cleanup();
    }
  }, 60000);
});

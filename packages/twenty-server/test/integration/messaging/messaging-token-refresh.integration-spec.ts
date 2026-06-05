import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type MessagingMessageListFetchJobData,
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobResult,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import {
  gmailMessage,
  INVALID_REFRESH_TOKEN_PREFIX,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-mock.util';
import { getMessageChannel } from 'test/integration/messaging/utils/get-message-channel.util';
import { seedMessageChannel } from 'test/integration/messaging/utils/seed-message-channel.util';
import { enqueueJobAndAwait } from 'test/integration/utils/enqueue-job-and-await.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

// Older than the 55-minute access-token validity window, so the stored access token is treated
// as expired and a refresh round-trip fires.
const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

const runListFetch = (channelId: string) =>
  enqueueJobAndAwait<
    MessagingMessageListFetchJobData,
    MessagingMessageListFetchJobResult
  >(MessageQueue.messagingQueue, MessagingMessageListFetchJob, {
    messageChannelId: channelId,
    workspaceId: WORKSPACE_ID,
  });

const getConnectedAccount = (connectedAccountId: string) =>
  getCoreRepository(ConnectedAccountEntity).findOneByOrFail({
    id: connectedAccountId,
  });

describe('Messaging token refresh (integration)', () => {
  setupGmailMock({ inbox: [gmailMessage()], handle: 'tim@apple.dev' });

  it('refreshes an expired access token and completes the sync', async () => {
    const channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT,
    });

    try {
      const result = await runListFetch(channel.channelId);

      expect(result).toEqual({ messagesToImport: 1, messagesToDelete: 0 });

      const connectedAccount = await getConnectedAccount(
        channel.connectedAccountId,
      );
      expect(connectedAccount.authFailedAt).toBeNull();
      expect(
        connectedAccount.lastCredentialsRefreshedAt?.getTime(),
      ).toBeGreaterThan(EXPIRED_CREDENTIALS_AT.getTime());
    } finally {
      await channel.cleanup();
    }
  }, 60000);

  it('marks the channel as insufficient-permissions when the refresh token is declined', async () => {
    const channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT,
      refreshTokenPlaintext: `${INVALID_REFRESH_TOKEN_PREFIX}-tim`,
    });

    try {
      await runListFetch(channel.channelId);

      const channelAfter = await getMessageChannel(channel.channelId);
      expect(channelAfter.syncStage).toBe(MessageChannelSyncStage.FAILED);
      expect(channelAfter.syncStatus).toBe(
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      );

      const connectedAccount = await getConnectedAccount(
        channel.connectedAccountId,
      );
      expect(connectedAccount.authFailedAt).not.toBeNull();
    } finally {
      await channel.cleanup();
    }
  }, 60000);
});

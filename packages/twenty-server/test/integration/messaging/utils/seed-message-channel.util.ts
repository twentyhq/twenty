import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { mintEncryptedToken } from 'test/integration/utils/mint-encrypted-token.util';

type SeedMessageChannelResult = {
  channelId: string;
  connectedAccountId: string;
  handle: string;
  cleanup: () => Promise<void>;
};

// Reuses a dev-seeded connected account, sets fresh encrypted tokens + provider on it, and
// creates a brand new association-free channel scheduled for list-fetch. Provider-agnostic:
// the channel/account shape is identical for Gmail and Microsoft. A unique channelId keeps
// each run isolated without a DB reset.
export const seedMessageChannel = async ({
  workspaceId,
  provider = ConnectedAccountProvider.GOOGLE,
  handle = 'tim@apple.dev',
  connectedAccountId = CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
  messageFolderImportPolicy = MessageFolderImportPolicy.ALL_FOLDERS,
  syncStatus = MessageChannelSyncStatus.NOT_SYNCED,
  syncStage = MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
  syncCursor = null,
  syncStageStartedAt = null,
  throttleRetryAfter = null,
  throttleFailureCount = 0,
  lastCredentialsRefreshedAt = new Date(),
  refreshTokenPlaintext = 'mock-refresh-token',
}: {
  workspaceId: string;
  provider?: ConnectedAccountProvider;
  handle?: string;
  connectedAccountId?: string;
  messageFolderImportPolicy?: MessageFolderImportPolicy;
  syncStatus?: MessageChannelSyncStatus;
  syncStage?: MessageChannelSyncStage;
  syncCursor?: string | null;
  syncStageStartedAt?: Date | null;
  throttleRetryAfter?: Date | null;
  throttleFailureCount?: number;
  lastCredentialsRefreshedAt?: Date | null;
  refreshTokenPlaintext?: string;
}): Promise<SeedMessageChannelResult> => {
  const connectedAccountRepository = getCoreRepository(ConnectedAccountEntity);
  const messageChannelRepository = getCoreRepository(MessageChannelEntity);

  const channelId = randomUUID();

  await connectedAccountRepository.update(
    { id: connectedAccountId },
    {
      provider,
      accessToken: mintEncryptedToken('mock-access-token', workspaceId),
      refreshToken: mintEncryptedToken(refreshTokenPlaintext, workspaceId),
      lastCredentialsRefreshedAt,
      authFailedAt: null,
    },
  );

  await messageChannelRepository.save({
    id: channelId,
    visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    handle,
    type: MessageChannelType.EMAIL,
    messageFolderImportPolicy,
    pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
    isSyncEnabled: true,
    syncCursor,
    syncStatus,
    syncStage,
    syncStageStartedAt,
    throttleRetryAfter,
    throttleFailureCount,
    connectedAccountId,
    workspaceId,
  });

  const cleanup = async () => {
    await messageChannelRepository.delete({ id: channelId });
    await connectedAccountRepository.update(
      { id: connectedAccountId },
      {
        accessToken: null,
        refreshToken: null,
        lastCredentialsRefreshedAt: null,
        authFailedAt: null,
      },
    );
  };

  return { channelId, connectedAccountId, handle, cleanup };
};

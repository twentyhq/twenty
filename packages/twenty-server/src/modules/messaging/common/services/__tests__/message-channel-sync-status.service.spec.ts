import { In, IsNull, type Repository } from 'typeorm';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';

describe('MessageChannelSyncStatusService', () => {
  let service: MessageChannelSyncStatusService;
  let cacheStorage: { del: jest.Mock };
  let workspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };
  let messageChannelRepository: { update: jest.Mock };
  let messageFolderRepository: { update: jest.Mock };
  let connectedAccountRepository: { update: jest.Mock };
  let userWorkspaceRepository: { findOne: jest.Mock };
  let accountsToReconnectService: { reconnectAccount: jest.Mock };
  let metricsService: { incrementCounterForEvents: jest.Mock };
  let mockAssociationRepository: { delete: jest.Mock };

  const workspaceId = 'workspace-1';
  const channelId = 'channel-1';

  beforeEach(() => {
    cacheStorage = { del: jest.fn().mockResolvedValue(undefined) };
    mockAssociationRepository = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(async (cb) => cb()),
      getRepository: jest.fn((name: string) => {
        if (name === 'messageChannelMessageAssociation') {
          return mockAssociationRepository;
        }

        return {};
      }),
    };
    messageChannelRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    messageFolderRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    connectedAccountRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    userWorkspaceRepository = { findOne: jest.fn().mockResolvedValue(null) };
    accountsToReconnectService = { reconnectAccount: jest.fn() };
    metricsService = { incrementCounterForEvents: jest.fn() };

    service = new MessageChannelSyncStatusService(
      cacheStorage as unknown as CacheStorageService,
      workspaceOrmManager as unknown as WorkspaceOrmManager,
      messageChannelRepository as unknown as Repository<MessageChannelEntity>,
      messageFolderRepository as unknown as Repository<MessageFolderEntity>,
      connectedAccountRepository as unknown as Repository<ConnectedAccountEntity>,
      userWorkspaceRepository as unknown as Repository<UserWorkspaceEntity>,
      accountsToReconnectService as unknown as AccountsToReconnectService,
      metricsService as unknown as MetricsService,
    );
  });

  describe('resetAndMarkAsMessagesListFetchPending', () => {
    it('deletes placeholder associations with messageId: IsNull() when resetting channels', async () => {
      await service.resetAndMarkAsMessagesListFetchPending(
        [channelId],
        workspaceId,
      );

      expect(cacheStorage.del).toHaveBeenCalledWith(
        `messages-to-import:${workspaceId}:${channelId}`,
      );

      expect(mockAssociationRepository.delete).toHaveBeenCalledWith({
        messageChannelId: In([channelId]),
        messageId: IsNull(),
      });
    });

    it('returns early when messageChannelIds is empty', async () => {
      await service.resetAndMarkAsMessagesListFetchPending([], workspaceId);

      expect(cacheStorage.del).not.toHaveBeenCalled();
      expect(mockAssociationRepository.delete).not.toHaveBeenCalled();
    });
  });
});

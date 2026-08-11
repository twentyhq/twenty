import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageChannelSyncStage } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { RECENT_MESSAGES_IMPORT_CACHE_TTL_MS } from 'src/modules/onboarding-recent-messages-import/constants/recent-messages-import-cache-ttl-ms.constant';
import { RecentMessagesService } from 'src/modules/onboarding-recent-messages-import/services/recent-messages.service';

@Injectable()
export class OnboardingRecentMessagesImportService {
  private readonly logger = new Logger(
    OnboardingRecentMessagesImportService.name,
  );

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly recentMessagesService: RecentMessagesService,
  ) {}

  async importRecentMessages({
    messageChannelId,
    workspaceId,
  }: {
    messageChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const messageChannel = await this.messageChannelRepository.findOne({
            where: { id: messageChannelId, workspaceId },
            relations: { connectedAccount: true, messageFolders: true },
          });

          if (!isDefined(messageChannel) || !messageChannel.isSyncEnabled) {
            return;
          }

          const hasAlreadyCompletedASync = isDefined(messageChannel.syncedAt);

          if (hasAlreadyCompletedASync) {
            return;
          }

          const messageExternalIds =
            await this.recentMessagesService.getExternalIds({
              connectedAccount: messageChannel.connectedAccount,
              messageFolders: messageChannel.messageFolders ?? [],
            });

          if (messageExternalIds.length === 0) {
            return;
          }

          await this.cacheStorage.setAdd(
            `messages-to-import:${workspaceId}:${messageChannel.id}`,
            messageExternalIds,
            RECENT_MESSAGES_IMPORT_CACHE_TTL_MS,
          );

          await this.messageChannelSyncStatusService.markAsMessagesImportScheduled(
            [messageChannel.id],
            workspaceId,
          );

          await this.messagingMessagesImportService.processMessageBatchImport(
            {
              ...messageChannel,
              syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
            },
            messageChannel.connectedAccount,
            workspaceId,
            messageExternalIds.length,
          );

          await this.messageChannelSyncStatusService.markAsMessagesListFetchPending(
            [messageChannel.id],
            workspaceId,
          );

          this.logger.log(
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Imported ${messageExternalIds.length} recent messages`,
          );
        },
        authContext,
        { lite: true },
      );
    } catch (error) {
      this.logger.warn(
        `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Could not import recent messages: ${error.message}`,
      );
    }
  }
}

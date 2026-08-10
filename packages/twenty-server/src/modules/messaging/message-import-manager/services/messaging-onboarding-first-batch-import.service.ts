import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageChannelSyncStage } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MESSAGES_TO_IMPORT_CACHE_TTL_MS } from 'src/modules/messaging/common/constants/messages-to-import-cache-ttl-ms.constant';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { getMessagesToImportCacheKey } from 'src/modules/messaging/common/utils/get-messages-to-import-cache-key.util';
import { type MessagingMessageListFetchJobData } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { MessagingOnboardingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-onboarding-message-list-fetch.job';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { OnboardingFirstMessagesService } from 'src/modules/onboarding-first-messages/services/onboarding-first-messages.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

// Listing a whole mailbox takes a page request per 500 messages, so nothing
// reaches the CRM until that finishes. For a first sync we ask each driver for
// the newest messages only, run them through the regular import so they get the
// same filtering, saving and contact creation as everything else, and only then
// start the full list fetch.
@Injectable()
export class MessagingOnboardingFirstBatchImportService {
  private readonly logger = new Logger(
    MessagingOnboardingFirstBatchImportService.name,
  );

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly onboardingFirstMessagesService: OnboardingFirstMessagesService,
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectMessageQueue(MessageQueue.messagingOnboardingQueue)
    private readonly onboardingQueueService: MessageQueueService,
  ) {}

  async importFirstBatch({
    messageChannelId,
    workspaceId,
  }: {
    messageChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannel = await this.messageChannelRepository.findOne({
          where: { id: messageChannelId, workspaceId },
          relations: { connectedAccount: true, messageFolders: true },
        });

        if (!isDefined(messageChannel) || !messageChannel.isSyncEnabled) {
          return;
        }

        await this.messagingMonitoringService.track({
          eventName: 'onboarding_first_batch_import.started',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccountId,
          messageChannelId: messageChannel.id,
        });

        const messageExternalIds =
          await this.onboardingFirstMessagesService.getFirstMessageExternalIds({
            connectedAccount: messageChannel.connectedAccount,
            messageFolders: messageChannel.messageFolders ?? [],
          });

        if (messageExternalIds.length > 0) {
          await this.cacheStorage.setAdd(
            getMessagesToImportCacheKey({ workspaceId, messageChannelId }),
            messageExternalIds,
            MESSAGES_TO_IMPORT_CACHE_TTL_MS,
          );

          await this.messageChannelSyncStatusService.markAsMessagesImportScheduled(
            [messageChannel.id],
            workspaceId,
          );

          await this.messagingMessagesImportService.processMessageBatchImport({
            messageChannel: {
              ...messageChannel,
              syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
            },
            connectedAccount: messageChannel.connectedAccount,
            workspaceId,
            messagesGetBatchSize: this.twentyConfigService.get(
              'MESSAGING_ONBOARDING_FIRST_MESSAGES_GET_BATCH_SIZE',
            ),
          });

          this.logger.log(
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Imported a first batch of ${messageExternalIds.length} messages`,
          );
        }

        await this.messagingMonitoringService.track({
          eventName: 'onboarding_first_batch_import.completed',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccountId,
          messageChannelId: messageChannel.id,
        });

        await this.startFullMessageListFetch(messageChannel.id, workspaceId);
      },
      authContext,
      { lite: true },
    );
  }

  private async startFullMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelSyncStatusService.markAsMessagesListFetchScheduled(
      [messageChannelId],
      workspaceId,
    );

    await this.onboardingQueueService.add<MessagingMessageListFetchJobData>(
      MessagingOnboardingMessageListFetchJob.name,
      { workspaceId, messageChannelId },
    );
  }
}

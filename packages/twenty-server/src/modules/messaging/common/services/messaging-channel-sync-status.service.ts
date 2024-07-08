import { Injectable } from '@nestjs/common';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class MessagingChannelSyncStatusService {
  constructor(
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  public async scheduleFullMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
      workspaceId,
    );
  }

  public async schedulePartialMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
      workspaceId,
    );
  }

  public async scheduleMessagesImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
      workspaceId,
    );
  }

  public async resetAndScheduleFullMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    await this.messageChannelRepository.resetSyncCursor(
      messageChannelId,
      workspaceId,
    );

    await this.messageChannelRepository.resetSyncStageStartedAt(
      messageChannelId,
      workspaceId,
    );

    await this.messageChannelRepository.resetThrottleFailureCount(
      messageChannelId,
      workspaceId,
    );

    await this.scheduleFullMessageListFetch(messageChannelId, workspaceId);
  }

  public async markAsMessagesListFetchOngoing(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.ONGOING,
      workspaceId,
    );
  }

  public async markAsCompletedAndSchedulePartialMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.COMPLETED,
      workspaceId,
    );

    await this.schedulePartialMessageListFetch(messageChannelId, workspaceId);
  }

  public async markAsMessagesImportOngoing(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
      workspaceId,
    );
  }

  public async markAsFailedUnknownAndFlushMessagesToImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.FAILED,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
      workspaceId,
    );
  }

  public async markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.FAILED,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      workspaceId,
    );
  }
}

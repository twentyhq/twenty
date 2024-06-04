import { Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/common/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingGmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/messaging-gmail-client.provider';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessagingGmailFetchMessageIdsToExcludeService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-fetch-messages-ids-to-exclude.service';
import { MessagingErrorHandlingService } from 'src/modules/messaging/common/services/messaging-error-handling.service';
import { MessagingGmailHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-history.service';

@Injectable()
export class MessagingGmailPartialMessageListFetchService {
  private readonly logger = new Logger(
    MessagingGmailPartialMessageListFetchService.name,
  );

  constructor(
    private readonly gmailClientProvider: MessagingGmailClientProvider,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    private readonly gmailErrorHandlingService: MessagingErrorHandlingService,
    private readonly gmailGetHistoryService: MessagingGmailHistoryService,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
    private readonly gmailFetchMessageIdsToExcludeService: MessagingGmailFetchMessageIdsToExcludeService,
  ) {}

  public async processMessageListFetch(
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingChannelSyncStatusService.markAsMessagesListFetchOngoing(
      messageChannel.id,
      workspaceId,
    );

    const lastSyncHistoryId = messageChannel.syncCursor;

    const gmailClient: gmail_v1.Gmail =
      await this.gmailClientProvider.getGmailClient(
        connectedAccount.refreshToken,
      );

    const { history, historyId, error } =
      await this.gmailGetHistoryService.getHistory(
        gmailClient,
        lastSyncHistoryId,
      );

    if (error) {
      await this.gmailErrorHandlingService.handleGmailError(
        error,
        'partial-message-list-fetch',
        messageChannel,
        workspaceId,
      );

      return;
    }

    await this.messageChannelRepository.resetThrottleFailureCount(
      messageChannel.id,
      workspaceId,
    );

    await this.messageChannelRepository.resetSyncStageStartedAt(
      messageChannel.id,
      workspaceId,
    );

    if (!historyId) {
      throw new Error(
        `No historyId found for ${connectedAccount.id} in workspace ${workspaceId} in gmail history response.`,
      );
    }

    if (historyId === lastSyncHistoryId || !history?.length) {
      this.logger.log(
        `Partial message list import done with history ${historyId} and nothing to update for workspace ${workspaceId} and account ${connectedAccount.id}`,
      );

      await this.messagingChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
        messageChannel.id,
        workspaceId,
      );

      return;
    }

    const { messagesAdded, messagesDeleted } =
      await this.gmailGetHistoryService.getMessageIdsFromHistory(history);

    let messageIdsToFilter: string[] = [];

    try {
      messageIdsToFilter =
        await this.gmailFetchMessageIdsToExcludeService.fetchEmailIdsToExcludeOrThrow(
          gmailClient,
          lastSyncHistoryId,
        );
    } catch (error) {
      await this.gmailErrorHandlingService.handleGmailError(
        error,
        'partial-message-list-fetch',
        messageChannel,
        workspaceId,
      );

      return;
    }

    const messagesAddedFiltered = messagesAdded.filter(
      (messageId) => !messageIdsToFilter.includes(messageId),
    );

    await this.cacheStorage.setAdd(
      `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
      messagesAddedFiltered,
    );

    this.logger.log(
      `Added ${messagesAddedFiltered.length} messages to import for workspace ${workspaceId} and account ${connectedAccount.id}`,
    );

    await this.messageChannelMessageAssociationRepository.deleteByMessageExternalIdsAndMessageChannelId(
      messagesDeleted,
      messageChannel.id,
      workspaceId,
    );

    this.logger.log(
      `Deleted ${messagesDeleted.length} messages for workspace ${workspaceId} and account ${connectedAccount.id}`,
    );

    await this.messageChannelRepository.updateLastSyncCursorIfHigher(
      messageChannel.id,
      historyId,
      workspaceId,
    );

    await this.messagingChannelSyncStatusService.scheduleMessagesImport(
      messageChannel.id,
      workspaceId,
    );
  }
}

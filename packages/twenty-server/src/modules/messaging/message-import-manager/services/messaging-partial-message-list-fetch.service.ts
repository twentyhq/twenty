import { Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';
import { Any } from 'typeorm';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingGmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/messaging-gmail-client.provider';
import { MessagingGmailFetchMessageIdsToExcludeService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-fetch-messages-ids-to-exclude.service';
import { MessagingGmailHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-history.service';
import { MessagingErrorHandlingService } from 'src/modules/messaging/message-import-manager/services/messaging-error-handling.service';

@Injectable()
export class MessagingPartialMessageListFetchService {
  private readonly logger = new Logger(
    MessagingPartialMessageListFetchService.name,
  );

  constructor(
    private readonly gmailClientProvider: MessagingGmailClientProvider,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly gmailErrorHandlingService: MessagingErrorHandlingService,
    private readonly gmailGetHistoryService: MessagingGmailHistoryService,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
    private readonly gmailFetchMessageIdsToExcludeService: MessagingGmailFetchMessageIdsToExcludeService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async processMessageListFetch(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingChannelSyncStatusService.markAsMessagesListFetchOngoing(
      messageChannel.id,
      workspaceId,
    );

    const lastSyncHistoryId = messageChannel.syncCursor;

    const gmailClient: gmail_v1.Gmail =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

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

    const messageChannelMessageAssociationRepository =
      await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    await messageChannelMessageAssociationRepository.delete({
      messageChannelId: messageChannel.id,
      messageExternalId: Any(messagesDeleted),
    });

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

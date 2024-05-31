import { Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { GmailGetHistoryService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-get-history.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { GmailErrorHandlingService } from 'src/modules/messaging/services/gmail-error-handling/gmail-error-handling.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/services/message-channel-sync-status/message-channel-sync-status.service';

@Injectable()
export class GmailPartialMessageListFetchV2Service {
  private readonly logger = new Logger(
    GmailPartialMessageListFetchV2Service.name,
  );

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    private readonly gmailErrorHandlingService: GmailErrorHandlingService,
    private readonly gmailGetHistoryService: GmailGetHistoryService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  public async processMessageListFetch(
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsMessagesListFetchOngoing(
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

    if (!historyId) {
      throw new Error(
        `No historyId found for ${connectedAccount.id} in workspace ${workspaceId} in gmail history response.`,
      );
    }

    if (historyId === lastSyncHistoryId || !history?.length) {
      this.logger.log(
        `Partial message list import done with history ${historyId} and nothing to update for workspace ${workspaceId} and account ${connectedAccount.id}`,
      );

      await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
        messageChannel.id,
        workspaceId,
      );

      return;
    }

    const { messagesAdded, messagesDeleted } =
      await this.gmailGetHistoryService.getMessageIdsFromHistory(history);

    await this.cacheStorage.setAdd(
      `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
      messagesAdded,
    );

    this.logger.log(
      `Added ${messagesAdded.length} messages to import for workspace ${workspaceId} and account ${connectedAccount.id}`,
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

    await this.messageChannelSyncStatusService.scheduleMessagesImport(
      messageChannel.id,
      workspaceId,
    );
  }
}

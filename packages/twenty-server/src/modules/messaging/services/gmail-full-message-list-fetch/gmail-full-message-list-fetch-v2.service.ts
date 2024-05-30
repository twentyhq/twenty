import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { gmail_v1 } from 'googleapis';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/constants/gmail-users-messages-list-max-result.constant';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { GmailError } from 'src/modules/messaging/types/gmail-error';
import { GmailErrorHandlingService } from 'src/modules/messaging/services/gmail-error-handling/gmail-error-handling.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/services/message-channel-sync-status/message-channel-sync-status.service';

@Injectable()
export class GmailFullMessageListFetchV2Service {
  private readonly logger = new Logger(GmailFullMessageListFetchV2Service.name);

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
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly gmailErrorHandlingService: GmailErrorHandlingService,
  ) {}

  public async processMessageListFetch(
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ) {
    this.logger.log(
      `Fetching full message list for workspace ${workspaceId} and account ${connectedAccount.id}`,
    );

    await this.messageChannelSyncStatusService.markAsMessagesListFetchOngoing(
      messageChannel.id,
      workspaceId,
    );

    const gmailClient: gmail_v1.Gmail =
      await this.gmailClientProvider.getGmailClient(
        connectedAccount.refreshToken,
      );

    try {
      const { error: gmailError } =
        await this.fetchAllMessageIdsFromGmailAndStoreInCache(
          gmailClient,
          messageChannel.id,
          workspaceId,
        );

      if (gmailError) {
        await this.gmailErrorHandlingService.handleGmailError(
          gmailError,
          'full',
          messageChannel,
          workspaceId,
        );

        return;
      }

      await this.messageChannelSyncStatusService.scheduleMessagesImport(
        messageChannel.id,
        workspaceId,
      );
    } catch (error) {
      await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
        messageChannel.id,
        workspaceId,
      );

      throw new Error(
        `Error fetching messages for ${connectedAccount.id} in workspace ${workspaceId}: ${error.message}`,
      );
    }
  }

  private async fetchAllMessageIdsFromGmailAndStoreInCache(
    gmailClient: gmail_v1.Gmail,
    messageChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<{ error?: GmailError }> {
    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let messageIdsToFetch = 0;
    let firstMessageExternalId;

    while (hasMoreMessages) {
      try {
        const response = await gmailClient.users.messages.list({
          userId: 'me',
          maxResults: GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
        });

        if (response.data?.messages) {
          const messageExternalIds = response.data.messages
            .filter((message): message is { id: string } => message.id != null)
            .map((message) => message.id);

          if (!firstMessageExternalId) {
            firstMessageExternalId = messageExternalIds[0];
          }

          const existingMessageChannelMessageAssociations =
            await this.messageChannelMessageAssociationRepository.getByMessageExternalIdsAndMessageChannelId(
              messageExternalIds,
              messageChannelId,
              workspaceId,
              transactionManager,
            );

          const existingMessageChannelMessageAssociationsExternalIds =
            existingMessageChannelMessageAssociations.map(
              (messageChannelMessageAssociation) =>
                messageChannelMessageAssociation.messageExternalId,
            );

          const messageIdsToImport = messageExternalIds.filter(
            (messageExternalId) =>
              !existingMessageChannelMessageAssociationsExternalIds.includes(
                messageExternalId,
              ),
          );

          if (messageIdsToImport.length) {
            await this.cacheStorage.setAdd(
              `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
              messageIdsToImport,
            );

            messageIdsToFetch += messageIdsToImport.length;
          }
        }

        pageToken = response.data.nextPageToken ?? undefined;
        hasMoreMessages = !!pageToken;
      } catch (error) {
        const gmailError = error?.response?.data?.error;

        if (gmailError) {
          return {
            error: gmailError,
          };
        }

        throw error;
      }
    }

    if (!messageIdsToFetch) {
      this.logger.log(
        `No messages found in Gmail for messageChannel ${messageChannelId} in workspace ${workspaceId}`,
      );

      return {};
    }

    this.logger.log(
      `Fetched all ${messageIdsToFetch} message ids from Gmail for messageChannel ${messageChannelId} in workspace ${workspaceId} and added to cache for import`,
    );

    await this.updateLastSyncCursor(
      gmailClient,
      messageChannelId,
      firstMessageExternalId,
      workspaceId,
      transactionManager,
    );

    return {};
  }

  private async updateLastSyncCursor(
    gmailClient: gmail_v1.Gmail,
    messageChannelId: string,
    firstMessageExternalId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (!firstMessageExternalId) {
      throw new Error(
        `No first message found for workspace ${workspaceId} and account ${messageChannelId}, can't update sync external id`,
      );
    }

    const firstMessageContent = await gmailClient.users.messages.get({
      userId: 'me',
      id: firstMessageExternalId,
    });

    if (!firstMessageContent?.data) {
      throw new Error(
        `No first message content found for message ${firstMessageExternalId} in workspace ${workspaceId}`,
      );
    }

    const historyId = firstMessageContent?.data?.historyId;

    if (!historyId) {
      throw new Error(
        `No historyId found for message ${firstMessageExternalId} in workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Updating last sync cursor: ${historyId} for workspace ${workspaceId} and account ${messageChannelId} succeeded.`,
    );

    await this.messageChannelRepository.updateLastSyncCursorIfHigher(
      messageChannelId,
      historyId,
      workspaceId,
      transactionManager,
    );
  }
}

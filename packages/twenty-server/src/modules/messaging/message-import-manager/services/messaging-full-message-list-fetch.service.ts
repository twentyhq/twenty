import { Injectable, Logger } from '@nestjs/common';

import { GaxiosResponse } from 'gaxios';
import { gmail_v1 } from 'googleapis';
import { Any, EntityManager } from 'typeorm';

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
import { MESSAGING_GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-categories';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { MessagingGmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/messaging-gmail-client.provider';
import { computeGmailCategoryExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-excude-search-filter';
import {
  GmailError,
  MessagingErrorHandlingService,
} from 'src/modules/messaging/message-import-manager/services/messaging-error-handling.service';

@Injectable()
export class MessagingFullMessageListFetchService {
  private readonly logger = new Logger(
    MessagingFullMessageListFetchService.name,
  );

  constructor(
    private readonly gmailClientProvider: MessagingGmailClientProvider,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
    private readonly gmailErrorHandlingService: MessagingErrorHandlingService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async processMessageListFetch(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    await this.messagingChannelSyncStatusService.markAsMessagesListFetchOngoing(
      messageChannel.id,
      workspaceId,
    );

    const gmailClient: gmail_v1.Gmail =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    const { error: gmailError } = await this.fetchAllMessageIdsAndStoreInCache(
      gmailClient,
      messageChannel.id,
      workspaceId,
    );

    if (gmailError) {
      await this.gmailErrorHandlingService.handleGmailError(
        gmailError,
        'full-message-list-fetch',
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

    await this.messagingChannelSyncStatusService.scheduleMessagesImport(
      messageChannel.id,
      workspaceId,
    );
  }

  private async fetchAllMessageIdsAndStoreInCache(
    gmailClient: gmail_v1.Gmail,
    messageChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<{ error?: GmailError }> {
    let pageToken: string | undefined;
    let fetchedMessageIdsCount = 0;
    let hasMoreMessages = true;
    let firstMessageExternalId: string | undefined;
    let response: GaxiosResponse<gmail_v1.Schema$ListMessagesResponse>;

    while (hasMoreMessages) {
      try {
        response = await gmailClient.users.messages.list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
          q: computeGmailCategoryExcludeSearchFilter(
            MESSAGING_GMAIL_EXCLUDED_CATEGORIES,
          ),
        });
      } catch (error) {
        return {
          error: {
            code: error.response?.status,
            reason: error.response?.data?.error,
          },
        };
      }

      if (response.data?.messages) {
        const messageExternalIds = response.data.messages
          .filter((message): message is { id: string } => message.id != null)
          .map((message) => message.id);

        if (!firstMessageExternalId) {
          firstMessageExternalId = messageExternalIds[0];
        }

        const messageChannelMessageAssociationRepository =
          await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
          );

        const existingMessageChannelMessageAssociations =
          await messageChannelMessageAssociationRepository.find(
            {
              where: {
                messageChannelId,
                messageExternalId: Any(messageExternalIds),
              },
            },
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
        }

        fetchedMessageIdsCount += messageExternalIds.length;
      }

      pageToken = response.data.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;
    }

    this.logger.log(
      `Added ${fetchedMessageIdsCount} messages ids from Gmail for messageChannel ${messageChannelId} in workspace ${workspaceId} and added to cache for import`,
    );

    if (!firstMessageExternalId) {
      throw new Error(
        `No first message found for workspace ${workspaceId} and account ${messageChannelId}, can't update sync external id`,
      );
    }

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

    await this.messageChannelRepository.updateLastSyncCursorIfHigher(
      messageChannelId,
      historyId,
      workspaceId,
      transactionManager,
    );
  }
}

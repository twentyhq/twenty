import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { gmail_v1 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/common/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  GmailError,
  MessagingErrorHandlingService,
} from 'src/modules/messaging/common/services/messaging-error-handling.service';
import { computeGmailCategoryExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-excude-search-filter';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessagingGmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/messaging-gmail-client.provider';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { MESSAGING_GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-categories';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';

@Injectable()
export class MessagingGmailFullMessageListFetchService {
  private readonly logger = new Logger(
    MessagingGmailFullMessageListFetchService.name,
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
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
    private readonly gmailErrorHandlingService: MessagingErrorHandlingService,
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
  ) {}

  public async processMessageListFetch(
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ) {
    await this.messagingChannelSyncStatusService.markAsMessagesListFetchOngoing(
      messageChannel.id,
      workspaceId,
    );

    await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
      workspaceId,
      connectedAccount.id,
    );

    const refreshedConnectedAccount =
      await this.connectedAccountRepository.getById(
        connectedAccount.id,
        workspaceId,
      );

    if (!refreshedConnectedAccount) {
      throw new Error(
        `Connected account ${connectedAccount.id} not found in workspace ${workspaceId}`,
      );
    }

    const gmailClient: gmail_v1.Gmail =
      await this.gmailClientProvider.getGmailClient(
        refreshedConnectedAccount.refreshToken,
      );

    const { error: gmailError } =
      await this.fetchAllMessageIdsFromGmailAndStoreInCache(
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

  private async fetchAllMessageIdsFromGmailAndStoreInCache(
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

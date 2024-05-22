import { Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelSyncStatus,
  MessageChannelSyncSubStatus,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { GMAIL_USERS_HISTORY_MAX_RESULT } from 'src/modules/messaging/constants/gmail-users-history-max-result.constant';
import { GmailError } from 'src/modules/messaging/types/gmail-error';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { GmailPartialMessageListFetchErrorHandlingService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch-error-handling.service';

@Injectable()
export class GmailPartialMessageListFetchV2Service {
  private readonly logger = new Logger(
    GmailPartialMessageListFetchV2Service.name,
  );

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    private readonly gmailPartialMessageListFetchErrorHandlingService: GmailPartialMessageListFetchErrorHandlingService,
  ) {}

  public async processMessageListFetch(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      this.logger.error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const gmailMessageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!gmailMessageChannel) {
      this.logger.error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );

      return;
    }

    if (
      gmailMessageChannel.syncSubStatus !==
      MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING
    ) {
      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} is locked, import will be retried later.`,
      );

      return;
    }

    await this.messageChannelRepository.updateSyncSubStatus(
      gmailMessageChannel.id,
      MessageChannelSyncSubStatus.MESSAGES_LIST_FETCH_ONGOING,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      gmailMessageChannel.id,
      MessageChannelSyncStatus.ONGOING,
      workspaceId,
    );

    const lastSyncHistoryId = gmailMessageChannel.syncCursor;

    if (!lastSyncHistoryId) {
      this.logger.log(
        `No lastSyncHistoryId for workspace ${workspaceId} and account ${connectedAccountId}, falling back to full sync.`,
      );

      await this.messageChannelRepository.updateSyncSubStatus(
        gmailMessageChannel.id,
        MessageChannelSyncSubStatus.MESSAGES_LIST_FETCH_ONGOING,
        workspaceId,
      );

      await this.messageChannelRepository.updateSyncSubStatus(
        gmailMessageChannel.id,
        MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING,
        workspaceId,
      );

      return;
    }

    const gmailClient: gmail_v1.Gmail =
      await this.gmailClientProvider.getGmailClient(refreshToken);

    const { history, historyId, error } = await this.getHistoryFromGmail(
      gmailClient,
      lastSyncHistoryId,
    );

    if (error) {
      await this.gmailPartialMessageListFetchErrorHandlingService.handleGmailError(
        error,
        gmailMessageChannel,
        workspaceId,
        connectedAccountId,
      );

      return;
    }

    if (!historyId) {
      throw new Error(
        `No historyId found for ${connectedAccountId} in workspace ${workspaceId} in gmail history response.`,
      );
    }

    if (historyId === lastSyncHistoryId || !history?.length) {
      this.logger.log(
        `Messaging import done with history ${historyId} and nothing to update for workspace ${workspaceId} and account ${connectedAccountId}`,
      );

      await this.messageChannelRepository.updateSyncSubStatus(
        gmailMessageChannel.id,
        MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
        workspaceId,
      );

      await this.messageChannelRepository.updateSyncStatus(
        gmailMessageChannel.id,
        MessageChannelSyncStatus.COMPLETED,
        workspaceId,
      );

      return;
    }

    const { messagesAdded, messagesDeleted } =
      await this.getMessageIdsFromHistory(history);

    await this.cacheStorage.setAdd(
      `messages-to-import:${workspaceId}:gmail:${gmailMessageChannel.id}`,
      messagesAdded,
    );

    this.logger.log(
      `Added ${messagesAdded.length} messages to import for workspace ${workspaceId} and account ${connectedAccountId}`,
    );

    await this.messageChannelMessageAssociationRepository.deleteByMessageExternalIdsAndMessageChannelId(
      messagesDeleted,
      gmailMessageChannel.id,
      workspaceId,
    );

    this.logger.log(
      `Deleted ${messagesDeleted.length} messages for workspace ${workspaceId} and account ${connectedAccountId}`,
    );

    await this.messageChannelRepository.updateLastSyncCursorIfHigher(
      gmailMessageChannel.id,
      historyId,
      workspaceId,
    );

    this.logger.log(
      `Updated lastSyncCursor to ${historyId} for workspace ${workspaceId} and account ${connectedAccountId}`,
    );

    this.logger.log(
      `gmail partial-sync done for workspace ${workspaceId} and account ${connectedAccountId}`,
    );

    await this.messageChannelRepository.updateSyncSubStatus(
      gmailMessageChannel.id,
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_PENDING,
      workspaceId,
    );
  }

  private async getMessageIdsFromHistory(
    history: gmail_v1.Schema$History[],
  ): Promise<{
    messagesAdded: string[];
    messagesDeleted: string[];
  }> {
    const { messagesAdded, messagesDeleted } = history.reduce(
      (
        acc: {
          messagesAdded: string[];
          messagesDeleted: string[];
        },
        history,
      ) => {
        const messagesAdded = history.messagesAdded?.map(
          (messageAdded) => messageAdded.message?.id || '',
        );

        const messagesDeleted = history.messagesDeleted?.map(
          (messageDeleted) => messageDeleted.message?.id || '',
        );

        if (messagesAdded) acc.messagesAdded.push(...messagesAdded);
        if (messagesDeleted) acc.messagesDeleted.push(...messagesDeleted);

        return acc;
      },
      { messagesAdded: [], messagesDeleted: [] },
    );

    const uniqueMessagesAdded = messagesAdded.filter(
      (messageId) => !messagesDeleted.includes(messageId),
    );

    const uniqueMessagesDeleted = messagesDeleted.filter(
      (messageId) => !messagesAdded.includes(messageId),
    );

    return {
      messagesAdded: uniqueMessagesAdded,
      messagesDeleted: uniqueMessagesDeleted,
    };
  }

  private async getHistoryFromGmail(
    gmailClient: gmail_v1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<{
    history: gmail_v1.Schema$History[];
    historyId?: string | null;
    error?: GmailError;
  }> {
    const fullHistory: gmail_v1.Schema$History[] = [];
    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let nextHistoryId: string | undefined;

    while (hasMoreMessages) {
      try {
        const response = await gmailClient.users.history.list({
          userId: 'me',
          maxResults: GMAIL_USERS_HISTORY_MAX_RESULT,
          pageToken,
          startHistoryId: lastSyncHistoryId,
          historyTypes: ['messageAdded', 'messageDeleted'],
        });

        nextHistoryId = response?.data?.historyId ?? undefined;

        if (response?.data?.history) {
          fullHistory.push(...response.data.history);
        }

        pageToken = response?.data?.nextPageToken ?? undefined;
        hasMoreMessages = !!pageToken;
      } catch (error) {
        const errorData = error?.response?.data?.error;

        if (errorData) {
          return {
            history: [],
            error: errorData,
            historyId: lastSyncHistoryId,
          };
        }

        throw error;
      }
    }

    return { history: fullHistory, historyId: nextHistoryId };
  }
}

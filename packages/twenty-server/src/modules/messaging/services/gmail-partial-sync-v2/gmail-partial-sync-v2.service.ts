import { Inject, Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';
import { EntityManager } from 'typeorm';

import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import {
  GmailFullSyncJob,
  GmailFullSyncJobData,
} from 'src/modules/messaging/jobs/gmail-full-sync.job';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import {
  MessageChannelObjectMetadata,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { GMAIL_USERS_HISTORY_MAX_RESULT } from 'src/modules/messaging/constants/gmail-users-history-max-result.constant';
import { GmailError } from 'src/modules/messaging/types/gmail-error';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class GmailPartialSyncV2Service {
  private readonly logger = new Logger(GmailPartialSyncV2Service.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      this.logger.error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId} during partial-sync`,
      );

      return;
    }

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId} during partial-sync`,
      );
    }

    const gmailMessageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!gmailMessageChannel) {
      this.logger.error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId} during full-syn`,
      );

      return;
    }

    if (gmailMessageChannel.syncStatus !== MessageChannelSyncStatus.PENDING) {
      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} is not pending, partial sync will be retried later.`,
      );

      return;
    }

    await this.messageChannelRepository.updateSyncStatus(
      gmailMessageChannel.id,
      MessageChannelSyncStatus.ONGOING,
      workspaceId,
    );

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource
      ?.transaction(async (transactionManager: EntityManager) => {
        const lastSyncHistoryId = gmailMessageChannel.syncExternalId;

        if (!lastSyncHistoryId) {
          this.logger.log(
            `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}: no lastSyncHistoryId, falling back to full sync.`,
          );

          await this.fallbackToFullSync(workspaceId, connectedAccountId);

          return;
        }

        const gmailClient: gmail_v1.Gmail =
          await this.gmailClientProvider.getGmailClient(refreshToken);

        const { history, historyId, error } = await this.getHistoryFromGmail(
          gmailClient,
          lastSyncHistoryId,
        );

        if (error?.code === 404) {
          this.logger.log(
            `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}: invalid lastSyncHistoryId, falling back to full sync.`,
          );

          await this.messageChannelRepository.resetSyncExternalId(
            gmailMessageChannel.id,
            workspaceId,
            transactionManager,
          );

          await this.fallbackToFullSync(workspaceId, connectedAccountId);

          return;
        }

        if (error?.code === 429) {
          this.logger.log(
            `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}: Error 429: ${error.message}, partial sync will be retried later.`,
          );

          return;
        }

        if (error) {
          throw new Error(
            `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId} during partial-sync: ${error.message}`,
          );
        }

        if (!historyId) {
          throw new Error(
            `No historyId found for ${connectedAccountId} in workspace ${workspaceId} during partial-sync`,
          );
        }

        if (historyId === lastSyncHistoryId || !history?.length) {
          this.logger.log(
            `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to update.`,
          );

          return;
        }

        const { messagesAdded, messagesDeleted } =
          await this.getMessageIdsFromHistory(history);

        await this.cacheStorage.setAdd(
          `messages-to-import:${workspaceId}:gmail:${gmailMessageChannel.id}`,
          messagesAdded,
        );

        await this.cacheStorage.setAdd(
          `messages-to-delete:${workspaceId}:gmail:${gmailMessageChannel.id}`,
          messagesDeleted,
        );

        await this.messageChannelRepository.updateLastSyncExternalIdIfHigher(
          gmailMessageChannel.id,
          historyId,
          workspaceId,
          transactionManager,
        );

        await this.messageChannelRepository.updateSyncStatus(
          gmailMessageChannel.id,
          MessageChannelSyncStatus.PENDING,
          workspaceId,
          transactionManager,
        );
      })
      .catch(async (error) => {
        await this.messageChannelRepository.updateSyncStatus(
          gmailMessageChannel.id,
          MessageChannelSyncStatus.FAILED,
          workspaceId,
        );

        this.logger.error(
          `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId} during partial-sync: ${error.message}`,
        );
      })
      .finally(async () => {
        await this.messageChannelRepository.updateSyncStatus(
          gmailMessageChannel.id,
          MessageChannelSyncStatus.SUCCEEDED,
          workspaceId,
        );
      });
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
          return { history: [], error: errorData };
        }

        throw error;
      }
    }

    return { history: fullHistory, historyId: nextHistoryId };
  }

  private async fallbackToFullSync(
    workspaceId: string,
    connectedAccountId: string,
  ) {
    await this.messageQueueService.add<GmailFullSyncJobData>(
      GmailFullSyncJob.name,
      { workspaceId, connectedAccountId },
      {
        retryLimit: 2,
      },
    );
  }
}

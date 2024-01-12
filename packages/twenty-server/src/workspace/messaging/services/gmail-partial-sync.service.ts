import { Inject, Injectable } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { MessagingUtilsService } from 'src/workspace/messaging/services/messaging-utils.service';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import {
  GmailFullSyncJob,
  GmailFullSyncJobData,
} from 'src/workspace/messaging/jobs/gmail-full-sync.job';

@Injectable()
export class GmailPartialSyncService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    private readonly utils: MessagingUtilsService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  private async getHistory(
    workspaceId: string,
    connectedAccountId: string,
    lastSyncHistoryId: string,
    maxResults: number,
  ) {
    const { connectedAccount } =
      await this.utils.getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
        workspaceId,
        connectedAccountId,
      );

    const gmailClient = await this.gmailClientProvider.getGmailClient(
      connectedAccount.refreshToken,
    );

    const history = await gmailClient.users.history.list({
      userId: 'me',
      startHistoryId: lastSyncHistoryId,
      historyTypes: ['messageAdded', 'messageDeleted'],
      maxResults,
    });

    return history.data;
  }

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
    maxResults = 500,
  ): Promise<void> {
    const { workspaceDataSource, dataSourceMetadata, connectedAccount } =
      await this.utils.getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
        workspaceId,
        connectedAccountId,
      );

    const lastSyncHistoryId = connectedAccount.lastSyncHistoryId;

    if (!lastSyncHistoryId) {
      // Fall back to full sync

      await this.messageQueueService.add<GmailFullSyncJobData>(
        GmailFullSyncJob.name,
        { workspaceId, connectedAccountId },
        {
          id: `${workspaceId}-${connectedAccount.id}`,
          retryLimit: 2,
        },
      );

      return;
    }

    const accessToken = connectedAccount.accessToken;
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const history = await this.getHistory(
      workspaceId,
      connectedAccountId,
      lastSyncHistoryId,
      maxResults,
    );

    const historyId = history.historyId;

    if (!historyId) {
      throw new Error('No history id found');
    }

    if (historyId === lastSyncHistoryId) {
      return;
    }

    if (!history.history) {
      await this.utils.saveLastSyncHistoryId(
        historyId,
        connectedAccountId,
        dataSourceMetadata,
        workspaceDataSource,
      );

      return;
    }

    const { messagesAdded, messagesDeleted } =
      await this.getMessageIdsAndThreadIdsFromHistory(history);

    const {
      savedMessageIds: messagesAddedAlreadySaved,
      savedThreadIds: threadsAddedAlreadySaved,
    } = await this.utils.getSavedMessageIdsAndThreadIds(
      messagesAdded,
      connectedAccountId,
      dataSourceMetadata,
      workspaceDataSource,
    );

    const messageExternalIdsToSave = messagesAdded.filter(
      (messageId) =>
        !messagesAddedAlreadySaved.includes(messageId) &&
        !messagesDeleted.includes(messageId),
    );

    const { savedMessageIds: messagesDeletedAlreadySaved } =
      await this.utils.getSavedMessageIdsAndThreadIds(
        messagesDeleted,
        connectedAccountId,
        dataSourceMetadata,
        workspaceDataSource,
      );

    const messageExternalIdsToDelete = messagesDeleted.filter((messageId) =>
      messagesDeletedAlreadySaved.includes(messageId),
    );

    const messageQueries = this.utils.createQueriesFromMessageIds(
      messageExternalIdsToSave,
    );

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    const threads = this.utils.getThreadsFromMessages(messagesToSave);

    const threadsToSave = threads.filter(
      (thread) => !threadsAddedAlreadySaved.includes(thread.id),
    );

    await this.utils.saveMessageThreads(
      threadsToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount.id,
    );

    await this.utils.saveMessages(
      messagesToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
    );

    await this.utils.deleteMessages(
      messageExternalIdsToDelete,
      dataSourceMetadata,
      workspaceDataSource,
    );

    await this.utils.deleteEmptyThreads(
      messagesDeleted,
      connectedAccountId,
      dataSourceMetadata,
      workspaceDataSource,
    );

    if (errors.length) throw new Error('Error fetching messages');

    await this.utils.saveLastSyncHistoryId(
      historyId,
      connectedAccount.id,
      dataSourceMetadata,
      workspaceDataSource,
    );
  }

  private async getMessageIdsAndThreadIdsFromHistory(
    history: gmail_v1.Schema$ListHistoryResponse,
  ): Promise<{
    messagesAdded: string[];
    messagesDeleted: string[];
  }> {
    if (!history.history) throw new Error('No history found');

    const { messagesAdded, messagesDeleted } = history.history.reduce(
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

    return {
      messagesAdded,
      messagesDeleted,
    };
  }
}

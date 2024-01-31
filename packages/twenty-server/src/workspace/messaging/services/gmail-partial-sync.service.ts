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
import { ConnectedAccountService } from 'src/workspace/messaging/connected-account/connected-account.service';
import { MessageChannelService } from 'src/workspace/messaging/message-channel/message-channel.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';

@Injectable()
export class GmailPartialSyncService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    private readonly utils: MessagingUtilsService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly messageChannelService: MessageChannelService,
  ) {}

  private async getHistoryFromGmail(
    workspaceId: string,
    connectedAccountId: string,
    lastSyncHistoryId: string,
    maxResults: number,
  ) {
    const connectedAccount = await this.connectedAccountService.getByIdOrFail(
      connectedAccountId,
      workspaceId,
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
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    const connectedAccount = await this.connectedAccountService.getByIdOrFail(
      connectedAccountId,
      workspaceId,
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

    const history = await this.getHistoryFromGmail(
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
      await this.connectedAccountService.saveLastSyncHistoryId(
        historyId,
        connectedAccountId,
        workspaceId,
      );

      return;
    }

    const gmailMessageChannel =
      await this.messageChannelService.getFirstByConnectedAccountIdOrFail(
        workspaceId,
        connectedAccountId,
      );

    const gmailMessageChannelId = gmailMessageChannel.id;

    const { messagesAdded, messagesDeleted } =
      await this.getMessageIdsFromHistory(history);

    const messageQueries =
      this.utils.createQueriesFromMessageIds(messagesAdded);

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    await this.utils.saveMessages(
      messagesToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
      gmailMessageChannelId,
      workspaceId,
    );

    await this.utils.deleteMessages(
      messagesDeleted,
      gmailMessageChannelId,
      workspaceId,
    );

    if (errors.length) throw new Error('Error fetching messages');

    await this.connectedAccountService.saveLastSyncHistoryId(
      historyId,
      connectedAccount.id,
      workspaceId,
    );
  }

  private async getMessageIdsFromHistory(
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
}

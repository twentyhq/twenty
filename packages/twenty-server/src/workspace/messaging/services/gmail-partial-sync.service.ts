import { Injectable } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { Utils } from 'src/workspace/messaging/services/utils.service';
import { MessagingProducer } from 'src/workspace/messaging/producers/messaging-producer';

@Injectable()
export class GmailPartialSync {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchBatchMessagesService: FetchBatchMessagesService,
    private readonly utils: Utils,
    private readonly messagingProducer: MessagingProducer,
  ) {}

  private async getLastSyncHistoryId(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<string> {
    const { connectedAccount } =
      await this.utils.getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
        workspaceId,
        connectedAccountId,
      );

    if (!connectedAccount) {
      throw new Error('No connected account found');
    }

    const lastSyncHistoryId = connectedAccount.lastSyncHistoryId;

    if (!lastSyncHistoryId) {
      // Fall back to full sync
      await this.messagingProducer.enqueueFetchAllMessagesFromConnectedAccount(
        { workspaceId, connectedAccountId: connectedAccountId },
        `${workspaceId}-${connectedAccount.id}`,
      );
    }

    return lastSyncHistoryId;
  }

  private async getHistory(
    workspaceId: string,
    connectedAccountId: string,
    lastSyncHistoryId: string,
  ) {
    const { connectedAccount } =
      await this.utils.getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
        workspaceId,
        connectedAccountId,
      );

    if (!connectedAccount) {
      throw new Error('No connected account found');
    }

    const gmailClient = await this.gmailClientProvider.getGmailClient(
      connectedAccount.refreshToken,
    );

    const history = await gmailClient.users.history.list({
      userId: 'me',
      startHistoryId: lastSyncHistoryId,
      historyTypes: ['messageAdded', 'messageDeleted'],
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

    const accessToken = connectedAccount.accessToken;
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const gmailClient =
      await this.gmailClientProvider.getGmailClient(refreshToken);

    const history = await this.getHistory(
      workspaceId,
      connectedAccountId,
      connectedAccount.lastSyncHistoryId,
    );

    const { messagesAdded, messagesDeleted } =
      await this.getMessageIdsAndThreadIdsFromHistory(history);

    const messageIds = messagesAdded?.map((message) => message.messageId) || [];
    const threadIds = messagesAdded?.map((message) => message.threadId) || [];
  }

  private async getMessageIdsAndThreadIdsFromHistory(
    history: gmail_v1.Schema$ListHistoryResponse,
  ): Promise<{
    messagesAdded: { messageId: string; threadId: string }[] | undefined;
    messagesDeleted: { messageId: string; threadId: string }[] | undefined;
  }> {
    if (!history.history) throw new Error('No history found');

    const { messagesAdded, messagesDeleted } = history.history.reduce(
      (
        acc: {
          messagesAdded: { messageId: string; threadId: string }[];
          messagesDeleted: { messageId: string; threadId: string }[];
        },
        history,
      ) => {
        const messagesAdded = history.messagesAdded?.map((messageAdded) => ({
          messageId: messageAdded.message?.id || '',
          threadId: messageAdded.message?.threadId || '',
        }));

        const messagesDeleted = history.messagesDeleted?.map(
          (messageDeleted) => ({
            messageId: messageDeleted.message?.id || '',
            threadId: messageDeleted.message?.threadId || '',
          }),
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

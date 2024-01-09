import { Injectable } from '@nestjs/common';

import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { MessageOrThreadQuery } from 'src/workspace/messaging/types/messageOrThreadQuery';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { Utils } from 'src/workspace/messaging/services/utils.service';

@Injectable()
export class GmailFullSync {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchBatchMessagesService: FetchBatchMessagesService,
    private readonly utils: Utils,
  ) {}

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

    const threads = await gmailClient.users.threads.list({
      userId: 'me',
      maxResults,
    });

    const threadsData = threads.data.threads;

    if (!threadsData || threadsData?.length === 0) {
      return;
    }

    const { savedMessageIds, savedThreadIds } =
      await this.utils.getAllSavedMessagesIdsAndMessageThreadsIdsForConnectedAccount(
        dataSourceMetadata,
        workspaceDataSource,
        connectedAccount.id,
      );

    const threadsToSave = threadsData.filter(
      (thread) => thread.id && !savedThreadIds.includes(thread.id),
    );

    await this.utils.saveMessageThreads(
      threadsToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount.id,
    );

    const threadQueries: MessageOrThreadQuery[] = threadsData.map((thread) => ({
      uri: '/gmail/v1/users/me/threads/' + thread.id + '?format=minimal',
    }));

    const threadsWithMessageIds =
      await this.fetchBatchMessagesService.fetchAllThreads(
        threadQueries,
        accessToken,
      );

    const messageIds = threadsWithMessageIds
      .map((thread) => thread.messageIds)
      .flat();

    const messageIdsToSave = messageIds.filter(
      (messageId) => !savedMessageIds.includes(messageId),
    );

    const messageQueries: MessageOrThreadQuery[] = messageIdsToSave.map(
      (messageId) => ({
        uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
      }),
    );

    const messagesResponse =
      await this.fetchBatchMessagesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    await this.utils.saveMessages(
      messagesResponse,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
    );
  }
}

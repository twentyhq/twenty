import { Injectable } from '@nestjs/common';

import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { MessageOrThreadQuery } from 'src/workspace/messaging/types/messageOrThreadQuery';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { Utils } from 'src/workspace/messaging/services/utils.service';

@Injectable()
export class GmailFullSyncService {
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

    const messages = await gmailClient.users.messages.list({
      userId: 'me',
      maxResults,
    });

    const messagesData = messages.data.messages;

    const messageIdsFromGmail = messagesData
      ? messagesData.map((message) => message.id || '')
      : [];

    if (!messagesData || messagesData?.length === 0) {
      return;
    }

    const { savedMessageIds, savedThreadIds } =
      await this.utils.getSavedMessageIdsAndThreadIds(
        messageIdsFromGmail,
        dataSourceMetadata,
        workspaceDataSource,
        connectedAccount.id,
      );

    const messageIdsToSave = messageIdsFromGmail.filter(
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

    const threadIdsFromGmail = messagesResponse.map(
      (message) => message.messageThreadId,
    );

    const threadIdsToSave = threadIdsFromGmail.filter(
      (threadId) => !savedThreadIds.includes(threadId),
    );

    const threadQueries: MessageOrThreadQuery[] = threadIdsToSave.map(
      (threadId) => ({
        uri: '/gmail/v1/users/me/threads/' + threadId + '?format=full',
      }),
    );

    const threads = await this.fetchBatchMessagesService.fetchAllThreads(
      threadQueries,
      accessToken,
    );

    await this.utils.saveMessageThreads(
      threads,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount.id,
    );

    await this.utils.saveMessages(
      messagesResponse,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
    );
  }
}

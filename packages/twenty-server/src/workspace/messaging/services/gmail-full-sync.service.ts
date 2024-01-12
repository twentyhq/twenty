import { Injectable } from '@nestjs/common';

import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { MessagingUtilsService } from 'src/workspace/messaging/services/messaging-utils.service';

@Injectable()
export class GmailFullSyncService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    private readonly utils: MessagingUtilsService,
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

    const messageExternalIds = messagesData
      ? messagesData.map((message) => message.id || '')
      : [];

    if (!messagesData || messagesData?.length === 0) {
      return;
    }

    const { savedMessageIds, savedThreadIds } =
      await this.utils.getSavedMessageIdsAndThreadIds(
        messageExternalIds,
        connectedAccountId,
        dataSourceMetadata,
        workspaceDataSource,
      );

    const messageIdsToSave = messageExternalIds.filter(
      (messageId) => !savedMessageIds.includes(messageId),
    );

    const messageQueries =
      this.utils.createQueriesFromMessageIds(messageIdsToSave);

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    const threads = this.utils.getThreadsFromMessages(messagesToSave);

    const threadsToSave = threads.filter(
      (threadId) => !savedThreadIds.includes(threadId.id),
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

    if (errors.length) throw new Error('Error fetching messages');

    if (messagesToSave.length === 0) {
      return;
    }

    const lastModifiedMessageId = messagesData[0].id;

    const historyId = messagesToSave.find(
      (message) => message.externalId === lastModifiedMessageId,
    )?.historyId;

    if (!historyId) throw new Error('No history id found');

    await this.utils.saveLastSyncHistoryId(
      historyId,
      connectedAccount.id,
      dataSourceMetadata,
      workspaceDataSource,
    );
  }
}

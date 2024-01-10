import { Injectable } from '@nestjs/common';

import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { MessageQuery } from 'src/workspace/messaging/types/messageOrThreadQuery';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { Utils } from 'src/workspace/messaging/services/utils.service';
import { GmailThread } from 'src/workspace/messaging/types/gmailThread';

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

    const messageQueries: MessageQuery[] = messageIdsToSave.map(
      (messageId) => ({
        uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
      }),
    );

    const messagesToSave =
      await this.fetchBatchMessagesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    const threadIdsFromGmail = messagesToSave.reduce((acc, message) => {
      if (message.externalId === message.messageThreadId) {
        acc.push({ id: message.messageThreadId, subject: message.subject });
      }

      return acc;
    }, [] as GmailThread[]);

    const threadsToSave = threadIdsFromGmail.filter(
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
  }
}

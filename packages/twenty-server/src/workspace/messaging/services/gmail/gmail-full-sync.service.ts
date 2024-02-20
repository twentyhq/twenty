import { Inject, Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { GmailClientProvider } from 'src/workspace/messaging/services/providers/gmail/gmail-client.provider';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import {
  GmailFullSyncSubJob,
  GmailFullSyncSubJobData,
} from 'src/workspace/messaging/jobs/gmail-full-sync/gmail-full-sync-sub.job';

@Injectable()
export class GmailFullSyncService {
  private readonly logger = new Logger(GmailFullSyncService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly messageChannelService: MessageChannelService,
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
  ) {}

  public async getAllMessagesToFetch(
    gmailClient: gmail_v1.Gmail,
  ): Promise<string[]> {
    const messages = await gmailClient.users.messages.list({
      userId: 'me',
      maxResults: 500,
    });

    const messagesData = messages.data.messages;

    if (!messagesData) {
      throw new Error('Error fetching first page');
    }

    let nextPageToken = messages.data.nextPageToken;

    while (nextPageToken) {
      const nextPageMessages = await gmailClient.users.messages.list({
        userId: 'me',
        maxResults: 500,
        pageToken: nextPageToken,
      });

      const nextPageMessagesData = nextPageMessages.data.messages;

      if (!nextPageMessagesData) {
        throw new Error('Error fetching page ${nextPageToken}');
      }

      messagesData.push(...nextPageMessagesData);

      nextPageToken = nextPageMessages.data.nextPageToken;
    }

    return messagesData ? messagesData.map((message) => message.id || '') : [];
  }

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountService.getByIdOrFail(
      connectedAccountId,
      workspaceId,
    );

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    await this.connectedAccountService.deleteHistoryId(
      connectedAccountId,
      workspaceId,
    );

    const messageChannel =
      await this.messageChannelService.getFirstByConnectedAccountIdOrFail(
        connectedAccountId,
        workspaceId,
      );

    const messageChannelId = messageChannel.id;

    const gmailClient =
      await this.gmailClientProvider.getGmailClient(refreshToken);

    const messageExternalIds = await this.getAllMessagesToFetch(gmailClient);

    if (!messageExternalIds || messageExternalIds?.length === 0) {
      return;
    }

    const existingMessageChannelMessageAssociations =
      await this.messageChannelMessageAssociationService.getByMessageExternalIdsAndMessageChannelId(
        messageExternalIds,
        messageChannelId,
        workspaceId,
      );

    const existingMessageChannelMessageAssociationsExternalIds =
      existingMessageChannelMessageAssociations.map(
        (messageChannelMessageAssociation) =>
          messageChannelMessageAssociation.messageExternalId,
      );

    const messagesToFetch = messageExternalIds.filter(
      (messageExternalId) =>
        !existingMessageChannelMessageAssociationsExternalIds.includes(
          messageExternalId,
        ),
    );

    if (messagesToFetch.length === 0) {
      this.logger.log(
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    const numberOfPages = Math.ceil(messagesToFetch.length / 500);

    for (let i = 0; i < numberOfPages; i++) {
      const messages = messagesToFetch.slice(i * 500, (i + 1) * 500);

      await this.messageQueueService.add<GmailFullSyncSubJobData>(
        GmailFullSyncSubJob.name,
        {
          pageNumber: i + 1,
          lastPageNumber: numberOfPages,
          messagesToFetch: messages,
          accessToken: connectedAccount.accessToken,
          workspaceId,
          connectedAccount,
          messageChannelId,
        },
        {
          retryLimit: 2,
        },
      );
    }
  }
}

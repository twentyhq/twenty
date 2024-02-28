import { Inject, Injectable, Logger } from '@nestjs/common';

import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailClientProvider } from 'src/workspace/messaging/services/providers/gmail/gmail-client.provider';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  GmailFullSyncJobData,
  GmailFullSyncJob,
} from 'src/workspace/messaging/jobs/gmail-full-sync.job';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import { createQueriesFromMessageIds } from 'src/workspace/messaging/utils/create-queries-from-message-ids.util';
import { SaveMessagesAndCreateContactsService } from 'src/workspace/messaging/services/save-messages-and-create-contacts.service';

@Injectable()
export class GmailFullSyncService {
  private readonly logger = new Logger(GmailFullSyncService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly messageChannelService: MessageChannelService,
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    private readonly saveMessagesAndCreateContactsService: SaveMessagesAndCreateContactsService,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
    nextPageToken?: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountService.getByIdOrFail(
      connectedAccountId,
      workspaceId,
    );

    const accessToken = connectedAccount.accessToken;
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const gmailMessageChannel =
      await this.messageChannelService.getFirstByConnectedAccountIdOrFail(
        connectedAccountId,
        workspaceId,
      );

    const gmailMessageChannelId = gmailMessageChannel.id;

    const gmailClient =
      await this.gmailClientProvider.getGmailClient(refreshToken);

    let startTime = Date.now();

    const messages = await gmailClient.users.messages.list({
      userId: 'me',
      maxResults: 500,
      pageToken: nextPageToken,
    });

    let endTime = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} getting messages list in ${
        endTime - startTime
      }ms.`,
    );

    const messagesData = messages.data.messages;

    const messageExternalIds = messagesData
      ? messagesData.map((message) => message.id || '')
      : [];

    if (!messageExternalIds || messageExternalIds?.length === 0) {
      return;
    }

    startTime = Date.now();

    const existingMessageChannelMessageAssociations =
      await this.messageChannelMessageAssociationService.getByMessageExternalIdsAndMessageChannelId(
        messageExternalIds,
        gmailMessageChannelId,
        workspaceId,
      );

    endTime = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId}: getting existing message channel message associations in ${
        endTime - startTime
      }ms.`,
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

    const messageQueries = createQueriesFromMessageIds(messagesToFetch);

    startTime = Date.now();

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
        'gmail full-sync',
        workspaceId,
        connectedAccountId,
      );

    endTime = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId}: fetching all messages in ${
        endTime - startTime
      }ms.`,
    );

    if (messagesToSave.length === 0) {
      if (errors.length) throw new Error('Error fetching messages');

      this.logger.log(
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    this.saveMessagesAndCreateContactsService.saveMessagesAndCreateContacts(
      messagesToSave,
      connectedAccount,
      workspaceId,
      gmailMessageChannelId,
      'gmail full-sync',
    );

    if (errors.length) throw new Error('Error fetching messages');

    const lastModifiedMessageId = messagesToFetch[0];

    const historyId = messagesToSave.find(
      (message) => message.externalId === lastModifiedMessageId,
    )?.historyId;

    if (!historyId) throw new Error('No history id found');

    startTime = Date.now();

    await this.connectedAccountService.updateLastSyncHistoryIdIfHigher(
      historyId,
      connectedAccount.id,
      workspaceId,
    );

    endTime = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId}: updating last sync history id in ${
        endTime - startTime
      }ms.`,
    );

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} ${
        nextPageToken ? `and ${nextPageToken} pageToken` : ''
      }done.`,
    );

    if (messages.data.nextPageToken) {
      await this.messageQueueService.add<GmailFullSyncJobData>(
        GmailFullSyncJob.name,
        {
          workspaceId,
          connectedAccountId,
          nextPageToken: messages.data.nextPageToken,
        },
        {
          retryLimit: 2,
        },
      );
    }
  }
}

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
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';
import { createQueriesFromMessageIds } from 'src/workspace/messaging/utils/create-queries-from-message-ids.util';

@Injectable()
export class GmailFullSyncService {
  private readonly logger = new Logger(GmailFullSyncService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly messageChannelService: MessageChannelService,
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    private readonly messageService: MessageService,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
    nextPageToken?: string,
  ): Promise<void> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

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

    const messages = await gmailClient.users.messages.list({
      userId: 'me',
      maxResults: 500,
      pageToken: nextPageToken,
    });

    const messagesData = messages.data.messages;

    const messageExternalIds = messagesData
      ? messagesData.map((message) => message.id || '')
      : [];

    if (!messageExternalIds || messageExternalIds?.length === 0) {
      return;
    }

    const existingMessageChannelMessageAssociations =
      await this.messageChannelMessageAssociationService.getByMessageExternalIdsAndMessageChannelId(
        messageExternalIds,
        gmailMessageChannelId,
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

    const messageQueries = createQueriesFromMessageIds(messagesToFetch);

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    if (messagesToSave.length === 0) {
      this.logger.log(
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    await this.messageService.saveMessages(
      messagesToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
      gmailMessageChannelId,
      workspaceId,
    );

    if (errors.length) throw new Error('Error fetching messages');

    const lastModifiedMessageId = messagesToFetch[0];

    const historyId = messagesToSave.find(
      (message) => message.externalId === lastModifiedMessageId,
    )?.historyId;

    if (!historyId) throw new Error('No history id found');

    await this.connectedAccountService.updateLastSyncHistoryId(
      historyId,
      connectedAccount.id,
      workspaceId,
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

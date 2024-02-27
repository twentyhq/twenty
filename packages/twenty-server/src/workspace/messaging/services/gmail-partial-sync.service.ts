import { Inject, Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailClientProvider } from 'src/workspace/messaging/services/providers/gmail/gmail-client.provider';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import {
  GmailFullSyncJob,
  GmailFullSyncJobData,
} from 'src/workspace/messaging/jobs/gmail-full-sync.job';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';
import { createQueriesFromMessageIds } from 'src/workspace/messaging/utils/create-queries-from-message-ids.util';
import { GmailMessage } from 'src/workspace/messaging/types/gmail-message';
import { isPersonEmail } from 'src/workspace/messaging/utils/is-person-email.util';
import { BlocklistService } from 'src/workspace/messaging/repositories/blocklist/blocklist.service';
import { SaveMessagesAndCreateContactsService } from 'src/workspace/messaging/services/save-messages-and-create-contacts.service';

@Injectable()
export class GmailPartialSyncService {
  private readonly logger = new Logger(GmailPartialSyncService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly messageChannelService: MessageChannelService,
    private readonly messageService: MessageService,
    private readonly blocklistService: BlocklistService,
    private readonly saveMessagesAndCreateContactsService: SaveMessagesAndCreateContactsService,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
    maxResults = 500,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountService.getByIdOrFail(
      connectedAccountId,
      workspaceId,
    );

    const lastSyncHistoryId = connectedAccount.lastSyncHistoryId;

    if (!lastSyncHistoryId) {
      await this.fallbackToFullSync(workspaceId, connectedAccountId);

      return;
    }

    const accessToken = connectedAccount.accessToken;
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const { history, error } = await this.getHistoryFromGmail(
      refreshToken,
      lastSyncHistoryId,
      maxResults,
    );

    if (error && error.code === 404) {
      await this.connectedAccountService.deleteHistoryId(
        connectedAccountId,
        workspaceId,
      );

      await this.fallbackToFullSync(workspaceId, connectedAccountId);

      return;
    }

    const newHistoryId = history?.historyId;

    if (!newHistoryId) {
      throw new Error('No history id found');
    }

    if (newHistoryId === lastSyncHistoryId) {
      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to update.`,
      );

      return;
    }

    const gmailMessageChannel =
      await this.messageChannelService.getFirstByConnectedAccountIdOrFail(
        connectedAccountId,
        workspaceId,
      );

    const gmailMessageChannelId = gmailMessageChannel.id;

    const { messagesAdded, messagesDeleted } =
      await this.getMessageIdsFromHistory(history);

    const messageQueries = createQueriesFromMessageIds(messagesAdded);

    const { messages, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
        'gmail full-sync',
        workspaceId,
        connectedAccountId,
      );

    const blocklist = await this.blocklistService.getByWorkspaceMemberId(
      connectedAccount.accountOwnerId,
      workspaceId,
    );

    const blocklistedEmails = blocklist.map((blocklist) => blocklist.handle);

    const messagesToSave = messages.filter(
      (message) =>
        !this.shouldSkipImport(
          connectedAccount.handle,
          message,
          blocklistedEmails,
        ),
    );

    if (messagesToSave.length !== 0) {
      await this.saveMessagesAndCreateContactsService.saveMessagesAndCreateContacts(
        messagesToSave,
        connectedAccount,
        workspaceId,
        gmailMessageChannelId,
        'gmail partial-sync',
      );
    }

    if (messagesDeleted.length !== 0) {
      await this.messageService.deleteMessages(
        messagesDeleted,
        gmailMessageChannelId,
        workspaceId,
      );
    }

    if (errors.length) throw new Error('Error fetching messages');

    await this.connectedAccountService.updateLastSyncHistoryId(
      newHistoryId,
      connectedAccount.id,
      workspaceId,
    );

    this.logger.log(
      `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} done.`,
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

  private async getHistoryFromGmail(
    refreshToken: string,
    lastSyncHistoryId: string,
    maxResults: number,
  ): Promise<{
    history?: gmail_v1.Schema$ListHistoryResponse;
    error?: any;
  }> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(refreshToken);

    try {
      const history = await gmailClient.users.history.list({
        userId: 'me',
        startHistoryId: lastSyncHistoryId,
        historyTypes: ['messageAdded', 'messageDeleted'],
        maxResults,
      });

      return { history: history.data };
    } catch (error) {
      const errorData = error?.response?.data?.error;

      if (errorData) {
        return { error: errorData };
      }

      throw error;
    }
  }

  private async fallbackToFullSync(
    workspaceId: string,
    connectedAccountId: string,
  ) {
    await this.messageQueueService.add<GmailFullSyncJobData>(
      GmailFullSyncJob.name,
      { workspaceId, connectedAccountId },
      {
        retryLimit: 2,
      },
    );
  }

  private isMessageBlocked = (
    selfHandle: string,
    message: GmailMessage,
    blocklistedEmails: string[],
  ): boolean => {
    // If the message is received, check if the sender is in the blocklist
    // If the message is sent, check if any of the recipients with role 'to' are in the blocklist

    if (message.fromHandle === selfHandle) {
      return message.participants.some(
        (participant) =>
          participant.role === 'to' &&
          blocklistedEmails.includes(participant.handle),
      );
    }

    return blocklistedEmails.includes(message.fromHandle);
  };

  private shouldSkipImport(
    selfHandle: string,
    message: GmailMessage,
    blocklistedEmails: string[],
  ): boolean {
    return (
      !isPersonEmail(message.fromHandle) ||
      this.isMessageBlocked(selfHandle, message, blocklistedEmails)
    );
  }
}

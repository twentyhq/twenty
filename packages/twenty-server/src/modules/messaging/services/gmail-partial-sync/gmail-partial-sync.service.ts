import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { gmail_v1 } from 'googleapis';
import { Repository } from 'typeorm';

import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import {
  GmailFullSyncJob,
  GmailFullSyncJobData,
} from 'src/modules/messaging/jobs/gmail-full-sync.job';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { createQueriesFromMessageIds } from 'src/modules/messaging/utils/create-queries-from-message-ids.util';
import { GmailMessage } from 'src/modules/messaging/types/gmail-message';
import { isPersonEmail } from 'src/modules/messaging/utils/is-person-email.util';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { SaveMessageAndEmitContactCreationEventService } from 'src/modules/messaging/services/save-message-and-emit-contact-creation-event/save-message-and-emit-contact-creation-event.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { MessageService } from 'src/modules/messaging/services/message/message.service';

@Injectable()
export class GmailPartialSyncService {
  private readonly logger = new Logger(GmailPartialSyncService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messageService: MessageService,
    @InjectObjectMetadataRepository(BlocklistObjectMetadata)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly saveMessagesAndEmitContactCreationEventService: SaveMessageAndEmitContactCreationEventService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
    maxResults = 500,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      this.logger.error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId} during partial-sync`,
      );

      return;
    }

    const lastSyncHistoryId = connectedAccount.lastSyncHistoryId;

    if (!lastSyncHistoryId) {
      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}: no lastSyncHistoryId, falling back to full sync.`,
      );

      await this.fallbackToFullSync(workspaceId, connectedAccountId);

      return;
    }

    const accessToken = connectedAccount.accessToken;
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId} during partial-sync`,
      );
    }

    let startTime = Date.now();

    const { history, historyId, error } = await this.getHistoryFromGmail(
      refreshToken,
      lastSyncHistoryId,
      maxResults,
    );

    let endTime = Date.now();

    this.logger.log(
      `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} getting history in ${
        endTime - startTime
      }ms.`,
    );

    if (error && error.code === 404) {
      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}: invalid lastSyncHistoryId, falling back to full sync.`,
      );

      await this.connectedAccountRepository.deleteHistoryId(
        connectedAccountId,
        workspaceId,
      );

      await this.fallbackToFullSync(workspaceId, connectedAccountId);

      return;
    }

    if (error && error.code === 429) {
      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}: Error 429: ${error.message}, partial sync will be retried later.`,
      );

      return;
    }

    if (error) {
      throw new Error(
        `Error getting history for ${connectedAccountId} in workspace ${workspaceId} during partial-sync:
        ${JSON.stringify(error)}`,
      );
    }

    if (!historyId) {
      throw new Error(
        `No historyId found for ${connectedAccountId} in workspace ${workspaceId} during partial-sync`,
      );
    }

    if (historyId === lastSyncHistoryId || !history?.length) {
      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to update.`,
      );

      return;
    }

    const gmailMessageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!gmailMessageChannel) {
      this.logger.error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId} during partial-sync`,
      );

      return;
    }

    const gmailMessageChannelId = gmailMessageChannel.id;

    const { messagesAdded, messagesDeleted } =
      await this.getMessageIdsFromHistory(history);

    const messageQueries = createQueriesFromMessageIds(messagesAdded);

    const { messages, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
        workspaceId,
        connectedAccountId,
      );

    const isBlocklistEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKeys.IsBlocklistEnabled,
        value: true,
      });

    const isBlocklistEnabled =
      isBlocklistEnabledFeatureFlag && isBlocklistEnabledFeatureFlag.value;

    const blocklist = isBlocklistEnabled
      ? await this.blocklistRepository.getByWorkspaceMemberId(
          connectedAccount.accountOwnerId,
          workspaceId,
        )
      : [];

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
      await this.saveMessagesAndEmitContactCreationEventService.saveMessagesAndEmitContactCreation(
        messagesToSave,
        connectedAccount,
        workspaceId,
        gmailMessageChannelId,
      );
    }

    if (messagesDeleted.length !== 0) {
      startTime = Date.now();

      await this.messageService.deleteMessages(
        messagesDeleted,
        gmailMessageChannelId,
        workspaceId,
      );

      endTime = Date.now();

      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}: deleting messages in ${
          endTime - startTime
        }ms.`,
      );
    }

    if (errors.length) {
      this.logger.error(
        `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId} during partial-sync: ${JSON.stringify(
          errors,
          null,
          2,
        )}`,
      );
      const errorsCanBeIgnored = errors.every((error) => error.code === 404);
      const errorsShouldBeRetried = errors.some((error) => error.code === 429);

      if (errorsShouldBeRetried) {
        return;
      }

      if (!errorsCanBeIgnored) {
        throw new Error(
          `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId} during partial-sync`,
        );
      }
    }
    startTime = Date.now();

    await this.connectedAccountRepository.updateLastSyncHistoryId(
      historyId,
      connectedAccount.id,
      workspaceId,
    );

    endTime = Date.now();

    this.logger.log(
      `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} updating lastSyncHistoryId in ${
        endTime - startTime
      }ms.`,
    );

    this.logger.log(
      `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} done.`,
    );
  }

  private async getMessageIdsFromHistory(
    history: gmail_v1.Schema$History[],
  ): Promise<{
    messagesAdded: string[];
    messagesDeleted: string[];
  }> {
    const { messagesAdded, messagesDeleted } = history.reduce(
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
    history: gmail_v1.Schema$History[];
    historyId?: string | null;
    error?: {
      code: number;
      errors: {
        domain: string;
        reason: string;
        message: string;
        locationType?: string;
        location?: string;
      }[];
      message: string;
    };
  }> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(refreshToken);

    const fullHistory: gmail_v1.Schema$History[] = [];

    try {
      const history = await gmailClient.users.history.list({
        userId: 'me',
        startHistoryId: lastSyncHistoryId,
        historyTypes: ['messageAdded', 'messageDeleted'],
        maxResults,
      });

      let nextPageToken = history?.data?.nextPageToken;

      const historyId = history?.data?.historyId;

      if (history?.data?.history) {
        fullHistory.push(...history.data.history);
      }

      while (nextPageToken) {
        const nextHistory = await gmailClient.users.history.list({
          userId: 'me',
          startHistoryId: lastSyncHistoryId,
          historyTypes: ['messageAdded', 'messageDeleted'],
          maxResults,
          pageToken: nextPageToken,
        });

        nextPageToken = nextHistory?.data?.nextPageToken;

        if (nextHistory?.data?.history) {
          fullHistory.push(...nextHistory.data.history);
        }
      }

      return { history: fullHistory, historyId };
    } catch (error) {
      const errorData = error?.response?.data?.error;

      if (errorData) {
        return { history: [], error: errorData };
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

  private isHandleBlocked = (
    selfHandle: string,
    message: GmailMessage,
    blocklistedEmails: string[],
  ): boolean => {
    // If the message is received, check if the sender is in the blocklist
    // If the message is sent, check if any of the recipients with role 'to' is in the blocklist

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
      this.isHandleBlocked(selfHandle, message, blocklistedEmails)
    );
  }
}

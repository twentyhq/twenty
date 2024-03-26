import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  GmailFullSyncJobData,
  GmailFullSyncJob,
} from 'src/modules/messaging/jobs/gmail-full-sync.job';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { createQueriesFromMessageIds } from 'src/modules/messaging/utils/create-queries-from-message-ids.util';
import { gmailSearchFilterExcludeEmails } from 'src/modules/messaging/utils/gmail-search-filter.util';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { SaveMessageAndEmitContactCreationEventService } from 'src/modules/messaging/services/save-message-and-emit-contact-creation-event/save-message-and-emit-contact-creation-event.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';

@Injectable()
export class GmailFullSyncService {
  private readonly logger = new Logger(GmailFullSyncService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationObjectMetadata,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(BlocklistObjectMetadata)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly saveMessagesAndEmitContactCreationEventService: SaveMessageAndEmitContactCreationEventService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
    nextPageToken?: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      this.logger.error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId} during full-sync`,
      );

      return;
    }

    const accessToken = connectedAccount.accessToken;
    const refreshToken = connectedAccount.refreshToken;
    const workspaceMemberId = connectedAccount.accountOwnerId;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
      );
    }

    const gmailMessageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!gmailMessageChannel) {
      this.logger.error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId} during full-syn`,
      );

      return;
    }

    const gmailMessageChannelId = gmailMessageChannel.id;

    const gmailClient =
      await this.gmailClientProvider.getGmailClient(refreshToken);

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
          workspaceMemberId,
          workspaceId,
        )
      : [];

    const blocklistedEmails = blocklist.map((blocklist) => blocklist.handle);
    let startTime = Date.now();

    const messages = await gmailClient.users.messages.list({
      userId: 'me',
      maxResults: 500,
      pageToken: nextPageToken,
      q: gmailSearchFilterExcludeEmails(blocklistedEmails),
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
      this.logger.log(
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    startTime = Date.now();

    const existingMessageChannelMessageAssociations =
      await this.messageChannelMessageAssociationRepository.getByMessageExternalIdsAndMessageChannelId(
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
        workspaceId,
        connectedAccountId,
      );

    endTime = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId}: fetching all messages in ${
        endTime - startTime
      }ms.`,
    );

    if (messagesToSave.length > 0) {
      await this.saveMessagesAndEmitContactCreationEventService.saveMessagesAndEmitContactCreation(
        messagesToSave,
        connectedAccount,
        workspaceId,
        gmailMessageChannelId,
      );
    } else {
      this.logger.log(
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    if (errors.length) {
      throw new Error(
        `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
      );
    }
    const lastModifiedMessageId = messagesToFetch[0];

    const historyId = messagesToSave.find(
      (message) => message.externalId === lastModifiedMessageId,
    )?.historyId;

    if (!historyId) {
      throw new Error(
        `No historyId found for ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
      );
    }

    startTime = Date.now();

    await this.connectedAccountRepository.updateLastSyncHistoryIdIfHigher(
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

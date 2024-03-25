import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';
import { gmail_v1 } from 'googleapis';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/constants/gmail-users-messages-list-max-result.constant';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import {
  MessageChannelObjectMetadata,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { gmailSearchFilterExcludeEmails } from 'src/modules/messaging/utils/gmail-search-filter.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  GmailFetchMessageContentFromCacheJobData,
  GmailFetchMessageContentFromCacheJob,
} from 'src/modules/messaging/jobs/gmail-fetch-message-content-from-cache.job';

@Injectable()
export class GmailFullSyncV2Service {
  private readonly logger = new Logger(GmailFullSyncV2Service.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectObjectMetadataRepository(BlocklistObjectMetadata)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationObjectMetadata,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
  ) {
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

    const refreshToken = connectedAccount.refreshToken;

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

    if (gmailMessageChannel.syncStatus !== MessageChannelSyncStatus.PENDING) {
      this.logger.log(
        `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId} is not pending, partial sync will be retried later.`,
      );

      return;
    }

    await this.messageChannelRepository.updateSyncStatus(
      gmailMessageChannel.id,
      MessageChannelSyncStatus.ONGOING,
      workspaceId,
    );

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource
      ?.transaction(async (transactionManager) => {
        const gmailClient: gmail_v1.Gmail =
          await this.gmailClientProvider.getGmailClient(refreshToken);

        const blocklistedEmails = await this.fetchBlocklistEmails(
          connectedAccount.accountOwnerId,
          workspaceId,
        );

        await this.fetchAllMessageIdsFromGmail(
          gmailClient,
          gmailMessageChannel.id,
          blocklistedEmails,
          workspaceId,
          transactionManager,
        );
      })
      .catch(async (error) => {
        await this.messageChannelRepository.updateSyncStatus(
          gmailMessageChannel.id,
          MessageChannelSyncStatus.FAILED,
          workspaceId,
        );

        this.logger.error(
          `Error occurred while fetching message ids from Gmail for connected account ${connectedAccountId} in workspace ${workspaceId}`,
          error,
        );
      })
      .finally(async () => {
        await this.messageChannelRepository.updateSyncStatus(
          gmailMessageChannel.id,
          MessageChannelSyncStatus.SUCCEEDED,
          workspaceId,
        );

        await this.messageQueueService.add<GmailFetchMessageContentFromCacheJobData>(
          GmailFetchMessageContentFromCacheJob.name,
          {
            workspaceId,
            connectedAccountId,
          },
        );
      });
  }

  public async fetchAllMessageIdsFromGmail(
    gmailClient: gmail_v1.Gmail,
    messageChannelId: string,
    blocklistedEmails: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let messageIdsToFetch = 0;

    while (hasMoreMessages) {
      const response = await gmailClient.users.messages.list({
        userId: 'me',
        maxResults: GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
        pageToken,
        q: gmailSearchFilterExcludeEmails(blocklistedEmails),
      });

      if (response.data?.messages) {
        const messageExternalIds = response.data.messages
          .filter((message): message is { id: string } => message.id != null)
          .map((message) => message.id);

        const existingMessageChannelMessageAssociations =
          await this.messageChannelMessageAssociationRepository.getByMessageExternalIdsAndMessageChannelId(
            messageExternalIds,
            messageChannelId,
            workspaceId,
            transactionManager,
          );

        const existingMessageChannelMessageAssociationsExternalIds =
          existingMessageChannelMessageAssociations.map(
            (messageChannelMessageAssociation) =>
              messageChannelMessageAssociation.messageExternalId,
          );

        const messageIdsToImport = messageExternalIds.filter(
          (messageExternalId) =>
            !existingMessageChannelMessageAssociationsExternalIds.includes(
              messageExternalId,
            ),
        );

        if (messageIdsToImport && messageIdsToImport.length) {
          await this.cacheStorage.setAdd(
            `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
            messageIdsToImport,
          );

          messageIdsToFetch += messageIdsToImport.length;
        }
      }

      pageToken = response.data.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;
    }

    if (!messageIdsToFetch) {
      this.logger.log(
        `No messages found in Gmail for messageChannel ${messageChannelId} in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Fetched all ${messageIdsToFetch} message ids from Gmail for messageChannel ${messageChannelId} in workspace ${workspaceId} and added to cache for import`,
    );
  }

  public async fetchBlocklistEmails(
    workspaceMemberId: string,
    workspaceId: string,
  ) {
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

    return blocklist.map((blocklist) => blocklist.handle);
  }
}

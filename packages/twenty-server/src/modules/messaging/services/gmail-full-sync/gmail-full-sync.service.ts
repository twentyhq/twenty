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
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { gmailSearchFilterEmailAdresses } from 'src/modules/messaging/utils/gmail-search-filter.util';

@Injectable()
export class GmailFullSyncService {
  private readonly logger = new Logger(GmailFullSyncService.name);

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
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async fetchConnectedAccountThreads(
    workspaceId: string,
    connectedAccountId: string,
    includedEmails?: string[],
  ) {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      this.logger.error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const gmailMessageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!gmailMessageChannel) {
      this.logger.error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );

      return;
    }

    if (gmailMessageChannel.syncStatus === MessageChannelSyncStatus.ONGOING) {
      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} is locked, import will be retried later.`,
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

    const gmailClient: gmail_v1.Gmail =
      await this.gmailClientProvider.getGmailClient(refreshToken);

    const blocklistedEmails = await this.fetchBlocklistEmails(
      connectedAccount.accountOwnerId,
      workspaceId,
    );

    await workspaceDataSource
      ?.transaction(async (transactionManager) => {
        await this.fetchAllMessageIdsFromGmailAndStoreInCache(
          gmailClient,
          gmailMessageChannel.id,
          includedEmails || [],
          blocklistedEmails,
          workspaceId,
          transactionManager,
        );

        await this.messageChannelRepository.updateSyncStatus(
          gmailMessageChannel.id,
          MessageChannelSyncStatus.PENDING,
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

        throw new Error(
          `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId}: ${error.message}`,
        );
      });
  }

  public async fetchAllMessageIdsFromGmailAndStoreInCache(
    gmailClient: gmail_v1.Gmail,
    messageChannelId: string,
    includedEmails: string[],
    blocklistedEmails: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let messageIdsToFetch = 0;
    let firstMessageExternalId;

    while (hasMoreMessages) {
      const response = await gmailClient.users.messages.list({
        userId: 'me',
        maxResults: GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
        pageToken,
        q: gmailSearchFilterEmailAdresses(includedEmails, blocklistedEmails),
      });

      if (response.data?.messages) {
        const messageExternalIds = response.data.messages
          .filter((message): message is { id: string } => message.id != null)
          .map((message) => message.id);

        if (!firstMessageExternalId) {
          firstMessageExternalId = messageExternalIds[0];
        }

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

    await this.updateLastSyncCursor(
      gmailClient,
      messageChannelId,
      firstMessageExternalId,
      workspaceId,
      transactionManager,
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

  private async updateLastSyncCursor(
    gmailClient: gmail_v1.Gmail,
    messageChannelId: string,
    firstMessageExternalId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (!firstMessageExternalId) {
      throw new Error(
        `No first message found for workspace ${workspaceId} and account ${messageChannelId}, can't update sync external id`,
      );
    }

    const firstMessageContent = await gmailClient.users.messages.get({
      userId: 'me',
      id: firstMessageExternalId,
    });

    if (!firstMessageContent?.data) {
      throw new Error(
        `No first message content found for message ${firstMessageExternalId} in workspace ${workspaceId}`,
      );
    }

    const historyId = firstMessageContent?.data?.historyId;

    if (!historyId) {
      throw new Error(
        `No historyId found for message ${firstMessageExternalId} in workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Updating last external id: ${historyId} for workspace ${workspaceId} and account ${messageChannelId} succeeded.`,
    );

    await this.messageChannelRepository.updateLastSyncCursorIfHigher(
      messageChannelId,
      historyId,
      workspaceId,
      transactionManager,
    );
  }
}

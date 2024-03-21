import { Injectable, Logger } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import {
  MessageChannelObjectMetadata,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { createQueriesFromMessageIds } from 'src/modules/messaging/utils/create-queries-from-message-ids.util';
import { MessageService } from 'src/modules/messaging/services/message/message.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/constants/gmail-users-messages-get-batch-size.constant';

@Injectable()
export class GmailFetchMessageContentFromCacheService {
  private readonly logger = new Logger(
    GmailFetchMessageContentFromCacheService.name,
  );

  constructor(
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messageService: MessageService,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async fetchMessageContentFromCache(
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

    const accessToken = connectedAccount.accessToken;
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
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} is not pending.`,
      );

      return;
    }

    const gmailMessageChannelId = gmailMessageChannel.id;

    const messageIdsToFetch = await this.cacheStorage.setPop(
      `messages-to-import:${workspaceId}:gmail:${gmailMessageChannelId}`,
      GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
    );

    if (!messageIdsToFetch || !messageIdsToFetch.length) {
      await this.messageChannelRepository.updateSyncStatus(
        gmailMessageChannelId,
        MessageChannelSyncStatus.SUCCEEDED,
        workspaceId,
      );

      this.logger.log(
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    const messageQueries = createQueriesFromMessageIds(messageIdsToFetch);

    let startTime = Date.now();

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
        'gmail full-sync',
        workspaceId,
        connectedAccountId,
      );

    let endTime = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId}: fetching all messages in ${
        endTime - startTime
      }ms.`,
    );

    if (!messagesToSave.length) {
      this.logger.log(
        `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import.`,
      );

      return;
    }

    const savedMessagesMap = await this.messageService.saveMessagesFromCache(
      messagesToSave,
      connectedAccount,
      gmailMessageChannelId,
      workspaceId,
    );

    if (errors.length) {
      await this.cacheStorage.setAdd(
        `messages-to-import:${workspaceId}:gmail:${gmailMessageChannelId}`,
        messageIdsToFetch,
      );

      throw new Error(
        `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
      );
    }
    const savedMessageExternalIds = [...savedMessagesMap.keys()];

    const lastModifiedMessageId = savedMessageExternalIds[0];

    const historyId = messagesToSave.find(
      (message) => message.externalId === lastModifiedMessageId,
    )?.historyId;

    if (!historyId) {
      throw new Error(
        `No historyId found for ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
      );
    }

    startTime = Date.now();

    await this.messageChannelRepository.updateLastSyncExternalIdIfHigher(
      gmailMessageChannelId,
      historyId,
      workspaceId,
    );

    endTime = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId}: updating last sync history id in ${
        endTime - startTime
      }ms.`,
    );

    if (messageIdsToFetch.length < GMAIL_USERS_MESSAGES_GET_BATCH_SIZE) {
      await this.messageChannelRepository.updateSyncStatus(
        gmailMessageChannelId,
        MessageChannelSyncStatus.SUCCEEDED,
        workspaceId,
      );
    }
  }
}

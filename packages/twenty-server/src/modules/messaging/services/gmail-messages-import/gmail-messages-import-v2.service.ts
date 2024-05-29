import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelSyncSubStatus,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { createQueriesFromMessageIds } from 'src/modules/messaging/utils/create-queries-from-message-ids.util';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/constants/gmail-users-messages-get-batch-size.constant';
import { GMAIL_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/constants/gmail-ongoing-sync-timeout.constant';
import { GmailMessagesImportService } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import.service';
import { SetMessageChannelSyncStatusService } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { SaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/services/gmail-messages-import/save-messages-and-enqueue-contact-creation.service';

@Injectable()
export class GmailMessagesImportV2Service {
  private readonly logger = new Logger(GmailMessagesImportService.name);

  constructor(
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly setMessageChannelSyncStatusService: SetMessageChannelSyncStatusService,
    private readonly saveMessagesAndEnqueueContactCreationService: SaveMessagesAndEnqueueContactCreationService,
  ) {}

  async processMessageBatchImport(
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ) {
    if (messageChannel.syncSubStatus === MessageChannelSyncSubStatus.FAILED) {
      throw new Error(
        `Connected account ${connectedAccount.id} in workspace ${workspaceId} is in a failed state. Skipping...`,
      );
    }

    if (
      messageChannel.syncSubStatus !==
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_PENDING
    ) {
      throw new Error(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} is not pending.`,
      );
    }

    await this.setMessageChannelSyncStatusService.setMessagesImportOnGoingStatus(
      messageChannel.id,
      workspaceId,
    );

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} starting...`,
    );

    const messageIdsToFetch =
      (await this.cacheStorage.setPop(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
      )) ?? [];

    if (!messageIdsToFetch?.length) {
      await this.setMessageChannelSyncStatusService.setCompletedStatus(
        messageChannel.id,
        workspaceId,
      );

      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} done with nothing to import or delete.`,
      );

      return;
    }

    const messageQueries = createQueriesFromMessageIds(messageIdsToFetch);

    try {
      const messagesToSave =
        await this.fetchMessagesByBatchesService.fetchAllMessages(
          messageQueries,
          connectedAccount.accessToken,
          workspaceId,
          connectedAccount.id,
        );

      if (!messagesToSave.length) {
        await this.setMessageChannelSyncStatusService.setCompletedStatus(
          messageChannel.id,
          workspaceId,
        );

        return [];
      }

      await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreationJob(
        messagesToSave,
        messageChannel,
        connectedAccount,
        workspaceId,
      );

      if (messageIdsToFetch.length < GMAIL_USERS_MESSAGES_GET_BATCH_SIZE) {
        await this.setMessageChannelSyncStatusService.setCompletedStatus(
          messageChannel.id,
          workspaceId,
        );

        this.logger.log(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} done with no more messages to import.`,
        );
      } else {
        await this.setMessageChannelSyncStatusService.setMessagesImportPendingStatus(
          messageChannel.id,
          workspaceId,
        );

        this.logger.log(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} done with more messages to import.`,
        );
      }
    } catch (error) {
      await this.cacheStorage.setAdd(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        messageIdsToFetch,
      );

      await this.setMessageChannelSyncStatusService.setFailedUnkownStatus(
        messageChannel.id,
        workspaceId,
      );

      this.logger.error(
        `Error fetching messages for ${connectedAccount.id} in workspace ${workspaceId}: locking for ${GMAIL_ONGOING_SYNC_TIMEOUT}ms...`,
      );

      throw new Error(
        `Error fetching messages for ${connectedAccount.id} in workspace ${workspaceId}: ${error.message}`,
      );
    }
  }
}

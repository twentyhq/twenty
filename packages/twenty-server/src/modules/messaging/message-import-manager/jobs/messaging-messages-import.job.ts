import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingGmailMessagesImportService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-messages-import.service';
import { isThrottled } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-throttled';

export type MessagingMessagesImportJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Injectable()
export class MessagingMessagesImportJob
  implements MessageQueueJob<MessagingMessagesImportJobData>
{
  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly gmailFetchMessageContentFromCacheService: MessagingGmailMessagesImportService,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  async handle(data: MessagingMessagesImportJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    await this.messagingTelemetryService.track({
      eventName: 'messages_import.triggered',
      workspaceId,
      messageChannelId,
    });

    const messageChannel = await this.messageChannelRepository.getById(
      messageChannelId,
      workspaceId,
    );

    if (!messageChannel) {
      await this.messagingTelemetryService.track({
        eventName: 'messages_import.error.message_channel_not_found',
        messageChannelId,
        workspaceId,
      });

      return;
    }

    const connectedAccount =
      await this.connectedAccountRepository.getConnectedAccountOrThrow(
        workspaceId,
        messageChannel.connectedAccountId,
      );

    if (!messageChannel?.isSyncEnabled) {
      return;
    }

    if (
      isThrottled(
        messageChannel.syncStageStartedAt,
        messageChannel.throttleFailureCount,
      )
    ) {
      return;
    }

    if (
      messageChannel.syncStage !==
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING
    ) {
      return;
    }

    await this.gmailFetchMessageContentFromCacheService.processMessageBatchImport(
      messageChannel,
      connectedAccount,
      workspaceId,
    );
  }
}

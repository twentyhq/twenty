import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingGmailMessagesImportService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-messages-import.service';
import { isThrottled } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-throttled';

export type MessagingMessagesImportJobData = {
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
    const { workspaceId } = data;

    const messageChannels =
      await this.messageChannelRepository.getAll(workspaceId);

    for (const messageChannel of messageChannels) {
      if (!messageChannel?.isSyncEnabled) {
        continue;
      }

      await this.messagingTelemetryService.track({
        eventName: 'messages_import.triggered',
        workspaceId,
        connectedAccountId: messageChannel.connectedAccountId,
        messageChannelId: messageChannel.id,
      });

      if (
        isThrottled(
          messageChannel.syncStageStartedAt,
          messageChannel.throttleFailureCount,
        )
      ) {
        continue;
      }

      const connectedAccount =
        await this.connectedAccountRepository.getConnectedAccountOrThrow(
          workspaceId,
          messageChannel.connectedAccountId,
        );

      await this.gmailFetchMessageContentFromCacheService.processMessageBatchImport(
        messageChannel,
        connectedAccount,
        workspaceId,
      );
    }
  }
}

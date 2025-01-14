import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingTelemetryService } from 'src/modules/messaging/monitoring/services/messaging-telemetry.service';

export type MessagingMessagesImportJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessagesImportJob {
  constructor(
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly messagingTelemetryService: MessagingTelemetryService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @Process(MessagingMessagesImportJob.name)
  async handle(data: MessagingMessagesImportJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    await this.messagingTelemetryService.track({
      eventName: 'messages_import.triggered',
      workspaceId,
      messageChannelId,
    });

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: {
        id: messageChannelId,
      },
      relations: ['connectedAccount'],
    });

    if (!messageChannel) {
      await this.messagingTelemetryService.track({
        eventName: 'messages_import.error.message_channel_not_found',
        messageChannelId,
        workspaceId,
      });

      return;
    }

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

    await this.messagingMessagesImportService.processMessageBatchImport(
      messageChannel,
      messageChannel.connectedAccount,
      workspaceId,
    );
  }
}

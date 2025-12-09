import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

export type MessagingMessageListFetchJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessageListFetchJob {
  constructor(
    private readonly messagingMessageListFetchService: MessagingMessageListFetchService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(MessagingMessageListFetchJob.name)
  async handle(data: MessagingMessageListFetchJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    await this.messagingMonitoringService.track({
      eventName: 'message_list_fetch_job.triggered',
      messageChannelId,
      workspaceId,
    });

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: {
        id: messageChannelId,
      },
      relations: ['connectedAccount', 'messageFolders'],
    });

    if (!messageChannel) {
      await this.messagingMonitoringService.track({
        eventName: 'message_list_fetch_job.error.message_channel_not_found',
        messageChannelId,
        workspaceId,
      });

      return;
    }

    if (
      messageChannel.syncStage !==
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED
    ) {
      return;
    }

    try {
      if (
        isThrottled(
          messageChannel.syncStageStartedAt,
          messageChannel.throttleFailureCount,
        )
      ) {
        await this.messageChannelSyncStatusService.markAsMessagesListFetchPending(
          [messageChannel.id],
          workspaceId,
          true,
        );

        return;
      }

      await this.messagingMonitoringService.track({
        eventName: 'message_list_fetch.started',
        workspaceId,
        connectedAccountId: messageChannel.connectedAccount.id,
        messageChannelId: messageChannel.id,
      });

      await this.messagingMessageListFetchService.processMessageListFetch(
        messageChannel,
        workspaceId,
      );

      await this.messagingMonitoringService.track({
        eventName: 'message_list_fetch.completed',
        workspaceId,
        connectedAccountId: messageChannel.connectedAccount.id,
        messageChannelId: messageChannel.id,
      });
    } catch (error) {
      await this.messageImportErrorHandlerService.handleDriverException(
        error,
        MessageImportSyncStep.MESSAGE_LIST_FETCH,
        messageChannel,
        workspaceId,
      );
    }
  }
}

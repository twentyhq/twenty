import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingAccountAuthenticationService } from 'src/modules/messaging/message-import-manager/services/messaging-account-authentication.service';
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
    private readonly twentyORMManager: TwentyORMManager,
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingAccountAuthenticationService: MessagingAccountAuthenticationService,
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
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
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

    try {
      if (
        isThrottled(
          messageChannel.syncStageStartedAt,
          messageChannel.throttleFailureCount,
        )
      ) {
        return;
      }

      await this.messagingAccountAuthenticationService.validateAndPrepareAuthentication(
        messageChannel,
        workspaceId,
      );

      switch (messageChannel.syncStage) {
        case MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING: // TODO: deprecate as we introduce MESSAGE_LIST_FETCH_PENDING
        case MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING:
          await this.messagingMonitoringService.track({
            eventName: 'full_message_list_fetch.started',
            workspaceId,
            connectedAccountId: messageChannel.connectedAccount.id,
            messageChannelId: messageChannel.id,
          });

          await this.messagingMessageListFetchService.processMessageListFetch(
            messageChannel,
            workspaceId,
          );

          await this.messagingMonitoringService.track({
            eventName: 'full_message_list_fetch.completed',
            workspaceId,
            connectedAccountId: messageChannel.connectedAccount.id,
            messageChannelId: messageChannel.id,
          });

          break;

        default:
          break;
      }
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

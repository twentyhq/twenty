import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingFullMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-full-message-list-fetch.service';
import { MessagingPartialMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-partial-message-list-fetch.service';
import { MessagingTelemetryService } from 'src/modules/messaging/monitoring/services/messaging-telemetry.service';

export type MessagingMessageListFetchJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessageListFetchJob {
  private readonly logger = new Logger(MessagingMessageListFetchJob.name);

  constructor(
    private readonly messagingFullMessageListFetchService: MessagingFullMessageListFetchService,
    private readonly messagingPartialMessageListFetchService: MessagingPartialMessageListFetchService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  @Process(MessagingMessageListFetchJob.name)
  async handle(data: MessagingMessageListFetchJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    await this.messagingTelemetryService.track({
      eventName: 'message_list_fetch_job.triggered',
      messageChannelId,
      workspaceId,
    });

    const messageChannel = await this.messageChannelRepository.getById(
      messageChannelId,
      workspaceId,
    );

    if (!messageChannel) {
      await this.messagingTelemetryService.track({
        eventName: 'message_list_fetch_job.error.message_channel_not_found',
        messageChannelId,
        workspaceId,
      });

      return;
    }

    const connectedAccount =
      await this.connectedAccountRepository.getByIdOrFail(
        messageChannel.connectedAccountId,
        workspaceId,
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

    switch (messageChannel.syncStage) {
      case MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING:
        this.logger.log(
          `Fetching partial message list for workspace ${workspaceId} and messageChannelId ${messageChannel.id}`,
        );

        await this.messagingTelemetryService.track({
          eventName: 'partial_message_list_fetch.started',
          workspaceId,
          connectedAccountId: connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        await this.messagingPartialMessageListFetchService.processMessageListFetch(
          messageChannel,
          connectedAccount,
          workspaceId,
        );

        await this.messagingTelemetryService.track({
          eventName: 'partial_message_list_fetch.completed',
          workspaceId,
          connectedAccountId: connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        break;

      case MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING:
        this.logger.log(
          `Fetching full message list for workspace ${workspaceId} and account ${connectedAccount.id}`,
        );

        await this.messagingTelemetryService.track({
          eventName: 'full_message_list_fetch.started',
          workspaceId,
          connectedAccountId: connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        await this.messagingFullMessageListFetchService.processMessageListFetch(
          messageChannel,
          connectedAccount,
          workspaceId,
        );

        await this.messagingTelemetryService.track({
          eventName: 'full_message_list_fetch.completed',
          workspaceId,
          connectedAccountId: connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        break;

      default:
        break;
    }
  }
}

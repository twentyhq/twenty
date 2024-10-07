import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageImportExceptionHandlerService } from 'src/modules/messaging/message-import-manager/services/message-import-exception-handler.service';
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
    private readonly messagingTelemetryService: MessagingTelemetryService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
  ) {}

  @Process(MessagingMessageListFetchJob.name)
  async handle(data: MessagingMessageListFetchJobData): Promise<void> {
    console.time('MessagingMessageListFetchJob time');

    const { messageChannelId, workspaceId } = data;

    await this.messagingTelemetryService.track({
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
    });

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

    console.timeEnd('MessagingMessageListFetchJob time');
  }
}

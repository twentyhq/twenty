import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { RefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-access-token-manager/exceptions/refresh-access-token.exception';
import { RefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/services/refresh-access-token.service';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessageImportExceptionCode } from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';
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
    private readonly messagingTelemetryService: MessagingTelemetryService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly refreshAccessTokenService: RefreshAccessTokenService,
  ) {}

  @Process(MessagingMessageListFetchJob.name)
  async handle(data: MessagingMessageListFetchJobData): Promise<void> {
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
      relations: ['connectedAccount', 'messageFolders'],
    });

    if (!messageChannel) {
      await this.messagingTelemetryService.track({
        eventName: 'message_list_fetch_job.error.message_channel_not_found',
        messageChannelId,
        workspaceId,
      });

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

    try {
      messageChannel.connectedAccount.accessToken =
        await this.refreshAccessTokenService.refreshAndSaveAccessToken(
          messageChannel.connectedAccount,
          workspaceId,
        );
    } catch (error) {
      switch (error.code) {
        case RefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED:
        case RefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
          await this.messagingTelemetryService.track({
            eventName: `refresh_token.error.insufficient_permissions`,
            workspaceId,
            connectedAccountId: messageChannel.connectedAccountId,
            messageChannelId: messageChannel.id,
            message: `${error.code}: ${error.reason ?? ''}`,
          });
          throw {
            code: MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
            message: error.message,
          };
        case RefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED:
          throw {
            code: MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
            message: error.message,
          };
        default:
          throw error;
      }
    }

    switch (messageChannel.syncStage) {
      case MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING:
        this.logger.log(
          `Fetching partial message list for workspace ${workspaceId} and messageChannelId ${messageChannel.id}`,
        );

        await this.messagingTelemetryService.track({
          eventName: 'partial_message_list_fetch.started',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        await this.messagingPartialMessageListFetchService.processMessageListFetch(
          messageChannel,
          messageChannel.connectedAccount,
          workspaceId,
        );

        await this.messagingTelemetryService.track({
          eventName: 'partial_message_list_fetch.completed',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        break;

      case MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING:
        this.logger.log(
          `Fetching full message list for workspace ${workspaceId} and account ${messageChannel.connectedAccount.id}`,
        );

        await this.messagingTelemetryService.track({
          eventName: 'full_message_list_fetch.started',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        await this.messagingFullMessageListFetchService.processMessageListFetch(
          messageChannel,
          messageChannel.connectedAccount,
          workspaceId,
        );

        await this.messagingTelemetryService.track({
          eventName: 'full_message_list_fetch.completed',
          workspaceId,
          connectedAccountId: messageChannel.connectedAccount.id,
          messageChannelId: messageChannel.id,
        });

        break;

      default:
        break;
    }
  }
}

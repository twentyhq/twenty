import { Injectable, Logger } from '@nestjs/common';

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
import { MessagingGmailFullMessageListFetchService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-full-message-list-fetch.service';
import { MessagingGmailPartialMessageListFetchService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-partial-message-list-fetch.service';
import { isThrottled } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-throttled';

export type MessagingMessageListFetchJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class MessagingMessageListFetchJob
  implements MessageQueueJob<MessagingMessageListFetchJobData>
{
  private readonly logger = new Logger(MessagingMessageListFetchJob.name);

  constructor(
    private readonly gmailFullMessageListFetchService: MessagingGmailFullMessageListFetchService,
    private readonly gmailPartialMessageListFetchV2Service: MessagingGmailPartialMessageListFetchService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  async handle(data: MessagingMessageListFetchJobData): Promise<void> {
    const { workspaceId, connectedAccountId } = data;

    await this.messagingTelemetryService.track({
      eventName: 'message_list_fetch_job.triggered',
      workspaceId,
      connectedAccountId,
    });

    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      await this.messagingTelemetryService.track({
        eventName: 'message_list_fetch_job.error.connected_account_not_found',
        workspaceId,
        connectedAccountId,
      });

      return;
    }

    const messageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!messageChannel) {
      await this.messagingTelemetryService.track({
        eventName: 'message_list_fetch_job.error.message_channel_not_found',
        workspaceId,
        connectedAccountId,
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

    switch (messageChannel.syncStage) {
      case MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING:
        this.logger.log(
          `Fetching partial message list for workspace ${workspaceId} and account ${connectedAccount.id}`,
        );

        await this.messagingTelemetryService.track({
          eventName: 'partial_message_list_fetch.started',
          workspaceId,
          connectedAccountId,
          messageChannelId: messageChannel.id,
        });

        await this.gmailPartialMessageListFetchV2Service.processMessageListFetch(
          messageChannel,
          connectedAccount,
          workspaceId,
        );

        await this.messagingTelemetryService.track({
          eventName: 'partial_message_list_fetch.completed',
          workspaceId,
          connectedAccountId,
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
          connectedAccountId,
          messageChannelId: messageChannel.id,
        });

        await this.gmailFullMessageListFetchService.processMessageListFetch(
          messageChannel,
          connectedAccount,
          workspaceId,
        );

        await this.messagingTelemetryService.track({
          eventName: 'full_message_list_fetch.completed',
          workspaceId,
          connectedAccountId,
          messageChannelId: messageChannel.id,
        });

        break;

      default:
        break;
    }
  }
}

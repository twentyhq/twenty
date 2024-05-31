import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GmailPartialMessageListFetchV2Service } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch-v2.service';
import {
  MessageChannelSyncSubStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { GmailFullMessageListFetchV2Service } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch-v2.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessagingTelemetryService } from 'src/modules/messaging/services/telemetry/messaging-telemetry.service';

export type GmailMessageListFetchJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailMessageListFetchJob
  implements MessageQueueJob<GmailMessageListFetchJobData>
{
  private readonly logger = new Logger(GmailMessageListFetchJob.name);

  constructor(
    private readonly gmailFullMessageListFetchV2Service: GmailFullMessageListFetchV2Service,
    private readonly gmailPartialMessageListFetchV2Service: GmailPartialMessageListFetchV2Service,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  async handle(data: GmailMessageListFetchJobData): Promise<void> {
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

    switch (messageChannel.syncSubStatus) {
      case MessageChannelSyncSubStatus.PARTIAL_MESSAGE_LIST_FETCH_PENDING:
        this.logger.log(
          `Fetching partial message list for workspace ${workspaceId} and account ${connectedAccount.id}`,
        );

        await this.messagingTelemetryService.track({
          eventName: 'partial_message_list_fetch.started',
          workspaceId,
          connectedAccountId,
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

      case MessageChannelSyncSubStatus.FULL_MESSAGE_LIST_FETCH_PENDING:
        this.logger.log(
          `Fetching full message list for workspace ${workspaceId} and account ${connectedAccount.id}`,
        );

        await this.messagingTelemetryService.track({
          eventName: 'full_message_list_fetch.started',
          workspaceId,
          connectedAccountId,
        });

        await this.gmailFullMessageListFetchV2Service.processMessageListFetch(
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

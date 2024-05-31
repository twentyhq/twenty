import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailFullMessageListFetchService } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch.service';
import { GmailFullMessageListFetchV2Service } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch-v2.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { MessagingTelemetryService } from 'src/modules/messaging/services/telemetry/messaging-telemetry.service';

export type GmailFullMessageListFetchJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailFullMessageListFetchJob
  implements MessageQueueJob<GmailFullMessageListFetchJobData>
{
  private readonly logger = new Logger(GmailFullMessageListFetchJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailFullMessageListFetchService: GmailFullMessageListFetchService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly gmailFullMessageListFetchV2Service: GmailFullMessageListFetchV2Service,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  async handle(data: GmailFullMessageListFetchJobData): Promise<void> {
    const { workspaceId, connectedAccountId } = data;

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccountId}`,
    );

    try {
      await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
        workspaceId,
        connectedAccountId,
      );
    } catch (e) {
      this.logger.error(
        `Error refreshing access token for connected account ${connectedAccountId} in workspace ${workspaceId}`,
        e,
      );

      return;
    }

    const isGmailSyncV2EnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId: workspaceId,
        key: FeatureFlagKeys.IsGmailSyncV2Enabled,
        value: true,
      });

    const isGmailSyncV2Enabled = isGmailSyncV2EnabledFeatureFlag?.value;

    if (isGmailSyncV2Enabled) {
      // Todo delete this code block after migration
      const connectedAccount = await this.connectedAccountRepository.getById(
        connectedAccountId,
        workspaceId,
      );

      if (!connectedAccount) {
        throw new Error(
          `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
        );
      }

      const messageChannel =
        await this.messageChannelRepository.getFirstByConnectedAccountId(
          connectedAccountId,
          workspaceId,
        );

      if (!messageChannel) {
        throw new Error(
          `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
        );
      }

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
    } else {
      await this.gmailFullMessageListFetchService.fetchConnectedAccountThreads(
        data.workspaceId,
        data.connectedAccountId,
      );
    }
  }
}

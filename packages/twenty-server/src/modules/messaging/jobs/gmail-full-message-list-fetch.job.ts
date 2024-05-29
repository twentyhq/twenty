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
import { GetConnectedAccountAndMessageChannelService } from 'src/modules/messaging/services/get-connected-account-and-message-channel/get-connected-account-and-message-channel.service';

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
    private readonly getConnectedAccountAndMessageChannelService: GetConnectedAccountAndMessageChannelService,
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
      const { messageChannel, connectedAccount } =
        await this.getConnectedAccountAndMessageChannelService.getConnectedAccountAndMessageChannelOrThrow(
          workspaceId,
          connectedAccountId,
        );

      await this.gmailFullMessageListFetchV2Service.processMessageListFetch(
        messageChannel,
        connectedAccount,
        workspaceId,
      );
    }
    await this.gmailFullMessageListFetchService.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}

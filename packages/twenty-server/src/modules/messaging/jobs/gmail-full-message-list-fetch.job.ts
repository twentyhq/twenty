import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { GmailFullMessageListFetchService } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch.service';
import { GmailFullSyncV2Service } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-sync-v2.service';

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
    private readonly gmailFullSyncV2Service: GmailFullSyncV2Service,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly gmailFullSyncService: GmailFullMessageListFetchService,
  ) {}

  async handle(data: GmailFullMessageListFetchJobData): Promise<void> {
    this.logger.log(
      `gmail full-sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
    );

    try {
      await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
        data.workspaceId,
        data.connectedAccountId,
      );
    } catch (e) {
      this.logger.error(
        `Error refreshing access token for connected account ${data.connectedAccountId} in workspace ${data.workspaceId}`,
        e,
      );

      return;
    }

    const isGmailSyncV2EnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId: data.workspaceId,
        key: FeatureFlagKeys.IsGmailSyncV2Enabled,
        value: true,
      });

    const isGmailSyncV2Enabled = isGmailSyncV2EnabledFeatureFlag?.value;

    if (isGmailSyncV2Enabled) {
      await this.gmailFullSyncV2Service.fetchConnectedAccountThreads(
        data.workspaceId,
        data.connectedAccountId,
      );
    } else {
      await this.gmailFullSyncService.fetchConnectedAccountThreads(
        data.workspaceId,
        data.connectedAccountId,
      );
    }
  }
}

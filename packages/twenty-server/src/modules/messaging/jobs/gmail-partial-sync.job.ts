import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailPartialSyncService } from 'src/modules/messaging/services/gmail-partial-sync/gmail-partial-sync.service';
import { GmailPartialSyncV2Service } from 'src/modules/messaging/services/gmail-partial-sync/gmail-partial-sync-v2.service';

export type GmailPartialSyncJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailPartialSyncJob
  implements MessageQueueJob<GmailPartialSyncJobData>
{
  private readonly logger = new Logger(GmailPartialSyncJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailPartialSyncService: GmailPartialSyncService,
    private readonly gmailPartialSyncV2Service: GmailPartialSyncV2Service,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async handle(data: GmailPartialSyncJobData): Promise<void> {
    this.logger.log(
      `gmail partial-sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
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
      await this.gmailPartialSyncV2Service.fetchConnectedAccountThreads(
        data.workspaceId,
        data.connectedAccountId,
      );
    } else {
      await this.gmailPartialSyncService.fetchConnectedAccountThreads(
        data.workspaceId,
        data.connectedAccountId,
      );
    }
  }
}

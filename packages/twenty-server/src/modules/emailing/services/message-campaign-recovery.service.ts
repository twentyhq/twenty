import { Injectable, Logger } from '@nestjs/common';

import { LessThan } from 'typeorm';
import { MessageCampaignStatus } from 'twenty-shared/types';

import { CAMPAIGN_SENDING_STALE_THRESHOLD_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

@Injectable()
export class MessageCampaignRecoveryService {
  private readonly logger = new Logger(MessageCampaignRecoveryService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageCampaignService: MessageCampaignService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  async sweepStuckSendingCampaigns({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const staleSince = new Date(
      Date.now() - CAMPAIGN_SENDING_STALE_THRESHOLD_MS,
    ).toISOString();

    const staleCampaigns =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const campaignRepository =
            await this.getCampaignRepository(workspaceId);

          return campaignRepository.find({
            where: {
              status: MessageCampaignStatus.SENDING,
              updatedAt: LessThan(staleSince),
            },
            select: { id: true },
          });
        },
        buildSystemAuthContext(workspaceId),
      );

    for (const campaign of staleCampaigns) {
      await this.recoverStaleCampaign({
        workspaceId,
        campaignId: campaign.id,
      }).catch((error) => {
        this.logger.error(
          `Failed to recover campaign ${campaign.id} of workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
    }
  }

  private async recoverStaleCampaign({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const countByDeliveryStatus =
      await this.messageCampaignStatisticsService.countMessagesByDeliveryStatus(
        { workspaceId, campaignId },
      );

    if (countByDeliveryStatus.size > 0) {
      await this.messageCampaignService.finalizeCampaignIfComplete({
        workspaceId,
        campaignId,
      });

      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = await this.getCampaignRepository(workspaceId);

      await campaignRepository.update(
        { id: campaignId, status: MessageCampaignStatus.SENDING },
        { status: MessageCampaignStatus.DRAFT },
      );
    }, buildSystemAuthContext(workspaceId));

    this.logger.warn(
      `Campaign ${campaignId} of workspace ${workspaceId} materialized no message and was released back to draft`,
    );
  }

  private async getCampaignRepository(workspaceId: string) {
    return this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );
  }
}

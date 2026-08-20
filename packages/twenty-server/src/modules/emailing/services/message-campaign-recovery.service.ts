import { Injectable, Logger } from '@nestjs/common';

import { LessThan, MoreThan } from 'typeorm';
import { MessageCampaignStatus } from 'twenty-shared/types';

import { CAMPAIGN_SENDING_STALE_THRESHOLD_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@Injectable()
export class MessageCampaignRecoveryService {
  private readonly logger = new Logger(MessageCampaignRecoveryService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  async recoverOngoingStaleCampaigns({
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
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              MessageCampaignWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

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
        staleSince,
      }).catch((error) => {
        this.logger.error(
          `Failed to recover campaign ${campaign.id} of workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
    }
  }

  private async hasRecentMessageProgress({
    workspaceId,
    campaignId,
    staleSince,
  }: {
    workspaceId: string;
    campaignId: string;
    staleSince: string;
  }): Promise<boolean> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const recentlyChangedMessageCount = await messageRepository.count({
          where: {
            messageCampaignId: campaignId,
            updatedAt: MoreThan(staleSince),
          },
        });

        return recentlyChangedMessageCount > 0;
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  private async recoverStaleCampaign({
    workspaceId,
    campaignId,
    staleSince,
  }: {
    workspaceId: string;
    campaignId: string;
    staleSince: string;
  }): Promise<void> {
    const hasProgress = await this.hasRecentMessageProgress({
      workspaceId,
      campaignId,
      staleSince,
    });

    if (hasProgress) {
      return;
    }

    const countByDeliveryStatus =
      await this.messageCampaignStatisticsService.countMessagesByDeliveryStatus(
        { workspaceId, campaignId },
      );

    if (countByDeliveryStatus.size > 0) {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const failedCount =
            await this.messageCampaignLifecycleService.failStalledMessages({
              workspaceId,
              campaignId,
            });

          if (failedCount > 0) {
            this.logger.warn(
              `Campaign ${campaignId} of workspace ${workspaceId} had ${failedCount} message(s) stalled and they were failed`,
            );
          }

          await this.messageCampaignLifecycleService.finalizeCampaignIfComplete(
            {
              workspaceId,
              campaignId,
            },
          );
        },
        buildSystemAuthContext(workspaceId),
      );

      return;
    }

    await this.messageCampaignLifecycleService.transitionCampaignStatus({
      workspaceId,
      campaignId,
      from: MessageCampaignStatus.SENDING,
      to: MessageCampaignStatus.DRAFT,
    });

    this.logger.warn(
      `Campaign ${campaignId} of workspace ${workspaceId} materialized no message and was released back to draft`,
    );
  }
}

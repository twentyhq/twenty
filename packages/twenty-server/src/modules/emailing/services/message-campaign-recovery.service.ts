import { Injectable, Logger } from '@nestjs/common';

import { In, LessThan, MoreThan } from 'typeorm';
import { MessageCampaignStatus } from 'twenty-shared/types';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const SENDING_STALE_THRESHOLD_MS = 60 * 60 * 1000;

@Injectable()
export class MessageCampaignRecoveryService {
  private readonly logger = new Logger(MessageCampaignRecoveryService.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  async recoverOngoingStaleCampaigns({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const staleSince = new Date(
      Date.now() - SENDING_STALE_THRESHOLD_MS,
    ).toISOString();

    const staleCampaigns =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const campaignRepository = this.workspaceOrmManager.getRepository(
          MessageCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

        return campaignRepository.find({
          where: {
            status: In([
              MessageCampaignStatus.SENDING,
              MessageCampaignStatus.CANCELED,
            ]),
            updatedAt: LessThan(staleSince),
          },
          select: { id: true },
        });
      }, buildSystemAuthContext(workspaceId));

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
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository = this.workspaceOrmManager.getRepository(
        MessageWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      return messageRepository.exists({
        where: {
          messageCampaignId: campaignId,
          updatedAt: MoreThan(staleSince),
        },
      });
    }, buildSystemAuthContext(workspaceId));
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

    const counts =
      await this.messageCampaignStatisticsService.countDeliveriesByState({
        workspaceId,
        campaignId,
      });

    if (counts.totalCount > 0) {
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const failedCount =
          await this.messageCampaignLifecycleService.failDeliveriesWithExpiredClaims(
            { workspaceId, campaignId },
          );

        if (failedCount > 0) {
          this.logger.warn(
            `Campaign ${campaignId} of workspace ${workspaceId} had ${failedCount} message(s) stalled and they were failed`,
          );
        }

        await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
          workspaceId,
          campaignId,
        });
      }, buildSystemAuthContext(workspaceId));

      return;
    }

    const released =
      await this.messageCampaignLifecycleService.transitionCampaignStatus({
        workspaceId,
        campaignId,
        from: MessageCampaignStatus.SENDING,
        to: MessageCampaignStatus.DRAFT,
      });

    if (released) {
      this.logger.warn(
        `Campaign ${campaignId} of workspace ${workspaceId} materialized no message and was released back to draft`,
      );
    }
  }
}

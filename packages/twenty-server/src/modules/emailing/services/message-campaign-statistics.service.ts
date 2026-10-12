import { CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';
import { CAMPAIGN_JOB_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-job-retry-limit.constant';
import { Injectable } from '@nestjs/common';

import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { MoreThanOrEqual } from 'typeorm';
import { MessageCampaignStatus } from 'twenty-shared/types';

import {
  CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS,
  REFRESH_CAMPAIGN_STATS_JOB,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type RefreshCampaignStatsJobData } from 'src/engine/core-modules/emailing-domain/types/refresh-campaign-stats-job-data.type';
import { type CampaignCountGroup } from 'src/engine/core-modules/emailing-domain/types/campaign-count-group.type';
import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';
import { computeCampaignCounts } from 'src/engine/core-modules/emailing-domain/utils/compute-campaign-counts.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getCampaignDeliveryTableName } from 'src/modules/emailing/utils/get-campaign-delivery-table-name.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { type CampaignEngagementCounts } from 'src/modules/emailing/types/campaign-engagement-counts.type';

const RECONCILIATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class MessageCampaignStatisticsService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
  ) {}

  async scheduleRefresh({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    await this.messageQueueService.add<RefreshCampaignStatsJobData>(
      REFRESH_CAMPAIGN_STATS_JOB,
      { workspaceId, campaignId },
      {
        delay: CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS,
        retryLimit: CAMPAIGN_JOB_RETRY_LIMIT,
        deduplication: {
          id: `campaign-stats-refresh:${workspaceId}:${campaignId}`,
          keepLastIfActive: true,
        },
      },
    );
  }

  async countDeliveriesByState({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<CampaignCounts> {
    const groups = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignDeliveryRepository =
          this.workspaceOrmManager.getRepository(
            CampaignDeliveryWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
            { shouldSkipEventEmission: true },
          );
        return campaignDeliveryRepository.executeRaw<CampaignCountGroup>(
          `SELECT
        "state",
        COUNT(*) AS "total",
        COUNT("deliveredAt") AS "deliveredCount",
        COUNT("bouncedAt") AS "bouncedCount",
        COUNT("complainedAt") AS "complainedCount",
        COUNT(*) FILTER (WHERE "rejectedAt" IS NOT NULL OR "renderingFailedAt" IS NOT NULL) AS "providerFailedCount"
      FROM ${getCampaignDeliveryTableName(workspaceId)}
      WHERE "campaignId" = :campaignId
      GROUP BY "state"`,
          { campaignId },
        );
      },
      buildSystemAuthContext(workspaceId),
    );

    return computeCampaignCounts({ groups });
  }

  async refreshCampaignCounts({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const counts = await this.countDeliveriesByState({
      workspaceId,
      campaignId,
    });

    await this.persistCampaignCounts({ workspaceId, campaignId, counts });

    if (!this.campaignEngagementEventService.isAvailable()) {
      return;
    }

    const engagementCounts =
      await this.campaignEngagementEventService.countCampaignEngagement({
        workspaceId,
        campaignId,
      });

    await this.persistEngagementStats({
      workspaceId,
      campaignId,
      engagementCounts,
      deliveredCount: counts.deliveredCount,
    });
  }

  async reconcileWorkspaceCampaignCounts({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const campaignIds =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const campaignRepository = this.workspaceOrmManager.getRepository(
          MessageCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

        const campaigns = await campaignRepository.find({
          where: [
            { status: MessageCampaignStatus.SENDING },
            {
              sentAt: MoreThanOrEqual(
                new Date(Date.now() - RECONCILIATION_WINDOW_MS),
              ),
            },
          ],
          select: { id: true },
        });

        return campaigns.map((campaign) => campaign.id);
      }, buildSystemAuthContext(workspaceId));

    for (const campaignId of campaignIds) {
      await this.scheduleRefresh({ workspaceId, campaignId });
    }
  }

  async persistCampaignCounts({
    workspaceId,
    campaignId,
    counts,
  }: {
    workspaceId: string;
    campaignId: string;
    counts: CampaignCounts;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = this.workspaceOrmManager.getRepository(
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const campaign = await campaignRepository.findOne({
        where: { id: campaignId },
        select: {
          id: true,
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          skippedCount: true,
          bouncedCount: true,
          complainedCount: true,
        },
      });

      if (!isDefined(campaign)) {
        return;
      }

      const nextCounts = {
        sentCount: counts.sentCount,
        deliveredCount: counts.deliveredCount,
        failedCount: counts.failedCount,
        skippedCount: counts.skippedCount,
        bouncedCount: counts.bouncedCount,
        complainedCount: counts.complainedCount,
      };

      const storedCounts = {
        sentCount: campaign.sentCount,
        deliveredCount: campaign.deliveredCount,
        failedCount: campaign.failedCount,
        skippedCount: campaign.skippedCount,
        bouncedCount: campaign.bouncedCount,
        complainedCount: campaign.complainedCount,
      };

      if (fastDeepEqual(storedCounts, nextCounts)) {
        return;
      }

      await campaignRepository.update({ id: campaignId }, nextCounts);
    }, buildSystemAuthContext(workspaceId));
  }

  private async persistEngagementStats({
    workspaceId,
    campaignId,
    engagementCounts,
    deliveredCount,
  }: {
    workspaceId: string;
    campaignId: string;
    engagementCounts: CampaignEngagementCounts;
    deliveredCount: number;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = this.workspaceOrmManager.getRepository(
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const campaign = await campaignRepository.findOne({
        where: { id: campaignId },
        select: {
          id: true,
          uniqueClickCount: true,
          clickRate: true,
          uniqueOpenCount: true,
          openRate: true,
        },
      });

      if (!isDefined(campaign)) {
        return;
      }

      const nextEngagementStats = {
        uniqueClickCount: engagementCounts.uniqueClickCount,
        clickRate: this.computeRate(
          engagementCounts.uniqueClickCount,
          deliveredCount,
        ),
        uniqueOpenCount: engagementCounts.uniqueOpenCount,
        openRate: this.computeRate(
          engagementCounts.uniqueOpenCount,
          deliveredCount,
        ),
      };

      const storedEngagementStats = {
        uniqueClickCount: campaign.uniqueClickCount,
        clickRate: campaign.clickRate,
        uniqueOpenCount: campaign.uniqueOpenCount,
        openRate: campaign.openRate,
      };

      if (fastDeepEqual(storedEngagementStats, nextEngagementStats)) {
        return;
      }

      await campaignRepository.update({ id: campaignId }, nextEngagementStats);
    }, buildSystemAuthContext(workspaceId));
  }

  private computeRate(count: number, deliveredCount: number): number {
    if (deliveredCount === 0) {
      return 0;
    }

    return count / deliveredCount;
  }
}

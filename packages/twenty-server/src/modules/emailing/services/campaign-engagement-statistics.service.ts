import { Injectable } from '@nestjs/common';

import { In, IsNull } from 'typeorm';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CAMPAIGN_ENGAGEMENT_EVENT_TYPE } from 'src/modules/emailing/constants/campaign-engagement-event-type.constant';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { type CampaignEngagementCounts } from 'src/modules/emailing/types/campaign-engagement-counts.type';

@Injectable()
export class CampaignEngagementStatisticsService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  // Unique recipients, bounced ones excluded; the rate divides by
  // deliveredCount. Returns undefined when ClickHouse cannot answer, which
  // leaves the stored engagement fields as they are instead of writing a
  // false zero.
  async countEngagedDeliveries({
    workspaceId,
    campaignId,
    deliveredCount,
    isClickTrackingEnabled,
  }: {
    workspaceId: string;
    campaignId: string;
    deliveredCount: number;
    isClickTrackingEnabled: boolean;
  }): Promise<CampaignEngagementCounts | undefined> {
    if (!isClickTrackingEnabled) {
      return { clickedCount: null, clickRate: null };
    }

    if (!this.campaignEngagementEventService.isAvailable()) {
      return undefined;
    }

    try {
      const clickerIds = await this.findNotBouncedClickerIds({
        workspaceId,
        campaignId,
      });

      return {
        clickedCount: clickerIds.length,
        clickRate: this.computeRate(clickerIds.length, deliveredCount),
      };
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: { workspaceId, campaignId },
      });

      return undefined;
    }
  }

  // An engagement is itself proof the email arrived, so a missing delivery
  // receipt does not disqualify a recipient; only a bounce does.
  private async findNotBouncedClickerIds({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<string[]> {
    const engagedIds =
      await this.campaignEngagementEventService.findEngagedDeliveryIds({
        workspaceId,
        messageCampaignId: campaignId,
        eventType: CAMPAIGN_ENGAGEMENT_EVENT_TYPE.CLICK,
        activityFilter: CampaignEngagementActivityFilter.FILTERED,
      });

    if (engagedIds.length === 0) {
      return [];
    }

    const notBouncedEngaged = await this.campaignDeliveryRepository.find(
      workspaceId,
      {
        where: { id: In(engagedIds), campaignId, bouncedAt: IsNull() },
        select: { id: true },
      },
    );

    return notBouncedEngaged.map((delivery) => delivery.id);
  }

  private computeRate(count: number, deliveredCount: number): number | null {
    if (deliveredCount === 0) {
      return null;
    }

    return count / deliveredCount;
  }
}

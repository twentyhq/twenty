import { Injectable } from '@nestjs/common';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { type CampaignEngagementCounts } from 'src/modules/emailing/types/campaign-engagement-counts.type';
import { type CampaignTrackingFlags } from 'src/modules/emailing/types/campaign-tracking-flags.type';

@Injectable()
export class CampaignEngagementStatisticsService {
  constructor(
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async computeEngagementCounts({
    workspaceId,
    campaignId,
    sentCount,
    bouncedCount,
    isClickTrackingEnabled,
    isOpenTrackingEnabled,
  }: {
    workspaceId: string;
    campaignId: string;
    sentCount: number;
    bouncedCount: number;
  } & CampaignTrackingFlags): Promise<CampaignEngagementCounts | undefined> {
    if (
      (!isClickTrackingEnabled && !isOpenTrackingEnabled) ||
      !this.campaignEngagementEventService.isAvailable()
    ) {
      return undefined;
    }

    try {
      const { uniqueClickers, uniqueOpeners } =
        await this.campaignEngagementEventService.countEngagement({
          workspaceId,
          messageCampaignId: campaignId,
          activityFilter: CampaignEngagementActivityFilter.FILTERED,
        });
      const reachedCount = sentCount - bouncedCount;
      const clickedCount = isClickTrackingEnabled ? uniqueClickers : null;
      const openedCount = isOpenTrackingEnabled ? uniqueOpeners : null;

      return {
        clickedCount,
        openedCount,
        clickRate: this.computeRate(clickedCount, reachedCount),
        openRate: this.computeRate(openedCount, reachedCount),
      };
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: { workspaceId, campaignId },
      });

      return undefined;
    }
  }

  private computeRate(
    count: number | null,
    reachedCount: number,
  ): number | null {
    if (count === null || reachedCount <= 0) {
      return null;
    }

    return count / reachedCount;
  }
}

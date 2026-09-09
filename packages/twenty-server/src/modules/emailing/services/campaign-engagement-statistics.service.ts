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
  }: {
    workspaceId: string;
    campaignId: string;
    sentCount: number;
    bouncedCount: number;
  } & CampaignTrackingFlags): Promise<CampaignEngagementCounts | undefined> {
    if (
      !isClickTrackingEnabled ||
      !this.campaignEngagementEventService.isAvailable()
    ) {
      return undefined;
    }

    try {
      const { uniqueClickers } =
        await this.campaignEngagementEventService.countEngagement({
          workspaceId,
          messageCampaignId: campaignId,
          activityFilter: CampaignEngagementActivityFilter.FILTERED,
        });

      return {
        clickedCount: uniqueClickers,
        clickRate: this.computeRate(uniqueClickers, sentCount - bouncedCount),
      };
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: { workspaceId, campaignId },
      });

      return undefined;
    }
  }

  private computeRate(count: number, reachedCount: number): number | null {
    return reachedCount > 0 ? count / reachedCount : null;
  }
}

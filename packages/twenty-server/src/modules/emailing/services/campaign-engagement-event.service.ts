import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS } from 'src/modules/emailing/constants/campaign-engagement-insert-busy-timeout-ms.constant';
import { MESSAGE_VIEW_TABLE } from 'src/modules/emailing/constants/message-view-table.constant';
import { SHORT_LINK_CLICK_TABLE } from 'src/modules/emailing/constants/short-link-click-table.constant';
import { type CampaignEngagementActivityClass } from 'src/modules/emailing/types/campaign-engagement-activity-class.type';
import { type CampaignEngagementCounts } from 'src/modules/emailing/types/campaign-engagement-counts.type';

type ShortLinkClickEvent = {
  workspaceId: string;
  messageCampaignId: string;
  shortLinkId: string;
  deliveryId: string;
  eventId: string;
  occurredAt: string;
  activityClass: CampaignEngagementActivityClass;
};

@Injectable()
export class CampaignEngagementEventService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  isAvailable(): boolean {
    return isDefined(this.clickHouseService.getMainClient());
  }

  async insertClickOrThrow(event: ShortLinkClickEvent): Promise<void> {
    const result = await this.clickHouseService.insert(
      SHORT_LINK_CLICK_TABLE,
      [{ ...event, occurredAt: formatDateTimeForClickHouse(event.occurredAt) }],
      {
        asyncInsertBusyTimeoutMaxMs: CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS,
      },
    );

    if (!result.success) {
      throw result.error;
    }
  }

  async countCampaignEngagement({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<CampaignEngagementCounts> {
    const [clicks, opens] = await Promise.all([
      this.countHumanEngagement({
        table: SHORT_LINK_CLICK_TABLE,
        workspaceId,
        campaignId,
      }),
      this.countHumanEngagement({
        table: MESSAGE_VIEW_TABLE,
        workspaceId,
        campaignId,
      }),
    ]);

    return {
      uniqueClickCount: clicks.uniqueCount,
      totalClickCount: clicks.totalCount,
      uniqueOpenCount: opens.uniqueCount,
      totalOpenCount: opens.totalCount,
    };
  }

  private async countHumanEngagement({
    table,
    workspaceId,
    campaignId,
  }: {
    table: string;
    workspaceId: string;
    campaignId: string;
  }): Promise<{ uniqueCount: number; totalCount: number }> {
    const [row] = await this.clickHouseService.selectOrThrow<{
      uniqueCount: string;
      totalCount: string;
    }>(
      `SELECT uniqExact(deliveryId) AS uniqueCount, uniqExact(eventId) AS totalCount
       FROM ${table}
       WHERE workspaceId = {workspaceId:UUID}
         AND messageCampaignId = {campaignId:UUID}
         AND activityClass = 'UNCLASSIFIED'`,
      { workspaceId, campaignId },
    );

    return {
      uniqueCount: Number(row?.uniqueCount ?? 0),
      totalCount: Number(row?.totalCount ?? 0),
    };
  }
}

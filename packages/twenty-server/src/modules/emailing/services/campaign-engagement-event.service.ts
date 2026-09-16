import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { type CampaignEngagementActivityClass } from 'src/modules/emailing/types/campaign-engagement-activity-class.type';

type ShortLinkClickEvent = {
  workspaceId: string;
  messageCampaignId: string;
  shortLinkId: string;
  deliveryId: string;
  eventId: string;
  occurredAt: string;
  activityClass: CampaignEngagementActivityClass;
};

const SHORT_LINK_CLICK_TABLE = 'shortLinkClick';
const CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS = 1_000;

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
}

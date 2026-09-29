import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS } from 'src/modules/emailing/constants/campaign-engagement-insert-busy-timeout-ms.constant';
import { SHORT_LINK_CLICK_TABLE } from 'src/modules/emailing/constants/short-link-click-table.constant';
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

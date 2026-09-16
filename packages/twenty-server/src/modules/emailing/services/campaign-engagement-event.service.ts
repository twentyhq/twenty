import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { type CampaignEngagementActivityClass } from 'src/modules/emailing/types/campaign-engagement-activity-class.type';
import { type CampaignEngagementBucket } from 'src/modules/emailing/types/campaign-engagement-bucket.type';

type CampaignScope = {
  workspaceId: string;
  messageCampaignId: string;
  activityFilter: CampaignEngagementActivityFilter;
};

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
const SCANNER_BURST_MIN_DISTINCT_LINKS = 3;
const SCANNER_BURST_WINDOW_MS = 10_000;

const CLICK_SCOPE_CONDITION = `workspaceId = {workspaceId:UUID}
  AND messageCampaignId = {messageCampaignId:UUID}`;

const SCANNER_BURST_EVENT_SUBQUERY = `SELECT eventId
  FROM (
    SELECT
      eventId,
      uniqExact(shortLinkId) OVER (
        PARTITION BY deliveryId
        ORDER BY toUnixTimestamp64Milli(occurredAt)
        RANGE BETWEEN ${SCANNER_BURST_WINDOW_MS} PRECEDING
          AND ${SCANNER_BURST_WINDOW_MS} FOLLOWING
      ) AS distinctLinksInWindow
    FROM ${SHORT_LINK_CLICK_TABLE}
    WHERE ${CLICK_SCOPE_CONDITION}
  )
  WHERE distinctLinksInWindow >= ${SCANNER_BURST_MIN_DISTINCT_LINKS}`;

const FILTERED_CLICK_CONDITION = `AND activityClass != 'SUSPECTED_AUTOMATION'
  AND activityClass != 'PRIVACY_PROXY'
  AND eventId NOT IN (${SCANNER_BURST_EVENT_SUBQUERY})`;

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

  async findClickerDeliveryIds(scope: CampaignScope): Promise<string[]> {
    const rows = await this.select<{ deliveryId: string }>(
      `SELECT DISTINCT deliveryId
       FROM ${SHORT_LINK_CLICK_TABLE}
       WHERE ${CLICK_SCOPE_CONDITION}
         ${this.buildClickActivityCondition(scope.activityFilter)}`,
      scope,
    );

    return rows.map((row) => row.deliveryId);
  }

  async countClicks(scope: CampaignScope): Promise<{
    totalClicks: number;
    uniqueClickers: number;
  }> {
    const [row] = await this.select<{
      totalClicks: string | number;
      uniqueClickers: string | number;
    }>(
      `SELECT
         uniqExact(eventId) AS totalClicks,
         uniqExact(deliveryId) AS uniqueClickers
       FROM ${SHORT_LINK_CLICK_TABLE}
       WHERE ${CLICK_SCOPE_CONDITION}
         ${this.buildClickActivityCondition(scope.activityFilter)}`,
      scope,
    );

    return {
      totalClicks: Number(row?.totalClicks ?? 0),
      uniqueClickers: Number(row?.uniqueClickers ?? 0),
    };
  }

  async findClickSeries({
    bucket,
    ...scope
  }: CampaignScope & { bucket: CampaignEngagementBucket }): Promise<
    { bucketStart: Date; clicks: number }[]
  > {
    const bucketFunction = bucket === 'hour' ? 'toStartOfHour' : 'toStartOfDay';

    const rows = await this.select<{
      bucketStart: string;
      clicks: string | number;
    }>(
      `SELECT
         ${bucketFunction}(occurredAt) AS bucketStart,
         uniqExact(eventId) AS clicks
       FROM ${SHORT_LINK_CLICK_TABLE}
       WHERE ${CLICK_SCOPE_CONDITION}
         ${this.buildClickActivityCondition(scope.activityFilter)}
       GROUP BY bucketStart
       ORDER BY bucketStart`,
      scope,
    );

    return rows.map((row) => ({
      bucketStart: parseClickHouseDateTime(row.bucketStart),
      clicks: Number(row.clicks),
    }));
  }

  async findClicksByShortLink(
    scope: CampaignScope,
  ): Promise<
    { shortLinkId: string; uniqueClickers: number; totalClicks: number }[]
  > {
    const rows = await this.select<{
      shortLinkId: string;
      uniqueClickers: string | number;
      totalClicks: string | number;
    }>(
      `SELECT
         shortLinkId,
         uniqExact(deliveryId) AS uniqueClickers,
         uniqExact(eventId) AS totalClicks
       FROM ${SHORT_LINK_CLICK_TABLE}
       WHERE ${CLICK_SCOPE_CONDITION}
         ${this.buildClickActivityCondition(scope.activityFilter)}
       GROUP BY shortLinkId`,
      scope,
    );

    return rows.map((row) => ({
      shortLinkId: row.shortLinkId,
      uniqueClickers: Number(row.uniqueClickers),
      totalClicks: Number(row.totalClicks),
    }));
  }

  async findClickedDeliveries({
    limit,
    ...scope
  }: CampaignScope & { limit: number }): Promise<
    {
      deliveryId: string;
      firstClickedAt: Date | null;
      lastClickedAt: Date;
    }[]
  > {
    const rows = await this.select<{
      deliveryId: string;
      firstClickedAt: string;
      lastClickedAt: string;
    }>(
      `SELECT
         deliveryId,
         min(occurredAt) AS firstClickedAt,
         max(occurredAt) AS lastClickedAt
       FROM ${SHORT_LINK_CLICK_TABLE}
       WHERE ${CLICK_SCOPE_CONDITION}
         ${this.buildClickActivityCondition(scope.activityFilter)}
       GROUP BY deliveryId
       ORDER BY lastClickedAt DESC
       LIMIT {limit:UInt32}`,
      { ...scope, limit },
    );

    return rows.map((row) => ({
      deliveryId: row.deliveryId,
      firstClickedAt: parseClickHouseDateTime(row.firstClickedAt),
      lastClickedAt: parseClickHouseDateTime(row.lastClickedAt),
    }));
  }

  private buildClickActivityCondition(
    activityFilter: CampaignEngagementActivityFilter,
  ): string {
    return activityFilter === CampaignEngagementActivityFilter.FILTERED
      ? FILTERED_CLICK_CONDITION
      : '';
  }

  private select<TRow>(
    query: string,
    params: Record<string, string | number>,
  ): Promise<TRow[]> {
    return this.clickHouseService.selectOrThrow<TRow>(query, params);
  }
}

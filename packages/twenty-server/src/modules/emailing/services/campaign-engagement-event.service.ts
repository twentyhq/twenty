import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS } from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';
import { CAMPAIGN_ENGAGEMENT_EVENT_TABLE } from 'src/modules/emailing/constants/campaign-engagement-event-table.constant';
import { CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS } from 'src/modules/emailing/constants/campaign-engagement-insert-busy-timeout-ms.constant';
import { type CampaignEngagementBucket } from 'src/modules/emailing/types/campaign-engagement-bucket.type';
import { type CampaignEngagementEvent } from 'src/modules/emailing/types/campaign-engagement-event.type';
import { type CampaignEngagementEventType } from 'src/modules/emailing/types/campaign-engagement-event-type.type';

type CampaignScope = {
  workspaceId: string;
  messageCampaignId: string;
  activityFilter: CampaignEngagementActivityFilter;
};

const SCANNER_BURST_MIN_DISTINCT_DESTINATIONS = 3;
const SCANNER_BURST_WINDOW_MS = 10_000;

const CAMPAIGN_SCOPE_CONDITION = `workspaceId = {workspaceId:UUID}
  AND messageCampaignId = {messageCampaignId:UUID}`;

const SCANNER_BURST_EVENT_SUBQUERY = `SELECT eventId
  FROM (
    SELECT
      eventId,
      uniqExact(destinationId) OVER (
        PARTITION BY deliveryId
        ORDER BY toUnixTimestamp64Milli(occurredAt)
        RANGE BETWEEN ${SCANNER_BURST_WINDOW_MS} PRECEDING
          AND ${SCANNER_BURST_WINDOW_MS} FOLLOWING
      ) AS distinctDestinationsInWindow
    FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
    WHERE ${CAMPAIGN_SCOPE_CONDITION} AND eventType = 'CLICK'
  )
  WHERE distinctDestinationsInWindow >= ${SCANNER_BURST_MIN_DISTINCT_DESTINATIONS}`;

const FILTERED_CONDITION = `AND activityClass != '${CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.SUSPECTED_AUTOMATION}'
  AND eventId NOT IN (${SCANNER_BURST_EVENT_SUBQUERY})`;

@Injectable()
export class CampaignEngagementEventService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  isAvailable(): boolean {
    return isDefined(this.clickHouseService.getMainClient());
  }

  async insertOrThrow(event: CampaignEngagementEvent): Promise<void> {
    const result = await this.clickHouseService.insert(
      CAMPAIGN_ENGAGEMENT_EVENT_TABLE,
      [{ ...event, occurredAt: formatDateTimeForClickHouse(event.occurredAt) }],
      {
        asyncInsertBusyTimeoutMaxMs: CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS,
      },
    );

    if (!result.success) {
      throw result.error;
    }
  }

  async findEngagedDeliveryIds({
    eventType,
    ...scope
  }: CampaignScope & {
    eventType: CampaignEngagementEventType;
  }): Promise<string[]> {
    const rows = await this.select<{ deliveryId: string }>(
      `SELECT DISTINCT deliveryId
       FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
       WHERE ${CAMPAIGN_SCOPE_CONDITION}
         AND eventType = {eventType:String}
         ${this.buildActivityCondition(scope.activityFilter)}`,
      { ...scope, eventType },
    );

    return rows.map((row) => row.deliveryId);
  }

  async countEngagement(scope: CampaignScope): Promise<{
    totalOpens: number;
    totalClicks: number;
    uniqueOpeners: number;
    uniqueClickers: number;
  }> {
    const [row] = await this.select<{
      totalOpens: string | number;
      totalClicks: string | number;
      uniqueOpeners: string | number;
      uniqueClickers: string | number;
    }>(
      `SELECT
         uniqExactIf(eventId, eventType = 'OPEN') AS totalOpens,
         uniqExactIf(eventId, eventType = 'CLICK') AS totalClicks,
         uniqExactIf(deliveryId, eventType IN ('OPEN', 'CLICK')) AS uniqueOpeners,
         uniqExactIf(deliveryId, eventType = 'CLICK') AS uniqueClickers
       FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
       WHERE ${CAMPAIGN_SCOPE_CONDITION}
         ${this.buildActivityCondition(scope.activityFilter)}`,
      scope,
    );

    return {
      totalOpens: Number(row?.totalOpens ?? 0),
      totalClicks: Number(row?.totalClicks ?? 0),
      uniqueOpeners: Number(row?.uniqueOpeners ?? 0),
      uniqueClickers: Number(row?.uniqueClickers ?? 0),
    };
  }

  async findSeries({
    bucket,
    ...scope
  }: CampaignScope & { bucket: CampaignEngagementBucket }): Promise<
    { bucketStart: Date; opens: number; clicks: number }[]
  > {
    const bucketFunction = bucket === 'hour' ? 'toStartOfHour' : 'toStartOfDay';

    const rows = await this.select<{
      bucketStart: string;
      opens: string | number;
      clicks: string | number;
    }>(
      `SELECT
         ${bucketFunction}(occurredAt) AS bucketStart,
         uniqExactIf(eventId, eventType = 'OPEN') AS opens,
         uniqExactIf(eventId, eventType = 'CLICK') AS clicks
       FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
       WHERE ${CAMPAIGN_SCOPE_CONDITION}
         ${this.buildActivityCondition(scope.activityFilter)}
       GROUP BY bucketStart
       ORDER BY bucketStart`,
      scope,
    );

    return rows.map((row) => ({
      bucketStart: parseClickHouseDateTime(row.bucketStart),
      opens: Number(row.opens),
      clicks: Number(row.clicks),
    }));
  }

  async findClicksByDestination(
    scope: CampaignScope,
  ): Promise<
    { destinationId: string; uniqueClickers: number; totalClicks: number }[]
  > {
    const rows = await this.select<{
      destinationId: string;
      uniqueClickers: string | number;
      totalClicks: string | number;
    }>(
      `SELECT
         destinationId,
         uniqExact(deliveryId) AS uniqueClickers,
         uniqExact(eventId) AS totalClicks
       FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
       WHERE ${CAMPAIGN_SCOPE_CONDITION}
         AND eventType = 'CLICK'
         AND destinationId IS NOT NULL
         ${this.buildActivityCondition(scope.activityFilter)}
       GROUP BY destinationId`,
      scope,
    );

    return rows.map((row) => ({
      destinationId: row.destinationId,
      uniqueClickers: Number(row.uniqueClickers),
      totalClicks: Number(row.totalClicks),
    }));
  }

  async findEngagedDeliveries({
    limit,
    ...scope
  }: CampaignScope & { limit: number }): Promise<
    {
      deliveryId: string;
      firstOpenedAt: Date | null;
      firstClickedAt: Date | null;
      lastEngagedAt: Date;
    }[]
  > {
    const rows = await this.select<{
      deliveryId: string;
      firstOpenedAt: string | null;
      firstClickedAt: string | null;
      lastEngagedAt: string;
    }>(
      `SELECT
         deliveryId,
         minIfOrNull(occurredAt, eventType = 'OPEN') AS firstOpenedAt,
         minIfOrNull(occurredAt, eventType = 'CLICK') AS firstClickedAt,
         max(occurredAt) AS lastEngagedAt
       FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
       WHERE ${CAMPAIGN_SCOPE_CONDITION}
         ${this.buildActivityCondition(scope.activityFilter)}
       GROUP BY deliveryId
       ORDER BY lastEngagedAt DESC
       LIMIT {limit:UInt32}`,
      { ...scope, limit },
    );

    return rows.map((row) => ({
      deliveryId: row.deliveryId,
      firstOpenedAt: isDefined(row.firstOpenedAt)
        ? parseClickHouseDateTime(row.firstOpenedAt)
        : null,
      firstClickedAt: isDefined(row.firstClickedAt)
        ? parseClickHouseDateTime(row.firstClickedAt)
        : null,
      lastEngagedAt: parseClickHouseDateTime(row.lastEngagedAt),
    }));
  }

  async findRecentlyEngagedCampaignIds({
    workspaceId,
    since,
  }: {
    workspaceId: string;
    since: Date;
  }): Promise<string[]> {
    const rows = await this.select<{ messageCampaignId: string }>(
      `SELECT DISTINCT messageCampaignId
       FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
       WHERE workspaceId = {workspaceId:UUID}
         AND occurredAt >= {since:DateTime64(3)}`,
      { workspaceId, since: formatDateTimeForClickHouse(since) },
    );

    return rows.map((row) => row.messageCampaignId);
  }

  private buildActivityCondition(
    activityFilter: CampaignEngagementActivityFilter,
  ): string {
    return activityFilter === CampaignEngagementActivityFilter.FILTERED
      ? FILTERED_CONDITION
      : '';
  }

  private select<TRow>(
    query: string,
    params: Record<string, string | number>,
  ): Promise<TRow[]> {
    return this.clickHouseService.selectOrThrow<TRow>(query, params);
  }
}

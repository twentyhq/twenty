import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS } from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';
import {
  CAMPAIGN_ENGAGEMENT_EVENT_TABLE,
  CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS,
} from 'src/modules/emailing/constants/campaign-engagement-event-table.constant';
import { type CampaignEngagementEventType } from 'src/modules/emailing/constants/campaign-engagement-event-type.constant';
import { type CampaignEngagementEvent } from 'src/modules/emailing/types/campaign-engagement-event.type';

export type CampaignEngagementBucket = 'hour' | 'day';

type CampaignScope = {
  workspaceId: string;
  messageCampaignId: string;
  activityFilter: CampaignEngagementActivityFilter;
};

// A scanner opens every link of a message within seconds; a person does not.
const SCANNER_MIN_DISTINCT_DESTINATIONS = 3;
const SCANNER_MAX_SPREAD_SECONDS = 10;

const CAMPAIGN_SCOPE_CONDITION = `workspaceId = {workspaceId:UUID}
  AND messageCampaignId = {messageCampaignId:UUID}`;

const SCANNER_DELIVERY_SUBQUERY = `SELECT deliveryId
  FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
  WHERE ${CAMPAIGN_SCOPE_CONDITION} AND eventType = 'CLICK'
  GROUP BY deliveryId
  HAVING uniqExact(destinationId) >= ${SCANNER_MIN_DISTINCT_DESTINATIONS}
    AND dateDiff('second', min(occurredAt), max(occurredAt)) <= ${SCANNER_MAX_SPREAD_SECONDS}`;

const FILTERED_CONDITION = `AND activityClass = '${CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.UNCLASSIFIED}'
  AND deliveryId NOT IN (${SCANNER_DELIVERY_SUBQUERY})`;

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

  // Retries write duplicate rows on purpose; every count here is distinct.
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
    totalClicks: number;
    uniqueClickers: number;
  }> {
    const [row] = await this.select<{
      totalClicks: string | number;
      uniqueClickers: string | number;
    }>(
      `SELECT
         uniqExactIf(eventId, eventType = 'CLICK') AS totalClicks,
         uniqExactIf(deliveryId, eventType = 'CLICK') AS uniqueClickers
       FROM ${CAMPAIGN_ENGAGEMENT_EVENT_TABLE}
       WHERE ${CAMPAIGN_SCOPE_CONDITION}
         ${this.buildActivityCondition(scope.activityFilter)}`,
      scope,
    );

    return {
      totalClicks: Number(row?.totalClicks ?? 0),
      uniqueClickers: Number(row?.uniqueClickers ?? 0),
    };
  }

  async findSeries({
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
      firstClickedAt: Date | null;
      lastEngagedAt: Date;
    }[]
  > {
    const rows = await this.select<{
      deliveryId: string;
      firstClickedAt: string | null;
      lastEngagedAt: string;
    }>(
      `SELECT
         deliveryId,
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

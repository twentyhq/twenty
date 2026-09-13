import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS } from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';
import { CAMPAIGN_ENGAGEMENT_EVENT_TYPE } from 'src/modules/emailing/constants/campaign-engagement-event-type.constant';
import { CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS } from 'src/modules/emailing/constants/campaign-engagement-insert-busy-timeout-ms.constant';
import { MESSAGE_VIEW_TABLE } from 'src/modules/emailing/constants/message-view-table.constant';
import { SHORT_LINK_CLICK_TABLE } from 'src/modules/emailing/constants/short-link-click-table.constant';
import { type CampaignEngagementBucket } from 'src/modules/emailing/types/campaign-engagement-bucket.type';
import { type MessageViewEvent } from 'src/modules/emailing/types/message-view-event.type';
import { type ShortLinkClickEvent } from 'src/modules/emailing/types/short-link-click-event.type';

type CampaignScope = {
  workspaceId: string;
  messageCampaignId: string;
  activityFilter: CampaignEngagementActivityFilter;
};

const SCANNER_BURST_MIN_DISTINCT_LINKS = 3;
const SCANNER_BURST_WINDOW_MS = 10_000;

const CLICK_SCOPE_CONDITION = `workspaceId = {workspaceId:UUID}
  AND messageCampaignId = {messageCampaignId:UUID}`;

const VIEW_SCOPE_CONDITION = `workspaceId = {workspaceId:UUID}
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

const HUMAN_ACTIVITY_CONDITION = `AND activityClass != '${CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.SUSPECTED_AUTOMATION}'`;

const FILTERED_CLICK_CONDITION = `${HUMAN_ACTIVITY_CONDITION}
  AND eventId NOT IN (${SCANNER_BURST_EVENT_SUBQUERY})`;

@Injectable()
export class CampaignEngagementEventService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  isAvailable(): boolean {
    return isDefined(this.clickHouseService.getMainClient());
  }

  async insertClickOrThrow(event: ShortLinkClickEvent): Promise<void> {
    await this.insertOrThrow(SHORT_LINK_CLICK_TABLE, event);
  }

  async insertViewOrThrow(event: MessageViewEvent): Promise<void> {
    await this.insertOrThrow(MESSAGE_VIEW_TABLE, event);
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

  async countEngagement(scope: CampaignScope): Promise<{
    totalClicks: number;
    uniqueClickers: number;
    totalOpens: number;
    uniqueOpeners: number;
  }> {
    const [row] = await this.select<{
      totalClicks: string | number;
      uniqueClickers: string | number;
      totalOpens: string | number;
      uniqueOpeners: string | number;
    }>(
      `SELECT
         uniqExactIf(eventId, eventType = '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.CLICK}') AS totalClicks,
         uniqExactIf(deliveryId, eventType = '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.CLICK}') AS uniqueClickers,
         uniqExactIf(eventId, eventType = '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.OPEN}') AS totalOpens,
         uniqExact(deliveryId) AS uniqueOpeners
       FROM (${this.buildEngagementSubquery(scope.activityFilter)})`,
      scope,
    );

    return {
      totalClicks: Number(row?.totalClicks ?? 0),
      uniqueClickers: Number(row?.uniqueClickers ?? 0),
      totalOpens: Number(row?.totalOpens ?? 0),
      uniqueOpeners: Number(row?.uniqueOpeners ?? 0),
    };
  }

  async findEngagementSeries({
    bucket,
    ...scope
  }: CampaignScope & { bucket: CampaignEngagementBucket }): Promise<
    { bucketStart: Date; clicks: number; opens: number }[]
  > {
    const rows = await this.select<{
      bucketStart: string;
      clicks: string | number;
      opens: string | number;
    }>(
      `SELECT
         ${this.bucketFunction(bucket)}(occurredAt) AS bucketStart,
         uniqExactIf(eventId, eventType = '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.CLICK}') AS clicks,
         uniqExactIf(eventId, eventType = '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.OPEN}') AS opens
       FROM (${this.buildEngagementSubquery(scope.activityFilter)})
       GROUP BY bucketStart
       ORDER BY bucketStart`,
      scope,
    );

    return rows.map((row) => ({
      bucketStart: parseClickHouseDateTime(row.bucketStart),
      clicks: Number(row.clicks),
      opens: Number(row.opens),
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
         minIfOrNull(occurredAt, eventType = '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.OPEN}') AS firstOpenedAt,
         minIfOrNull(occurredAt, eventType = '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.CLICK}') AS firstClickedAt,
         max(occurredAt) AS lastEngagedAt
       FROM (${this.buildEngagementSubquery(scope.activityFilter)})
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

  private async insertOrThrow(
    table: string,
    event: ShortLinkClickEvent | MessageViewEvent,
  ): Promise<void> {
    const result = await this.clickHouseService.insert(
      table,
      [{ ...event, occurredAt: formatDateTimeForClickHouse(event.occurredAt) }],
      {
        asyncInsertBusyTimeoutMaxMs: CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS,
      },
    );

    if (!result.success) {
      throw result.error;
    }
  }

  private buildEngagementSubquery(
    activityFilter: CampaignEngagementActivityFilter,
  ): string {
    return `SELECT eventId, deliveryId, occurredAt, '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.OPEN}' AS eventType
      FROM ${MESSAGE_VIEW_TABLE}
      WHERE ${VIEW_SCOPE_CONDITION}
        ${this.buildViewActivityCondition(activityFilter)}
      UNION ALL
      SELECT eventId, deliveryId, occurredAt, '${CAMPAIGN_ENGAGEMENT_EVENT_TYPE.CLICK}' AS eventType
      FROM ${SHORT_LINK_CLICK_TABLE}
      WHERE ${CLICK_SCOPE_CONDITION}
        ${this.buildClickActivityCondition(activityFilter)}`;
  }

  private bucketFunction(bucket: CampaignEngagementBucket): string {
    return bucket === 'hour' ? 'toStartOfHour' : 'toStartOfDay';
  }

  private buildClickActivityCondition(
    activityFilter: CampaignEngagementActivityFilter,
  ): string {
    return activityFilter === CampaignEngagementActivityFilter.FILTERED
      ? FILTERED_CLICK_CONDITION
      : '';
  }

  private buildViewActivityCondition(
    activityFilter: CampaignEngagementActivityFilter,
  ): string {
    return activityFilter === CampaignEngagementActivityFilter.FILTERED
      ? HUMAN_ACTIVITY_CONDITION
      : '';
  }

  private select<TRow>(
    query: string,
    params: Record<string, string | number>,
  ): Promise<TRow[]> {
    return this.clickHouseService.selectOrThrow<TRow>(query, params);
  }
}

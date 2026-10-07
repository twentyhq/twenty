import { randomUUID } from 'node:crypto';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { gql } from 'graphql-tag';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const DAY_MS = 24 * 60 * 60 * 1000;
const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;

// A past day no other suite writes to, so analytics totals are exactly the rows seeded here
const HISTORY_PERIOD_START = new Date(
  Math.floor((Date.now() - 400 * DAY_MS) / DAY_MS) * DAY_MS,
);
const HISTORY_PERIOD_END = new Date(HISTORY_PERIOD_START.getTime() + DAY_MS);

const PAID_CHAT_CREDITS_MICRO = 2_000_000;
const PAID_WEB_SEARCH_CREDITS_MICRO = 500_000;
const PAID_CREDITS_MICRO =
  PAID_CHAT_CREDITS_MICRO + PAID_WEB_SEARCH_CREDITS_MICRO;
const INCLUDED_CHAT_TOKEN_CREDITS_MICRO = 5_000_000;
const INCLUDED_CHAT_WEB_SEARCH_CREDITS_MICRO = 1_000_000;

const PAID_MODEL = 'paid-model';
const INCLUDED_MODEL = 'included-model';

const GET_USAGE_ANALYTICS = gql`
  query GetUsageAnalytics($input: UsageAnalyticsInput) {
    getUsageAnalytics(input: $input) {
      usageByUser {
        key
        creditsUsed
      }
      usageByOperationType {
        key
        creditsUsed
      }
      usageByModel {
        key
        creditsUsed
      }
      timeSeries {
        date
        creditsUsed
      }
    }
  }
`;

const USAGE_QUOTA_SCOPE_CONSUMPTION = gql`
  query UsageQuotaScopeConsumption($input: UsageQuotaScopeInput!) {
    usageQuotaScopeConsumption(input: $input) {
      consumedValue
    }
  }
`;

const GET_ADMIN_AI_USAGE_BY_WORKSPACE = gql`
  query GetAdminAiUsageByWorkspace(
    $periodStart: DateTime
    $periodEnd: DateTime
  ) {
    getAdminAiUsageByWorkspace(
      periodStart: $periodStart
      periodEnd: $periodEnd
    ) {
      key
      creditsUsed
      includedCreditsUsed
    }
  }
`;

type BreakdownItem = { key: string; creditsUsed: number };

const toDisplayCredits = (creditsMicro: number) =>
  creditsMicro / INTERNAL_CREDITS_PER_DISPLAY_CREDIT;

describe('Non-billable operation usage', () => {
  let clickHouseClient: ClickHouseClient;
  const resourceId = randomUUID();
  const userWorkspaceId = randomUUID();

  const buildChatRows = (timestamp: Date) => {
    const baseRow = {
      timestamp: formatDateTimeForClickHouse(timestamp),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId,
      resourceType: UsageResourceType.AI,
      resourceId,
      metadata: {},
    };

    return [
      {
        ...baseRow,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        unit: UsageUnit.TOKEN,
        quantity: 200,
        creditsUsedMicro: PAID_CHAT_CREDITS_MICRO,
        resourceContext: PAID_MODEL,
      },
      {
        ...baseRow,
        operationType: UsageOperationType.WEB_SEARCH,
        unit: UsageUnit.INVOCATION,
        quantity: 1,
        creditsUsedMicro: PAID_WEB_SEARCH_CREDITS_MICRO,
        resourceContext: '',
      },
      {
        ...baseRow,
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
        unit: UsageUnit.TOKEN,
        quantity: 500,
        creditsUsedMicro: INCLUDED_CHAT_TOKEN_CREDITS_MICRO,
        resourceContext: INCLUDED_MODEL,
      },
      {
        ...baseRow,
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
        unit: UsageUnit.INVOCATION,
        quantity: 1,
        creditsUsedMicro: INCLUDED_CHAT_WEB_SEARCH_CREDITS_MICRO,
        resourceContext: '',
      },
    ];
  };

  const countSeededRows = async (): Promise<number> => {
    const result = await clickHouseClient.query({
      query: `SELECT count() AS rowCount
              FROM usageEvent
              WHERE workspaceId = {workspaceId:String}
                AND resourceId = {resourceId:String}`,
      query_params: { workspaceId: SEED_APPLE_WORKSPACE_ID, resourceId },
      format: 'JSONEachRow',
    });

    const [row] = await result.json<{ rowCount: string }>();

    return Number(row?.rowCount ?? 0);
  };

  const getUsageAnalytics = async (
    input: Record<string, unknown> = {},
  ): Promise<{
    usageByUser: BreakdownItem[];
    usageByOperationType: BreakdownItem[];
    usageByModel: BreakdownItem[];
    timeSeries: { date: string; creditsUsed: number }[];
  }> => {
    const response = await makeMetadataApiRequest({
      query: GET_USAGE_ANALYTICS,
      variables: {
        input: {
          periodStart: HISTORY_PERIOD_START.toISOString(),
          periodEnd: HISTORY_PERIOD_END.toISOString(),
          ...input,
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.getUsageAnalytics;
  };

  const findScopeConsumedValue = async (
    input: Record<string, unknown>,
  ): Promise<number | null> => {
    const response = await makeMetadataApiRequest({
      query: USAGE_QUOTA_SCOPE_CONSUMPTION,
      variables: {
        input: {
          resourceType: UsageResourceType.AI,
          spenderType: 'workspace',
          spenderId: null,
          periodUnit: 'month',
          unit: UsageUnit.CREDIT,
          ...input,
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.usageQuotaScopeConsumption?.consumedValue ?? null;
  };

  beforeAll(async () => {
    clickHouseClient = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: {
        allow_experimental_json_type: 1,
      },
      log: { level: ClickHouseLogLevel.OFF },
    });

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: [
        ...buildChatRows(new Date(HISTORY_PERIOD_START.getTime() + 60_000)),
        ...buildChatRows(new Date()),
      ],
      format: 'JSONEachRow',
    });

    await expectEventually(
      async () => {
        expect(await countSeededRows()).toBe(8);
      },
      { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
    );
  });

  afterAll(async () => {
    await clickHouseClient.command({
      query: `ALTER TABLE usageEvent DELETE
              WHERE workspaceId = {workspaceId:String}
                AND resourceId = {resourceId:String}`,
      query_params: { workspaceId: SEED_APPLE_WORKSPACE_ID, resourceId },
      clickhouse_settings: { mutations_sync: '2' },
    });

    await clickHouseClient.close();
  });

  describe('workspace usage analytics', () => {
    it('leaves included chat out of every breakdown', async () => {
      const analytics = await getUsageAnalytics();
      const paidChatCredits = toDisplayCredits(PAID_CHAT_CREDITS_MICRO);

      expect(analytics.usageByOperationType).toEqual([
        { key: UsageOperationType.AI_CHAT_TOKEN, creditsUsed: paidChatCredits },
        {
          key: UsageOperationType.WEB_SEARCH,
          creditsUsed: toDisplayCredits(PAID_WEB_SEARCH_CREDITS_MICRO),
        },
      ]);
      expect(analytics.usageByModel).toEqual([
        { key: PAID_MODEL, creditsUsed: paidChatCredits },
      ]);
      expect(analytics.usageByUser).toEqual([
        {
          key: userWorkspaceId,
          creditsUsed: toDisplayCredits(PAID_CREDITS_MICRO),
        },
      ]);
    });

    it('leaves included chat out of the time series', async () => {
      const analytics = await getUsageAnalytics();

      const totalCredits = analytics.timeSeries.reduce(
        (total, point) => total + point.creditsUsed,
        0,
      );

      expect(totalCredits).toBe(toDisplayCredits(PAID_CREDITS_MICRO));
    });

    it('returns nothing when asked for included chat by name', async () => {
      const analytics = await getUsageAnalytics({
        operationTypes: [UsageOperationType.AI_CHAT_INCLUDED],
      });

      expect(analytics.usageByOperationType).toEqual([]);
      expect(analytics.usageByModel).toEqual([]);
      expect(analytics.usageByUser).toEqual([]);
      expect(
        analytics.timeSeries.every((point) => point.creditsUsed === 0),
      ).toBe(true);
    });
  });

  describe('limit form consumption preview', () => {
    it('leaves included chat out of a credit scope over every operation', async () => {
      expect(
        await findScopeConsumedValue({
          operationType: UsageOperationType.ALL,
          spenderType: 'userWorkspace',
          spenderId: userWorkspaceId,
        }),
      ).toBe(PAID_CREDITS_MICRO);
    });

    it('reads nothing for a scope naming included chat', async () => {
      expect(
        await findScopeConsumedValue({
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          spenderType: 'userWorkspace',
          spenderId: userWorkspaceId,
        }),
      ).toBeNull();
      expect(
        await findScopeConsumedValue({
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          periodUnit: 'day',
        }),
      ).toBeNull();
    });
  });

  describe('admin AI usage by workspace', () => {
    it('reports included chat as its own figure, next to paid chat and web search', async () => {
      const response = await makeAdminPanelApiRequest({
        query: GET_ADMIN_AI_USAGE_BY_WORKSPACE,
        variables: {
          periodStart: HISTORY_PERIOD_START.toISOString(),
          periodEnd: HISTORY_PERIOD_END.toISOString(),
        },
      });

      expect(response.body.errors).toBeUndefined();

      const workspaceUsage = response.body.data.getAdminAiUsageByWorkspace.find(
        (item: { key: string }) => item.key === SEED_APPLE_WORKSPACE_ID,
      );

      jestExpectToBeDefined(workspaceUsage);

      // Dollar mode applies with billing off; both scales are one unit per million micro-credits
      expect(workspaceUsage).toEqual({
        key: SEED_APPLE_WORKSPACE_ID,
        creditsUsed: toDisplayCredits(PAID_CREDITS_MICRO),
        includedCreditsUsed: toDisplayCredits(
          INCLUDED_CHAT_TOKEN_CREDITS_MICRO +
            INCLUDED_CHAT_WEB_SEARCH_CREDITS_MICRO,
        ),
      });
    });
  });
});

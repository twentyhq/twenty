import { randomUUID } from 'node:crypto';

import { addMinutes, addMonths, startOfMonth } from 'date-fns';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import {
  getSeededBillingWorkspaceId,
  quitBillingFixtureRedis,
  readAllowanceCounter,
  resetBillingCreditState,
  setupResourceCreditSubscription,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { gql } from 'graphql-tag';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Off the month boundary so no other suite's rows carry the same period stamp
const PERIOD_START = addMinutes(startOfMonth(new Date()), 17);
const PERIOD_END = addMonths(PERIOD_START, 1);

const ALLOWANCE_MICRO = 10_000_000;
const PAID_CHAT_CREDITS_MICRO = 3_000_000;
const INCLUDED_CHAT_CREDITS_MICRO = 4_000_000;
const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;

const GET_RESOURCE_CREDIT_USAGE = gql`
  query GetResourceCreditUsage {
    getResourceCreditUsage {
      usedCredits
    }
  }
`;

const AI_CHAT_USAGE = gql`
  query AiChatUsage {
    aiChatUsage {
      kind
      limitValue
      consumedValue
    }
  }
`;

describe('Billing resource credit usage (integration)', () => {
  let workspaceId: string;
  let clickHouseClient: ClickHouseClient;
  const resourceId = randomUUID();

  const countSeededRows = async (): Promise<number> => {
    const result = await clickHouseClient.query({
      query: `SELECT count() AS rowCount
              FROM usageEvent
              WHERE workspaceId = {workspaceId:String}
                AND resourceId = {resourceId:String}`,
      query_params: { workspaceId, resourceId },
      format: 'JSONEachRow',
    });

    const [row] = await result.json<{ rowCount: string }>();

    return Number(row?.rowCount ?? 0);
  };

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();

    clickHouseClient = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: {
        allow_experimental_json_type: 1,
      },
      log: { level: ClickHouseLogLevel.OFF },
    });

    // Every request below reads as Jane, so rows seeded on another workspace would never be read back
    if (workspaceId !== SEED_APPLE_WORKSPACE_ID) {
      throw new Error(
        `The seeded billing subscription belongs to workspace ${workspaceId}, not to the Apple workspace the access token reads`,
      );
    }

    await resetBillingCreditState(workspaceId);
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
    });

    const baseRow = {
      timestamp: formatDateTimeForClickHouse(new Date()),
      workspaceId,
      periodStart: formatDateTimeForClickHouse(PERIOD_START),
      resourceType: UsageResourceType.AI,
      resourceId,
      unit: UsageUnit.TOKEN,
      metadata: {},
    };

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: [
        {
          ...baseRow,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          quantity: 300,
          creditsUsedMicro: PAID_CHAT_CREDITS_MICRO,
        },
        {
          ...baseRow,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          quantity: 400,
          creditsUsedMicro: INCLUDED_CHAT_CREDITS_MICRO,
        },
      ],
      format: 'JSONEachRow',
    });

    await expectEventually(
      async () => {
        expect(await countSeededRows()).toBe(2);
      },
      { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
    );
  });

  afterAll(async () => {
    await clickHouseClient.command({
      query: `ALTER TABLE usageEvent DELETE
              WHERE workspaceId = {workspaceId:String}
                AND resourceId = {resourceId:String}`,
      query_params: { workspaceId, resourceId },
      clickhouse_settings: { mutations_sync: '2' },
    });

    await clickHouseClient.close();
    await resetBillingCreditState(workspaceId);
    await quitBillingFixtureRedis();
  });

  it('leaves included chat out of the credits used this period', async () => {
    const response = await makeMetadataApiRequest({
      query: GET_RESOURCE_CREDIT_USAGE,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getResourceCreditUsage).toEqual([
      {
        usedCredits:
          PAID_CHAT_CREDITS_MICRO / INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
      },
    ]);
  });

  it('warms the allowance counter without included chat', async () => {
    // A cold counter is warmed from ClickHouse, which is the read under test
    await resetBillingCreditState(workspaceId);

    const response = await makeMetadataApiRequest({ query: AI_CHAT_USAGE });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.aiChatUsage).toEqual({
      kind: 'allowance',
      limitValue: ALLOWANCE_MICRO,
      consumedValue: PAID_CHAT_CREDITS_MICRO,
    });
    expect(await readAllowanceCounter(workspaceId, PERIOD_START)).toBe(
      ALLOWANCE_MICRO - PAID_CHAT_CREDITS_MICRO,
    );
  });
});

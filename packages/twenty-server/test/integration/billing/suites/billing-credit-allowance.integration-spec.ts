import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { addMonths, startOfMonth } from 'date-fns';
import {
  getSeededBillingWorkspaceId,
  quitBillingFixtureRedis,
  readAllowanceCounter,
  resetBillingCreditState,
  setupResourceCreditSubscription,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { type BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// The subscription period must contain now() so the counter's TTL is positive.
const PERIOD_START = startOfMonth(new Date());
const PERIOD_END = addMonths(PERIOD_START, 1);

const ALLOWANCE_MICRO = 10_000;
const STAMPED_USAGE_MICRO = 3_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Billing credit allowance enforcement (integration)', () => {
  let workspaceId: string;
  let quotaService: UsageLimitQuotaService;
  let billingCreditService: BillingCreditService;
  let workspaceCacheService: WorkspaceCacheService;
  let clickHouse: ClickHouseClient;

  const quotaArgs = () => ({
    workspaceId,
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    spenders: {},
  });

  const sumStampedUsage = async (): Promise<number> => {
    const result = await clickHouse.query({
      query: `SELECT sum(creditsUsedMicro) AS total FROM usageEvent
              WHERE workspaceId = '${workspaceId}'
                AND resourceType = '${UsageResourceType.WORKFLOW}'`,
      format: 'JSONEachRow',
    });
    const rows = await result.json<{ total: string }>();

    return Number(rows[0]?.total ?? 0);
  };

  const waitForStampedUsage = async (expectedTotal: number) => {
    for (let attempt = 0; attempt < 50; attempt++) {
      if ((await sumStampedUsage()) === expectedTotal) {
        return;
      }
      await sleep(100);
    }

    throw new Error(
      `ClickHouse never reached ${expectedTotal} micro-credits of stamped usage`,
    );
  };

  const deleteStampedUsage = async () => {
    await clickHouse.command({
      query: `ALTER TABLE usageEvent DELETE
              WHERE workspaceId = '${workspaceId}'
                AND resourceType = '${UsageResourceType.WORKFLOW}'`,
      clickhouse_settings: { mutations_sync: '2' },
    });
  };

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
    quotaService = getAppProviderByClassName<UsageLimitQuotaService>(
      'UsageLimitQuotaService',
    );
    billingCreditService = getAppProviderByClassName<BillingCreditService>(
      'BillingCreditService',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    clickHouse = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: { allow_experimental_json_type: 1 },
      log: { level: ClickHouseLogLevel.OFF },
    });

    // A quota limit left behind by another suite would put a limit counter in
    // front of the allowance and change which scope reports exhaustion.
    await global.testDataSource.query(
      `DELETE FROM core."usageLimit" WHERE "workspaceId" = $1 AND "limitKind" = 'quota'`,
      [workspaceId],
    );
    await workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    await deleteStampedUsage();
    await clickHouse.insert({
      table: 'usageEvent',
      format: 'JSONEachRow',
      values: [
        {
          timestamp: formatDateTimeForClickHouse(new Date()),
          periodStart: formatDateTimeForClickHouse(PERIOD_START),
          workspaceId,
          resourceType: UsageResourceType.WORKFLOW,
          operationType: UsageOperationType.WORKFLOW_EXECUTION,
          creditsUsedMicro: STAMPED_USAGE_MICRO,
          quantity: 1,
          metadata: {},
        },
      ],
    });
    await waitForStampedUsage(STAMPED_USAGE_MICRO);
  });

  // The subscription is written before the caches are invalidated: a
  // recompute landing mid-fixture must capture the final state, and the
  // invalidation must go through the app's own cache service or its
  // in-process copy would be re-served.
  beforeEach(async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
    });
    await resetBillingCreditState(workspaceId);
    await workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'currentBillingSubscription',
    ]);
  });

  afterAll(async () => {
    await resetBillingCreditState(workspaceId);
    await deleteStampedUsage();
    await clickHouse.close();
    await quitBillingFixtureRedis();
  });

  it('warms the allowance from the granted credits minus the stamped usage', async () => {
    const remaining =
      await quotaService.getAllowanceRemainingMicro(workspaceId);

    expect(remaining).toBe(ALLOWANCE_MICRO - STAMPED_USAGE_MICRO);
    expect(await readAllowanceCounter(workspaceId, PERIOD_START)).toBe(
      ALLOWANCE_MICRO - STAMPED_USAGE_MICRO,
    );
  });

  it('debits the allowance on consume and reports exhaustion once overspent', async () => {
    const { exhausted } = await quotaService.consumeQuota({
      ...quotaArgs(),
      cost: { creditsUsedMicro: 8_000, quantity: 1 },
    });

    expect(exhausted).toMatchObject({
      limitKind: 'quota',
      exhaustedKind: 'allowance',
    });
    expect(await readAllowanceCounter(workspaceId, PERIOD_START)).toBe(-1_000);

    await expect(
      quotaService.assertQuotaNotExhausted(quotaArgs()),
    ).rejects.toMatchObject({
      code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      exhaustedScope: expect.objectContaining({ exhaustedKind: 'allowance' }),
    });
  });

  it('drops the counter on a fresh grant so the next read includes it', async () => {
    await quotaService.getAllowanceRemainingMicro(workspaceId);

    await billingCreditService.grantCredits({
      workspaceId,
      amountMicro: 5_000,
      type: BillingCreditGrantType.COMPENSATION,
      reason: 'integration test grant',
    });

    expect(await readAllowanceCounter(workspaceId, PERIOD_START)).toBeNull();
    expect(await quotaService.getAllowanceRemainingMicro(workspaceId)).toBe(
      ALLOWANCE_MICRO + 5_000 - STAMPED_USAGE_MICRO,
    );
  });
});

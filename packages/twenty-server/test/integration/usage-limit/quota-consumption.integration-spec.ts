import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { randomUUID } from 'node:crypto';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { gql } from 'graphql-tag';
import { createClient as createRedisClient } from 'redis';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-month-period.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const LOGIC_FUNCTION_CODE = `export const main = async (): Promise<object> => {
  return { isDone: true };
};`;

const SEEDED_RUNS = [
  {
    invocationCreditsMicro: 1_000,
    durationMs: 1_500,
    durationCreditsMicro: 150,
  },
  {
    invocationCreditsMicro: 1_000,
    durationMs: 3_000,
    durationCreditsMicro: 300,
  },
  {
    invocationCreditsMicro: 1_000,
    durationMs: 4_500,
    durationCreditsMicro: 450,
  },
];

const SEEDED_CONSUMPTION_BY_UNIT = {
  [UsageUnit.INVOCATION]: SEEDED_RUNS.length,
  [UsageUnit.CREDIT]: 3_900,
};

const QUOTA_UNITS = [UsageUnit.INVOCATION, UsageUnit.CREDIT] as const;

const EXECUTED_RUN_COUNT = 2;
const UNREACHABLE_LIMIT_VALUE = 1_000_000_000_000;
const CREDIT_LIMIT_MICRO = 1_000;
const CONCURRENT_CHARGE_COUNT = 8;
const SLOW_SEED_READ_MS = 1_500;
const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;
const EXECUTION_TIMEOUT_MS = 120_000;

const USAGE_QUOTAS_WITH_CONSUMPTION = gql`
  query UsageQuotasWithConsumption {
    usageQuotasWithConsumption {
      id
      unit
      isEnforced
      consumedValue
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

type QuotaUnit = (typeof QUOTA_UNITS)[number];

const buildRunEvent = ({
  spenderId,
  creditsUsedMicro,
}: {
  spenderId: string;
  creditsUsedMicro: number;
}): RecordUsageInput => ({
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.CODE_EXECUTION,
  unit: UsageUnit.INVOCATION,
  quantity: 1,
  creditsUsedMicro,
  resourceId: spenderId,
  spenders: { logicFunctionId: spenderId },
});

describe('Usage quota consumption', () => {
  let clickHouseClient: ClickHouseClient;
  let redis: Awaited<ReturnType<typeof createRedisClient>>;
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let logicFunctionId: string;
  let usageLimitIdByUnit: Record<QuotaUnit, string>;
  const savedUsageLimitIds: string[] = [];
  const chargedSpenderIds: string[] = [];

  const getQuotaService = () =>
    getAppProviderByClassName<UsageLimitQuotaService>('UsageLimitQuotaService');

  const refreshUsageLimitsCache = () =>
    getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['usageLimits']);

  const findSpenderCounterKeys = (spenderId: string) =>
    redis.keys(`*{${SEED_APPLE_WORKSPACE_ID}}:*:logicFunction:${spenderId}:*`);

  const findQuotaCounterKeys = () => findSpenderCounterKeys(logicFunctionId);

  const flushQuotaCounters = async () => {
    const counterKeys = await redis.keys(
      `*{${SEED_APPLE_WORKSPACE_ID}}:quota*`,
    );

    if (counterKeys.length > 0) {
      await redis.del(counterKeys);
    }
  };

  const spyOnMetrics = () =>
    jest.spyOn(
      getAppProviderByClassName<MetricsService>('MetricsService'),
      'incrementCounterBy',
    );

  const findAdmittedOnFailureAttributes = (
    incrementCounterBySpy: ReturnType<typeof spyOnMetrics>,
  ) =>
    incrementCounterBySpy.mock.calls
      .map(([metric]) => metric)
      .filter(
        (metric) => metric.key === MetricsKeys.UsageLimitQuotaAdmittedOnFailure,
      )
      .map((metric) => metric.attributes);

  const chargeRun = (event: Parameters<typeof buildRunEvent>[0]) =>
    getQuotaService().charge({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      events: [buildRunEvent(event)],
    });

  const debitRunAheadOfRecord = (event: Parameters<typeof buildRunEvent>[0]) =>
    getQuotaService().debitAheadOfRecord({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      event: buildRunEvent(event),
    });

  const findRunRefusal = ({
    spenderId,
    costMicro,
  }: {
    spenderId: string;
    costMicro: number;
  }) =>
    getQuotaService().findExhaustedScope({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType: UsageOperationType.CODE_EXECUTION,
      spenders: { logicFunctionId: spenderId },
      cost: { [UsageUnit.CREDIT]: costMicro },
    });

  const countUsageEventRows = async (
    spenderId: string = logicFunctionId,
  ): Promise<number> => {
    const result = await clickHouseClient.query({
      query: `SELECT count() AS rowCount
              FROM usageEvent
              WHERE workspaceId = {workspaceId:String}
                AND logicFunctionId = {logicFunctionId:String}`,
      query_params: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        logicFunctionId: spenderId,
      },
      format: 'JSONEachRow',
    });

    const [row] = await result.json<{ rowCount: string }>();

    return Number(row?.rowCount ?? 0);
  };

  const waitForUsageEventRows = (expectedRowCount: number) =>
    expectEventually(
      async () => {
        expect(await countUsageEventRows()).toBe(expectedRowCount);
      },
      { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
    );

  const insertSeededRuns = async () => {
    const timestamp = formatDateTimeForClickHouse(new Date());
    const baseRow = {
      timestamp,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType: UsageOperationType.CODE_EXECUTION,
      resourceId: logicFunctionId,
      logicFunctionId,
      metadata: {},
    };

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: SEEDED_RUNS.flatMap(
        ({ invocationCreditsMicro, durationMs, durationCreditsMicro }) => [
          {
            ...baseRow,
            unit: UsageUnit.INVOCATION,
            quantity: 1,
            creditsUsedMicro: invocationCreditsMicro,
          },
          {
            ...baseRow,
            unit: UsageUnit.MILLISECOND,
            quantity: durationMs,
            creditsUsedMicro: durationCreditsMicro,
          },
        ],
      ),
      format: 'JSONEachRow',
    });
  };

  const saveCodeExecutionQuota = async ({
    spenderId,
    unit,
    limitValue,
    isInstanceOverride = true,
  }: {
    spenderId: string;
    unit: QuotaUnit;
    limitValue: number;
    isInstanceOverride?: boolean;
  }): Promise<string> => {
    const usageLimit = await usageLimitRepository.save({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType: UsageOperationType.CODE_EXECUTION,
      spenderType: 'logicFunction',
      spenderId,
      limitKind: 'quota',
      periodCount: 1,
      periodUnit: 'month',
      unit,
      limitValue,
      burstValue: null,
      isInstanceOverride,
    });

    savedUsageLimitIds.push(usageLimit.id);

    return usageLimit.id;
  };

  const saveCreditQuotaForNewSpender = async ({
    limitValue = CREDIT_LIMIT_MICRO,
    isInstanceOverride,
  }: {
    limitValue?: number;
    isInstanceOverride?: boolean;
  } = {}): Promise<{ spenderId: string; usageLimitId: string }> => {
    const spenderId = randomUUID();

    chargedSpenderIds.push(spenderId);

    const usageLimitId = await saveCodeExecutionQuota({
      spenderId,
      unit: UsageUnit.CREDIT,
      limitValue,
      isInstanceOverride,
    });

    await refreshUsageLimitsCache();

    return { spenderId, usageLimitId };
  };

  const findQuotaConsumedValue = async (unit: QuotaUnit) => {
    const response = await makeMetadataApiRequest({
      query: USAGE_QUOTAS_WITH_CONSUMPTION,
    });

    expect(response.body.errors).toBeUndefined();

    const usageQuota = response.body.data.usageQuotasWithConsumption.find(
      (quota: { id: string }) => quota.id === usageLimitIdByUnit[unit],
    );

    jestExpectToBeDefined(usageQuota);
    expect(usageQuota).toMatchObject({ unit, isEnforced: true });

    return usageQuota.consumedValue;
  };

  const findScopeConsumedValue = async (unit: QuotaUnit) => {
    const response = await makeMetadataApiRequest({
      query: USAGE_QUOTA_SCOPE_CONSUMPTION,
      variables: {
        input: {
          resourceType: UsageResourceType.LOGIC_FUNCTION,
          operationType: UsageOperationType.CODE_EXECUTION,
          spenderType: 'logicFunction',
          spenderId: logicFunctionId,
          periodUnit: 'month',
          unit,
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.usageQuotaScopeConsumption.consumedValue;
  };

  const executeRun = () =>
    executeLogicFunction({
      input: { id: logicFunctionId, payload: {} },
      expectToFail: false,
    });

  beforeAll(async () => {
    clickHouseClient = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: {
        allow_experimental_json_type: 1,
      },
      log: { level: ClickHouseLogLevel.OFF },
    });
    redis = await createRedisClient({ url: process.env.REDIS_URL }).connect();
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);

    const { data } = await createOneLogicFunction({
      input: {
        name: 'Usage quota consumption',
        source: {
          sourceHandlerCode: LOGIC_FUNCTION_CODE,
          handlerName: 'main',
        },
      },
      expectToFail: false,
    });

    logicFunctionId = data?.createOneLogicFunction?.id;
    jestExpectToBeDefined(logicFunctionId);

    await insertSeededRuns();
    await waitForUsageEventRows(SEEDED_RUNS.length * 2);

    usageLimitIdByUnit = {
      [UsageUnit.INVOCATION]: await saveCodeExecutionQuota({
        spenderId: logicFunctionId,
        unit: UsageUnit.INVOCATION,
        limitValue: UNREACHABLE_LIMIT_VALUE,
      }),
      [UsageUnit.CREDIT]: await saveCodeExecutionQuota({
        spenderId: logicFunctionId,
        unit: UsageUnit.CREDIT,
        limitValue: UNREACHABLE_LIMIT_VALUE,
      }),
    };

    await refreshUsageLimitsCache();
  }, EXECUTION_TIMEOUT_MS);

  afterAll(async () => {
    if (isNonEmptyArray(savedUsageLimitIds)) {
      await usageLimitRepository.delete(savedUsageLimitIds);
    }

    await refreshUsageLimitsCache();

    const quotaCounterKeys = await findQuotaCounterKeys();

    if (quotaCounterKeys.length > 0) {
      await redis.del(quotaCounterKeys);
    }

    await clickHouseClient.command({
      query: `ALTER TABLE usageEvent DELETE WHERE workspaceId = {workspaceId:String} AND logicFunctionId IN {logicFunctionIds:Array(String)}`,
      query_params: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        logicFunctionIds: [logicFunctionId, ...chargedSpenderIds],
      },
      clickhouse_settings: { mutations_sync: '2' },
    });

    await deleteLogicFunction({
      input: { id: logicFunctionId },
      expectToFail: false,
    });

    await redis.quit();
    await clickHouseClient.close();
  }, EXECUTION_TIMEOUT_MS);

  it.each(QUOTA_UNITS)(
    'previews the same cold %s consumption as the quota list',
    async (unit) => {
      expect(await findQuotaCounterKeys()).toEqual([]);

      const quotaConsumedValue = await findQuotaConsumedValue(unit);
      const scopeConsumedValue = await findScopeConsumedValue(unit);

      expect(quotaConsumedValue).toBe(SEEDED_CONSUMPTION_BY_UNIT[unit]);
      expect(scopeConsumedValue).toBe(SEEDED_CONSUMPTION_BY_UNIT[unit]);
    },
    EXECUTION_TIMEOUT_MS,
  );

  it(
    'keeps the warm counters equal to the recorded rows',
    async () => {
      for (let runIndex = 0; runIndex < EXECUTED_RUN_COUNT; runIndex++) {
        const { data, errors } = await executeRun();

        expect(errors).toBeUndefined();
        expect(data?.executeOneLogicFunction?.status).toBe(
          LogicFunctionExecutionStatus.SUCCESS,
        );
      }

      expect(await findQuotaCounterKeys()).toHaveLength(QUOTA_UNITS.length);

      await waitForUsageEventRows(
        (SEEDED_RUNS.length + EXECUTED_RUN_COUNT) * 2,
      );

      for (const unit of QUOTA_UNITS) {
        const quotaConsumedValue = await findQuotaConsumedValue(unit);
        const scopeConsumedValue = await findScopeConsumedValue(unit);

        expect(quotaConsumedValue).toBe(scopeConsumedValue);
        expect(quotaConsumedValue).toBeGreaterThanOrEqual(
          SEEDED_CONSUMPTION_BY_UNIT[unit],
        );
      }

      expect(await findQuotaConsumedValue(UsageUnit.INVOCATION)).toBe(
        SEEDED_RUNS.length + EXECUTED_RUN_COUNT,
      );
    },
    EXECUTION_TIMEOUT_MS,
  );

  it(
    'gives the same boundary answer once the counters are flushed',
    async () => {
      const creditLimit =
        Number(await findQuotaConsumedValue(UsageUnit.CREDIT)) +
        CREDIT_LIMIT_MICRO;

      const expectCreditBoundary = async () => {
        expect(
          await findRunRefusal({
            spenderId: logicFunctionId,
            costMicro: CREDIT_LIMIT_MICRO,
          }),
        ).toBeNull();
        expect(
          await findRunRefusal({
            spenderId: logicFunctionId,
            costMicro: CREDIT_LIMIT_MICRO + 1,
          }),
        ).toMatchObject({
          exhaustedKind: 'limit',
          unit: UsageUnit.CREDIT,
          limitValue: creditLimit,
        });
      };

      await usageLimitRepository.update(
        { id: usageLimitIdByUnit[UsageUnit.CREDIT] },
        { limitValue: creditLimit },
      );
      await refreshUsageLimitsCache();

      await expectCreditBoundary();

      await flushQuotaCounters();

      await expectCreditBoundary();

      await usageLimitRepository.update(
        { id: usageLimitIdByUnit[UsageUnit.CREDIT] },
        { limitValue: UNREACHABLE_LIMIT_VALUE },
      );
      await refreshUsageLimitsCache();
    },
    EXECUTION_TIMEOUT_MS,
  );

  it(
    'admits the last run under the invocation quota and refuses the next one',
    async () => {
      const invocationLimit =
        Number(await findQuotaConsumedValue(UsageUnit.INVOCATION)) + 1;
      const usageEventRowCount = await countUsageEventRows();

      await usageLimitRepository.update(
        { id: usageLimitIdByUnit[UsageUnit.INVOCATION] },
        { limitValue: invocationLimit },
      );
      await refreshUsageLimitsCache();

      const admitted = await executeRun();

      expect(admitted.errors).toBeUndefined();
      expect(admitted.data?.executeOneLogicFunction?.status).toBe(
        LogicFunctionExecutionStatus.SUCCESS,
      );

      const refused = await executeLogicFunction({
        input: { id: logicFunctionId, payload: {} },
        expectToFail: true,
      });

      expect(refused.errors?.[0]?.extensions).toMatchObject({
        subCode: 'QUOTA_EXHAUSTED',
        exhaustedKind: 'limit',
        unit: UsageUnit.INVOCATION,
        limit: invocationLimit,
        scope: { spenderType: 'logicFunction', spenderId: logicFunctionId },
      });

      await waitForUsageEventRows(usageEventRowCount + 2);
    },
    EXECUTION_TIMEOUT_MS,
  );

  describe('on a credit quota', () => {
    it('admits a cost that fits exactly and refuses one micro-credit more', async () => {
      const { spenderId } = await saveCreditQuotaForNewSpender();

      await chargeRun({ spenderId, creditsUsedMicro: 600 });
      await chargeRun({ spenderId, creditsUsedMicro: 300 });

      expect(await findRunRefusal({ spenderId, costMicro: 100 })).toBeNull();
      expect(await findRunRefusal({ spenderId, costMicro: 101 })).toMatchObject(
        {
          exhaustedKind: 'limit',
          unit: UsageUnit.CREDIT,
          limitValue: CREDIT_LIMIT_MICRO,
        },
      );
    });

    it('meters a consume-only caller from its first call', async () => {
      const { spenderId } = await saveCreditQuotaForNewSpender();

      expect(
        await chargeRun({ spenderId, creditsUsedMicro: CREDIT_LIMIT_MICRO }),
      ).toEqual({ exhaustedKind: 'limit' });
      expect(await findRunRefusal({ spenderId, costMicro: 0 })).toMatchObject({
        exhaustedKind: 'limit',
      });

      const counterKeys = await findSpenderCounterKeys(spenderId);

      expect(counterKeys).toHaveLength(1);
      expect(
        Math.abs(
          (await redis.pTTL(counterKeys[0])) -
            (getCalendarMonthPeriod(new Date()).periodEnd.getTime() -
              Date.now()),
        ),
      ).toBeLessThan(60_000);
    });

    it('counts every concurrent charge on a cold counter once', async () => {
      const { spenderId } = await saveCreditQuotaForNewSpender();

      await Promise.all(
        Array.from({ length: CONCURRENT_CHARGE_COUNT }, () =>
          chargeRun({ spenderId, creditsUsedMicro: 100 }),
        ),
      );

      expect(await findRunRefusal({ spenderId, costMicro: 200 })).toBeNull();
      expect(await findRunRefusal({ spenderId, costMicro: 201 })).toMatchObject(
        { exhaustedKind: 'limit' },
      );
    });

    it('keeps in-flight usage when the cap is edited', async () => {
      const { spenderId, usageLimitId } = await saveCreditQuotaForNewSpender();

      await debitRunAheadOfRecord({ spenderId, creditsUsedMicro: 600 });
      await usageLimitRepository.update(
        { id: usageLimitId },
        { limitValue: 700 },
      );
      await refreshUsageLimitsCache();

      expect(await findRunRefusal({ spenderId, costMicro: 100 })).toBeNull();
      expect(await findRunRefusal({ spenderId, costMicro: 101 })).toMatchObject(
        { exhaustedKind: 'limit', limitValue: 700 },
      );
    });

    it('counts a charge made with the limits a stale pod still holds', async () => {
      const { spenderId, usageLimitId } = await saveCreditQuotaForNewSpender();
      const workspaceCacheService =
        getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        );
      const { usageLimits: preEditUsageLimits } =
        await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
          'usageLimits',
        ]);

      await usageLimitRepository.update(
        { id: usageLimitId },
        { limitValue: 500 },
      );
      await refreshUsageLimitsCache();

      expect(await findRunRefusal({ spenderId, costMicro: 0 })).toBeNull();

      const getOrRecompute = workspaceCacheService.getOrRecompute.bind(
        workspaceCacheService,
      );
      const stalePodSpy = jest
        .spyOn(workspaceCacheService, 'getOrRecompute')
        .mockImplementation(async (workspaceId, cacheKeyNames) =>
          cacheKeyNames.includes('usageLimits')
            ? ({ usageLimits: preEditUsageLimits } as never)
            : getOrRecompute(workspaceId, cacheKeyNames),
        );

      try {
        await chargeRun({ spenderId, creditsUsedMicro: 400 });
      } finally {
        stalePodSpy.mockRestore();
      }

      expect(await findRunRefusal({ spenderId, costMicro: 100 })).toBeNull();
      expect(await findRunRefusal({ spenderId, costMicro: 101 })).toMatchObject(
        { exhaustedKind: 'limit', limitValue: 500 },
      );
    });

    it('debits a limit the workspace is not entitled to without refusing on it', async () => {
      const { spenderId } = await saveCreditQuotaForNewSpender({
        limitValue: 500,
        isInstanceOverride: false,
      });
      const entitlementSpy = jest
        .spyOn(
          getAppProviderByClassName<UsageLimitEntitlementService>(
            'UsageLimitEntitlementService',
          ),
          'isIntraWorkspaceLimitEntitled',
        )
        .mockResolvedValue(false);

      try {
        expect(
          await debitRunAheadOfRecord({ spenderId, creditsUsedMicro: 600 }),
        ).toEqual({ exhaustedKind: null });
        expect(await findRunRefusal({ spenderId, costMicro: 0 })).toBeNull();
        entitlementSpy.mockResolvedValue(true);

        expect(await findRunRefusal({ spenderId, costMicro: 0 })).toMatchObject(
          { exhaustedKind: 'limit', limitValue: 500 },
        );
      } finally {
        entitlementSpy.mockRestore();
      }
    });
  });

  describe('on the daily email default', () => {
    const emailResourceId = randomUUID();
    let emailDailyLimit: number;
    let overrideUsageLimitId: string;
    let chargedEmailRowCount = 0;

    const buildEmailEvent = (quantity: number): RecordUsageInput => ({
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      unit: UsageUnit.INVOCATION,
      quantity,
      creditsUsedMicro: 0,
      resourceId: emailResourceId,
    });

    const findEmailRefusal = (invocationCost: number) =>
      getQuotaService().findExhaustedScope({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        spenders: {},
        cost: {
          [UsageUnit.CREDIT]: 0,
          [UsageUnit.INVOCATION]: invocationCost,
        },
      });

    const debitEmailAheadOfRecord = (quantity: number) =>
      getQuotaService().debitAheadOfRecord({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        event: buildEmailEvent(quantity),
      });

    const saveEmailOverride = async (periodUnit: PeriodUnit) => {
      const usageLimit = await usageLimitRepository.save({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        spenderType: 'workspace',
        spenderId: '',
        limitKind: 'quota',
        periodCount: 1,
        periodUnit,
        unit: UsageUnit.INVOCATION,
        limitValue: emailDailyLimit + 1_000,
        burstValue: null,
        isInstanceOverride: true,
      });

      savedUsageLimitIds.push(usageLimit.id);
      await refreshUsageLimitsCache();

      return usageLimit.id;
    };

    const countEmailRows = async (): Promise<number> => {
      const result = await clickHouseClient.query({
        query: `SELECT count() AS rowCount
                FROM usageEvent
                WHERE workspaceId = {workspaceId:String}
                  AND resourceId = {resourceId:String}`,
        query_params: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          resourceId: emailResourceId,
        },
        format: 'JSONEachRow',
      });

      const [row] = await result.json<{ rowCount: string }>();

      return Number(row?.rowCount ?? 0);
    };

    const deleteEmailRows = () =>
      clickHouseClient.command({
        query: `ALTER TABLE usageEvent DELETE WHERE workspaceId = {workspaceId:String} AND resourceType = {resourceType:String}`,
        query_params: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          resourceType: UsageResourceType.EMAIL,
        },
        clickhouse_settings: { mutations_sync: '2' },
      });

    beforeAll(async () => {
      emailDailyLimit = Number(
        getAppProviderByClassName<TwentyConfigService>(
          'TwentyConfigService',
        ).get('EMAIL_SEND_WORKSPACE_DAILY_LIMIT'),
      );

      await deleteEmailRows();
      await flushQuotaCounters();
    });

    const waitForChargedEmailRows = () =>
      expectEventually(
        async () => {
          expect(await countEmailRows()).toBe(chargedEmailRowCount);
        },
        { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
      );

    afterAll(async () => {
      await waitForChargedEmailRows();
      await deleteEmailRows();
      await flushQuotaCounters();
    }, EXECUTION_TIMEOUT_MS);

    it('refuses the email that would cross the daily default', async () => {
      await getQuotaService().charge({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        events: [buildEmailEvent(emailDailyLimit - 1)],
      });
      chargedEmailRowCount++;

      expect(await findEmailRefusal(1)).toBeNull();
      expect(await findEmailRefusal(2)).toMatchObject({
        exhaustedKind: 'limit',
        isDefault: true,
        unit: UsageUnit.INVOCATION,
        limitValue: emailDailyLimit,
      });
    });

    it('admits once an operator override replaces the default', async () => {
      overrideUsageLimitId = await saveEmailOverride('day');

      expect(await findEmailRefusal(2)).toBeNull();
    });

    it(
      'forgives nothing when the override is deleted, recreated or moved off the default',
      async () => {
        await debitEmailAheadOfRecord(1);
        await usageLimitRepository.delete(overrideUsageLimitId);
        await refreshUsageLimitsCache();

        expect(await findEmailRefusal(1)).toMatchObject({
          exhaustedKind: 'limit',
          isDefault: true,
        });

        await waitForChargedEmailRows();
        await flushQuotaCounters();

        overrideUsageLimitId = await saveEmailOverride('day');
        await debitEmailAheadOfRecord(1);
        await usageLimitRepository.update(
          { id: overrideUsageLimitId },
          { periodUnit: 'month' },
        );
        await refreshUsageLimitsCache();

        expect(await findEmailRefusal(0)).toMatchObject({
          exhaustedKind: 'limit',
          isDefault: true,
        });
      },
      EXECUTION_TIMEOUT_MS,
    );
  });

  describe('when Redis fails', () => {
    const spyOnUnreachableRedis = () => {
      const cacheStorage: CacheStorageService =
        getQuotaService()['cacheStorage'];
      const redisError = new Error('Redis is unreachable');

      return [
        jest.spyOn(cacheStorage, 'runScript').mockRejectedValue(redisError),
        jest.spyOn(cacheStorage, 'mget').mockRejectedValue(redisError),
      ];
    };

    it(
      'records the charge and counts it as admitted on failure',
      async () => {
        const { spenderId } = await saveCreditQuotaForNewSpender();
        const incrementCounterBySpy = spyOnMetrics();
        const redisSpies = spyOnUnreachableRedis();

        try {
          expect(await chargeRun({ spenderId, creditsUsedMicro: 100 })).toEqual(
            {
              exhaustedKind: null,
            },
          );
          expect(
            findAdmittedOnFailureAttributes(incrementCounterBySpy),
          ).toEqual([
            {
              operation: 'consume',
              resourceType: UsageResourceType.LOGIC_FUNCTION,
            },
          ]);
        } finally {
          redisSpies.forEach((spy) => spy.mockRestore());
          incrementCounterBySpy.mockRestore();
        }

        await expectEventually(
          async () => {
            expect(await countUsageEventRows(spenderId)).toBe(1);
          },
          { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
        );
      },
      EXECUTION_TIMEOUT_MS,
    );

    it('admits the assert and counts it as admitted on failure', async () => {
      const { spenderId } = await saveCreditQuotaForNewSpender({
        limitValue: 0,
      });
      const incrementCounterBySpy = spyOnMetrics();
      const redisSpies = spyOnUnreachableRedis();

      try {
        expect(await findRunRefusal({ spenderId, costMicro: 1 })).toBeNull();
        expect(findAdmittedOnFailureAttributes(incrementCounterBySpy)).toEqual([
          {
            operation: 'assert',
            resourceType: UsageResourceType.LOGIC_FUNCTION,
          },
        ]);
      } finally {
        redisSpies.forEach((spy) => spy.mockRestore());
        incrementCounterBySpy.mockRestore();
      }
    });
  });

  describe('when a cold counter cannot be seeded', () => {
    const spyOnClickHouseRead = () =>
      jest.spyOn(
        getAppProviderByClassName<UsageAnalyticsService>(
          'UsageAnalyticsService',
        ),
        'getConsumptionRowsForAllScopes',
      );

    it.each([
      {
        failure: 'its ClickHouse read fails',
        spyOnFailure: () =>
          spyOnClickHouseRead().mockRejectedValue(
            new Error('ClickHouse is unreachable'),
          ),
      },
      {
        failure: 'its ClickHouse read misses the seed deadline',
        spyOnFailure: () => {
          const usageAnalyticsService =
            getAppProviderByClassName<UsageAnalyticsService>(
              'UsageAnalyticsService',
            );
          const getConsumptionRowsForAllScopes =
            usageAnalyticsService.getConsumptionRowsForAllScopes.bind(
              usageAnalyticsService,
            );

          return spyOnClickHouseRead().mockImplementation(async (args) => {
            await new Promise((resolve) =>
              setTimeout(resolve, SLOW_SEED_READ_MS),
            );

            return getConsumptionRowsForAllScopes(args);
          });
        },
      },
      {
        failure: 'Redis fails on the seeding pass',
        spyOnFailure: () => {
          const cacheStorage: CacheStorageService =
            getQuotaService()['cacheStorage'];
          const runScript = cacheStorage.runScript.bind(cacheStorage);

          return jest
            .spyOn(cacheStorage, 'runScript')
            .mockImplementation((options) =>
              options.script.name === 'usage-limit:add-to-counters' &&
              (JSON.parse(options.args[1]) as (number | false)[]).some(
                (seed) => seed !== false,
              )
                ? Promise.reject(new Error('Redis is unreachable'))
                : runScript(options),
            );
        },
      },
    ])(
      'still debits the warm counter and leaves the cold one unseeded when $failure',
      async ({ spyOnFailure }) => {
        const { spenderId } = await saveCreditQuotaForNewSpender();

        await chargeRun({ spenderId, creditsUsedMicro: 600 });
        await saveCodeExecutionQuota({
          spenderId,
          unit: UsageUnit.INVOCATION,
          limitValue: UNREACHABLE_LIMIT_VALUE,
        });
        await refreshUsageLimitsCache();

        const incrementCounterBySpy = spyOnMetrics();
        const failureSpy = spyOnFailure();

        try {
          expect(await chargeRun({ spenderId, creditsUsedMicro: 100 })).toEqual(
            { exhaustedKind: null },
          );
          expect(await findSpenderCounterKeys(spenderId)).toHaveLength(1);
          expect(
            findAdmittedOnFailureAttributes(incrementCounterBySpy),
          ).toEqual([
            {
              operation: 'consume',
              resourceType: UsageResourceType.LOGIC_FUNCTION,
            },
          ]);
        } finally {
          failureSpy.mockRestore();
          incrementCounterBySpy.mockRestore();
        }

        expect(await findRunRefusal({ spenderId, costMicro: 300 })).toBeNull();
        expect(
          await findRunRefusal({ spenderId, costMicro: 301 }),
        ).toMatchObject({ exhaustedKind: 'limit', unit: UsageUnit.CREDIT });
      },
    );

    it('reads ClickHouse once for cold counters that share a period', async () => {
      const spenderId = randomUUID();

      chargedSpenderIds.push(spenderId);
      await saveCodeExecutionQuota({
        spenderId,
        unit: UsageUnit.CREDIT,
        limitValue: CREDIT_LIMIT_MICRO,
      });
      await saveCodeExecutionQuota({
        spenderId,
        unit: UsageUnit.INVOCATION,
        limitValue: UNREACHABLE_LIMIT_VALUE,
      });
      await refreshUsageLimitsCache();

      const clickHouseReadSpy = spyOnClickHouseRead();

      try {
        await chargeRun({ spenderId, creditsUsedMicro: 100 });

        expect(clickHouseReadSpy).toHaveBeenCalledTimes(1);
      } finally {
        clickHouseReadSpy.mockRestore();
      }

      expect(await findSpenderCounterKeys(spenderId)).toHaveLength(2);
    });
  });
});

import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

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
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
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
  [UsageUnit.MILLISECOND]: 9_000,
  [UsageUnit.CREDIT]: 3_900,
};

const QUOTA_UNITS = [
  UsageUnit.INVOCATION,
  UsageUnit.MILLISECOND,
  UsageUnit.CREDIT,
] as const;

const EXECUTED_RUN_COUNT = 2;
const UNREACHABLE_LIMIT_VALUE = 1_000_000_000_000;
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

describe('Usage quota consumption', () => {
  let clickHouseClient: ClickHouseClient;
  let redis: Awaited<ReturnType<typeof createRedisClient>>;
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let logicFunctionId: string;
  let usageLimitIdByUnit: Record<QuotaUnit, string>;
  const savedUsageLimitIds: string[] = [];

  const refreshUsageLimitsCache = () =>
    getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['usageLimits']);

  const findQuotaCounterKeys = () =>
    redis.keys(
      `*{${SEED_APPLE_WORKSPACE_ID}}:quota:${UsageResourceType.LOGIC_FUNCTION}:${UsageOperationType.CODE_EXECUTION}:logicFunction:${logicFunctionId}:*`,
    );

  const countUsageEventRows = async (): Promise<number> => {
    const result = await clickHouseClient.query({
      query: `SELECT count() AS rowCount
              FROM usageEvent
              WHERE workspaceId = {workspaceId:String}
                AND logicFunctionId = {logicFunctionId:String}`,
      query_params: { workspaceId: SEED_APPLE_WORKSPACE_ID, logicFunctionId },
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

  const saveCodeExecutionQuota = async (unit: QuotaUnit): Promise<string> => {
    const usageLimit = await usageLimitRepository.save({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      operationType: UsageOperationType.CODE_EXECUTION,
      spenderType: 'logicFunction',
      spenderId: logicFunctionId,
      limitKind: 'quota',
      periodCount: 1,
      periodUnit: 'month',
      unit,
      limitValue: UNREACHABLE_LIMIT_VALUE,
      burstValue: null,
      isInstanceOverride: true,
    });

    savedUsageLimitIds.push(usageLimit.id);

    return usageLimit.id;
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
      [UsageUnit.INVOCATION]: await saveCodeExecutionQuota(
        UsageUnit.INVOCATION,
      ),
      [UsageUnit.MILLISECOND]: await saveCodeExecutionQuota(
        UsageUnit.MILLISECOND,
      ),
      [UsageUnit.CREDIT]: await saveCodeExecutionQuota(UsageUnit.CREDIT),
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
      query: `ALTER TABLE usageEvent DELETE WHERE workspaceId = '${SEED_APPLE_WORKSPACE_ID}' AND logicFunctionId = '${logicFunctionId}'`,
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
});

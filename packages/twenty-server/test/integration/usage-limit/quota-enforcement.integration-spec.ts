import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { createClient as createRedisClient } from 'redis';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type Repository } from 'typeorm';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage/utils/get-calendar-month-period.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const LIMIT_VALUE_MICRO = 5_000;
// Two ClickHouse rows below sum to this; the warmed counter must then hold
// LIMIT_VALUE_MICRO - WARMED_USAGE_MICRO.
const WARMED_USAGE_MICRO = 4_000;

const QUOTA_ARGS = {
  workspaceId: WORKSPACE_ID,
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenders: {},
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Quota enforcement (integration)', () => {
  let quotaService: UsageLimitQuotaService;
  let workspaceCacheService: WorkspaceCacheService;
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let clickHouse: ClickHouseClient;
  let redis: Awaited<ReturnType<typeof createRedisClient>>;
  let counterKey: string;

  const sumInsertedUsage = async (): Promise<number> => {
    const result = await clickHouse.query({
      query: `SELECT sum(creditsUsedMicro) AS total FROM usageEvent
              WHERE workspaceId = '${WORKSPACE_ID}'
                AND operationType = '${UsageOperationType.AI_CHAT_TOKEN}'`,
      format: 'JSONEachRow',
    });
    const rows = await result.json<{ total: string }>();

    return Number(rows[0]?.total ?? 0);
  };

  const waitForInsertedUsage = async (expectedTotal: number) => {
    for (let attempt = 0; attempt < 50; attempt++) {
      if ((await sumInsertedUsage()) === expectedTotal) {
        return;
      }
      await sleep(100);
    }

    throw new Error(
      `ClickHouse never reached ${expectedTotal} micro-credits of usage`,
    );
  };

  const deleteInsertedUsage = async () => {
    await clickHouse.command({
      query: `ALTER TABLE usageEvent DELETE
              WHERE workspaceId = '${WORKSPACE_ID}'
                AND operationType = '${UsageOperationType.AI_CHAT_TOKEN}'`,
      clickhouse_settings: { mutations_sync: '2' },
    });
  };

  const dropQuotaCounters = async () => {
    const keys = await redis.keys(`*{${WORKSPACE_ID}}:quota:*`);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  };

  // Deleting the Redis keys from outside is not enough: the app process keeps
  // a local copy it would re-serve, so the invalidation must go through the
  // app's own cache service.
  const invalidateUsageLimitCaches = async () => {
    await workspaceCacheService.invalidateAndRecompute(WORKSPACE_ID, [
      'usageLimits',
    ]);
  };

  const readCounter = async (): Promise<number | null> => {
    const value = await redis.get(counterKey);

    return value === null ? null : Number(value);
  };

  beforeAll(async () => {
    quotaService = getAppProviderByClassName<UsageLimitQuotaService>(
      'UsageLimitQuotaService',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    redis = await createRedisClient({ url: process.env.REDIS_URL }).connect();
    clickHouse = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: { allow_experimental_json_type: 1 },
      log: { level: ClickHouseLogLevel.OFF },
    });

    counterKey = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineUsageLimit}:${buildQuotaCounterKey(
      {
        workspaceId: WORKSPACE_ID,
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        spenderType: 'workspace',
        spenderId: null,
        meter: 'creditsUsedMicro',
        periodUnit: 'month',
        periodStart: getCalendarMonthPeriod(new Date()).periodStart,
      },
    )}`;

    await usageLimitRepository.delete({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.AI,
      limitKind: 'quota',
    });
    await usageLimitRepository.save({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenderType: 'workspace',
      spenderId: '',
      limitKind: 'quota',
      periodCount: 1,
      periodUnit: 'month',
      meter: 'creditsUsedMicro',
      limitValue: LIMIT_VALUE_MICRO,
    });
    await invalidateUsageLimitCaches();

    await deleteInsertedUsage();
    const timestamp = formatDateTimeForClickHouse(new Date());

    await clickHouse.insert({
      table: 'usageEvent',
      format: 'JSONEachRow',
      values: [
        {
          timestamp,
          workspaceId: WORKSPACE_ID,
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          creditsUsedMicro: 1_500,
          quantity: 3,
          metadata: {},
        },
        {
          timestamp,
          workspaceId: WORKSPACE_ID,
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          creditsUsedMicro: 2_500,
          quantity: 5,
          metadata: {},
        },
      ],
    });
    await waitForInsertedUsage(WARMED_USAGE_MICRO);
  });

  beforeEach(async () => {
    await dropQuotaCounters();
  });

  afterAll(async () => {
    await usageLimitRepository.delete({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.AI,
      limitKind: 'quota',
    });
    await invalidateUsageLimitCaches();
    await deleteInsertedUsage();
    await dropQuotaCounters();
    await redis.quit();
    await clickHouse.close();
  });

  it('warms a cold counter from ClickHouse usage and admits under the limit', async () => {
    await expect(
      quotaService.assertQuotaNotExhausted(QUOTA_ARGS),
    ).resolves.toBeUndefined();

    expect(await readCounter()).toBe(LIMIT_VALUE_MICRO - WARMED_USAGE_MICRO);
  });

  it('debits the warm counter on consume', async () => {
    await quotaService.assertQuotaNotExhausted(QUOTA_ARGS);

    const { exhausted } = await quotaService.consumeQuota({
      ...QUOTA_ARGS,
      cost: { creditsUsedMicro: 600, quantity: 1 },
    });

    expect(exhausted).toBeNull();
    expect(await readCounter()).toBe(400);
  });

  it('warms a cold counter before debiting it', async () => {
    const { exhausted } = await quotaService.consumeQuota({
      ...QUOTA_ARGS,
      cost: { creditsUsedMicro: 600, quantity: 1 },
    });

    expect(exhausted).toBeNull();
    expect(await readCounter()).toBe(400);
  });

  it('reports the exhausted limit and rejects the requests that follow', async () => {
    const { exhausted } = await quotaService.consumeQuota({
      ...QUOTA_ARGS,
      cost: { creditsUsedMicro: 1_500, quantity: 1 },
    });

    expect(exhausted).toMatchObject({
      limitKind: 'quota',
      exhaustedKind: 'limit',
      spenderType: 'workspace',
    });
    expect(await readCounter()).toBe(-500);

    await expect(
      quotaService.assertQuotaNotExhausted(QUOTA_ARGS),
    ).rejects.toMatchObject({
      code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      exhaustedScope: expect.objectContaining({ exhaustedKind: 'limit' }),
    });
  });
});

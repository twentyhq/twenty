import { randomUUID } from 'node:crypto';

import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { buildTestQuotaCounterKey } from 'test/integration/usage-limit/utils/build-test-quota-counter-key.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { gql } from 'graphql-tag';
import { createClient } from 'redis';
import { type Repository } from 'typeorm';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { getCalendarDayPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-day-period.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;

// AI_CHAT_INCLUDED_WORKSPACE_DAILY_CREDIT_LIMIT's default: the seeded workspace is not trialing
const PAID_DAILY_CEILING_MICRO = 5_000_000;
const OVERRIDE_DAILY_CEILING_MICRO = 20_000_000;
const OVERRIDE_COUNTED_MICRO = 3_000_000;
const INCLUDED_CHAT_CREDITS_MICRO = 750_000;

const WORKSPACE_USAGE_LIMITS = gql`
  query WorkspaceUsageLimits($workspaceId: UUID!) {
    workspaceUsageLimits(workspaceId: $workspaceId) {
      defaults {
        resourceType
        operationType
        spenderType
        limitKind
        periodUnit
        unit
        limitValue
        consumedValue
        isOverridable
        overriddenByUsageLimitId
      }
    }
  }
`;

const CREATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation CreateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: CreateUsageLimitInput!
  ) {
    createWorkspaceUsageLimit(workspaceId: $workspaceId, payload: $payload) {
      id
      limitValue
    }
  }
`;

type UsageLimitDefaultRow = {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: string;
  limitKind: string;
  periodUnit: string;
  unit: UsageUnit;
  limitValue: number | string;
  consumedValue: number | string | null;
  isOverridable: boolean;
  overriddenByUsageLimitId: string | null;
};

describe('Included chat daily ceiling', () => {
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let clickHouseClient: ClickHouseClient;
  let redis: Awaited<ReturnType<typeof createClient>>;
  const resourceId = randomUUID();

  const findIncludedChatCeiling = async (): Promise<UsageLimitDefaultRow> => {
    const response = await makeAdminPanelApiRequest({
      query: WORKSPACE_USAGE_LIMITS,
      variables: { workspaceId: SEED_APPLE_WORKSPACE_ID },
    });

    expect(response.body.errors).toBeUndefined();

    const ceiling = response.body.data.workspaceUsageLimits.defaults.find(
      (usageLimitDefault: UsageLimitDefaultRow) =>
        usageLimitDefault.operationType === UsageOperationType.AI_CHAT_INCLUDED,
    );

    jestExpectToBeDefined(ceiling);

    return ceiling;
  };

  beforeAll(async () => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    redis = await createClient({ url: process.env.REDIS_URL }).connect();

    clickHouseClient = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: {
        allow_experimental_json_type: 1,
      },
      log: { level: ClickHouseLogLevel.OFF },
    });
  });

  afterEach(async () => {
    await usageLimitRepository.delete({ workspaceId: SEED_APPLE_WORKSPACE_ID });

    // Deleting rows directly leaves the cached limits and warmed counters to later suites
    const keys = [
      ...(await redis.keys(`*usageLimits:${SEED_APPLE_WORKSPACE_ID}*`)),
      ...(await redis.keys(
        `*{${SEED_APPLE_WORKSPACE_ID}}:quota:${UsageResourceType.AI}:${UsageOperationType.AI_CHAT_INCLUDED}:*`,
      )),
    ];

    if (keys.length > 0) {
      await redis.del(keys);
    }
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
    await redis.quit();
  });

  it('lists the included chat ceiling as an overridable daily credit quota per workspace', async () => {
    const ceiling = await findIncludedChatCeiling();

    expect(ceiling).toEqual(
      expect.objectContaining({
        resourceType: UsageResourceType.AI,
        spenderType: 'workspace',
        limitKind: 'quota',
        periodUnit: 'day',
        unit: UsageUnit.CREDIT,
        isOverridable: true,
        overriddenByUsageLimitId: null,
      }),
    );
    expect(Number(ceiling.limitValue)).toBe(PAID_DAILY_CEILING_MICRO);
  });

  it("reports the workspace's included chat spend of the day", async () => {
    const consumedBefore = Number(
      (await findIncludedChatCeiling()).consumedValue,
    );

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: [
        {
          timestamp: formatDateTimeForClickHouse(new Date()),
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          resourceId,
          unit: UsageUnit.TOKEN,
          quantity: 400,
          creditsUsedMicro: INCLUDED_CHAT_CREDITS_MICRO,
          metadata: {},
        },
      ],
      format: 'JSONEachRow',
    });

    await expectEventually(
      async () => {
        expect(Number((await findIncludedChatCeiling()).consumedValue)).toBe(
          consumedBefore + INCLUDED_CHAT_CREDITS_MICRO,
        );
      },
      { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
    );
  });

  it('lets an operator replace the ceiling for one workspace, and reports what the override counted', async () => {
    const response = await makeAdminPanelApiRequest({
      query: CREATE_WORKSPACE_USAGE_LIMIT,
      variables: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        payload: {
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          spenderType: 'workspace',
          spenderId: null,
          limitKind: 'quota',
          periodCount: 1,
          periodUnit: 'day',
          unit: UsageUnit.CREDIT,
          limitValue: OVERRIDE_DAILY_CEILING_MICRO,
          burstValue: null,
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const usageLimitId = response.body.data?.createWorkspaceUsageLimit?.id;

    jestExpectToBeDefined(usageLimitId);

    const storedUsageLimit = await usageLimitRepository.findOneByOrFail({
      id: usageLimitId,
    });

    expect(storedUsageLimit.isInstanceOverride).toBe(true);
    expect(Number(storedUsageLimit.limitValue)).toBe(
      OVERRIDE_DAILY_CEILING_MICRO,
    );

    // The counter the engine debits under the override, warm with what it counted so far
    await redis.set(
      buildTestQuotaCounterKey(
        buildQuotaCounterKey({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          spenderType: 'workspace',
          spenderId: null,
          unit: UsageUnit.CREDIT,
          periodUnit: 'day',
          periodStart: getCalendarDayPeriod(new Date()).periodStart,
          limitValue: OVERRIDE_DAILY_CEILING_MICRO,
        }),
      ),
      String(OVERRIDE_DAILY_CEILING_MICRO - OVERRIDE_COUNTED_MICRO),
    );

    const ceiling = await findIncludedChatCeiling();

    expect(ceiling.overriddenByUsageLimitId).toBe(usageLimitId);
    expect(Number(ceiling.consumedValue)).toBe(OVERRIDE_COUNTED_MICRO);
  });
});

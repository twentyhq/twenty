import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { gql } from 'graphql-tag';
import { createClient } from 'redis';
import { type Repository } from 'typeorm';

import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CREATE_USAGE_LIMIT = gql`
  mutation CreateUsageLimit($input: CreateUsageLimitInput!) {
    createUsageLimit(input: $input) {
      id
      limitValue
      periodUnit
    }
  }
`;

const UPDATE_USAGE_LIMIT = gql`
  mutation UpdateUsageLimit($input: UpdateUsageLimitInput!) {
    updateUsageLimit(input: $input) {
      id
      limitValue
      periodUnit
    }
  }
`;

const DELETE_USAGE_LIMIT = gql`
  mutation DeleteUsageLimit($usageLimitId: UUID!) {
    deleteUsageLimit(usageLimitId: $usageLimitId)
  }
`;

const USAGE_QUOTAS_WITH_CONSUMPTION = gql`
  query UsageQuotasWithConsumption {
    usageQuotasWithConsumption {
      id
      limitValue
      periodUnit
      spenderType
    }
  }
`;

const buildPayload = (
  overrides: Partial<CreateUsageLimitInput> = {},
): CreateUsageLimitInput => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 1_000_000,
  burstValue: null,
  ...overrides,
});

describe('Usage limit mutations', () => {
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let redis: Awaited<ReturnType<typeof createClient>>;

  const createUsageLimitRequest = (
    overrides: Partial<CreateUsageLimitInput> = {},
  ) =>
    makeMetadataAPIRequest({
      query: CREATE_USAGE_LIMIT,
      variables: { input: buildPayload(overrides) },
    });

  const updateUsageLimit = (
    id: string,
    overrides: Partial<CreateUsageLimitInput> = {},
  ) =>
    makeMetadataAPIRequest({
      query: UPDATE_USAGE_LIMIT,
      variables: { input: { id, payload: buildPayload(overrides) } },
    });

  const findQuotasWithConsumption = async () => {
    const response = await makeMetadataAPIRequest({
      query: USAGE_QUOTAS_WITH_CONSUMPTION,
    });

    return response.body.data?.usageQuotasWithConsumption ?? [];
  };

  const createUsageLimit = async (
    overrides: Partial<CreateUsageLimitInput> = {},
  ) => {
    const response = await createUsageLimitRequest(overrides);
    const usageLimitId = response.body.data?.createUsageLimit?.id;

    jestExpectToBeDefined(usageLimitId);

    return usageLimitId as string;
  };

  beforeAll(async () => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    redis = await createClient({ url: process.env.REDIS_URL }).connect();
  });

  afterEach(async () => {
    await usageLimitRepository.delete({ workspaceId: SEED_APPLE_WORKSPACE_ID });

    const keys = await redis.keys(`*usageLimits:${SEED_APPLE_WORKSPACE_ID}*`);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  });

  afterAll(async () => {
    await redis.quit();
  });

  describe('createUsageLimit', () => {
    it('creates a limit and lists it with its consumption', async () => {
      const usageLimitId = await createUsageLimit();

      const quotas = await findQuotasWithConsumption();

      expect(quotas).toContainEqual(
        expect.objectContaining({
          id: usageLimitId,
          limitValue: 1_000_000,
          periodUnit: 'month',
          spenderType: 'workspace',
        }),
      );
    });

    it('refuses a scope another limit already covers', async () => {
      await createUsageLimit();

      const response = await createUsageLimitRequest({ limitValue: 2_000_000 });

      expect(response.body.errors?.[0]?.message).toBe(
        'Another usage limit already covers this scope',
      );
      expect(
        await usageLimitRepository.countBy({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ).toBe(1);
    });

    it('refuses a quota carrying a burst value', async () => {
      const response = await createUsageLimitRequest({ burstValue: 10 });

      expect(response.body.errors?.[0]?.message).toBe(
        'A quota limit cannot hold a burst value',
      );
    });
  });

  describe('updateUsageLimit', () => {
    it('changes the amount without moving the row', async () => {
      const usageLimitId = await createUsageLimit();

      const response = await updateUsageLimit(usageLimitId, {
        limitValue: 5_000_000,
      });

      expect(response.body.data?.updateUsageLimit).toEqual(
        expect.objectContaining({ id: usageLimitId, limitValue: 5_000_000 }),
      );
      expect(await findQuotasWithConsumption()).toHaveLength(1);
    });

    it('moves the limit to another scope, keeping its id', async () => {
      const usageLimitId = await createUsageLimit();

      const response = await updateUsageLimit(usageLimitId, {
        periodUnit: 'week',
      });

      expect(response.body.data?.updateUsageLimit).toEqual(
        expect.objectContaining({ id: usageLimitId, periodUnit: 'week' }),
      );

      const quotas = await findQuotasWithConsumption();

      expect(quotas).toHaveLength(1);
      expect(quotas[0]).toEqual(
        expect.objectContaining({ id: usageLimitId, periodUnit: 'week' }),
      );
    });

    it('refuses a scope another limit already covers', async () => {
      await createUsageLimit();
      const weeklyUsageLimitId = await createUsageLimit({
        periodUnit: 'week',
      });

      const response = await updateUsageLimit(weeklyUsageLimitId, {
        periodUnit: 'month',
      });

      expect(response.body.errors?.[0]?.message).toBe(
        'Another usage limit already covers this scope',
      );
      expect(await findQuotasWithConsumption()).toHaveLength(2);
    });

    it('refuses an id that belongs to no limit of this workspace', async () => {
      const response = await updateUsageLimit(
        '20202020-0000-4000-8000-000000000000',
      );

      expect(response.body.errors?.[0]?.message).toBe(
        'No usage limit 20202020-0000-4000-8000-000000000000 in this workspace',
      );
    });
  });

  describe('deleteUsageLimit', () => {
    it('removes the limit from the list', async () => {
      const usageLimitId = await createUsageLimit();

      const response = await makeMetadataAPIRequest({
        query: DELETE_USAGE_LIMIT,
        variables: { usageLimitId },
      });

      expect(response.body.data?.deleteUsageLimit).toBe(true);
      expect(await findQuotasWithConsumption()).toEqual([]);
    });

    it('reports nothing deleted for an unknown id', async () => {
      const response = await makeMetadataAPIRequest({
        query: DELETE_USAGE_LIMIT,
        variables: { usageLimitId: '20202020-0000-4000-8000-000000000000' },
      });

      expect(response.body.data?.deleteUsageLimit).toBe(false);
    });
  });

  describe('rows an operator set', () => {
    const OPERATOR_ROW_MESSAGE = 'only an operator can change it';

    const seedOperatorRow = async () => {
      await usageLimitRepository.insert({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        ...buildPayload({
          resourceType: UsageResourceType.STORAGE,
          operationType: UsageOperationType.STORAGE_FILE,
          spenderType: 'workspace',
          limitKind: 'stock',
          periodCount: 1,
          periodUnit: 'lifetime',
          meter: 'quantity',
          limitValue: 5_000,
        }),
        spenderId: '',
        burstValue: null,
        isInstanceOverride: true,
      });

      const usageLimit = await usageLimitRepository.findOneByOrFail({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        meter: 'quantity',
      });

      return usageLimit;
    };

    it('refuses a workspace update of one', async () => {
      const usageLimit = await seedOperatorRow();

      const response = await updateUsageLimit(usageLimit.id, {
        resourceType: UsageResourceType.STORAGE,
        operationType: UsageOperationType.STORAGE_FILE,
        spenderType: 'workspace',
        limitKind: 'stock',
        periodCount: 1,
        periodUnit: 'lifetime',
        meter: 'quantity',
        limitValue: 9_000_000,
      });

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ROW_MESSAGE),
      );
      expect(
        (await usageLimitRepository.findOneByOrFail({ id: usageLimit.id }))
          .limitValue,
      ).toBe(5_000);
    });

    it('refuses a workspace delete of one', async () => {
      const usageLimit = await seedOperatorRow();

      const response = await makeMetadataAPIRequest({
        query: DELETE_USAGE_LIMIT,
        variables: { usageLimitId: usageLimit.id },
      });

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ROW_MESSAGE),
      );
      expect(await usageLimitRepository.countBy({ id: usageLimit.id })).toBe(1);
    });
  });

  describe('instance defaults', () => {
    const OPERATOR_ONLY_MESSAGE = 'only an operator can replace it';

    const storageStockPayload = (
      overrides: Partial<CreateUsageLimitInput> = {},
    ) =>
      buildPayload({
        resourceType: UsageResourceType.STORAGE,
        operationType: UsageOperationType.STORAGE_FILE,
        spenderType: 'workspace',
        spenderId: null,
        limitKind: 'stock',
        periodCount: 1,
        periodUnit: 'lifetime',
        meter: 'bytes',
        limitValue: 1_000_000,
        ...overrides,
      });

    const seedOperatorOverride = async () => {
      await usageLimitRepository.insert({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        ...storageStockPayload(),
        spenderId: '',
        burstValue: null,
      });

      const usageLimit = await usageLimitRepository.findOneBy({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourceType: UsageResourceType.STORAGE,
      });

      jestExpectToBeDefined(usageLimit);

      return usageLimit;
    };

    it('refuses a workspace write that would replace a default', async () => {
      const response = await makeMetadataAPIRequest({
        query: CREATE_USAGE_LIMIT,
        variables: { input: storageStockPayload() },
      });

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ONLY_MESSAGE),
      );
      expect(
        await usageLimitRepository.countBy({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ).toBe(0);
    });

    it('allows a workspace write on a meter no default covers', async () => {
      const response = await makeMetadataAPIRequest({
        query: CREATE_USAGE_LIMIT,
        variables: { input: storageStockPayload({ meter: 'quantity' }) },
      });

      expect(response.body.errors).toBeUndefined();
    });

    it('refuses moving an operator override off the default it replaces', async () => {
      const usageLimit = await seedOperatorOverride();

      const response = await makeMetadataAPIRequest({
        query: UPDATE_USAGE_LIMIT,
        variables: {
          input: {
            id: usageLimit.id,
            payload: storageStockPayload({ meter: 'quantity' }),
          },
        },
      });

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ONLY_MESSAGE),
      );
      expect(
        (await usageLimitRepository.findOneByOrFail({ id: usageLimit.id }))
          .meter,
      ).toBe('bytes');
    });

    it('refuses deleting an operator override', async () => {
      const usageLimit = await seedOperatorOverride();

      const response = await makeMetadataAPIRequest({
        query: DELETE_USAGE_LIMIT,
        variables: { usageLimitId: usageLimit.id },
      });

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ONLY_MESSAGE),
      );
      expect(await usageLimitRepository.countBy({ id: usageLimit.id })).toBe(1);
    });
  });
});

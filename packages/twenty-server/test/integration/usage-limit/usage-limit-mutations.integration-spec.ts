import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { gql } from 'graphql-tag';
import { createClient } from 'redis';
import { type Repository } from 'typeorm';

import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
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

const USAGE_LIMITS = gql`
  query UsageLimits {
    usageLimits {
      id
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
  unit: UsageUnit.CREDIT,
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
    makeMetadataApiRequest({
      query: CREATE_USAGE_LIMIT,
      variables: { input: buildPayload(overrides) },
    });

  const updateUsageLimit = (
    id: string,
    overrides: Partial<CreateUsageLimitInput> = {},
  ) =>
    makeMetadataApiRequest({
      query: UPDATE_USAGE_LIMIT,
      variables: { input: { id, payload: buildPayload(overrides) } },
    });

  const findQuotasWithConsumption = async () => {
    const response = await makeMetadataApiRequest({
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

    it('refuses a unit the operation does not record', async () => {
      const response = await createUsageLimitRequest({
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        unit: UsageUnit.MILLISECOND,
      });

      expect(response.body.errors?.[0]?.message).toBe(
        'EMAIL EMAIL_SEND quota limits cannot count MILLISECOND, only CREDIT, INVOCATION',
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

      const response = await makeMetadataApiRequest({
        query: DELETE_USAGE_LIMIT,
        variables: { usageLimitId },
      });

      expect(response.body.data?.deleteUsageLimit).toBe(true);
      expect(await findQuotasWithConsumption()).toEqual([]);
    });

    it('reports nothing deleted for an unknown id', async () => {
      const response = await makeMetadataApiRequest({
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
          unit: UsageUnit.FILE,
          limitValue: 5_000,
        }),
        spenderId: '',
        burstValue: null,
        isInstanceOverride: true,
      });

      const usageLimit = await usageLimitRepository.findOneByOrFail({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        unit: UsageUnit.FILE,
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
        unit: UsageUnit.FILE,
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

      const response = await makeMetadataApiRequest({
        query: DELETE_USAGE_LIMIT,
        variables: { usageLimitId: usageLimit.id },
      });

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ROW_MESSAGE),
      );
      expect(await usageLimitRepository.countBy({ id: usageLimit.id })).toBe(1);
    });
  });

  describe('non-billable operations', () => {
    const includedChatPayload = buildPayload({
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
      periodUnit: 'day',
    });

    it('refuses a workspace limit on included chat', async () => {
      const response = await createUsageLimitRequest(includedChatPayload);

      expect(response.body.errors?.[0]?.message).toBe(
        'AI quota limits cannot target the AI_CHAT_INCLUDED operation',
      );
      expect(
        await usageLimitRepository.countBy({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ).toBe(0);
    });

    it('hides an operator limit on included chat from the workspace', async () => {
      const billableUsageLimitId = await createUsageLimit();

      await usageLimitRepository.insert({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        ...includedChatPayload,
        spenderId: '',
        burstValue: null,
        isInstanceOverride: true,
      });

      const includedChatUsageLimit = await usageLimitRepository.findOneByOrFail(
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
        },
      );

      const usageLimitsResponse = await makeMetadataApiRequest({
        query: USAGE_LIMITS,
      });
      const quotasResponse = await makeMetadataApiRequest({
        query: USAGE_QUOTAS_WITH_CONSUMPTION,
      });

      expect(usageLimitsResponse.body.errors).toBeUndefined();
      expect(quotasResponse.body.errors).toBeUndefined();

      const usageLimits = usageLimitsResponse.body.data.usageLimits;
      const quotas = quotasResponse.body.data.usageQuotasWithConsumption;

      expect(usageLimits).toContainEqual(
        expect.objectContaining({ id: billableUsageLimitId }),
      );
      expect(usageLimits).not.toContainEqual(
        expect.objectContaining({ id: includedChatUsageLimit.id }),
      );
      expect(quotas).toContainEqual(
        expect.objectContaining({ id: billableUsageLimitId }),
      );
      expect(quotas).not.toContainEqual(
        expect.objectContaining({ id: includedChatUsageLimit.id }),
      );
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
        unit: UsageUnit.BYTE,
        limitValue: 1_000_000,
        ...overrides,
      });

    const emailQuotaPayload = (
      overrides: Partial<CreateUsageLimitInput> = {},
    ) =>
      buildPayload({
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        unit: UsageUnit.INVOCATION,
        limitValue: 5_000,
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
      const response = await makeMetadataApiRequest({
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

    it('refuses a workspace email quota on the daily default period', async () => {
      const response = await createUsageLimitRequest(
        emailQuotaPayload({ periodUnit: 'day' }),
      );

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ONLY_MESSAGE),
      );
    });

    it('allows a workspace email quota on another period, stacked on the daily default', async () => {
      const response = await createUsageLimitRequest(
        emailQuotaPayload({ periodUnit: 'month' }),
      );

      expect(response.body.errors).toBeUndefined();
    });

    it('allows a workspace write on a unit no default covers', async () => {
      const response = await makeMetadataApiRequest({
        query: CREATE_USAGE_LIMIT,
        variables: { input: storageStockPayload({ unit: UsageUnit.FILE }) },
      });

      expect(response.body.errors).toBeUndefined();
    });

    it('refuses moving an operator override off the default it replaces', async () => {
      const usageLimit = await seedOperatorOverride();

      const response = await makeMetadataApiRequest({
        query: UPDATE_USAGE_LIMIT,
        variables: {
          input: {
            id: usageLimit.id,
            payload: storageStockPayload({ unit: UsageUnit.FILE }),
          },
        },
      });

      expect(response.body.errors?.[0]?.message).toEqual(
        expect.stringContaining(OPERATOR_ONLY_MESSAGE),
      );
      expect(
        (await usageLimitRepository.findOneByOrFail({ id: usageLimit.id }))
          .unit,
      ).toBe(UsageUnit.BYTE);
    });

    it('refuses deleting an operator override', async () => {
      const usageLimit = await seedOperatorOverride();

      const response = await makeMetadataApiRequest({
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

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { createClient } from 'redis';
import { FeatureFlagKey } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('API rate limiting', () => {
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let featureFlagRepository: Repository<FeatureFlagEntity>;
  let redis: Awaited<ReturnType<typeof createClient>>;
  let usageLimitId: string;

  const findCompanies = () =>
    makeGraphqlAPIRequestWithApiKey(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        first: 1,
      }),
    );

  const invalidateWorkspaceCaches = async () => {
    const keys = [
      ...(await redis.keys(`*featureFlagsMap:${SEED_APPLE_WORKSPACE_ID}*`)),
      ...(await redis.keys(`*usageLimitRules:${SEED_APPLE_WORKSPACE_ID}*`)),
    ];

    if (keys.length > 0) {
      await redis.del(keys);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  beforeAll(async () => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    featureFlagRepository =
      getCoreRepository<FeatureFlagEntity>(FeatureFlagEntity);
    redis = await createClient({ url: process.env.REDIS_URL }).connect();

    await featureFlagRepository.delete({
      key: FeatureFlagKey.IS_API_RATE_LIMIT_V2_ENABLED,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
    await featureFlagRepository.save({
      key: FeatureFlagKey.IS_API_RATE_LIMIT_V2_ENABLED,
      value: true,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    const [usageLimit] = await usageLimitRepository.save([
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourceType: UsageResourceType.API,
        operationType: UsageOperationType.API_REQUEST,
        spenderType: 'workspace',
        spenderId: '',
        limitKind: 'speed',
        windowSeconds: 1,
        limitValueType: 'absolute',
        limitValue: 1,
        burstValue: 1,
      },
    ]);

    usageLimitId = usageLimit.id;

    await invalidateWorkspaceCaches();
  });

  afterAll(async () => {
    await usageLimitRepository.delete({ id: usageLimitId });
    await featureFlagRepository.delete({
      key: FeatureFlagKey.IS_API_RATE_LIMIT_V2_ENABLED,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
    await invalidateWorkspaceCaches();
    await redis.quit();
  });

  it('admits a request and rejects the one that follows it', async () => {
    const admitted = await findCompanies();

    expect(admitted.body.errors).toBeUndefined();

    const rejected = await findCompanies();

    expect(rejected.body.errors?.[0]?.extensions?.code).toBe('RATE_LIMITED');
  });

  it('names the exhausted scope and says when to retry', async () => {
    await findCompanies();

    const { body } = await findCompanies();
    const extensions = body.errors?.[0]?.extensions;

    expect(extensions).toMatchObject({
      code: 'RATE_LIMITED',
      limitKind: 'speed',
      limit: 1,
      remaining: 0,
      windowSeconds: 1,
      scope: { spenderType: 'workspace' },
    });
    expect(extensions.retryAfterMs).toBeGreaterThan(0);
  });

  it('lets the caller back in once the window refills', async () => {
    await findCompanies();
    await findCompanies();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    expect((await findCompanies()).body.errors).toBeUndefined();
  });
});

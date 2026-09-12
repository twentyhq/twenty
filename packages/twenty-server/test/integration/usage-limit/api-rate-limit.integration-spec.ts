import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { gql } from 'graphql-tag';
import { createClient } from 'redis';
import { FeatureFlagKey } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WINDOW_SECONDS = 1;
const LIMIT_VALUE = 1;

describe('API rate limiting', () => {
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let featureFlagRepository: Repository<FeatureFlagEntity>;
  let apiKeyRepository: Repository<ApiKeyEntity>;
  let redis: Awaited<ReturnType<typeof createClient>>;
  let usageLimitId: string;
  let apiKeyId: string;
  let apiKeyToken: string;

  const findCompaniesOverGraphql = () =>
    makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        first: 1,
      }),
      apiKeyToken,
    );

  const findCompaniesOverRest = () =>
    makeRestAPIRequest({
      method: 'get',
      path: '/companies?limit=1',
      bearer: apiKeyToken,
    });

  // Every test starts from a full bucket so it does not inherit whatever the
  // previous one spent.
  const waitForBucketRefill = () =>
    new Promise((resolve) => setTimeout(resolve, WINDOW_SECONDS * 1000 + 200));

  const invalidateWorkspaceCaches = async () => {
    const keys = [
      ...(await redis.keys(`*featureFlagsMap:${SEED_APPLE_WORKSPACE_ID}*`)),
      ...(await redis.keys(`*usageLimits:${SEED_APPLE_WORKSPACE_ID}*`)),
    ];

    if (keys.length > 0) {
      await redis.del(keys);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  // The rule targets a key created for this suite alone. A workspace-scoped one
  // would meter every caller in the seeded workspace, and deleting it here
  // cannot undo that: the workspace cache memoizes resolved entries in process
  // for MEMOIZER_TTL_MS, so the next spec file would still be rate limited.
  const createDedicatedApiKey = async () => {
    const rolesResponse = await makeMetadataAPIRequest({
      query: gql`
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    });

    const adminRoleId = rolesResponse.body.data?.getRoles?.find(
      (role: { label: string }) => role.label === 'Admin',
    )?.id;

    jestExpectToBeDefined(adminRoleId);

    const createResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: 'API rate limiting test key',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          roleId: adminRoleId,
        },
      },
    });

    apiKeyId = createResponse.body.data?.createApiKey?.id;
    jestExpectToBeDefined(apiKeyId);

    const tokenResponse = await generateApiKeyToken({
      apiKeyId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    apiKeyToken = tokenResponse.body.data?.generateApiKeyToken?.token;
    jestExpectToBeDefined(apiKeyToken);
  };

  beforeAll(async () => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    featureFlagRepository =
      getCoreRepository<FeatureFlagEntity>(FeatureFlagEntity);
    apiKeyRepository = getCoreRepository<ApiKeyEntity>(ApiKeyEntity);
    redis = await createClient({ url: process.env.REDIS_URL }).connect();

    await createDedicatedApiKey();

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
        spenderType: 'apiKey',
        spenderId: apiKeyId,
        limitKind: 'speed',
        periodCount: WINDOW_SECONDS,
        periodUnit: 'second',
        meter: 'quantity',
        limitValue: LIMIT_VALUE,
        burstValue: LIMIT_VALUE,
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
    await apiKeyRepository.delete({ id: apiKeyId });
    await invalidateWorkspaceCaches();
    await redis.quit();
  });

  describe('over GraphQL', () => {
    it('admits a request and rejects the one that follows it', async () => {
      await waitForBucketRefill();

      const admitted = await findCompaniesOverGraphql();

      expect(admitted.body.errors).toBeUndefined();

      const rejected = await findCompaniesOverGraphql();

      expect(rejected.body.errors?.[0]?.extensions?.code).toBe('RATE_LIMITED');
    });

    // GraphQL keeps answering 200 and reports the denial in the extensions, so
    // an Apollo caller reads it as a GraphQL error rather than a network one.
    it('reports the denial in the body rather than in the HTTP status', async () => {
      await waitForBucketRefill();
      await findCompaniesOverGraphql();

      const rejected = await findCompaniesOverGraphql();

      expect(rejected.status).toBe(200);
      expect(rejected.body.errors?.[0]?.extensions?.http).toBeUndefined();
    });

    it('names the exhausted scope and says when to retry', async () => {
      await waitForBucketRefill();
      await findCompaniesOverGraphql();

      const { body } = await findCompaniesOverGraphql();
      const extensions = body.errors?.[0]?.extensions;

      expect(extensions).toMatchObject({
        code: 'RATE_LIMITED',
        limitKind: 'speed',
        exhaustedKind: 'limit',
        limit: LIMIT_VALUE,
        remaining: 0,
        periodCount: WINDOW_SECONDS,
        periodUnit: 'second',
        scope: { spenderType: 'apiKey', spenderId: apiKeyId },
      });
      expect(extensions.retryAfterMs).toBeGreaterThan(0);
    });

    it('lets the caller back in once the window refills', async () => {
      await waitForBucketRefill();
      await findCompaniesOverGraphql();
      await findCompaniesOverGraphql();

      await waitForBucketRefill();

      expect((await findCompaniesOverGraphql()).body.errors).toBeUndefined();
    });
  });

  describe('over REST', () => {
    it('admits a request and rejects the one that follows it', async () => {
      await waitForBucketRefill();

      const admitted = await findCompaniesOverRest();

      expect(admitted.status).toBe(200);

      const rejected = await findCompaniesOverRest();

      expect(rejected.status).toBe(429);
    });

    it('names the exhausted scope in the body', async () => {
      await waitForBucketRefill();
      await findCompaniesOverRest();

      const { body } = await findCompaniesOverRest();

      expect(body).toMatchObject({
        statusCode: 429,
        error: 'RATE_LIMITED',
        limitKind: 'speed',
        exhaustedKind: 'limit',
        limit: LIMIT_VALUE,
        remaining: 0,
        periodCount: WINDOW_SECONDS,
        periodUnit: 'second',
        retryAfterSeconds: 1,
        scope: { spenderType: 'apiKey', spenderId: apiKeyId },
      });
      expect(body.messages).toHaveLength(1);
    });

    it('answers with a Retry-After the caller can honour', async () => {
      await waitForBucketRefill();
      await findCompaniesOverRest();

      const rejected = await findCompaniesOverRest();

      expect(rejected.headers['retry-after']).toBe('1');
      expect(rejected.headers['x-ratelimit-limit']).toBe(String(LIMIT_VALUE));
      expect(rejected.headers['x-ratelimit-remaining']).toBe('0');
      expect(Number(rejected.headers['x-ratelimit-reset'])).toBeGreaterThan(0);
    });

    it('lets the caller back in once the window refills', async () => {
      await waitForBucketRefill();
      await findCompaniesOverRest();
      await findCompaniesOverRest();

      await waitForBucketRefill();

      expect((await findCompaniesOverRest()).status).toBe(200);
    });
  });
});

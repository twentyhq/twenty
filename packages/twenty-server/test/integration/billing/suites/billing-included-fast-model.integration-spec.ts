import { randomUUID } from 'node:crypto';

import request from 'supertest';
import {
  getSeededBillingWorkspaceId,
  quitBillingFixtureRedis,
  resetBillingCreditState,
  setSubscriptionStatus,
  TEST_STRIPE_SUBSCRIPTION_ID,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { postStripeEntitlementSummary } from 'test/integration/billing/utils/post-stripe-entitlement-summary.util';
import { TEST_AI_OTHER_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { buildTestQuotaCounterKey } from 'test/integration/usage-limit/utils/build-test-quota-counter-key.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { gql } from 'graphql-tag';
import { createClient as createRedisClient } from 'redis';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { STRIPE_SDK_MOCK_ACTIVE_ENTITLEMENT_LOOKUP_KEYS } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk-mock-active-entitlement-lookup-keys.constant';
import { buildQuotaDefaultCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-counter-key.util';
import { getCalendarDayPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-day-period.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;

// AI_CHAT_INCLUDED_TRIAL_WORKSPACE_DAILY_CREDIT_LIMIT's default
const TRIAL_DAILY_CEILING_MICRO = 1_000_000;
const OVERRIDE_DAILY_CEILING_MICRO = 20_000_000;
const INCLUDED_CHAT_CREDITS_MICRO = 250_000;

const UNAVAILABLE_FAST_MODEL_ID = 'test-provider/unavailable-fast-model@low';
const INCLUDED_FAST_MODEL_ID = 'test-provider/included-fast-model@medium';

const CURRENT_WORKSPACE_BILLING_ENTITLEMENTS = gql`
  query CurrentWorkspaceBillingEntitlements {
    currentUser {
      currentWorkspace {
        billingEntitlements {
          key
          value
        }
      }
    }
  }
`;

const WORKSPACE_USAGE_LIMITS = gql`
  query WorkspaceUsageLimits($workspaceId: UUID!) {
    workspaceUsageLimits(workspaceId: $workspaceId) {
      defaults {
        operationType
        limitValue
        consumedValue
        isTrialLimitValue
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
    }
  }
`;

const DELETE_WORKSPACE_USAGE_LIMIT = gql`
  mutation DeleteWorkspaceUsageLimit(
    $workspaceId: UUID!
    $usageLimitId: UUID!
  ) {
    deleteWorkspaceUsageLimit(
      workspaceId: $workspaceId
      usageLimitId: $usageLimitId
    )
  }
`;

type IncludedChatCeiling = {
  operationType: UsageOperationType;
  limitValue: number | string;
  consumedValue: number | string | null;
  isTrialLimitValue: boolean;
};

describe('Included fast model (integration)', () => {
  let workspaceId: string;
  let originalLookupKeys: string[];

  const findGrantedLookupKeys = async (): Promise<string[]> => {
    const grantedRows: { key: string }[] = await global.testDataSource.query(
      `SELECT key FROM core."billingEntitlement" WHERE "workspaceId" = $1 AND value = true`,
      [workspaceId],
    );

    return grantedRows.map(({ key }) => key);
  };

  const findIncludedFastModelEntitlement = async () => {
    const response = await makeMetadataApiRequest({
      query: CURRENT_WORKSPACE_BILLING_ENTITLEMENTS,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.currentUser.currentWorkspace.billingEntitlements.find(
      (entitlement: { key: BillingEntitlementKey }) =>
        entitlement.key === BillingEntitlementKey.INCLUDED_FAST_MODEL,
    );
  };

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();

    // Every request below reads as Jane, so a grant on another workspace would never be read back
    if (workspaceId !== SEED_APPLE_WORKSPACE_ID) {
      throw new Error(
        `The seeded billing customer belongs to workspace ${workspaceId}, not to the Apple workspace the access token reads`,
      );
    }

    originalLookupKeys = (await findGrantedLookupKeys()).filter(
      (key) => key !== BillingEntitlementKey.INCLUDED_FAST_MODEL,
    );
  });

  afterAll(async () => {
    await postStripeEntitlementSummary(originalLookupKeys);
    await quitBillingFixtureRedis();
  });

  describe('entitlement', () => {
    afterEach(async () => {
      await postStripeEntitlementSummary(originalLookupKeys);
    });

    it('is granted by the INCLUDED_FAST_MODEL Stripe feature', async () => {
      await postStripeEntitlementSummary([
        ...originalLookupKeys,
        BillingEntitlementKey.INCLUDED_FAST_MODEL,
      ]);

      expect(await findIncludedFastModelEntitlement()).toEqual({
        key: BillingEntitlementKey.INCLUDED_FAST_MODEL,
        value: true,
      });
    });

    it('is revoked when Stripe stops listing the feature', async () => {
      await postStripeEntitlementSummary([
        ...originalLookupKeys,
        BillingEntitlementKey.INCLUDED_FAST_MODEL,
      ]);
      await postStripeEntitlementSummary(originalLookupKeys);

      expect(await findIncludedFastModelEntitlement()).toEqual({
        key: BillingEntitlementKey.INCLUDED_FAST_MODEL,
        value: false,
      });
    });

    it('is read from the full Stripe list when the summary is truncated', async () => {
      await postStripeEntitlementSummary([BillingEntitlementKey.SSO], {
        hasMore: true,
      });

      expect((await findGrantedLookupKeys()).sort()).toEqual(
        [...STRIPE_SDK_MOCK_ACTIVE_ENTITLEMENT_LOOKUP_KEYS].sort(),
      );
      expect(await findIncludedFastModelEntitlement()).toEqual({
        key: BillingEntitlementKey.INCLUDED_FAST_MODEL,
        value: true,
      });
    });
  });

  describe('included chat model', () => {
    let getModelSpy: jest.SpyInstance;

    const setFastChain = (modelIds: string[]) =>
      createConfigVariable({
        input: { key: 'AI_MODELS_DEFAULT_FAST', value: modelIds },
      });

    const fetchClientConfig = async () =>
      (await client.get('/client-config').expect(200)).body;

    beforeAll(() => {
      const availableModelIds = [
        INCLUDED_FAST_MODEL_ID,
        TEST_AI_OTHER_MODEL_ID,
      ];

      // No provider key is configured in tests, so availability is stubbed
      getModelSpy = jest
        .spyOn(
          getAppProviderByClassName<AiModelRegistryService>(
            'AiModelRegistryService',
          ),
          'getModel',
        )
        .mockImplementation((modelId: string) =>
          availableModelIds.includes(modelId)
            ? ({ modelId } as never)
            : undefined,
        );
    });

    afterEach(async () => {
      await deleteConfigVariable({ input: { key: 'AI_MODELS_DEFAULT_FAST' } });
    });

    afterAll(() => {
      getModelSpy.mockRestore();
    });

    it('is the first available model of the fast chain, at its effort', async () => {
      await setFastChain([UNAVAILABLE_FAST_MODEL_ID, INCLUDED_FAST_MODEL_ID]);

      expect((await fetchClientConfig()).aiIncludedChatModelId).toBe(
        INCLUDED_FAST_MODEL_ID,
      );
    });

    it('is none when the fast chain is unavailable, even though the fast tier borrows a model', async () => {
      await setFastChain([UNAVAILABLE_FAST_MODEL_ID]);

      const clientConfig = await fetchClientConfig();

      expect(clientConfig.aiModelTiers).toContainEqual({
        tier: 'fast',
        modelId: TEST_AI_OTHER_MODEL_ID,
      });
      expect(clientConfig.aiIncludedChatModelId).toBeNull();
    });
  });

  describe('daily ceiling while trialing', () => {
    const resourceId = randomUUID();
    let originalStatus: SubscriptionStatus;
    let clickHouseClient: ClickHouseClient;
    let redis: Awaited<ReturnType<typeof createRedisClient>>;

    const findIncludedChatCeiling = async (): Promise<IncludedChatCeiling> => {
      const response = await makeAdminPanelApiRequest({
        query: WORKSPACE_USAGE_LIMITS,
        variables: { workspaceId },
      });

      expect(response.body.errors).toBeUndefined();

      const ceiling = response.body.data.workspaceUsageLimits.defaults.find(
        (usageLimitDefault: IncludedChatCeiling) =>
          usageLimitDefault.operationType ===
          UsageOperationType.AI_CHAT_INCLUDED,
      );

      jestExpectToBeDefined(ceiling);

      return ceiling;
    };

    const recordIncludedChatSpend = async () => {
      const consumedBefore = Number(
        (await findIncludedChatCeiling()).consumedValue,
      );

      await clickHouseClient.insert({
        table: 'usageEvent',
        values: [
          {
            timestamp: formatDateTimeForClickHouse(new Date()),
            workspaceId,
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

      const daySpend = consumedBefore + INCLUDED_CHAT_CREDITS_MICRO;

      await expectEventually(
        async () => {
          expect(Number((await findIncludedChatCeiling()).consumedValue)).toBe(
            daySpend,
          );
        },
        { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
      );

      return daySpend;
    };

    const deleteIncludedChatCacheKeys = async () => {
      const keys = [
        ...(await redis.keys(`*usageLimits:${workspaceId}*`)),
        ...(await redis.keys(
          `*{${workspaceId}}:quota:${UsageResourceType.AI}:${UsageOperationType.AI_CHAT_INCLUDED}:*`,
        )),
      ];

      if (isNonEmptyArray(keys)) {
        await redis.del(keys);
      }
    };

    beforeAll(async () => {
      const [subscription]: { status: SubscriptionStatus }[] =
        await global.testDataSource.query(
          `SELECT status FROM core."billingSubscription" WHERE "workspaceId" = $1 AND "stripeSubscriptionId" = $2`,
          [workspaceId, TEST_STRIPE_SUBSCRIPTION_ID],
        );

      originalStatus = subscription.status;

      clickHouseClient = createClickHouseClient({
        url: process.env.CLICKHOUSE_URL,
        clickhouse_settings: {
          allow_experimental_json_type: 1,
        },
        log: { level: ClickHouseLogLevel.OFF },
      });
      redis = await createRedisClient({ url: process.env.REDIS_URL }).connect();

      await setSubscriptionStatus(workspaceId, SubscriptionStatus.Trialing);
      await resetBillingCreditState(workspaceId);
    });

    afterAll(async () => {
      await global.testDataSource.query(
        `DELETE FROM core."usageLimit" WHERE "workspaceId" = $1 AND "operationType" = $2`,
        [workspaceId, UsageOperationType.AI_CHAT_INCLUDED],
      );
      await deleteIncludedChatCacheKeys();

      await clickHouseClient.command({
        query: `ALTER TABLE usageEvent DELETE
                WHERE workspaceId = {workspaceId:String}
                  AND resourceId = {resourceId:String}`,
        query_params: { workspaceId, resourceId },
        clickhouse_settings: { mutations_sync: '2' },
      });

      await clickHouseClient.close();
      await redis.quit();

      await setSubscriptionStatus(workspaceId, originalStatus);
      await resetBillingCreditState(workspaceId);
    });

    it('uses the trial value, and says so', async () => {
      const ceiling = await findIncludedChatCeiling();

      expect(Number(ceiling.limitValue)).toBe(TRIAL_DAILY_CEILING_MICRO);
      expect(ceiling.isTrialLimitValue).toBe(true);
    });

    it("counts the day's included chat spend against the trial ceiling", async () => {
      const daySpend = await recordIncludedChatSpend();

      expect(Number((await findIncludedChatCeiling()).consumedValue)).toBe(
        daySpend,
      );
    });

    it("drops the trial ceiling's counter when an operator overrides it, so removing the override resumes from the day's spend", async () => {
      const daySpend = await recordIncludedChatSpend();

      // A counter warmed before that spend, under the key the engine builds while trialing
      await redis.set(
        buildTestQuotaCounterKey(
          buildQuotaDefaultCounterKey({
            workspaceId,
            resourceType: UsageResourceType.AI,
            operationType: UsageOperationType.AI_CHAT_INCLUDED,
            spenderType: 'workspace',
            spenderId: null,
            unit: UsageUnit.CREDIT,
            periodUnit: 'day',
            periodStart: getCalendarDayPeriod(new Date()).periodStart,
            limitValue: TRIAL_DAILY_CEILING_MICRO,
          }),
        ),
        String(TRIAL_DAILY_CEILING_MICRO),
      );

      expect(Number((await findIncludedChatCeiling()).consumedValue)).toBe(0);

      const createResponse = await makeAdminPanelApiRequest({
        query: CREATE_WORKSPACE_USAGE_LIMIT,
        variables: {
          workspaceId,
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

      expect(createResponse.body.errors).toBeUndefined();

      const usageLimitId =
        createResponse.body.data?.createWorkspaceUsageLimit?.id;

      jestExpectToBeDefined(usageLimitId);

      const deleteResponse = await makeAdminPanelApiRequest({
        query: DELETE_WORKSPACE_USAGE_LIMIT,
        variables: { workspaceId, usageLimitId },
      });

      expect(deleteResponse.body.data?.deleteWorkspaceUsageLimit).toBe(true);
      expect(Number((await findIncludedChatCeiling()).consumedValue)).toBe(
        daySpend,
      );
    });
  });
});

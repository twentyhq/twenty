import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { addDays, subDays } from 'date-fns';
import { gql } from 'graphql-tag';
import {
  getSeededBillingWorkspaceId,
  quitBillingFixtureRedis,
  removeSubscriptionPlans,
  resetBillingCreditState,
  setSubscriptionPlan,
  setSubscriptionStatus,
  setupResourceCreditSubscription,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type BillingCreditAllowanceProvider } from 'src/engine/core-modules/billing/services/billing-credit-allowance-provider.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type UsageLimitStockService } from 'src/engine/core-modules/usage-limit/services/usage-limit-stock.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const PERIOD_START = subDays(new Date(), 1);
const PERIOD_END = addDays(PERIOD_START, 30);
const ALLOWANCE_MICRO = 1_000 * INTERNAL_CREDITS_PER_DISPLAY_CREDIT;
const INSTANCE_EMAIL_DAILY_LIMIT = 4;
const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;

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

const EMAIL_DAILY_DEFAULT_SCOPE = {
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'day',
  unit: UsageUnit.INVOCATION,
};

describe('Usage limit defaults per billing plan (integration)', () => {
  let workspaceId: string;
  let subscriptionId: string;
  let clickHouseClient: ClickHouseClient;
  let configOverrides: Partial<ConfigVariables> = {};

  const refreshBillingSubscriptionCache = () =>
    getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['currentBillingSubscription']);

  const findEmailRefusal = () =>
    getAppProviderByClassName<UsageLimitQuotaService>(
      'UsageLimitQuotaService',
    ).findExhaustedScope({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders: {},
    });

  const assertStorageAvailable = (usedBytes: number) =>
    getAppProviderByClassName<UsageLimitStockService>(
      'UsageLimitStockService',
    ).assertStockAvailable({
      workspaceId,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders: {},
      cost: { [UsageUnit.BYTE]: 1 },
      computeUsedStock: async () => ({ [UsageUnit.BYTE]: usedBytes }),
    });

  const countEmailSends = async (): Promise<number> => {
    const result = await clickHouseClient.query({
      query: `SELECT sum(quantity) AS sendCount
              FROM usageEvent
              WHERE workspaceId = {workspaceId:String}
                AND resourceType = {resourceType:String}`,
      query_params: { workspaceId, resourceType: UsageResourceType.EMAIL },
      format: 'JSONEachRow',
    });

    const [row] = await result.json<{ sendCount: string }>();

    return Number(row?.sendCount ?? 0);
  };

  const recordEmailSends = async (sendCount: number) => {
    const sendCountBefore = await countEmailSends();

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: [
        {
          timestamp: formatDateTimeForClickHouse(new Date()),
          periodStart: formatDateTimeForClickHouse(PERIOD_START),
          workspaceId,
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.EMAIL_SEND,
          unit: UsageUnit.INVOCATION,
          quantity: sendCount,
          creditsUsedMicro: 0,
          metadata: {},
        },
      ],
      format: 'JSONEachRow',
    });

    await expectEventually(
      async () => {
        expect(await countEmailSends()).toBe(sendCountBefore + sendCount);
      },
      { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
    );
  };

  const setUpPlan = async ({
    planKey = BillingPlanKey.PRO,
    status = SubscriptionStatus.Active,
    usageLimitDefaultsByPlan,
  }: {
    planKey?: BillingPlanKey;
    status?: SubscriptionStatus;
    usageLimitDefaultsByPlan: ConfigVariables['USAGE_LIMIT_DEFAULTS_BY_PLAN'];
  }) => {
    configOverrides = {
      EMAIL_SEND_WORKSPACE_DAILY_LIMIT: INSTANCE_EMAIL_DAILY_LIMIT,
      USAGE_LIMIT_DEFAULTS_BY_PLAN: usageLimitDefaultsByPlan,
    };

    const isTrialing = status === SubscriptionStatus.Trialing;

    ({ subscriptionId } = await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
      status,
      trialStart: isTrialing ? PERIOD_START : null,
      trialEnd: isTrialing ? addDays(PERIOD_START, 7) : null,
    }));
    await setSubscriptionPlan({ subscriptionId, planKey });
    await refreshBillingSubscriptionCache();
  };

  const deleteEmailUsage = () =>
    clickHouseClient.command({
      query: `ALTER TABLE usageEvent DELETE WHERE workspaceId = {workspaceId:String} AND resourceType = {resourceType:String}`,
      query_params: { workspaceId, resourceType: UsageResourceType.EMAIL },
      clickhouse_settings: { mutations_sync: '2' },
    });

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
    clickHouseClient = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: { allow_experimental_json_type: 1 },
      log: { level: ClickHouseLogLevel.OFF },
    });

    const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
      'TwentyConfigService',
    );
    const readConfig = twentyConfigService.get.bind(twentyConfigService);

    jest
      .spyOn(twentyConfigService, 'get')
      .mockImplementation((key) => configOverrides[key] ?? readConfig(key));
  });

  beforeEach(async () => {
    await deleteEmailUsage();
    await resetBillingCreditState(workspaceId);
  });

  afterEach(async () => {
    configOverrides = {};
    await global.testDataSource.query(
      `DELETE FROM core."usageLimit" WHERE "workspaceId" = $1`,
      [workspaceId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['usageLimits']);
    await deleteEmailUsage();
    await removeSubscriptionPlans([
      BillingPlanKey.PRO,
      BillingPlanKey.ENTERPRISE,
    ]);
    await resetBillingCreditState(workspaceId);
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
    });
    await refreshBillingSubscriptionCache();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await quitBillingFixtureRedis();
    await clickHouseClient.close();
  });

  it('caps the daily email default at the plan value', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 2 } },
      },
    });
    await recordEmailSends(2);

    expect(await findEmailRefusal()).toMatchObject({
      exhaustedKind: 'limit',
      limitValue: 2,
      isDefault: true,
    });
  });

  it('uses the trial value while the subscription is trialing', async () => {
    await setUpPlan({
      status: SubscriptionStatus.Trialing,
      usageLimitDefaultsByPlan: {
        PRO: {
          values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 3 },
          trialValues: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 2 },
        },
      },
    });
    await recordEmailSends(2);

    expect(await findEmailRefusal()).toMatchObject({ limitValue: 2 });
  });

  it('lifts the default when the plan removes it', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: null } },
      },
    });
    await recordEmailSends(INSTANCE_EMAIL_DAILY_LIMIT);

    expect(await findEmailRefusal()).toBeNull();
  });

  it('keeps the instance value for a plan the config leaves out', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        ENTERPRISE: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 100 } },
      },
    });
    await recordEmailSends(INSTANCE_EMAIL_DAILY_LIMIT);

    expect(await findEmailRefusal()).toMatchObject({
      limitValue: INSTANCE_EMAIL_DAILY_LIMIT,
    });
  });

  it('keeps the instance value once the subscription is canceled', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 100 } },
      },
    });
    await setSubscriptionStatus(workspaceId, SubscriptionStatus.Canceled);
    await refreshBillingSubscriptionCache();
    await recordEmailSends(INSTANCE_EMAIL_DAILY_LIMIT);

    expect(await findEmailRefusal()).toMatchObject({
      limitValue: INSTANCE_EMAIL_DAILY_LIMIT,
    });
  });

  it('applies the new plan value once the workspace switches plan', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 2 } },
        ENTERPRISE: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: null } },
      },
    });
    await recordEmailSends(2);

    expect(await findEmailRefusal()).toMatchObject({ limitValue: 2 });

    await setSubscriptionPlan({
      subscriptionId,
      planKey: BillingPlanKey.ENTERPRISE,
    });
    await refreshBillingSubscriptionCache();

    expect(await findEmailRefusal()).toBeNull();
  });

  it('skips every default a plan sets when the plan cannot be read', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 2 } },
      },
    });

    const getSubscriptionPlanSpy = jest
      .spyOn(
        getAppProviderByClassName<BillingCreditAllowanceProvider>(
          'BillingCreditAllowanceProvider',
        ),
        'getSubscriptionPlan',
      )
      .mockRejectedValue(new Error('Subscription plan read failed'));
    const incrementCounterSpy = jest.spyOn(
      getAppProviderByClassName<MetricsService>('MetricsService'),
      'incrementCounterBy',
    );

    try {
      await recordEmailSends(INSTANCE_EMAIL_DAILY_LIMIT);

      expect(await findEmailRefusal()).toBeNull();
      expect(incrementCounterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.UsageLimitPlanDefaultsSkippedOnFailure,
          attributes: { resourceType: UsageResourceType.EMAIL },
        }),
      );
      expect(incrementCounterSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.UsageLimitQuotaAdmittedOnFailure,
        }),
      );
    } finally {
      getSubscriptionPlanSpy.mockRestore();
      incrementCounterSpy.mockRestore();
    }
  });

  it('does not read the plan for a resource no plan sets a value for', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { WORKSPACE_STORAGE_LIMIT_BYTES: 1_000 } },
      },
    });

    const getSubscriptionPlanSpy = jest.spyOn(
      getAppProviderByClassName<BillingCreditAllowanceProvider>(
        'BillingCreditAllowanceProvider',
      ),
      'getSubscriptionPlan',
    );

    try {
      await recordEmailSends(INSTANCE_EMAIL_DAILY_LIMIT);

      expect(await findEmailRefusal()).toMatchObject({
        limitValue: INSTANCE_EMAIL_DAILY_LIMIT,
      });
      expect(getSubscriptionPlanSpy).not.toHaveBeenCalled();
    } finally {
      getSubscriptionPlanSpy.mockRestore();
    }
  });

  it('drops the plan-valued default counter when an operator limit replaces it and goes away', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 5 } },
      },
    });
    await recordEmailSends(2);

    expect(await findEmailRefusal()).toBeNull();

    const createResponse = await makeAdminPanelApiRequest({
      query: CREATE_WORKSPACE_USAGE_LIMIT,
      variables: {
        workspaceId,
        payload: { ...EMAIL_DAILY_DEFAULT_SCOPE, limitValue: 1_000 },
      },
    });
    const usageLimitId =
      createResponse.body.data?.createWorkspaceUsageLimit?.id;

    expect(usageLimitId).toBeDefined();

    await recordEmailSends(3);

    const deleteResponse = await makeAdminPanelApiRequest({
      query: DELETE_WORKSPACE_USAGE_LIMIT,
      variables: { workspaceId, usageLimitId },
    });

    expect(deleteResponse.body.data?.deleteWorkspaceUsageLimit).toBe(true);
    expect(await findEmailRefusal()).toMatchObject({
      limitValue: 5,
      isDefault: true,
    });
  });

  it('caps storage at the plan value and lifts it where the plan removes it', async () => {
    await setUpPlan({
      usageLimitDefaultsByPlan: {
        PRO: { values: { WORKSPACE_STORAGE_LIMIT_BYTES: 1_000 } },
        ENTERPRISE: { values: { WORKSPACE_STORAGE_LIMIT_BYTES: null } },
      },
    });
    configOverrides = {
      ...configOverrides,
      WORKSPACE_STORAGE_LIMIT_BYTES: 500,
    };

    await expect(assertStorageAvailable(1_000)).rejects.toMatchObject({
      code: UsageLimitExceptionCode.STOCK_EXHAUSTED,
      exhaustedScope: { limitValue: 1_000 },
    });

    await setSubscriptionPlan({
      subscriptionId,
      planKey: BillingPlanKey.ENTERPRISE,
    });
    await refreshBillingSubscriptionCache();

    await expect(assertStorageAvailable(1_000)).resolves.toBeUndefined();
  });
});

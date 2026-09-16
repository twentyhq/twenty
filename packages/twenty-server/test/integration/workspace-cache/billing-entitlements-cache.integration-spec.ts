import { isDefined } from 'twenty-shared/utils';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type BillingUsageLimitEntitlementProvider } from 'src/engine/core-modules/billing/services/billing-usage-limit-entitlement-provider.service';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

import {
  getSeededBillingWorkspaceId,
  TEST_STRIPE_CUSTOMER_ID,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';

(isBillingEnabled ? describe.skip : describe)(
  'Billing entitlement cache without billing',
  () => {
    it('returns an empty map without loading unregistered billing entities', async () => {
      const workspaceCacheService =
        getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        );
      const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

      await workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'billingEntitlements',
      ]);
      expect(
        await workspaceCacheService.getOrRecompute(workspaceId, [
          'billingEntitlements',
        ]),
      ).toEqual({ billingEntitlements: {} });
    });
  },
);

(isBillingEnabled ? describe : describe.skip)(
  'Billing entitlement cache with billing',
  () => {
    let workspaceId: string;
    let originalEntitlements: { value: boolean }[];
    let workspaceCacheService: WorkspaceCacheService;
    let subscriptionService: BillingSubscriptionService;
    let usageLimitProvider: BillingUsageLimitEntitlementProvider;
    let enterprisePlanService: EnterprisePlanService;

    const setUsageLimitEntitlement = async (value: boolean) => {
      await global.testDataSource.query(
        `INSERT INTO core."billingEntitlement" ("workspaceId", key, value, "stripeCustomerId")
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ("workspaceId", key) DO UPDATE SET value = EXCLUDED.value`,
        [
          workspaceId,
          BillingEntitlementKey.USAGE_LIMIT,
          value,
          TEST_STRIPE_CUSTOMER_ID,
        ],
      );
    };

    const refreshEntitlements = () =>
      workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'billingEntitlements',
      ]);

    beforeAll(async () => {
      workspaceId = await getSeededBillingWorkspaceId();
      workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      );
      subscriptionService =
        getAppProviderByClassName<BillingSubscriptionService>(
          'BillingSubscriptionService',
        );
      usageLimitProvider =
        getAppProviderByClassName<BillingUsageLimitEntitlementProvider>(
          'BillingUsageLimitEntitlementProvider',
        );
      enterprisePlanService = getAppProviderByClassName<EnterprisePlanService>(
        'EnterprisePlanService',
      );
      originalEntitlements = await global.testDataSource.query(
        'SELECT value FROM core."billingEntitlement" WHERE "workspaceId" = $1 AND key = $2',
        [workspaceId, BillingEntitlementKey.USAGE_LIMIT],
      );
    });

    beforeEach(async () => {
      jest.spyOn(enterprisePlanService, 'isValid').mockReturnValue(true);
      await setUsageLimitEntitlement(true);
      await refreshEntitlements();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    afterAll(async () => {
      const originalEntitlement = originalEntitlements[0];

      if (isDefined(originalEntitlement)) {
        await setUsageLimitEntitlement(originalEntitlement.value);
      } else {
        await global.testDataSource.query(
          'DELETE FROM core."billingEntitlement" WHERE "workspaceId" = $1 AND key = $2',
          [workspaceId, BillingEntitlementKey.USAGE_LIMIT],
        );
      }
      await refreshEntitlements();
    });

    it('reuses cached rows until invalidation, then exposes a revoked entitlement to all readers', async () => {
      expect(
        await usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId),
      ).toBe(true);
      await setUsageLimitEntitlement(false);
      expect(
        await usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId),
      ).toBe(true);

      await refreshEntitlements();

      expect(
        await usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId),
      ).toBe(false);
      expect(
        await subscriptionService.getWorkspaceEntitlements(workspaceId),
      ).toContainEqual({
        key: BillingEntitlementKey.USAGE_LIMIT,
        value: false,
      });
    });

    it('evaluates license validity again while the entitlement remains cached', async () => {
      expect(
        await usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId),
      ).toBe(true);
      jest.spyOn(enterprisePlanService, 'isValid').mockReturnValue(false);
      expect(
        await usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId),
      ).toBe(false);
    });

    it('propagates a cache outage rather than treating it as a missing entitlement', async () => {
      jest
        .spyOn(workspaceCacheService, 'getOrRecompute')
        .mockRejectedValueOnce(new Error('cache unavailable'));
      await expect(
        usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId),
      ).rejects.toThrow('cache unavailable');
    });
  },
);

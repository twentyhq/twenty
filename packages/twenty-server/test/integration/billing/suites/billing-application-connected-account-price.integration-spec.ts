import { randomUUID } from 'node:crypto';

import {
  getSeededBillingWorkspaceId,
  setupResourceCreditSubscription,
  TEST_STRIPE_SUBSCRIPTION_ID,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  deleteConnectedAccount,
  disconnectConnectedAccount,
} from 'test/integration/utils/query-messaging.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type ApplicationBillingPrice } from 'twenty-shared/application';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';

import { type ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { type AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { UPDATE_SUBSCRIPTION_QUANTITY_JOB_DELAY_MS } from 'src/engine/core-modules/billing/constants/update-subscription-quantity-job-delay-ms.constant';
import { SyncSubscriptionApplicationsJob } from 'src/engine/core-modules/billing/jobs/sync-subscription-applications.job';
import { type BillingSeatService } from 'src/engine/core-modules/billing/services/billing-seat.service';
import { type BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { type StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { buildApplicationStripeProductId } from 'src/engine/core-modules/billing/utils/build-application-stripe-product-id.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type StripeItem = { id: string; price: { id: string }; quantity: number };

const PRICE: ApplicationBillingPrice = {
  universalIdentifier: '6f0d2c1e-8a47-4b93-9e15-3c7d5a2b4f80',
  label: 'Per connected account',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 1000,
  per: 'CONNECTED_ACCOUNT',
};

const BASE_PRODUCT_ID = 'prod_base_connected_account_price_test';
const BASE_MONTH_PRICE_ID = 'price_base_connected_account_price_test';
const BASE_SUBSCRIPTION_ITEM_ID = 'si_base_connected_account_price_test';
const CREDIT_SUBSCRIPTION_ITEM_ID = 'si_resource_credit_test';
const CREDIT_PRICE_ID = 'price_resource_credit_test';

const query = async <TRow>(
  sql: string,
  params: unknown[] = [],
): Promise<TRow[]> => globalThis.testDataSource.query(sql, params);

const insertMonthAndYearPrices = async ({
  stripeProductId,
  monthPriceId,
  monthAmountCents,
}: {
  stripeProductId: string;
  monthPriceId: string;
  monthAmountCents: number;
}) =>
  query(
    `INSERT INTO core."billingPrice"
       ("stripePriceId", "stripeProductId", active, currency, "taxBehavior",
        type, "billingScheme", "usageType", interval, "unitAmount", metadata)
     VALUES ($1, $3, true, 'usd', 'UNSPECIFIED', 'RECURRING', 'PER_UNIT', 'LICENSED', 'month', $4, '{}'),
            ($2, $3, true, 'usd', 'UNSPECIFIED', 'RECURRING', 'PER_UNIT', 'LICENSED', 'year', $5, '{}')`,
    [
      monthPriceId,
      `${monthPriceId}_year`,
      stripeProductId,
      monthAmountCents,
      monthAmountCents * 12,
    ],
  );

describe('Application price per connected account (integration)', () => {
  let workspaceId: string;
  let applicationUniversalIdentifier: string;
  let applicationStripeProductId: string;
  let applicationMonthPriceId: string;
  let stripeItems: StripeItem[];
  let updateSubscriptionSpy: jest.SpyInstance;
  let billingQueueAddSpy: jest.SpyInstance;
  let spies: jest.SpyInstance[];

  const findApplicationItem = () =>
    stripeItems.find(({ price }) => price.id === applicationMonthPriceId);

  const runDelayedApplicationsSync = async () => {
    expect(billingQueueAddSpy).toHaveBeenCalledWith(
      SyncSubscriptionApplicationsJob.name,
      { workspaceId },
      expect.objectContaining({
        delay: UPDATE_SUBSCRIPTION_QUANTITY_JOB_DELAY_MS,
      }),
    );
    billingQueueAddSpy.mockClear();

    await getAppProviderByClassName<BillingSubscriptionUpdateService>(
      'BillingSubscriptionUpdateService',
    ).syncApplications({ workspaceId });
  };

  const findUserWorkspace = async () => {
    const [userWorkspace] = await query<{ id: string; userId: string }>(
      `SELECT id, "userId" FROM core."userWorkspace" WHERE "workspaceId" = $1 LIMIT 1`,
      [workspaceId],
    );

    return userWorkspace;
  };

  const connectAccount = async ({
    handle,
    reconnectingConnectedAccountId = null,
  }: {
    handle: string;
    reconnectingConnectedAccountId?: string | null;
  }): Promise<string> => {
    const [provider] = await findConnectionProvidersByApplication(
      applicationUniversalIdentifier,
    );
    const userWorkspace = await findUserWorkspace();

    const connectedAccount =
      await getAppProviderByClassName<ConnectionProviderConnectedAccountService>(
        'ConnectionProviderConnectedAccountService',
      ).persist({
        provider,
        credentials: undefined,
        handle,
        identifiedAccount: null,
        workspaceId,
        userId: userWorkspace.userId,
        userWorkspaceId: userWorkspace.id,
        scope: 'WORKSPACE',
        reconnectingConnectedAccountId,
      });

    await waitForAllJobsToFinish();

    return connectedAccount.id;
  };

  const insertConnectedAccount = async ({
    applicationId,
    archivedAt = null,
    provider = ConnectedAccountProvider.APP,
  }: {
    applicationId: string | null;
    archivedAt?: Date | null;
    provider?: ConnectedAccountProvider;
  }): Promise<string> => {
    const userWorkspace = await findUserWorkspace();
    const id = randomUUID();

    await query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId", "applicationId", "archivedAt")
       VALUES ($1, $2, $3, 'WORKSPACE', $4, $5, $6, $7)`,
      [
        id,
        `not-billed-${randomUUID()}@apple.dev`,
        provider,
        workspaceId,
        userWorkspace.id,
        applicationId,
        archivedAt,
      ],
    );

    return id;
  };

  beforeEach(async () => {
    const billingSubscriptionService =
      getAppProviderByClassName<BillingSubscriptionService>(
        'BillingSubscriptionService',
      );

    spies = [];

    workspaceId = await getSeededBillingWorkspaceId();
    applicationUniversalIdentifier = randomUUID();
    applicationStripeProductId = buildApplicationStripeProductId({
      applicationUniversalIdentifier,
      price: PRICE,
    });
    applicationMonthPriceId = `price_${applicationStripeProductId}`;

    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Test Application',
      description: 'App billed per connected account',
      sourcePath: 'test-connected-account-price',
    });

    jest.useRealTimers();

    const baseManifest = buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: randomUUID(),
    });

    await syncApplication({
      manifest: {
        ...baseManifest,
        connectionProviders: [
          {
            universalIdentifier: randomUUID(),
            name: 'fathom',
            displayName: 'Fathom',
            type: 'oauth',
            oauth: {
              authorizationEndpoint: 'https://fathom.video/oauth2/authorize',
              tokenEndpoint: 'https://api.fathom.ai/oauth2/token',
              scopes: ['public_api'],
              clientIdVariable: 'FATHOM_CLIENT_ID',
              clientSecretVariable: 'FATHOM_CLIENT_SECRET',
            },
          },
        ],
      },
      expectToFail: false,
    });

    await query(
      `UPDATE core."application"
       SET "sourceType" = 'npm', version = '1.0.0', "acceptedBillingPrices" = $3::jsonb
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, workspaceId, JSON.stringify([PRICE])],
    );
    const { subscriptionId: billingSubscriptionId } =
      await setupResourceCreditSubscription({
        workspaceId,
        periodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        creditAmountMicro: 1_000_000,
      });

    await query(
      `INSERT INTO core."billingProduct" ("stripeProductId", active, name, description, metadata)
       VALUES ($1, true, 'Pro', '', $2),
              ($3, true, 'Test Application - Per connected account', '', $4)`,
      [
        BASE_PRODUCT_ID,
        JSON.stringify({
          productKey: 'BASE_PRODUCT',
          planKey: 'PRO',
          priceUsageBased: 'LICENSED',
        }),
        applicationStripeProductId,
        JSON.stringify({
          productKey: 'APPLICATION',
          priceUsageBased: 'LICENSED',
        }),
      ],
    );
    await insertMonthAndYearPrices({
      stripeProductId: BASE_PRODUCT_ID,
      monthPriceId: BASE_MONTH_PRICE_ID,
      monthAmountCents: 900,
    });
    await insertMonthAndYearPrices({
      stripeProductId: applicationStripeProductId,
      monthPriceId: applicationMonthPriceId,
      monthAmountCents: PRICE.amountCents,
    });
    await query(
      `INSERT INTO core."billingSubscriptionItem"
         ("billingSubscriptionId", "stripeSubscriptionId", "stripeProductId",
          "stripePriceId", "stripeSubscriptionItemId", quantity, metadata)
       VALUES ($1, $2, $3, $4, $5, 1, '{}')`,
      [
        billingSubscriptionId,
        TEST_STRIPE_SUBSCRIPTION_ID,
        BASE_PRODUCT_ID,
        BASE_MONTH_PRICE_ID,
        BASE_SUBSCRIPTION_ITEM_ID,
      ],
    );

    await getAppProviderByClassName<FeatureFlagService>(
      'FeatureFlagService',
    ).enableFeatureFlags(
      [FeatureFlagKey.IS_APPLICATION_PRICE_BILLING_ENABLED],
      workspaceId,
    );

    const billedSeats =
      (await getAppProviderByClassName<BillingSeatService>(
        'BillingSeatService',
      ).computeCurrentBilledSeats(workspaceId)) ?? 0;

    stripeItems = [
      {
        id: BASE_SUBSCRIPTION_ITEM_ID,
        price: { id: BASE_MONTH_PRICE_ID },
        quantity: billedSeats,
      },
      {
        id: CREDIT_SUBSCRIPTION_ITEM_ID,
        price: { id: CREDIT_PRICE_ID },
        quantity: 1,
      },
    ];

    const buildStripeSubscription = () =>
      ({
        id: TEST_STRIPE_SUBSCRIPTION_ID,
        items: { data: stripeItems },
      }) as unknown as SubscriptionWithSchedule;

    updateSubscriptionSpy = jest
      .spyOn(
        getAppProviderByClassName<StripeSubscriptionService>(
          'StripeSubscriptionService',
        ),
        'updateSubscription',
      )
      .mockImplementation(async (_stripeSubscriptionId, { items = [] }) => {
        for (const item of items) {
          if (item.deleted) {
            stripeItems = stripeItems.filter(({ id }) => id !== item.id);
            continue;
          }

          const existingItem = stripeItems.find(({ id }) => id === item.id);

          if (existingItem) {
            existingItem.price = { id: item.price ?? existingItem.price.id };
            existingItem.quantity = item.quantity ?? existingItem.quantity;
            continue;
          }

          stripeItems.push({
            id: `si_${randomUUID()}`,
            price: { id: item.price ?? '' },
            quantity: item.quantity ?? 1,
          });
        }

        return buildStripeSubscription();
      });

    billingQueueAddSpy = jest
      .spyOn(
        global.app.get<MessageQueueService>(
          getQueueToken(MessageQueue.billingQueue),
        ),
        'add',
      )
      .mockResolvedValue(undefined);

    spies = [
      updateSubscriptionSpy,
      billingQueueAddSpy,
      jest
        .spyOn(
          getAppProviderByClassName<StripeSubscriptionScheduleService>(
            'StripeSubscriptionScheduleService',
          ),
          'loadSubscriptionSchedule',
        )
        .mockImplementation(async () => ({
          subscription: buildStripeSubscription(),
        })),
      jest
        .spyOn(billingSubscriptionService, 'syncSubscriptionToDatabase')
        .mockImplementation(async ({ workspaceId }) =>
          billingSubscriptionService.getCurrentBillingSubscriptionOrThrow({
            workspaceId,
          }),
        ),
      jest
        .spyOn(
          getAppProviderByClassName<AppOAuthRevokeService>(
            'AppOAuthRevokeService',
          ),
          'revokeIfApp',
        )
        .mockResolvedValue(undefined),
    ];
  }, 120000);

  afterEach(async () => {
    await waitForAllJobsToFinish();
    spies.forEach((spy) => spy.mockRestore());

    await query(
      `DELETE FROM core."connectedAccount" WHERE "workspaceId" = $1 AND handle LIKE '%@apple.dev' AND provider = $2`,
      [workspaceId, ConnectedAccountProvider.APP],
    );
    await query(
      `DELETE FROM core."billingSubscriptionItem" WHERE "stripeSubscriptionItemId" = $1`,
      [BASE_SUBSCRIPTION_ITEM_ID],
    );
    await query(
      `DELETE FROM core."billingPrice" WHERE "stripeProductId" = ANY($1)`,
      [[BASE_PRODUCT_ID, applicationStripeProductId]],
    );
    await query(
      `DELETE FROM core."billingProduct" WHERE "stripeProductId" = ANY($1)`,
      [[BASE_PRODUCT_ID, applicationStripeProductId]],
    );
    await query(
      `DELETE FROM core."featureFlag" WHERE "workspaceId" = $1 AND key = $2`,
      [workspaceId, FeatureFlagKey.IS_APPLICATION_PRICE_BILLING_ENABLED],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(workspaceId, ['featureFlagsMap']);
    await query(
      `UPDATE core."application" SET "sourceType" = 'local'
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, workspaceId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  }, 120000);

  it('bills each connected account of the application and stops with the last one', async () => {
    const firstConnectedAccountId = await connectAccount({
      handle: 'first-linkedin@apple.dev',
    });
    await runDelayedApplicationsSync();

    expect(findApplicationItem()?.quantity).toBe(1);

    const secondConnectedAccountId = await connectAccount({
      handle: 'second-linkedin@apple.dev',
    });
    await runDelayedApplicationsSync();

    expect(findApplicationItem()?.quantity).toBe(2);

    const updateCallCount = updateSubscriptionSpy.mock.calls.length;

    await connectAccount({
      handle: 'first-linkedin@apple.dev',
      reconnectingConnectedAccountId: firstConnectedAccountId,
    });
    await runDelayedApplicationsSync();

    expect(findApplicationItem()?.quantity).toBe(2);
    expect(updateSubscriptionSpy).toHaveBeenCalledTimes(updateCallCount);

    const [application] = await query<{ id: string }>(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, workspaceId],
    );
    const [otherApplication] = await query<{ id: string }>(
      `SELECT id FROM core."application" WHERE "workspaceId" = $1 AND id <> $2 LIMIT 1`,
      [workspaceId, application.id],
    );

    await insertConnectedAccount({
      applicationId: application.id,
      archivedAt: new Date(),
    });
    await insertConnectedAccount({ applicationId: otherApplication.id });

    await getAppProviderByClassName<BillingSubscriptionUpdateService>(
      'BillingSubscriptionUpdateService',
    ).syncApplications({ workspaceId });

    expect(findApplicationItem()?.quantity).toBe(2);

    await disconnectConnectedAccount(firstConnectedAccountId);
    await waitForAllJobsToFinish();
    await runDelayedApplicationsSync();

    expect(findApplicationItem()?.quantity).toBe(1);

    const nativeConnectedAccountId = await insertConnectedAccount({
      applicationId: null,
      provider: ConnectedAccountProvider.GOOGLE,
    });

    await deleteConnectedAccount(nativeConnectedAccountId);
    await waitForAllJobsToFinish();

    expect(billingQueueAddSpy).not.toHaveBeenCalled();

    await deleteConnectedAccount(secondConnectedAccountId);
    await waitForAllJobsToFinish();
    await runDelayedApplicationsSync();

    expect(findApplicationItem()).toBeUndefined();
    expect(updateSubscriptionSpy).toHaveBeenLastCalledWith(
      TEST_STRIPE_SUBSCRIPTION_ID,
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ deleted: true }),
        ]),
      }),
    );
  }, 120000);
});

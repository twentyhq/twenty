import { randomUUID } from 'node:crypto';

import Stripe from 'stripe';

import {
  getSeededBillingWorkspaceId,
  setupResourceCreditSubscription,
  TEST_STRIPE_SUBSCRIPTION_ID,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type ApplicationBillingPrice } from 'twenty-shared/application';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type BillingSeatService } from 'src/engine/core-modules/billing/services/billing-seat.service';
import { type BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { type BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { type StripeProductService } from 'src/engine/core-modules/billing/stripe/services/stripe-product.service';
import { type StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { buildApplicationStripeProductId } from 'src/engine/core-modules/billing/utils/build-application-stripe-product-id.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type StripeItem = { id: string; price: { id: string }; quantity: number };

const PER_MEMBER_PRICE: ApplicationBillingPrice = {
  universalIdentifier: '3a8e5f71-2c94-4d0b-8e63-9b1f7c2d5a46',
  label: 'Per member',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 200,
  per: 'WORKSPACE_MEMBER',
};

const BASE_PRODUCT_ID = 'prod_base_application_price_test';
const BASE_MONTH_PRICE_ID = 'price_base_application_price_test';
const BASE_SUBSCRIPTION_ITEM_ID = 'si_base_application_price_test';
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

describe('Application price billing (integration)', () => {
  let workspaceId: string;
  let applicationUniversalIdentifier: string;
  let applicationStripeProductId: string;
  let applicationMonthPriceId: string;
  let billedSeats: number;
  let workspaceMemberCount: number;
  let stripeItems: StripeItem[];
  let updateSubscriptionSpy: jest.SpyInstance;
  let spies: jest.SpyInstance[];

  const findStripeItem = (stripePriceId: string) =>
    stripeItems.find(({ price }) => price.id === stripePriceId);

  const notifyInstallationChanged = async () => {
    getAppProviderByClassName<ApplicationService>(
      'ApplicationService',
    ).emitInstallationChanged({
      universalIdentifier: applicationUniversalIdentifier,
      workspaceId,
    });

    await waitForAllJobsToFinish();
  };

  const setAcceptedBillingPrices = async (
    acceptedBillingPrices: ApplicationBillingPrice[],
  ) =>
    query(
      `UPDATE core."application" SET "acceptedBillingPrices" = $3::jsonb
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [
        applicationUniversalIdentifier,
        workspaceId,
        JSON.stringify(acceptedBillingPrices),
      ],
    );

  beforeEach(async () => {
    jest.useRealTimers();

    workspaceId = await getSeededBillingWorkspaceId();
    applicationUniversalIdentifier = randomUUID();
    applicationStripeProductId = buildApplicationStripeProductId({
      applicationUniversalIdentifier,
      price: PER_MEMBER_PRICE,
    });
    applicationMonthPriceId = `price_${applicationStripeProductId}`;

    const billingSubscriptionService =
      getAppProviderByClassName<BillingSubscriptionService>(
        'BillingSubscriptionService',
      );

    spies = [];

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
              ($3, true, 'Test Application - Per member', '', $4)`,
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
      monthAmountCents: PER_MEMBER_PRICE.amountCents,
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
    await query(
      `INSERT INTO core."application"
         ("universalIdentifier", "workspaceId", name, "sourceType", "sourcePath", version, "acceptedBillingPrices")
       VALUES ($1, $2, 'Test Application', 'npm', 'test-application-price', '1.0.0', $3::jsonb)`,
      [
        applicationUniversalIdentifier,
        workspaceId,
        JSON.stringify([PER_MEMBER_PRICE]),
      ],
    );

    await getAppProviderByClassName<FeatureFlagService>(
      'FeatureFlagService',
    ).enableFeatureFlags(
      [FeatureFlagKey.IS_APPLICATION_PRICE_BILLING_ENABLED],
      workspaceId,
    );

    const billingSeatService =
      getAppProviderByClassName<BillingSeatService>('BillingSeatService');

    workspaceMemberCount =
      await billingSeatService.countWorkspaceMembers(workspaceId);
    billedSeats =
      (await billingSeatService.computeCurrentBilledSeats(workspaceId)) ?? 0;

    stripeItems = [
      {
        id: BASE_SUBSCRIPTION_ITEM_ID,
        price: { id: BASE_MONTH_PRICE_ID },
        quantity: billedSeats - 1,
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

          if (isDefined(existingItem)) {
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

    spies = [
      updateSubscriptionSpy,
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
    ];
  }, 120000);

  afterEach(async () => {
    await waitForAllJobsToFinish();
    spies.forEach((spy) => spy.mockRestore());

    await query(
      `DELETE FROM core."application" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, workspaceId],
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
  }, 120000);

  it('bills the price per member when the install completes and leaves seats untouched', async () => {
    await notifyInstallationChanged();

    expect(updateSubscriptionSpy).toHaveBeenCalledTimes(1);
    expect(updateSubscriptionSpy).toHaveBeenCalledWith(
      TEST_STRIPE_SUBSCRIPTION_ID,
      expect.objectContaining({
        proration_behavior: 'always_invoice',
        items: expect.arrayContaining([
          {
            id: BASE_SUBSCRIPTION_ITEM_ID,
            price: BASE_MONTH_PRICE_ID,
            quantity: billedSeats - 1,
          },
          { price: applicationMonthPriceId, quantity: workspaceMemberCount },
        ]),
      }),
    );
    expect(findStripeItem(applicationMonthPriceId)?.quantity).toBe(
      workspaceMemberCount,
    );
  }, 120000);

  it('leaves the subscription untouched when nothing changed since the last sync', async () => {
    await notifyInstallationChanged();
    await notifyInstallationChanged();

    expect(updateSubscriptionSpy).toHaveBeenCalledTimes(1);
  }, 120000);

  it('removes the application item once the installation has no accepted price left', async () => {
    await notifyInstallationChanged();
    await setAcceptedBillingPrices([]);
    await notifyInstallationChanged();

    expect(findStripeItem(applicationMonthPriceId)).toBeUndefined();
    expect(updateSubscriptionSpy).toHaveBeenLastCalledWith(
      TEST_STRIPE_SUBSCRIPTION_ID,
      expect.objectContaining({
        proration_behavior: 'create_prorations',
        items: expect.arrayContaining([
          expect.objectContaining({ deleted: true }),
        ]),
      }),
    );
  }, 120000);

  it('adds a newly installed application through an application sync rather than a seat update', async () => {
    await getAppProviderByClassName<BillingSubscriptionUpdateService>(
      'BillingSubscriptionUpdateService',
    ).syncSeats({ workspaceId });

    expect(updateSubscriptionSpy).toHaveBeenNthCalledWith(
      1,
      TEST_STRIPE_SUBSCRIPTION_ID,
      expect.objectContaining({
        items: expect.not.arrayContaining([
          expect.objectContaining({ price: applicationMonthPriceId }),
        ]),
      }),
    );

    await waitForAllJobsToFinish();

    expect(updateSubscriptionSpy).toHaveBeenLastCalledWith(
      TEST_STRIPE_SUBSCRIPTION_ID,
      expect.objectContaining({
        payment_behavior: 'error_if_incomplete',
        items: expect.arrayContaining([
          { price: applicationMonthPriceId, quantity: workspaceMemberCount },
        ]),
      }),
    );
  }, 120000);

  it('leaves the subscription unchanged when the application charge is declined', async () => {
    updateSubscriptionSpy.mockRejectedValueOnce(
      new Stripe.errors.StripeCardError({
        type: 'card_error',
        message: 'Your card was declined.',
      }),
    );

    const result =
      await getAppProviderByClassName<BillingSubscriptionUpdateService>(
        'BillingSubscriptionUpdateService',
      ).chargeApplications({ workspaceId });

    expect(result).toEqual({ isPaymentDeclined: true });
    expect(findStripeItem(applicationMonthPriceId)).toBeUndefined();
  }, 120000);

  it('repairs the catalog entry of a subscribed application item instead of removing it', async () => {
    await notifyInstallationChanged();
    await query(`DELETE FROM core."billingPrice" WHERE "stripePriceId" = $1`, [
      `${applicationMonthPriceId}_year`,
    ]);

    const stripeProductService =
      getAppProviderByClassName<StripeProductService>('StripeProductService');
    const stripePriceService =
      getAppProviderByClassName<StripePriceService>('StripePriceService');

    const buildStripePrice = ({
      id,
      interval,
      unitAmount,
    }: {
      id: string;
      interval: 'month' | 'year';
      unitAmount: number;
    }) =>
      ({
        id,
        active: true,
        product: applicationStripeProductId,
        currency: 'usd',
        nickname: null,
        tax_behavior: 'unspecified',
        type: 'recurring',
        billing_scheme: 'per_unit',
        unit_amount_decimal: null,
        unit_amount: unitAmount,
        transform_quantity: null,
        recurring: { interval, usage_type: 'licensed' },
        metadata: {},
      }) as unknown as Stripe.Price;

    const createPriceSpy = jest
      .spyOn(stripePriceService, 'createPrice')
      .mockImplementation(async () =>
        buildStripePrice({
          id: `${applicationMonthPriceId}_year`,
          interval: 'year',
          unitAmount: PER_MEMBER_PRICE.amountCents * 12,
        }),
      );

    spies.push(
      createPriceSpy,
      jest.spyOn(stripeProductService, 'getOrCreateProduct').mockImplementation(
        async () =>
          ({
            id: applicationStripeProductId,
            name: 'Test Application - Per member',
            active: true,
            description: '',
            images: [],
            marketing_features: [],
            default_price: null,
            unit_label: null,
            url: null,
            tax_code: null,
            metadata: {
              productKey: 'APPLICATION',
              priceUsageBased: 'LICENSED',
            },
          }) as unknown as Stripe.Product,
      ),
      jest
        .spyOn(stripePriceService, 'getPricesByProductId')
        .mockImplementation(async () => [
          buildStripePrice({
            id: applicationMonthPriceId,
            interval: 'month',
            unitAmount: PER_MEMBER_PRICE.amountCents,
          }),
        ]),
    );

    await getAppProviderByClassName<BillingSubscriptionUpdateService>(
      'BillingSubscriptionUpdateService',
    ).syncApplications({ workspaceId });

    expect(createPriceSpy).toHaveBeenCalledTimes(1);
    expect(updateSubscriptionSpy).toHaveBeenCalledTimes(1);
    expect(findStripeItem(applicationMonthPriceId)?.quantity).toBe(
      workspaceMemberCount,
    );
  }, 120000);
});

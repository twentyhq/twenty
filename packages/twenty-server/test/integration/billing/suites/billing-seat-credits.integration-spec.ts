import { addMonths, startOfMonth, subMonths } from 'date-fns';
import request from 'supertest';
import type Stripe from 'stripe';
import {
  getSeededBillingWorkspaceId,
  insertCreditGrant,
  listCreditGrants,
  quitBillingFixtureRedis,
  readAllowanceLimitMicro,
  refreshCurrentBillingSubscription,
  resetBillingCreditState,
  setupResourceCreditSubscription,
  TEST_STRIPE_CUSTOMER_ID,
  TEST_STRIPE_SUBSCRIPTION_ID,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { createMockStripeInvoiceFinalizedData } from 'test/integration/billing/utils/create-mock-stripe-invoice-finalized-data.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { mockStripeSubscriptionUpdatedEventWithUpdatedItemOnly } from 'src/engine/core-modules/billing-webhook/__mocks__/stripe-subscription-updated-events';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { type BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const client = request(`http://localhost:${APP_PORT}`);

const PERIOD_BOUNDARY = startOfMonth(new Date());
const CLOSING_PERIOD_START = subMonths(PERIOD_BOUNDARY, 1);
const CLOSING_PERIOD_END = PERIOD_BOUNDARY;
const NEXT_PERIOD_END = addMonths(PERIOD_BOUNDARY, 1);

const PACK_CREDITS_MICRO = 50_000_000;
const WORKSPACE_CREDITS_PER_SEAT_MICRO = 4_000_000;
const INITIAL_SEATS = 5;

const BASE_PRODUCT_ID = 'prod_seat_credits_test';
const BASE_PRICE_ID = 'price_seat_credits_test';
const BASE_ITEM_ID = 'si_seat_credits_test';

const query = <TRow>(sql: string, params: unknown[] = []): Promise<TRow[]> =>
  global.testDataSource.query(sql, params);

type PeakSeatsRow = {
  currentPeriodPeakSeats: number | null;
  previousPeriodPeakSeats: number | null;
  previousPeriodStart: Date | null;
};

const readPeakSeats = async (): Promise<PeakSeatsRow> => {
  const [row] = await query<PeakSeatsRow>(
    `SELECT "currentPeriodPeakSeats", "previousPeriodPeakSeats", "previousPeriodStart"
     FROM core."billingSubscription" WHERE "stripeSubscriptionId" = $1`,
    [TEST_STRIPE_SUBSCRIPTION_ID],
  );

  return row;
};

const setStoredSeats = (seats: number) =>
  query(
    `UPDATE core."billingSubscriptionItem" SET quantity = $2 WHERE "stripeSubscriptionItemId" = $1`,
    [BASE_ITEM_ID, seats],
  );

const setPeakSeats = ({
  currentPeriodPeakSeats,
  previousPeriodPeakSeats,
  previousPeriodStart,
}: PeakSeatsRow) =>
  query(
    `UPDATE core."billingSubscription"
     SET "currentPeriodPeakSeats" = $2, "previousPeriodPeakSeats" = $3, "previousPeriodStart" = $4
     WHERE "stripeSubscriptionId" = $1`,
    [
      TEST_STRIPE_SUBSCRIPTION_ID,
      currentPeriodPeakSeats,
      previousPeriodPeakSeats,
      previousPeriodStart,
    ],
  );

const postInvoiceFinalized = () =>
  client
    .post('/webhooks/stripe')
    .set('stripe-signature', 'correct-signature')
    .set('Content-Type', 'application/json')
    .send(
      JSON.stringify({
        type: 'invoice.finalized',
        data: createMockStripeInvoiceFinalizedData({
          periodStart: CLOSING_PERIOD_END,
          periodEnd: NEXT_PERIOD_END,
          stripeCustomerId: TEST_STRIPE_CUSTOMER_ID,
          invoiceId: 'in_seat_credits_test',
        }),
      }),
    );

describe('Workspace credits per seat (integration)', () => {
  let workspaceId: string;
  let workspace: WorkspaceEntity;
  let billingUsageService: BillingUsageService;
  let usageSpy: jest.SpyInstance;

  const postSubscriptionUpdated = async ({
    seats,
    periodStart,
    periodEnd,
  }: {
    seats: number;
    periodStart: Date;
    periodEnd: Date;
  }) => {
    const event = structuredClone(
      mockStripeSubscriptionUpdatedEventWithUpdatedItemOnly,
    );
    const [mockItem] = event.data.object.items.data;
    const baseItem: Stripe.SubscriptionItem = {
      ...mockItem,
      id: BASE_ITEM_ID,
      quantity: seats,
      current_period_start: periodStart.getTime() / 1000,
      current_period_end: periodEnd.getTime() / 1000,
      price: { ...mockItem.price, id: BASE_PRICE_ID, product: BASE_PRODUCT_ID },
    };

    event.data.object = {
      ...event.data.object,
      id: TEST_STRIPE_SUBSCRIPTION_ID,
      customer: TEST_STRIPE_CUSTOMER_ID,
      status: 'active',
      trial_start: null,
      trial_end: null,
      metadata: { workspaceId },
      items: { ...event.data.object.items, data: [baseItem] },
    };
    event.data.previous_attributes = undefined;

    const liveSubscription: SubscriptionWithSchedule = {
      ...event.data.object,
      schedule: null,
    };

    jest
      .spyOn(
        getAppProviderByClassName<StripeSubscriptionScheduleService>(
          'StripeSubscriptionScheduleService',
        ),
        'listCustomerNotEndedSubscriptionsWithSchedule',
      )
      .mockResolvedValue([liveSubscription]);

    await client
      .post('/webhooks/stripe')
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(event))
      .expect(200);
  };

  const getResourceCreditUsage = async () => {
    const [usage] =
      await billingUsageService.getResourceCreditProductUsage(workspace);

    return usage;
  };

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
    [workspace] = await query<WorkspaceEntity>(
      'SELECT * FROM core.workspace WHERE id = $1',
      [workspaceId],
    );
    billingUsageService = getAppProviderByClassName<BillingUsageService>(
      'BillingUsageService',
    );
  });

  beforeEach(async () => {
    await resetBillingCreditState(workspaceId);
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: CLOSING_PERIOD_START,
      periodEnd: CLOSING_PERIOD_END,
      creditAmountMicro: PACK_CREDITS_MICRO,
    });
    await setPeakSeats({
      currentPeriodPeakSeats: null,
      previousPeriodPeakSeats: null,
      previousPeriodStart: null,
    });
    await query(
      `INSERT INTO core."billingProduct" ("stripeProductId", active, name, description, metadata)
       VALUES ($1, true, 'Seat credits test', '', $2)
       ON CONFLICT ("stripeProductId") DO UPDATE SET metadata = EXCLUDED.metadata`,
      [
        BASE_PRODUCT_ID,
        JSON.stringify({
          productKey: 'BASE_PRODUCT',
          planKey: 'PRO',
          workspaceCreditsPerSeat: String(WORKSPACE_CREDITS_PER_SEAT_MICRO),
        }),
      ],
    );
    await query(
      `INSERT INTO core."billingSubscriptionItem"
         ("billingSubscriptionId", "stripeSubscriptionId", "stripeProductId", "stripePriceId", "stripeSubscriptionItemId", quantity)
       SELECT id, "stripeSubscriptionId", $2, $3, $4, $5 FROM core."billingSubscription" WHERE "stripeSubscriptionId" = $1
       ON CONFLICT ("stripeSubscriptionItemId") DO UPDATE SET quantity = EXCLUDED.quantity`,
      [
        TEST_STRIPE_SUBSCRIPTION_ID,
        BASE_PRODUCT_ID,
        BASE_PRICE_ID,
        BASE_ITEM_ID,
        INITIAL_SEATS,
      ],
    );

    usageSpy = jest.spyOn(billingUsageService, 'getCreditsUsedBetweenOrNull');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await query(
      `DELETE FROM core."billingSubscriptionItem" WHERE "stripeSubscriptionItemId" = $1`,
      [BASE_ITEM_ID],
    );
    await query(
      `DELETE FROM core."billingProduct" WHERE "stripeProductId" = $1`,
      [BASE_PRODUCT_ID],
    );
    await setPeakSeats({
      currentPeriodPeakSeats: null,
      previousPeriodPeakSeats: null,
      previousPeriodStart: null,
    });
    await resetBillingCreditState(workspaceId);
  });

  afterAll(async () => {
    await quitBillingFixtureRedis();
  });

  it('keeps the credits of a removed seat until the period ends', async () => {
    await postSubscriptionUpdated({
      seats: 8,
      periodStart: CLOSING_PERIOD_START,
      periodEnd: CLOSING_PERIOD_END,
    });
    await postSubscriptionUpdated({
      seats: 6,
      periodStart: CLOSING_PERIOD_START,
      periodEnd: CLOSING_PERIOD_END,
    });

    expect(await readPeakSeats()).toMatchObject({
      currentPeriodPeakSeats: 8,
    });

    await refreshCurrentBillingSubscription(workspaceId);

    expect(await readAllowanceLimitMicro(workspaceId)).toBe(82_000_000);
    expect(await getResourceCreditUsage()).toMatchObject({
      grantedCredits: 82_000_000,
      workspaceCreditsGrantedForSeats: 32_000_000,
      workspaceCreditsSeats: 8,
    });
  });

  it('keeps the seats stored before the first recorded peak', async () => {
    await setStoredSeats(8);

    await postSubscriptionUpdated({
      seats: 6,
      periodStart: CLOSING_PERIOD_START,
      periodEnd: CLOSING_PERIOD_END,
    });

    expect(await readPeakSeats()).toMatchObject({
      currentPeriodPeakSeats: 8,
    });
  });

  it('restarts the peak from the live seats when the period moves', async () => {
    await postSubscriptionUpdated({
      seats: 8,
      periodStart: CLOSING_PERIOD_START,
      periodEnd: CLOSING_PERIOD_END,
    });
    await postSubscriptionUpdated({
      seats: 6,
      periodStart: CLOSING_PERIOD_END,
      periodEnd: NEXT_PERIOD_END,
    });

    const peakSeats = await readPeakSeats();

    expect(peakSeats).toMatchObject({
      currentPeriodPeakSeats: 6,
      previousPeriodPeakSeats: 8,
    });
    expect(new Date(peakSeats.previousPeriodStart ?? 0)).toEqual(
      CLOSING_PERIOD_START,
    );
  });

  it('spends seat credits first and only rolls the pack over', async () => {
    await setPeakSeats({
      currentPeriodPeakSeats: 8,
      previousPeriodPeakSeats: null,
      previousPeriodStart: null,
    });
    usageSpy.mockResolvedValue(40_000_000);

    await postInvoiceFinalized().expect(200);

    const grants = await listCreditGrants(workspaceId);

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      amountMicro: 42_000_000,
      type: BillingCreditGrantType.ROLLOVER,
    });
  });

  it('reads the closing peak once the subscription has moved to the next period', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: CLOSING_PERIOD_END,
      periodEnd: NEXT_PERIOD_END,
      creditAmountMicro: PACK_CREDITS_MICRO,
    });
    await setStoredSeats(8);
    await setPeakSeats({
      currentPeriodPeakSeats: 8,
      previousPeriodPeakSeats: INITIAL_SEATS,
      previousPeriodStart: CLOSING_PERIOD_START,
    });
    usageSpy.mockResolvedValue(40_000_000);

    await postInvoiceFinalized().expect(200);

    const grants = await listCreditGrants(workspaceId);

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      amountMicro: 30_000_000,
      type: BillingCreditGrantType.ROLLOVER,
    });
  });

  it('carries a purchase over next to a free pack', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: CLOSING_PERIOD_START,
      periodEnd: CLOSING_PERIOD_END,
      creditAmountMicro: 0,
    });
    await setPeakSeats({
      currentPeriodPeakSeats: 8,
      previousPeriodPeakSeats: null,
      previousPeriodStart: null,
    });
    await insertCreditGrant({
      workspaceId,
      amountMicro: 20_000_000,
      type: BillingCreditGrantType.PURCHASE,
      effectiveAt: CLOSING_PERIOD_START,
      expiresAt: null,
    });
    usageSpy.mockResolvedValue(40_000_000);

    await postInvoiceFinalized().expect(200);

    const carriedGrants = (await listCreditGrants(workspaceId)).filter(
      (grant) => grant.sourceGrantId !== null,
    );

    expect(carriedGrants).toHaveLength(1);
    expect(carriedGrants[0]).toMatchObject({
      amountMicro: 12_000_000,
      type: BillingCreditGrantType.PURCHASE,
    });
  });

  it('gives no seat credits during the trial', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: CLOSING_PERIOD_START,
      periodEnd: NEXT_PERIOD_END,
      creditAmountMicro: PACK_CREDITS_MICRO,
      status: 'trialing',
      trialStart: CLOSING_PERIOD_START,
      trialEnd: NEXT_PERIOD_END,
    });

    expect(await getResourceCreditUsage()).toMatchObject({
      workspaceCreditsGrantedForSeats: 0,
      workspaceCreditsSeats: 0,
    });
  });
});

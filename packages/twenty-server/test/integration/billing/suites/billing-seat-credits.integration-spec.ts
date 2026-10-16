import { addMonths, startOfMonth, subMonths } from 'date-fns';
import type Stripe from 'stripe';
import {
  getSeededBillingWorkspaceId,
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
import { type BillingWebhookSubscriptionService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-subscription.service';
import { type BillingWebhookInvoiceService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-invoice.service';
import { type BillingResolver } from 'src/engine/core-modules/billing/billing.resolver';
import { type BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type BillingSeatChangeService } from 'src/engine/core-modules/billing/services/billing-seat-change.service';
import { type StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const BOUNDARY = startOfMonth(new Date());
const PERIOD_START = subMonths(BOUNDARY, 1);
const PERIOD_END = BOUNDARY;
const MIDPOINT = new Date((PERIOD_START.getTime() + PERIOD_END.getTime()) / 2);
const BASE_PRODUCT_ID = 'prod_seat_credits_test';
const BASE_ITEM_ID = 'si_seat_credits_test';

const provider = getAppProviderByClassName;

describe('Workspace credits per seat (integration)', () => {
  let workspaceId: string;
  let subscriptionId: string;
  let workspace: WorkspaceEntity;

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
    [workspace] = await global.testDataSource.query(
      'SELECT * FROM core.workspace WHERE id = $1',
      [workspaceId],
    );
  });

  beforeEach(async () => {
    await resetBillingCreditState(workspaceId);
    ({ subscriptionId } = await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: 50_000_000,
    }));
    await global.testDataSource.query(
      `UPDATE core."billingSubscription" SET "previousPeriodStart" = NULL WHERE id = $1`,
      [subscriptionId],
    );
    await global.testDataSource.query(
      `INSERT INTO core."billingProduct" ("stripeProductId", active, name, description, metadata)
      VALUES ($1, true, 'Seat credits test', '', $2)
      ON CONFLICT ("stripeProductId") DO UPDATE SET metadata = EXCLUDED.metadata`,
      [
        BASE_PRODUCT_ID,
        JSON.stringify({
          productKey: 'BASE_PRODUCT',
          planKey: 'PRO',
          workspaceCreditsPerSeat: '4000000',
        }),
      ],
    );
    await global.testDataSource.query(
      `INSERT INTO core."billingSubscriptionItem"
      ("billingSubscriptionId", "stripeSubscriptionId", "stripeProductId", "stripePriceId", "stripeSubscriptionItemId", quantity)
      VALUES ($1, $2, $3, 'price_seat_credits_test', $4, 8)
      ON CONFLICT ("stripeSubscriptionItemId") DO UPDATE SET quantity = 8`,
      [
        subscriptionId,
        TEST_STRIPE_SUBSCRIPTION_ID,
        BASE_PRODUCT_ID,
        BASE_ITEM_ID,
      ],
    );
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await global.testDataSource.query(
      `DELETE FROM core."billingSeatChange" WHERE "workspaceId" = $1`,
      [workspaceId],
    );
    await global.testDataSource.query(
      `DELETE FROM core."billingSubscriptionItem" WHERE "stripeSubscriptionItemId" = $1`,
      [BASE_ITEM_ID],
    );
    await global.testDataSource.query(
      `DELETE FROM core."billingProduct" WHERE "stripeProductId" = $1`,
      [BASE_PRODUCT_ID],
    );
    await resetBillingCreditState(workspaceId);
  });

  afterAll(quitBillingFixtureRedis);

  const recordIncrease = () =>
    provider<BillingSeatChangeService>(
      'BillingSeatChangeService',
    ).recordSeatChange({
      workspaceId,
      billingSubscriptionId: subscriptionId,
      previousSeats: 5,
      seats: 8,
      changedAt: MIDPOINT,
      stripeEventId: 'evt_seat_increase',
    });

  it('records webhook deltas once and keeps live quantities when events arrive late', async () => {
    const event = structuredClone(
      mockStripeSubscriptionUpdatedEventWithUpdatedItemOnly,
    );
    const baseItem = {
      ...event.data.object.items.data[0],
      id: BASE_ITEM_ID,
      quantity: 8,
      current_period_start: PERIOD_START.getTime() / 1000,
      current_period_end: PERIOD_END.getTime() / 1000,
      price: {
        ...event.data.object.items.data[0].price,
        id: 'price_seat_credits_test',
        product: BASE_PRODUCT_ID,
      },
    };

    event.id = 'evt_seat_webhook';
    event.created = MIDPOINT.getTime() / 1000;
    event.data.object = {
      ...event.data.object,
      id: TEST_STRIPE_SUBSCRIPTION_ID,
      customer: TEST_STRIPE_CUSTOMER_ID,
      status: 'active',
      trial_start: null,
      trial_end: null,
      items: { ...event.data.object.items, data: [baseItem] },
    };
    event.data.previous_attributes = {
      items: {
        ...event.data.object.items,
        data: [{ ...baseItem, quantity: 5 }],
      },
    };
    const liveSubscription: SubscriptionWithSchedule = {
      ...event.data.object,
      schedule: { phases: [] } as unknown as Stripe.SubscriptionSchedule,
      items: {
        ...event.data.object.items,
        data: [{ ...baseItem, quantity: 10 }],
      },
    };

    jest
      .spyOn(
        provider<StripeSubscriptionScheduleService>(
          'StripeSubscriptionScheduleService',
        ),
        'listCustomerNotEndedSubscriptionsWithSchedule',
      )
      .mockResolvedValue([liveSubscription]);
    const service = provider<BillingWebhookSubscriptionService>(
      'BillingWebhookSubscriptionService',
    );

    await service.processStripeEvent(workspaceId, event);
    await service.processStripeEvent(workspaceId, event);

    const changes = await global.testDataSource.query(
      `SELECT * FROM core."billingSeatChange" WHERE "workspaceId" = $1`,
      [workspaceId],
    );

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      previousSeats: 5,
      seats: 8,
      changedAt: MIDPOINT,
      stripeEventId: event.id,
    });
    const [item] = await global.testDataSource.query(
      `SELECT quantity FROM core."billingSubscriptionItem" WHERE "stripeSubscriptionItemId" = $1`,
      [BASE_ITEM_ID],
    );

    expect(Number(item.quantity)).toBe(10);
  });

  it('returns the combined allowance and seat split in display credits', async () => {
    await recordIncrease();
    const [usage] =
      await provider<BillingResolver>('BillingResolver').getResourceCreditUsage(
        workspace,
      );

    expect(usage).toMatchObject({
      grantedCredits: 76,
      workspaceCreditsGrantedForSeats: 26,
      totalGrantedCredits: 76,
    });
    await refreshCurrentBillingSubscription(workspaceId);
    expect(await readAllowanceLimitMicro(workspaceId)).toBe(76_000_000);
  });

  it('supports seat credits without a pack item', async () => {
    await recordIncrease();
    await global.testDataSource.query(
      `DELETE FROM core."billingSubscriptionItem" WHERE "billingSubscriptionId" = $1 AND "stripeProductId" = 'prod_resource_credit_test'`,
      [subscriptionId],
    );
    const [usage] =
      await provider<BillingResolver>('BillingResolver').getResourceCreditUsage(
        workspace,
      );

    expect(usage).toMatchObject({
      grantedCredits: 26,
      workspaceCreditsGrantedForSeats: 26,
      unitPriceCents: 0,
    });
  });

  it('leaves trial credits flat despite seat changes', async () => {
    await recordIncrease();
    await global.testDataSource.query(
      `UPDATE core."billingSubscription" SET status = 'trialing', "trialStart" = $2, "trialEnd" = $3 WHERE id = $1`,
      [subscriptionId, PERIOD_START, PERIOD_END],
    );
    const [usage] =
      await provider<BillingResolver>('BillingResolver').getResourceCreditUsage(
        workspace,
      );

    expect(usage.workspaceCreditsGrantedForSeats).toBe(0);
    await global.testDataSource.query(
      `UPDATE core."billingSubscriptionItem" SET quantity = 50 WHERE "stripeSubscriptionItemId" = $1`,
      [BASE_ITEM_ID],
    );
    const [after] =
      await provider<BillingResolver>('BillingResolver').getResourceCreditUsage(
        workspace,
      );

    expect(after.grantedCredits).toBe(usage.grantedCredits);
  });

  it('rolls unused seat credits over with a free pack, ignoring later seat changes', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_END,
      periodEnd: addMonths(PERIOD_END, 1),
      creditAmountMicro: 0,
    });
    await global.testDataSource.query(
      `UPDATE core."billingSubscription" SET "previousPeriodStart" = $2 WHERE id = $1`,
      [subscriptionId, PERIOD_START],
    );
    await recordIncrease();
    await provider<BillingSeatChangeService>(
      'BillingSeatChangeService',
    ).recordSeatChange({
      workspaceId,
      billingSubscriptionId: subscriptionId,
      previousSeats: 8,
      seats: 10,
      changedAt: new Date(PERIOD_END.getTime() + 86400000),
      stripeEventId: 'evt_next_period_seats',
    });
    await global.testDataSource.query(
      `UPDATE core."billingSubscriptionItem" SET quantity = 10 WHERE "stripeSubscriptionItemId" = $1`,
      [BASE_ITEM_ID],
    );
    jest
      .spyOn(
        provider<BillingUsageService>('BillingUsageService'),
        'getCreditsUsedBetweenOrNull',
      )
      .mockResolvedValue(6_000_000);
    const invoice = {
      type: 'invoice.finalized',
      data: createMockStripeInvoiceFinalizedData({
        periodStart: PERIOD_END,
        periodEnd: addMonths(PERIOD_END, 1),
        stripeCustomerId: TEST_STRIPE_CUSTOMER_ID,
      }),
    } as Stripe.InvoiceFinalizedEvent;

    await provider<BillingWebhookInvoiceService>(
      'BillingWebhookInvoiceService',
    ).processStripeEvent(invoice);
    const grants = await listCreditGrants(workspaceId);

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      amountMicro: 20_000_000,
      type: 'ROLLOVER',
      effectiveAt: PERIOD_END,
    });
  });
});

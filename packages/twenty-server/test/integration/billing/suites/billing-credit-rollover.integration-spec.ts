import { addMonths, startOfMonth, subMonths } from 'date-fns';
import request from 'supertest';
import { createMockStripeInvoiceFinalizedData } from 'test/integration/billing/utils/create-mock-stripe-invoice-finalized-data.util';
import {
  getBillingUsageCacheService,
  getMirroredCreditBalance,
  getSeededBillingWorkspaceId,
  insertCreditGrant,
  listCreditGrants,
  resetBillingCreditState,
  setupResourceCreditSubscription,
  TEST_STRIPE_CUSTOMER_ID,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { type BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';

const client = request(`http://localhost:${APP_PORT}`);

// Whole calendar months, anchored so the period the transition opens is the
// one running right now. The mirror column and the ledger both filter on now(),
// so periods fixed in the past would read as expired and assert nothing.
const PERIOD_BOUNDARY = startOfMonth(new Date());
const CLOSING_PERIOD_START = subMonths(PERIOD_BOUNDARY, 1);
const CLOSING_PERIOD_END = PERIOD_BOUNDARY;
const NEXT_PERIOD_END = addMonths(PERIOD_BOUNDARY, 1);

const ALLOWANCE_MICRO = 1_000_000;

const postInvoiceFinalized = (
  invoiceId = 'in_test_default',
  { periodStart = CLOSING_PERIOD_END, periodEnd = NEXT_PERIOD_END } = {},
) =>
  client
    .post('/webhooks/stripe')
    .set('stripe-signature', 'correct-signature')
    .set('Content-Type', 'application/json')
    .send(
      JSON.stringify({
        type: 'invoice.finalized',
        data: createMockStripeInvoiceFinalizedData({
          periodStart,
          periodEnd,
          stripeCustomerId: TEST_STRIPE_CUSTOMER_ID,
          invoiceId,
        }),
      }),
    );

describe('Billing credit rollover (integration)', () => {
  let workspaceId: string;
  let billingUsageService: BillingUsageService;
  let usageSpy: jest.SpyInstance;

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
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
      creditAmountMicro: ALLOWANCE_MICRO,
    });

    // Usage is read from ClickHouse, whose inserts are asynchronous. Stubbing
    // the read keeps every expectation exact instead of racing ingestion; the
    // query itself has its own unit coverage.
    usageSpy = jest.spyOn(billingUsageService, 'getCreditsUsedBetweenOrNull');
  });

  afterEach(async () => {
    usageSpy?.mockRestore();
    await resetBillingCreditState(workspaceId);
  });

  it('carries the unspent allowance into the next period', async () => {
    usageSpy.mockResolvedValue(300_000);

    await postInvoiceFinalized().expect(200);

    const grants = await listCreditGrants(workspaceId);

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      amountMicro: 700_000,
      type: BillingCreditGrantType.ROLLOVER,
      revokedAt: null,
    });
    expect(new Date(grants[0].effectiveAt)).toEqual(CLOSING_PERIOD_END);
    expect(new Date(grants[0].expiresAt)).toEqual(NEXT_PERIOD_END);
  });

  it('reads usage over the closing period, not the one just opened', async () => {
    usageSpy.mockResolvedValue(0);

    await postInvoiceFinalized().expect(200);

    expect(usageSpy).toHaveBeenCalledWith({
      workspaceId,
      from: CLOSING_PERIOD_START,
      to: CLOSING_PERIOD_END,
    });
  });

  it('carries nothing when the whole allowance was spent', async () => {
    usageSpy.mockResolvedValue(ALLOWANCE_MICRO);

    await postInvoiceFinalized().expect(200);

    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('closes the grants it carried forward so they cannot be counted twice', async () => {
    usageSpy.mockResolvedValue(0);
    await insertCreditGrant({
      workspaceId,
      amountMicro: 500_000,
      type: BillingCreditGrantType.COMPENSATION,
      effectiveAt: CLOSING_PERIOD_START,
      expiresAt: NEXT_PERIOD_END,
    });

    await postInvoiceFinalized().expect(200);

    const grants = await listCreditGrants(workspaceId);
    const compensation = grants.find(
      (grant) =>
        grant.type === BillingCreditGrantType.COMPENSATION &&
        grant.sourceGrantId === null,
    );

    expect(compensation).toBeDefined();

    // Its expiry was pulled back to the boundary, so the balance counts it
    // once through its carried-forward copy rather than twice.
    expect(new Date(compensation!.expiresAt)).toEqual(CLOSING_PERIOD_END);
    expect(
      grants.some(
        (grant) =>
          grant.type === BillingCreditGrantType.COMPENSATION &&
          grant.sourceGrantId === compensation!.id,
      ),
    ).toBe(true);
  });

  it('caps the carried rollover at the configured multiple of the allowance', async () => {
    usageSpy.mockResolvedValue(0);
    await insertCreditGrant({
      workspaceId,
      amountMicro: ALLOWANCE_MICRO,
      type: BillingCreditGrantType.ROLLOVER,
      effectiveAt: CLOSING_PERIOD_START,
      expiresAt: CLOSING_PERIOD_END,
    });

    await postInvoiceFinalized().expect(200);

    const carried = (await listCreditGrants(workspaceId)).filter(
      (grant) => grant.sourceGrantId !== null || grant.idempotencyKey !== null,
    );
    const carriedRollover = carried.filter(
      (grant) => grant.type === BillingCreditGrantType.ROLLOVER,
    );

    // allowance + expiring rollover = 2M unspent, clamped to (2 - 1) x 1M.
    expect(
      carriedRollover.reduce((total, grant) => total + grant.amountMicro, 0),
    ).toBe(ALLOWANCE_MICRO);
  });

  it('mirrors the resulting balance onto the billing customer', async () => {
    usageSpy.mockResolvedValue(300_000);

    await postInvoiceFinalized().expect(200);

    expect(await getMirroredCreditBalance(workspaceId)).toBe(700_000);
  });

  // A redelivery must not hand out the credits a second time.
  it('is idempotent when Stripe redelivers the same invoice', async () => {
    usageSpy.mockResolvedValue(300_000);

    await postInvoiceFinalized().expect(200);
    const afterFirst = await listCreditGrants(workspaceId);

    await postInvoiceFinalized().expect(200);
    const afterSecond = await listCreditGrants(workspaceId);

    expect(afterSecond).toHaveLength(afterFirst.length);
    expect(
      afterSecond.reduce((total, grant) => total + grant.amountMicro, 0),
    ).toBe(afterFirst.reduce((total, grant) => total + grant.amountMicro, 0));
    expect(await getMirroredCreditBalance(workspaceId)).toBe(700_000);
  });

  // Returning normally would answer 200 and Stripe would never redeliver, so
  // the transition would be lost and the balance would expire unrolled.
  it('fails the webhook when usage cannot be read so Stripe redelivers', async () => {
    usageSpy.mockResolvedValue(null);

    await postInvoiceFinalized().expect(500);

    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
    expect(await getMirroredCreditBalance(workspaceId)).toBe(0);
  });

  it('adds the carried balance to a warm usage counter', async () => {
    usageSpy.mockResolvedValue(300_000);
    const cache = getBillingUsageCacheService();

    // The counter is keyed by the period the subscription is currently in,
    // which is the one the invoice is closing: Stripe moves the subscription
    // forward in a separate event.
    await cache.warmAvailableCredits(
      workspaceId,
      CLOSING_PERIOD_START,
      NEXT_PERIOD_END,
      120_000,
    );

    await postInvoiceFinalized().expect(200);

    expect(
      await cache.getAvailableCredits(workspaceId, CLOSING_PERIOD_START),
    ).toBe(120_000 + 700_000);
  });

  // Stripe redelivers events it already handled. Rebuilding on that redelivery
  // would drop a counter that is already correct and recompute it from
  // ClickHouse, handing back every credit whose usage has not been ingested yet.
  it('leaves a warm counter alone when a successful delivery is repeated', async () => {
    usageSpy.mockResolvedValue(300_000);
    const cache = getBillingUsageCacheService();

    await cache.warmAvailableCredits(
      workspaceId,
      CLOSING_PERIOD_START,
      NEXT_PERIOD_END,
      120_000,
    );

    await postInvoiceFinalized().expect(200);
    const afterFirst = await cache.getAvailableCredits(
      workspaceId,
      CLOSING_PERIOD_START,
    );

    await postInvoiceFinalized().expect(200);

    expect(afterFirst).toBe(120_000 + 700_000);
    expect(
      await cache.getAvailableCredits(workspaceId, CLOSING_PERIOD_START),
    ).toBe(afterFirst);
  });

  // A subscription anchored on the 31st runs January 31 to February 28. Once
  // the subscription.updated webhook has moved the subscription on, calendar
  // arithmetic clamps February 28 back to January 28 and the closing period
  // swallows three days of the period before it.
  describe('a month-end anchor whose subscription already advanced', () => {
    const MONTH_END_BOUNDARY = new Date('2026-02-28T00:00:00.000Z');
    const TRUE_CLOSING_PERIOD_START = new Date('2026-01-31T00:00:00.000Z');
    const MONTH_END_NEXT_PERIOD_END = new Date('2026-03-31T00:00:00.000Z');

    it('reads the closing period start off the ledger rather than the calendar', async () => {
      usageSpy.mockResolvedValue(0);
      await setupResourceCreditSubscription({
        workspaceId,
        periodStart: MONTH_END_BOUNDARY,
        periodEnd: MONTH_END_NEXT_PERIOD_END,
        creditAmountMicro: ALLOWANCE_MICRO,
      });
      // What the previous transition left behind: a grant closed at the instant
      // the period it belonged to ended.
      await insertCreditGrant({
        workspaceId,
        amountMicro: 100_000,
        type: BillingCreditGrantType.ROLLOVER,
        effectiveAt: new Date('2025-12-31T00:00:00.000Z'),
        expiresAt: TRUE_CLOSING_PERIOD_START,
      });

      await postInvoiceFinalized('in_test_month_end', {
        periodStart: MONTH_END_BOUNDARY,
        periodEnd: MONTH_END_NEXT_PERIOD_END,
      }).expect(200);

      expect(usageSpy).toHaveBeenCalledWith({
        workspaceId,
        from: TRUE_CLOSING_PERIOD_START,
        to: MONTH_END_BOUNDARY,
      });
    });
  });

  describe('closing a trial', () => {
    it('carries credits earned during the trial into the first paid period', async () => {
      usageSpy.mockResolvedValue(0);
      await setupResourceCreditSubscription({
        workspaceId,
        periodStart: CLOSING_PERIOD_START,
        periodEnd: CLOSING_PERIOD_END,
        creditAmountMicro: ALLOWANCE_MICRO,
        status: 'trialing',
        trialStart: CLOSING_PERIOD_START,
        trialEnd: CLOSING_PERIOD_END,
      });
      await insertCreditGrant({
        workspaceId,
        amountMicro: 250_000,
        type: BillingCreditGrantType.ONBOARDING_REWARD,
        effectiveAt: CLOSING_PERIOD_START,
        expiresAt: CLOSING_PERIOD_END,
      });

      await postInvoiceFinalized('in_test_trial').expect(200);

      const reward = (await listCreditGrants(workspaceId)).find(
        (grant) =>
          grant.type === BillingCreditGrantType.ONBOARDING_REWARD &&
          grant.sourceGrantId !== null,
      );

      expect(reward).toBeDefined();
      expect(reward!.amountMicro).toBe(250_000);
      expect(new Date(reward!.expiresAt)).toEqual(NEXT_PERIOD_END);
    });
  });
});

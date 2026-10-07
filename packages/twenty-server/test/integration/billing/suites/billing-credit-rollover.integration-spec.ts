import { randomUUID } from 'node:crypto';

import {
  addHours,
  addMinutes,
  addMonths,
  startOfHour,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import request from 'supertest';
import { createMockStripeInvoiceFinalizedData } from 'test/integration/billing/utils/create-mock-stripe-invoice-finalized-data.util';
import {
  getSeededBillingWorkspaceId,
  insertCreditGrant,
  listCreditGrants,
  quitBillingFixtureRedis,
  readAllowanceCounter,
  resetBillingCreditState,
  setupResourceCreditSubscription,
  TEST_STRIPE_CUSTOMER_ID,
  warmAllowanceCounter,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { type BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const client = request(`http://localhost:${APP_PORT}`);

// The ledger filters on now(), so periods fixed in the past would read as expired and assert nothing
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

    // ClickHouse inserts are asynchronous, so the read is stubbed rather than racing ingestion
    usageSpy = jest.spyOn(billingUsageService, 'getCreditsUsedBetweenOrNull');
  });

  afterEach(async () => {
    usageSpy?.mockRestore();
    await resetBillingCreditState(workspaceId);
  });

  afterAll(async () => {
    await quitBillingFixtureRedis();
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
    // Stamping the next period end would expose the balance to the following transition
    expect(grants[0].expiresAt).toBeNull();
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

    // Pulled back to the boundary, so the balance counts it once through its carried-forward copy
    expect(compensation?.expiresAt).toEqual(CLOSING_PERIOD_END);
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
  });

  // Returning normally would answer 200 and Stripe would never redeliver
  it('fails the webhook when usage cannot be read so Stripe redelivers', async () => {
    usageSpy.mockResolvedValue(null);

    await postInvoiceFinalized().expect(500);

    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('drops the allowance counter on the period transition', async () => {
    usageSpy.mockResolvedValue(300_000);

    // Stripe advances the subscription in a separate event, so the counter is keyed by the closing period
    await warmAllowanceCounter(workspaceId, CLOSING_PERIOD_START, 120_000);

    await postInvoiceFinalized().expect(200);

    expect(
      await readAllowanceCounter(workspaceId, CLOSING_PERIOD_START),
    ).toBeNull();
  });

  it('drops the allowance counter again when a successful delivery is repeated', async () => {
    usageSpy.mockResolvedValue(300_000);

    await postInvoiceFinalized().expect(200);
    await warmAllowanceCounter(workspaceId, CLOSING_PERIOD_START, 120_000);

    await postInvoiceFinalized().expect(200);

    expect(
      await readAllowanceCounter(workspaceId, CLOSING_PERIOD_START),
    ).toBeNull();
  });

  // A 31st anchor runs Jan 31 to Feb 28; once advanced, calendar arithmetic clamps Feb 28 back to Jan 28 and swallows three days
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
      // What the previous transition left: a grant closed at the end of its period
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

  describe('reading the closing period usage from ClickHouse', () => {
    // A past hour no other suite writes to, so the usage read is exactly the rows seeded here
    const SEEDED_PERIOD_START = addMinutes(
      startOfHour(subDays(new Date(), 300)),
      17,
    );
    const SEEDED_PERIOD_END = addHours(SEEDED_PERIOD_START, 1);
    const PAID_CHAT_CREDITS_MICRO = 300_000;
    const INCLUDED_CHAT_CREDITS_MICRO = 400_000;
    const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;

    const resourceId = randomUUID();
    let clickHouseClient: ClickHouseClient;

    const countSeededRows = async (): Promise<number> => {
      const result = await clickHouseClient.query({
        query: `SELECT count() AS rowCount
                FROM usageEvent
                WHERE workspaceId = {workspaceId:String}
                  AND resourceId = {resourceId:String}`,
        query_params: { workspaceId, resourceId },
        format: 'JSONEachRow',
      });

      const [row] = await result.json<{ rowCount: string }>();

      return Number(row?.rowCount ?? 0);
    };

    beforeAll(async () => {
      clickHouseClient = createClickHouseClient({
        url: process.env.CLICKHOUSE_URL,
        clickhouse_settings: {
          allow_experimental_json_type: 1,
        },
        log: { level: ClickHouseLogLevel.OFF },
      });

      const baseRow = {
        timestamp: formatDateTimeForClickHouse(
          addMinutes(SEEDED_PERIOD_START, 10),
        ),
        workspaceId,
        periodStart: formatDateTimeForClickHouse(SEEDED_PERIOD_START),
        resourceType: UsageResourceType.AI,
        resourceId,
        unit: UsageUnit.TOKEN,
        metadata: {},
      };

      await clickHouseClient.insert({
        table: 'usageEvent',
        values: [
          {
            ...baseRow,
            operationType: UsageOperationType.AI_CHAT_TOKEN,
            quantity: 30,
            creditsUsedMicro: PAID_CHAT_CREDITS_MICRO,
          },
          {
            ...baseRow,
            operationType: UsageOperationType.AI_CHAT_INCLUDED,
            quantity: 40,
            creditsUsedMicro: INCLUDED_CHAT_CREDITS_MICRO,
          },
        ],
        format: 'JSONEachRow',
      });

      await expectEventually(
        async () => {
          expect(await countSeededRows()).toBe(2);
        },
        { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
      );
    });

    afterAll(async () => {
      await clickHouseClient.command({
        query: `ALTER TABLE usageEvent DELETE
                WHERE workspaceId = {workspaceId:String}
                  AND resourceId = {resourceId:String}`,
        query_params: { workspaceId, resourceId },
        clickhouse_settings: { mutations_sync: '2' },
      });

      await clickHouseClient.close();
    });

    // The spy is left unstubbed: the rows are already flushed, so the real ClickHouse read is what this covers
    it('carries over the allowance minus paid usage, ignoring included chat', async () => {
      await setupResourceCreditSubscription({
        workspaceId,
        periodStart: SEEDED_PERIOD_START,
        periodEnd: SEEDED_PERIOD_END,
        creditAmountMicro: ALLOWANCE_MICRO,
      });

      await postInvoiceFinalized('in_test_included_chat', {
        periodStart: SEEDED_PERIOD_END,
        periodEnd: addMonths(SEEDED_PERIOD_END, 1),
      }).expect(200);

      expect(usageSpy).toHaveBeenCalledWith({
        workspaceId,
        from: SEEDED_PERIOD_START,
        to: SEEDED_PERIOD_END,
      });

      const grants = await listCreditGrants(workspaceId);

      expect(grants).toHaveLength(1);
      expect(grants[0]).toMatchObject({
        amountMicro: ALLOWANCE_MICRO - PAID_CHAT_CREDITS_MICRO,
        type: BillingCreditGrantType.ROLLOVER,
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
        expiresAt: null,
      });

      await postInvoiceFinalized('in_test_trial').expect(200);

      const reward = (await listCreditGrants(workspaceId)).find(
        (grant) =>
          grant.type === BillingCreditGrantType.ONBOARDING_REWARD &&
          grant.sourceGrantId !== null,
      );

      expect(reward).toBeDefined();
      expect(reward?.amountMicro).toBe(250_000);
      expect(reward?.expiresAt).toBeNull();
    });
  });
});

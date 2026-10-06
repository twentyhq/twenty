import { randomUUID } from 'node:crypto';

import { addMonths, startOfMonth } from 'date-fns';
import { gql } from 'graphql-tag';
import request from 'supertest';
import {
  getSeededBillingWorkspaceId,
  listCreditGrants,
  quitBillingFixtureRedis,
  readAllowanceCounter,
  resetBillingCreditState,
  setupResourceCreditSubscription,
  TEST_STRIPE_CUSTOMER_ID,
  warmAllowanceCounter,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { createMockStripeCreditTopUpInvoicePaidData } from 'test/integration/billing/utils/create-mock-stripe-credit-top-up-invoice-paid-data.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const PERIOD_START = startOfMonth(new Date());
const PERIOD_END = addMonths(PERIOD_START, 1);

const ALLOWANCE_MICRO = 1_000_000;
const TOP_UP_MICRO = 2_000_000;

const postCreditTopUpInvoicePaid = ({
  invoiceId,
  workspaceId,
  creditAmountMicro = TOP_UP_MICRO,
  stripeCustomerId = TEST_STRIPE_CUSTOMER_ID,
}: {
  invoiceId: string;
  workspaceId: string;
  creditAmountMicro?: number;
  stripeCustomerId?: string;
}) =>
  client
    .post('/webhooks/stripe')
    .set('stripe-signature', 'correct-signature')
    .set('Content-Type', 'application/json')
    .send(
      JSON.stringify({
        type: 'invoice.paid',
        data: createMockStripeCreditTopUpInvoicePaidData({
          workspaceId,
          creditAmountMicro,
          stripeCustomerId,
          invoiceId,
        }),
      }),
    );

const OFFERS_QUERY = gql`
  query GetCreditTopUpOffers {
    getCreditTopUpOffers {
      creditAmount
      amountCents
      currency
    }
  }
`;

const PURCHASE_MUTATION = gql`
  mutation PurchaseCreditTopUp($creditAmount: Float!, $idempotencyKey: UUID!) {
    purchaseCreditTopUp(
      creditAmount: $creditAmount
      idempotencyKey: $idempotencyKey
    ) {
      status
      hostedInvoiceUrl
    }
  }
`;

const purchaseCreditTopUp = (creditAmount: number, accessToken?: string) =>
  makeMetadataApiRequest(
    {
      query: PURCHASE_MUTATION,
      variables: { creditAmount, idempotencyKey: randomUUID() },
    },
    accessToken,
  );

describe('Billing credit top-up webhook (integration)', () => {
  let workspaceId: string;

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
  });

  beforeEach(async () => {
    await resetBillingCreditState(workspaceId);
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
    });
  });

  afterEach(async () => {
    await resetBillingCreditState(workspaceId);
  });

  afterAll(async () => {
    await quitBillingFixtureRedis();
  });

  it('grants the purchased credits once the invoice is paid', async () => {
    const invoiceId = `in_test_top_up_${randomUUID()}`;

    const response = await postCreditTopUpInvoicePaid({
      invoiceId,
      workspaceId,
    });

    expect(response.status).toBe(200);

    const grants = await listCreditGrants(workspaceId);

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      amountMicro: TOP_UP_MICRO,
      type: BillingCreditGrantType.PURCHASE,
      expiresAt: null,
      revokedAt: null,
      reason: 'Credit top-up, invoice TEST-0001',
      idempotencyKey: `credit-top-up:${invoiceId}`,
    });
  });

  it('drops the allowance counter so a blocked workspace resumes at once', async () => {
    await warmAllowanceCounter(workspaceId, PERIOD_START, 0);

    await postCreditTopUpInvoicePaid({
      invoiceId: `in_test_top_up_${randomUUID()}`,
      workspaceId,
    });

    expect(await readAllowanceCounter(workspaceId, PERIOD_START)).toBeNull();
  });

  it('grants nothing more when Stripe redelivers the event', async () => {
    const invoiceId = `in_test_top_up_${randomUUID()}`;

    await postCreditTopUpInvoicePaid({ invoiceId, workspaceId });
    const redelivery = await postCreditTopUpInvoicePaid({
      invoiceId,
      workspaceId,
    });

    expect(redelivery.status).toBe(200);
    expect(await listCreditGrants(workspaceId)).toHaveLength(1);
  });

  it('ignores an invoice whose metadata names another workspace', async () => {
    const response = await postCreditTopUpInvoicePaid({
      invoiceId: `in_test_top_up_${randomUUID()}`,
      workspaceId: randomUUID(),
    });

    expect(response.status).toBe(200);
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('ignores an invoice paid by a customer the workspace does not own', async () => {
    const response = await postCreditTopUpInvoicePaid({
      invoiceId: `in_test_top_up_${randomUUID()}`,
      workspaceId,
      stripeCustomerId: 'cus_unknown_top_up',
    });

    expect(response.status).toBe(200);
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('ignores an invoice with no amount to grant', async () => {
    const response = await postCreditTopUpInvoicePaid({
      invoiceId: `in_test_top_up_${randomUUID()}`,
      workspaceId,
      creditAmountMicro: 0,
    });

    expect(response.status).toBe(200);
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });
});

describe('Billing credit top-up offers and purchase (integration)', () => {
  let workspaceId: string;

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();

    expect(workspaceId).toBe(SEED_APPLE_WORKSPACE_ID);
  });

  beforeEach(async () => {
    await resetBillingCreditState(workspaceId);
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
    });
  });

  afterEach(async () => {
    await resetBillingCreditState(workspaceId);
  });

  afterAll(async () => {
    await quitBillingFixtureRedis();
  });

  it('prices every offered amount at the plan rate', async () => {
    const response = await makeMetadataApiRequest({ query: OFFERS_QUERY });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getCreditTopUpOffers).toEqual([
      { creditAmount: 10, amountCents: 10_000, currency: 'USD' },
      { creditAmount: 50, amountCents: 50_000, currency: 'USD' },
      { creditAmount: 100, amountCents: 100_000, currency: 'USD' },
      { creditAmount: 500, amountCents: 500_000, currency: 'USD' },
    ]);
  });

  it('offers nothing while the subscription is trialing', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
      status: 'trialing',
    });

    const response = await makeMetadataApiRequest({ query: OFFERS_QUERY });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getCreditTopUpOffers).toEqual([]);
  });

  it('refuses an amount that is not offered', async () => {
    const response = await purchaseCreditTopUp(7);

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      'BILLING_CREDIT_AMOUNT_INVALID',
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('refuses a trialing subscription before charging anything', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
      status: 'trialing',
    });

    const response = await purchaseCreditTopUp(10);

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      'BILLING_CREDIT_TOP_UP_NOT_ALLOWED',
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('refuses an API key', async () => {
    const response = await purchaseCreditTopUp(10, API_KEY_ACCESS_TOKEN);

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.purchaseCreditTopUp ?? null).toBeNull();
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });
});

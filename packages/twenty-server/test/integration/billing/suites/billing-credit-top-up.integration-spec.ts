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

const PRICE_QUERY = gql`
  query GetCreditOneTimeTopUpPrice {
    getCreditOneTimeTopUpPrice {
      unitPriceCents
      currency
      minimumCreditAmount
      maximumCreditAmount
    }
  }
`;

const PURCHASE_MUTATION = gql`
  mutation PurchaseCreditOneTimeTopUp(
    $creditAmount: Int!
    $idempotencyKey: UUID!
  ) {
    purchaseCreditOneTimeTopUp(
      creditAmount: $creditAmount
      idempotencyKey: $idempotencyKey
    ) {
      status
      hostedInvoiceUrl
    }
  }
`;

const purchaseCreditOneTimeTopUp = ({
  creditAmount,
  accessToken,
}: {
  creditAmount: number;
  accessToken?: string;
}) =>
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

describe('Billing one-time credit top-up price and purchase (integration)', () => {
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

  it('prices one credit at the plan rate, with the allowed range', async () => {
    const response = await makeMetadataApiRequest({ query: PRICE_QUERY });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getCreditOneTimeTopUpPrice).toEqual({
      unitPriceCents: 1_000,
      currency: 'USD',
      minimumCreditAmount: 1,
      maximumCreditAmount: 1_000,
    });
  });

  it('has no price while the subscription is trialing', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
      status: 'trialing',
    });

    const response = await makeMetadataApiRequest({ query: PRICE_QUERY });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getCreditOneTimeTopUpPrice).toBeNull();
  });

  it.each([0, 1_001])(
    'refuses %s credits, outside the allowed range',
    async (creditAmount) => {
      const response = await purchaseCreditOneTimeTopUp({ creditAmount });

      expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
        'BILLING_CREDIT_AMOUNT_INVALID',
      );
      expect(await listCreditGrants(workspaceId)).toHaveLength(0);
    },
  );

  it('refuses a trialing subscription before charging anything', async () => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
      status: 'trialing',
    });

    const response = await purchaseCreditOneTimeTopUp({ creditAmount: 10 });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      'BILLING_CREDIT_ONE_TIME_TOP_UP_NOT_ALLOWED',
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('refuses an API key', async () => {
    const response = await purchaseCreditOneTimeTopUp({
      creditAmount: 10,
      accessToken: API_KEY_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.purchaseCreditOneTimeTopUp ?? null).toBeNull();
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });
});

import { randomUUID } from 'node:crypto';

import { addDays, addMonths, startOfMonth } from 'date-fns';
import request from 'supertest';
import {
  getBillingUsageCacheService,
  getSeededBillingWorkspaceId,
  listCreditGrants,
  quitBillingFixtureRedis,
  readAllowanceCounter,
  resetBillingCreditState,
  setupResourceCreditSubscription,
  warmAllowanceCounter,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

const client = request(`http://localhost:${APP_PORT}`);

const PERIOD_START = startOfMonth(new Date());
const PERIOD_END = addMonths(PERIOD_START, 1);
const ALLOWANCE_MICRO = 1_000_000;

const GRANT_MUTATION = `
  mutation GrantWorkspaceCredits(
    $workspaceId: UUID!
    $amount: Float!
    $type: BillingCreditGrantType!
    $reason: String
    $expiresInDays: Int
    $clientOperationId: UUID!
  ) {
    grantWorkspaceCredits(
      workspaceId: $workspaceId
      amount: $amount
      type: $type
      reason: $reason
      expiresInDays: $expiresInDays
      clientOperationId: $clientOperationId
    ) {
      id
      amount
      type
      reason
      expiresAt
      isActive
    }
  }
`;

const REVOKE_MUTATION = `
  mutation RevokeWorkspaceCreditGrant($workspaceId: UUID!, $creditGrantId: UUID!) {
    revokeWorkspaceCreditGrant(
      workspaceId: $workspaceId
      creditGrantId: $creditGrantId
    ) {
      id
      revokedAt
    }
  }
`;

const grantCredits = (variables: Record<string, unknown>) =>
  callAdminGraphql(GRANT_MUTATION, {
    clientOperationId: randomUUID(),
    ...variables,
  });

const callAdminGraphql = (query: string, variables: Record<string, unknown>) =>
  client
    .post('/admin-panel')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .send({ query, variables });

describe('Admin credit grant and revoke (integration)', () => {
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

  it('records a granted amount on the ledger and mirrors it', async () => {
    const response = await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: 'Outage on the 3rd',
    });

    expect(response.body.errors).toBeUndefined();

    const grants = await listCreditGrants(workspaceId);

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      amountMicro: 2 * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
      type: BillingCreditGrantType.COMPENSATION,
      reason: 'Outage on the 3rd',
      revokedAt: null,
    });
  });

  it('leaves a granted amount without an expiry so no missed transition can drop it', async () => {
    const response = await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.grantWorkspaceCredits.expiresAt).toBeNull();

    const grants = await listCreditGrants(workspaceId);

    expect(grants[0].expiresAt).toBeNull();
  });

  // Rounded up to a period end rather than the exact day: credits are spent and
  // settled a period at a time, so a deadline inside one would be invisible to
  // both the cached counter and the carry-forward.
  it('expires a time-boxed grant at the end of the period the requested day falls in', async () => {
    const response = await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.SALES,
      reason: 'Pilot credits',
      expiresInDays: 30,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.grantWorkspaceCredits.isActive).toBe(true);

    const [storedGrant] = await listCreditGrants(workspaceId);
    const expiresAt = new Date(storedGrant.expiresAt as Date);

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
      addDays(new Date(), 30).getTime(),
    );
    expect([PERIOD_END, addMonths(PERIOD_END, 1)].map(Number)).toContain(
      expiresAt.getTime(),
    );
  });

  it('refuses an expiry beyond the accepted range', async () => {
    const response = await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
      expiresInDays: 100_000,
    });

    expect(response.body.errors).toBeDefined();
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('adds the granted amount to a warm available-credits counter', async () => {
    const cache = getBillingUsageCacheService();

    await cache.warmAvailableCredits(
      workspaceId,
      PERIOD_START,
      PERIOD_END,
      500_000,
    );

    await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });

    expect(await cache.getAvailableCredits(workspaceId, PERIOD_START)).toBe(
      500_000 + 2 * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );
  });

  // The aligned deadline lands on the period end the counter already expires
  // with, so the cached balance stays valid and can simply be incremented.
  it('keeps a warm available-credits counter usable for a time-boxed grant', async () => {
    const cache = getBillingUsageCacheService();

    await cache.warmAvailableCredits(
      workspaceId,
      PERIOD_START,
      PERIOD_END,
      500_000,
    );

    await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.SALES,
      reason: null,
      expiresInDays: 1,
    });

    expect(await cache.getAvailableCredits(workspaceId, PERIOD_START)).toBe(
      500_000 + 2 * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );
  });

  it('takes a revoked grant back off the ledger and the available-credits counter', async () => {
    const cache = getBillingUsageCacheService();

    await cache.warmAvailableCredits(
      workspaceId,
      PERIOD_START,
      PERIOD_END,
      500_000,
    );

    const granted = await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });
    const creditGrantId = granted.body.data.grantWorkspaceCredits.id;

    const revoked = await callAdminGraphql(REVOKE_MUTATION, {
      workspaceId,
      creditGrantId,
    });

    expect(revoked.body.errors).toBeUndefined();
    expect(
      revoked.body.data.revokeWorkspaceCreditGrant.revokedAt,
    ).not.toBeNull();

    const grants = await listCreditGrants(workspaceId);

    expect(grants[0].revokedAt).not.toBeNull();
    expect(await cache.getAvailableCredits(workspaceId, PERIOD_START)).toBe(
      500_000,
    );
  });

  it.each([
    BillingCreditGrantType.ROLLOVER,
    BillingCreditGrantType.ONBOARDING_REWARD,
  ])('refuses to grant a %s by hand', async (type) => {
    const response = await grantCredits({
      workspaceId,
      amount: 1,
      type,
      reason: null,
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      'BILLING_CREDIT_GRANT_TYPE_NOT_GRANTABLE',
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('drops the warm allowance counter when a grant lands', async () => {
    await warmAllowanceCounter(workspaceId, PERIOD_START, 500_000);

    await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });

    expect(await readAllowanceCounter(workspaceId, PERIOD_START)).toBeNull();
  });

  it('takes a revoked grant off the ledger and drops the counter', async () => {
    const granted = await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });
    const creditGrantId = granted.body.data.grantWorkspaceCredits.id;

    await warmAllowanceCounter(workspaceId, PERIOD_START, 500_000);

    const revoked = await callAdminGraphql(REVOKE_MUTATION, {
      workspaceId,
      creditGrantId,
    });

    expect(revoked.body.errors).toBeUndefined();
    expect(
      revoked.body.data.revokeWorkspaceCreditGrant.revokedAt,
    ).not.toBeNull();

    const grants = await listCreditGrants(workspaceId);

    expect(grants[0].revokedAt).not.toBeNull();
    expect(await readAllowanceCounter(workspaceId, PERIOD_START)).toBeNull();
  });

  // The panel only offers the three operator types, but the mutation is
  // reachable directly and these two are written by the period transition and
  // the onboarding jobs.
  it.each([
    BillingCreditGrantType.ROLLOVER,
    BillingCreditGrantType.ONBOARDING_REWARD,
  ])('refuses to grant a %s by hand', async (type) => {
    const response = await grantCredits({
      workspaceId,
      amount: 1,
      type,
      reason: null,
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      'BILLING_CREDIT_GRANT_TYPE_NOT_GRANTABLE',
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  it('refuses an amount above the configured ceiling', async () => {
    const response = await grantCredits({
      workspaceId,
      amount: 1_000_000_000,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      'BILLING_CREDIT_AMOUNT_INVALID',
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(0);
  });

  // The admin panel keeps one operation id per open modal, so an Apollo retry
  // or a resubmit after a lost response must answer with the grant the first
  // attempt wrote rather than crediting the workspace a second time.
  it('answers a retried grant with the original instead of granting twice', async () => {
    const clientOperationId = randomUUID();
    const variables = {
      workspaceId,
      amount: 25,
      type: BillingCreditGrantType.COMPENSATION,
      reason: 'Retried by the client',
      clientOperationId,
    };

    const first = await callAdminGraphql(GRANT_MUTATION, variables);
    const second = await callAdminGraphql(GRANT_MUTATION, variables);

    expect(second.body.data.grantWorkspaceCredits.id).toBe(
      first.body.data.grantWorkspaceCredits.id,
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(1);
  });
});

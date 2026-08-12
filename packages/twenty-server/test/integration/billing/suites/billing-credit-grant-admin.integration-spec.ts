import { addMonths, startOfMonth } from 'date-fns';
import request from 'supertest';
import {
  getBillingUsageCacheService,
  getMirroredCreditBalance,
  getSeededBillingWorkspaceId,
  listCreditGrants,
  resetBillingCreditState,
  setupResourceCreditSubscription,
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
  ) {
    grantWorkspaceCredits(
      workspaceId: $workspaceId
      amount: $amount
      type: $type
      reason: $reason
    ) {
      id
      amount
      type
      reason
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

  it('records a granted amount on the ledger and mirrors it', async () => {
    const response = await callAdminGraphql(GRANT_MUTATION, {
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
    expect(await getMirroredCreditBalance(workspaceId)).toBe(
      2 * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );
  });

  it('adds the granted amount to a warm usage counter', async () => {
    const cache = getBillingUsageCacheService();

    await cache.warmAvailableCredits(
      workspaceId,
      PERIOD_START,
      PERIOD_END,
      500_000,
    );

    await callAdminGraphql(GRANT_MUTATION, {
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });

    expect(await cache.getAvailableCredits(workspaceId, PERIOD_START)).toBe(
      500_000 + 2 * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );
  });

  it('takes a revoked grant back off the ledger and the counter', async () => {
    const cache = getBillingUsageCacheService();

    await cache.warmAvailableCredits(
      workspaceId,
      PERIOD_START,
      PERIOD_END,
      500_000,
    );

    const granted = await callAdminGraphql(GRANT_MUTATION, {
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
    expect(await getMirroredCreditBalance(workspaceId)).toBe(0);
    expect(await cache.getAvailableCredits(workspaceId, PERIOD_START)).toBe(
      500_000,
    );
  });

  // The panel only offers the three operator types, but the mutation is
  // reachable directly and these two are written by the period transition and
  // the onboarding jobs.
  it.each([
    BillingCreditGrantType.ROLLOVER,
    BillingCreditGrantType.ONBOARDING_REWARD,
  ])('refuses to grant a %s by hand', async (type) => {
    const response = await callAdminGraphql(GRANT_MUTATION, {
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
    const response = await callAdminGraphql(GRANT_MUTATION, {
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
});

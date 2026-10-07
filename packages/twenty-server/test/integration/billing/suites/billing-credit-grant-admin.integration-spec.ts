import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { randomUUID } from 'node:crypto';

import { addDays, addMonths, startOfMonth } from 'date-fns';
import request from 'supertest';
import {
  debitInFlightCredits,
  getSeededBillingWorkspaceId,
  listCreditGrants,
  quitBillingFixtureRedis,
  readAllowanceConsumedMicro,
  refreshCurrentBillingSubscription,
  resetBillingCreditState,
  setupResourceCreditSubscription,
  setSubscriptionStatus,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { alignGrantExpiryToPeriodEnd } from 'src/engine/core-modules/billing/utils/align-grant-expiry-to-period-end.util';

const client = request(`http://localhost:${APP_PORT}`);

const PERIOD_START = startOfMonth(new Date());
const PERIOD_END = addMonths(PERIOD_START, 1);
const ALLOWANCE_MICRO = 1_000_000;
const IN_FLIGHT_CREDITS_MICRO = 120_000;

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

  // Credits settle a period at a time, so a mid-period deadline would be invisible to the counter and carry-forward
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

    // The boundary depends on when the suite runs, so derive it like the server does
    const expectedExpiresAt = alignGrantExpiryToPeriodEnd({
      requestedExpiresAt: addDays(new Date(), 30),
      currentPeriodStart: PERIOD_START,
      currentPeriodEnd: PERIOD_END,
      interval: SubscriptionInterval.Month,
    });

    expect(storedGrant.expiresAt).toEqual(expectedExpiresAt);
    expect(expectedExpiresAt.getTime()).toBeGreaterThanOrEqual(
      addDays(new Date(), 30).getTime(),
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

  it.failing(
    'keeps in-flight usage on the allowance when a grant lands',
    async () => {
      await refreshCurrentBillingSubscription(workspaceId);

      const consumedBeforeMicro = await readAllowanceConsumedMicro(workspaceId);

      await debitInFlightCredits(workspaceId, IN_FLIGHT_CREDITS_MICRO);
      await grantCredits({
        workspaceId,
        amount: 2,
        type: BillingCreditGrantType.COMPENSATION,
        reason: null,
      });

      expect(await readAllowanceConsumedMicro(workspaceId)).toBe(
        consumedBeforeMicro + IN_FLIGHT_CREDITS_MICRO,
      );
    },
  );

  it.failing(
    'takes a revoked grant off the ledger and keeps in-flight usage',
    async () => {
      const granted = await grantCredits({
        workspaceId,
        amount: 2,
        type: BillingCreditGrantType.COMPENSATION,
        reason: null,
      });
      const creditGrantId = granted.body.data.grantWorkspaceCredits.id;
      const consumedBeforeMicro = await readAllowanceConsumedMicro(workspaceId);

      await debitInFlightCredits(workspaceId, IN_FLIGHT_CREDITS_MICRO);

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
      expect(await readAllowanceConsumedMicro(workspaceId)).toBe(
        consumedBeforeMicro + IN_FLIGHT_CREDITS_MICRO,
      );
    },
  );

  it.failing('keeps in-flight usage when a revocation is retried', async () => {
    const granted = await grantCredits({
      workspaceId,
      amount: 2,
      type: BillingCreditGrantType.COMPENSATION,
      reason: null,
    });
    const creditGrantId = granted.body.data.grantWorkspaceCredits.id;

    await callAdminGraphql(REVOKE_MUTATION, { workspaceId, creditGrantId });

    const consumedBeforeMicro = await readAllowanceConsumedMicro(workspaceId);

    await debitInFlightCredits(workspaceId, IN_FLIGHT_CREDITS_MICRO);

    const retried = await callAdminGraphql(REVOKE_MUTATION, {
      workspaceId,
      creditGrantId,
    });

    expect(retried.body.errors).toBeUndefined();
    expect(await readAllowanceConsumedMicro(workspaceId)).toBe(
      consumedBeforeMicro + IN_FLIGHT_CREDITS_MICRO,
    );
  });

  // The panel offers three operator types, but the mutation is reachable directly and jobs write these two
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

  // The admin panel reuses one operation id per open modal, so a retry must not credit twice
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

  // The anchoring subscription can be gone by retry time, and the operation already succeeded
  it('answers a retried time-boxed grant after the subscription is canceled', async () => {
    const clientOperationId = randomUUID();
    const variables = {
      workspaceId,
      amount: 25,
      type: BillingCreditGrantType.SALES,
      reason: 'Retried after cancellation',
      clientOperationId,
      expiresInDays: 30,
    };

    const first = await callAdminGraphql(GRANT_MUTATION, variables);

    expect(first.body.errors).toBeUndefined();

    await setSubscriptionStatus(workspaceId, SubscriptionStatus.Canceled);

    const second = await callAdminGraphql(GRANT_MUTATION, variables);

    expect(second.body.errors).toBeUndefined();
    expect(second.body.data.grantWorkspaceCredits.id).toBe(
      first.body.data.grantWorkspaceCredits.id,
    );
    expect(await listCreditGrants(workspaceId)).toHaveLength(1);
  });
});

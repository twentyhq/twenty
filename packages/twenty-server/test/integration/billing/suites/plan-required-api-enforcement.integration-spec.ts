import gql from 'graphql-tag';
import {
  clearPlanRequiredApiEnforcementOverride,
  ensureDisposableBillingSubscription,
  flushBillingSubscriptionCache,
  isBillingPlanRequiredGraphqlError,
  quitPlanRequiredFixtureRedis,
  removeBillingSubscriptionsForWorkspace,
  restoreBillingSubscriptions,
  setPlanRequiredApiEnforcementEnabled,
} from 'test/integration/billing/utils/plan-required-api-enforcement-fixtures.util';
import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { getOnboardingStatus } from 'test/integration/graphql/utils/get-onboarding-status.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const companiesFindManyOperation = findManyOperationFactory({
  objectMetadataSingularName: 'company',
  objectMetadataPluralName: 'companies',
  gqlFields: COMPANY_GQL_FIELDS,
  first: 1,
});

const listPlansOperation = {
  query: gql`
    query ListPlansForPlanRequiredGate {
      listPlans {
        planKey
      }
    }
  `,
};

describe('PLAN_REQUIRED API enforcement (integration)', () => {
  // Jane + API key tokens are Apple-scoped; unpaid/paid fixtures must match.
  const workspaceId = SEED_APPLE_WORKSPACE_ID;
  let savedSubscriptions: Record<string, unknown>[] = [];
  let insertedDisposableSubscription = false;

  beforeAll(async () => {
    await setPlanRequiredApiEnforcementEnabled(true);
  });

  afterAll(async () => {
    if (savedSubscriptions.length > 0) {
      await restoreBillingSubscriptions(savedSubscriptions);
      savedSubscriptions = [];
    } else if (insertedDisposableSubscription) {
      await removeBillingSubscriptionsForWorkspace(workspaceId);
    }

    await clearPlanRequiredApiEnforcementOverride();
    await quitPlanRequiredFixtureRedis();
  });

  const makeWorkspaceUnpaid = async () => {
    const removed =
      await removeBillingSubscriptionsForWorkspace(workspaceId);

    if (removed.length > 0 && savedSubscriptions.length === 0) {
      savedSubscriptions = removed;
    }

    insertedDisposableSubscription = false;
    await flushBillingSubscriptionCache(workspaceId);
  };

  const makeWorkspacePaid = async () => {
    if (savedSubscriptions.length > 0) {
      await restoreBillingSubscriptions(savedSubscriptions);
      insertedDisposableSubscription = false;
    } else {
      await ensureDisposableBillingSubscription(workspaceId);
      insertedDisposableSubscription = true;
    }

    await flushBillingSubscriptionCache(workspaceId);
  };

  it('denies companies findMany for unpaid workspace when flag is on', async () => {
    await makeWorkspaceUnpaid();

    const response = await makeGraphqlAPIRequest(
      companiesFindManyOperation,
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.data?.companies).toBeUndefined();
    expect(isBillingPlanRequiredGraphqlError(response.body.errors)).toBe(true);
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].extensions.subCode).toBe(
      BillingExceptionCode.BILLING_PLAN_REQUIRED,
    );
  });

  it('allows listPlans for unpaid workspace when flag is on (billing allowlist)', async () => {
    await makeWorkspaceUnpaid();

    const response = await makeGraphqlAPIRequest(
      listPlansOperation,
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(isBillingPlanRequiredGraphqlError(response.body.errors)).toBe(false);
    // Stripe/seed may leave listPlans empty or error for other reasons; the
    // gate contract is only that BILLING_PLAN_REQUIRED must not appear.
    if (!response.body.errors) {
      expect(response.body.data.listPlans).toBeDefined();
    }
  });

  it('allows currentUser onboardingStatus bootstrap for unpaid workspace when flag is on', async () => {
    await makeWorkspaceUnpaid();

    const { data, errors } = await getOnboardingStatus({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.currentUser.onboardingStatus).toBeDefined();
  });

  it('allows companies findMany when workspace has a subscription row and flag is on', async () => {
    await makeWorkspacePaid();

    const response = await makeGraphqlAPIRequest(
      companiesFindManyOperation,
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(isBillingPlanRequiredGraphqlError(response.body.errors)).toBe(false);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.companies).toBeDefined();
  });

  it('allows companies findMany for unpaid workspace when flag is off (dark)', async () => {
    await makeWorkspaceUnpaid();
    await setPlanRequiredApiEnforcementEnabled(false);

    try {
      const response = await makeGraphqlAPIRequest(
        companiesFindManyOperation,
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(isBillingPlanRequiredGraphqlError(response.body.errors)).toBe(
        false,
      );
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.companies).toBeDefined();
    } finally {
      await setPlanRequiredApiEnforcementEnabled(true);
    }
  });

  it('denies REST GET /rest/companies for unpaid workspace when flag is on', async () => {
    await makeWorkspaceUnpaid();

    const response = await makeRestAPIRequest({
      method: 'get',
      path: '/companies',
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.status).toBe(402);
    expect(response.body.code).toBe(
      BillingExceptionCode.BILLING_PLAN_REQUIRED,
    );
  });
});

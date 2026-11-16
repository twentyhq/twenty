import { makeAdminPanelApiRequestAsNonServerAdmin } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-as-non-server-admin.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { gql } from 'graphql-tag';

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const EXTEND_WORKSPACE_TRIAL = gql`
  mutation ExtendWorkspaceTrial($workspaceId: UUID!, $trialEndsAt: DateTime!) {
    extendWorkspaceTrial(workspaceId: $workspaceId, trialEndsAt: $trialEndsAt)
  }
`;

const REVOKE_WORKSPACE_TRIAL_EXTENSION = gql`
  mutation RevokeWorkspaceTrialExtension($workspaceId: UUID!) {
    revokeWorkspaceTrialExtension(workspaceId: $workspaceId)
  }
`;

const WORKSPACE_WITHOUT_SUBSCRIPTION_ID =
  '5b4d1d8c-6f2a-4c47-9f0e-8a1f3d2c7b90';

const inTwoWeeks = () =>
  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

describe('Workspace trial extension from the admin panel', () => {
  it('refuses a trial end in the past', async () => {
    const response = await makeAdminPanelApiRequest({
      query: EXTEND_WORKSPACE_TRIAL,
      variables: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        trialEndsAt: new Date(Date.now() - 60_000).toISOString(),
      },
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      BillingExceptionCode.BILLING_TRIAL_END_INVALID,
    );
  });

  it('refuses to extend a workspace with no subscription', async () => {
    const response = await makeAdminPanelApiRequest({
      query: EXTEND_WORKSPACE_TRIAL,
      variables: {
        workspaceId: WORKSPACE_WITHOUT_SUBSCRIPTION_ID,
        trialEndsAt: inTwoWeeks(),
      },
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
    );
  });

  it('refuses to revoke on a workspace with no subscription', async () => {
    const response = await makeAdminPanelApiRequest({
      query: REVOKE_WORKSPACE_TRIAL_EXTENSION,
      variables: { workspaceId: WORKSPACE_WITHOUT_SUBSCRIPTION_ID },
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
    );
  });

  it('refuses a user without server admin access', async () => {
    const response = await makeAdminPanelApiRequestAsNonServerAdmin({
      query: EXTEND_WORKSPACE_TRIAL,
      variables: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        trialEndsAt: inTwoWeeks(),
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.extendWorkspaceTrial).toBeFalsy();
  });
});

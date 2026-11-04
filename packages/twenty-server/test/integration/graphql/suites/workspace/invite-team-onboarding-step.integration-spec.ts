import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { OnboardingStepKeys } from 'src/engine/core-modules/onboarding/onboarding.service';

const signUpInNewWorkspaceWithBilling = async ({
  accessToken,
  isBillingEnabled,
}: {
  accessToken: string;
  isBillingEnabled: boolean;
}) => {
  const billingService =
    getAppProviderByClassName<BillingService>('BillingService');
  const isBillingEnabledSpy = jest
    .spyOn(billingService, 'isBillingEnabled')
    .mockReturnValue(isBillingEnabled);
  const ensureBillingCustomerSpy = jest
    .spyOn(billingService, 'ensureBillingCustomer')
    .mockResolvedValue(undefined);

  try {
    return await signUpInNewWorkspace({ accessToken, expectToFail: false });
  } finally {
    isBillingEnabledSpy.mockRestore();
    ensureBillingCustomerSpy.mockRestore();
  }
};

const signUpOnNewWorkspace = async ({
  email,
  isBillingEnabled,
}: {
  email: string;
  isBillingEnabled: boolean;
}) => {
  const { data } = await signUp({
    input: { email, password: 'Test123!@#' },
    expectToFail: false,
  });

  const signUpAccessToken =
    data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

  await globalThis.testDataSource.query(
    'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
    [email],
  );

  const {
    data: { signUpInNewWorkspace: signUpInNewWorkspaceData },
  } = await signUpInNewWorkspaceWithBilling({
    accessToken: signUpAccessToken,
    isBillingEnabled,
  });

  const {
    data: { getAuthTokensFromLoginToken: authTokensData },
  } = await getAuthTokensFromLoginToken({
    origin: signUpInNewWorkspaceData.workspace.workspaceUrls.subdomainUrl,
    loginToken: signUpInNewWorkspaceData.loginToken.token,
    expectToFail: false,
  });

  const workspaceAccessToken =
    authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

  await activateWorkspace({
    accessToken: workspaceAccessToken,
    expectToFail: false,
  });

  return { signUpAccessToken, workspaceAccessToken };
};

const findInviteTeamPendingUserVar = async (accessToken: string) => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query CurrentUserVars {
          currentUser {
            userVars
          }
        }
      `,
      variables: {},
    },
    accessToken,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.currentUser.userVars[
    OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING
  ];
};

describe('Invite-team onboarding step on a new workspace (integration)', () => {
  let signUpAccessToken: string | undefined;

  afterEach(async () => {
    if (!isDefined(signUpAccessToken)) {
      return;
    }

    await deleteUser({ accessToken: signUpAccessToken, expectToFail: false });

    signUpAccessToken = undefined;
  });

  it('should not set up the invite step at creation when billing is enabled, even with a work email', async () => {
    const newWorkspace = await signUpOnNewWorkspace({
      email: `invite-team-${randomUUID()}@twenty-invite-test.dev`,
      isBillingEnabled: true,
    });

    signUpAccessToken = newWorkspace.signUpAccessToken;

    expect(
      await findInviteTeamPendingUserVar(newWorkspace.workspaceAccessToken),
    ).toBeUndefined();
  });

  it('should set up the invite step at creation when billing is disabled, even with a personal email', async () => {
    const newWorkspace = await signUpOnNewWorkspace({
      email: `invite-team-${randomUUID()}@example.com`,
      isBillingEnabled: false,
    });

    signUpAccessToken = newWorkspace.signUpAccessToken;

    expect(
      await findInviteTeamPendingUserVar(newWorkspace.workspaceAccessToken),
    ).toBe(true);
  });
});

import { deleteTwoFactorAuthenticationMethod } from 'test/integration/graphql/suites/user-session/utils/delete-two-factor-authentication-method.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';

import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// Jane (Apple admin, IMPERSONATE permission) impersonates Scott (regular
// member). The impersonated session must not be able to enrol, verify or
// remove Scott's second factor: those mutations act on the caller's own
// account and would otherwise let an impersonator replace or drop a member's
// authenticator under that member's identity.
const expectImpersonationDenied = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  expect(errors[0].message).toContain('while impersonating');
};

describe('Impersonation - two-factor authentication mutations denial (integration)', () => {
  let impersonationAccessToken: string;

  beforeAll(async () => {
    const { data: impersonateData } = await impersonate({
      userId: USER_DATA_SEED_IDS.SCOTT,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken: impersonateData.impersonate.loginToken.token,
      origin: impersonateData.impersonate.workspace.workspaceUrls
        .subdomainUrl as string,
      expectToFail: false,
    });

    impersonationAccessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;
  });

  it('rejects initiating OTP provisioning while impersonating', async () => {
    const { errors } = await initiateOtpProvisioningForAuthenticatedUser({
      accessToken: impersonationAccessToken,
      expectToFail: true,
    });

    expectImpersonationDenied(errors);
  });

  it('rejects verifying a two-factor method while impersonating', async () => {
    const { errors } = await verifyTwoFactorAuthenticationMethod({
      otp: '123456',
      accessToken: impersonationAccessToken,
      expectToFail: true,
    });

    expectImpersonationDenied(errors);
  });

  it('rejects deleting a two-factor method while impersonating', async () => {
    const { errors } = await deleteTwoFactorAuthenticationMethod({
      input: {
        twoFactorAuthenticationMethodId: '20202020-1111-4a01-8001-000000000004',
      },
      token: impersonationAccessToken,
      expectToFail: true,
    });

    expectImpersonationDenied(errors);
  });
});

import { deleteTwoFactorAuthenticationMethod } from 'test/integration/graphql/suites/user-session/utils/delete-two-factor-authentication-method.util';
import { generatePlaygroundToken } from 'test/integration/graphql/suites/user-session/utils/generate-playground-token.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getAuthTokensFromOtp } from 'test/integration/graphql/utils/get-auth-tokens-from-otp.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { initiateOtpProvisioning } from 'test/integration/graphql/utils/initiate-otp-provisioning.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';

import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const expectImpersonationDenied = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  expect(errors[0].extensions.userFriendlyMessage).toBe(
    'You do not have permission to perform this action.',
  );
};

const expectImpersonationLoginTokenRejected = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  expect(errors[0].message).toContain('impersonation login token');
};

const deleteScottTwoFactorAuthenticationMethods = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM core."twoFactorAuthenticationMethod"
      WHERE "userWorkspaceId" IN (
        SELECT id FROM core."userWorkspace" WHERE "userId" = $1
      )`,
    [USER_DATA_SEED_IDS.SCOTT],
  );
};

describe('Impersonation - two-factor authentication mutations denial (integration)', () => {
  let impersonationLoginToken: string;
  let impersonationOrigin: string;
  let impersonationAccessToken: string;

  beforeAll(async () => {
    await deleteScottTwoFactorAuthenticationMethods();

    const { data: impersonateData } = await impersonate({
      userId: USER_DATA_SEED_IDS.SCOTT,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    impersonationLoginToken = impersonateData.impersonate.loginToken.token;
    impersonationOrigin =
      impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl;

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken: impersonationLoginToken,
      origin: impersonationOrigin,
      expectToFail: false,
    });

    impersonationAccessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;
  });

  afterAll(deleteScottTwoFactorAuthenticationMethods);

  it('rejects login-time OTP provisioning with an impersonation login token', async () => {
    const { errors } = await initiateOtpProvisioning({
      loginToken: impersonationLoginToken,
      origin: impersonationOrigin,
      expectToFail: true,
    });

    expectImpersonationLoginTokenRejected(errors);
  });

  it('rejects exchanging an OTP for tokens with an impersonation login token', async () => {
    const { errors } = await getAuthTokensFromOtp({
      loginToken: impersonationLoginToken,
      origin: impersonationOrigin,
      otp: '000000',
      expectToFail: true,
    });

    expectImpersonationLoginTokenRejected(errors);
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

  it('rejects two-factor mutations with a playground token, which drops the impersonation context', async () => {
    const { data } = await generatePlaygroundToken({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const playgroundToken = data.generatePlaygroundToken.token;

    const { errors: provisioningErrors } =
      await initiateOtpProvisioningForAuthenticatedUser({
        accessToken: playgroundToken,
        expectToFail: true,
      });

    expectImpersonationDenied(provisioningErrors);

    const { errors: verificationErrors } =
      await verifyTwoFactorAuthenticationMethod({
        otp: '123456',
        accessToken: playgroundToken,
        expectToFail: true,
      });

    expectImpersonationDenied(verificationErrors);

    const { errors: deletionErrors } =
      await deleteTwoFactorAuthenticationMethod({
        input: {
          twoFactorAuthenticationMethodId:
            '20202020-1111-4a01-8001-000000000004',
        },
        token: playgroundToken,
        expectToFail: true,
      });

    expectImpersonationDenied(deletionErrors);
  });
});

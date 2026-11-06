import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { authorizeWithOktaPassword } from 'test/integration/sso/utils/authorize-with-okta-password.util';
import { completeOidcLogin } from 'test/integration/sso/utils/complete-oidc-login.util';
import { getOktaSsoTestTenant } from 'test/integration/sso/utils/get-okta-sso-test-tenant.util';
import { startOidcLogin } from 'test/integration/sso/utils/start-oidc-login.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('OIDC login through an Okta tenant', () => {
  const oktaTenant = getOktaSsoTestTenant();
  let identityProviderId: string;

  beforeAll(async () => {
    const { data } = await createOneOidcIdentityProvider({
      expectToFail: false,
      input: {
        name: 'Okta integration test tenant',
        issuer: oktaTenant.issuer,
        clientID: oktaTenant.clientId,
        clientSecret: oktaTenant.clientSecret,
      },
    });

    expect(data.createOIDCIdentityProvider).toMatchObject({
      type: 'OIDC',
      status: 'Active',
    });

    identityProviderId = data.createOIDCIdentityProvider.id;
  });

  afterAll(async () => {
    await deleteOneSsoIdentityProvider({
      identityProviderId,
      expectToFail: false,
    });
  });

  it('should sign an existing workspace member in', async () => {
    const { authorizationUrl, sessionCookie } =
      await startOidcLogin(identityProviderId);

    const callbackUrl = await authorizeWithOktaPassword({
      authorizationUrl,
      username: oktaTenant.username,
      password: oktaTenant.password,
    });

    const verifyUrl = await completeOidcLogin({ callbackUrl, sessionCookie });

    expect(verifyUrl.searchParams.get('errorMessage')).toBeNull();

    const loginToken = verifyUrl.searchParams.get('loginToken');

    expect(loginToken).toEqual(expect.any(String));

    const { data: authTokensData } = await getAuthTokensFromLoginToken({
      loginToken: loginToken as string,
      origin: verifyUrl.origin,
      expectToFail: false,
    });

    const { data: currentUserData } = await getCurrentUser({
      accessToken:
        authTokensData.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token,
      expectToFail: false,
    });

    expect(currentUserData.currentUser).toMatchObject({
      id: USER_DATA_SEED_IDS.PHIL,
      currentWorkspace: { id: SEED_APPLE_WORKSPACE_ID },
    });
  });
});

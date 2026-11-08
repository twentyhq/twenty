import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { authorizeWithPassword } from 'test/integration/sso/utils/authorize-with-password.util';
import { completeOidcLogin } from 'test/integration/sso/utils/complete-oidc-login.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { startOidcLogin } from 'test/integration/sso/utils/start-oidc-login.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('OIDC login through a real identity provider', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  let identityProviderId: string;

  beforeAll(async () => {
    const { data } = await createOneOidcIdentityProvider({
      expectToFail: false,
      input: {
        name: 'SSO integration test identity provider',
        issuer: testIdentityProvider.issuer,
        clientID: testIdentityProvider.clientId,
        clientSecret: testIdentityProvider.clientSecret,
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

    const callbackUrl = await authorizeWithPassword({
      authorizationUrl,
      username: testIdentityProvider.username,
      password: testIdentityProvider.password,
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

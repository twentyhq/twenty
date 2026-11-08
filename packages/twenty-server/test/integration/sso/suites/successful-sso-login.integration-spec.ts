import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { signInWithOidc } from 'test/integration/sso/utils/sign-in-with-oidc.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type StoredConnectedAccount = {
  id: string;
  handle: string;
  lastSignedInAt: Date;
  oidcTokenClaims: Record<string, unknown>;
};

const findPhilOidcConnectedAccounts = (): Promise<StoredConnectedAccount[]> =>
  globalThis.testDataSource.query(
    `SELECT ca."id", ca."handle", ca."lastSignedInAt", ca."oidcTokenClaims"
     FROM core."connectedAccount" ca
     JOIN core."userWorkspace" uw ON uw."id" = ca."userWorkspaceId"
     WHERE ca."provider" = 'oidc' AND uw."userId" = $1 AND uw."workspaceId" = $2`,
    [USER_DATA_SEED_IDS.PHIL, SEED_APPLE_WORKSPACE_ID],
  );

describe('SSO login should succeed', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  let identityProviderId: string;

  const signInAsPhil = () =>
    signInWithOidc({
      identityProviderId,
      username: testIdentityProvider.username,
      password: testIdentityProvider.password,
    });

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

    identityProviderId = data.createOIDCIdentityProvider.id;
  });

  afterAll(async () => {
    await deleteOneSsoIdentityProvider({
      identityProviderId,
      expectToFail: false,
    });

    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE "id" = ANY($1)`,
      [(await findPhilOidcConnectedAccounts()).map(({ id }) => id)],
    );
  });

  describe('OIDC', () => {
    it('should sign an existing workspace member in', async () => {
      const verifyUrl = await signInAsPhil();

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

    it('should store the id token claims on an OIDC connected account', async () => {
      const connectedAccounts = await findPhilOidcConnectedAccounts();

      expect(connectedAccounts).toHaveLength(1);
      expect(connectedAccounts[0]).toMatchObject({
        handle: 'phil.schiler@apple.dev',
        oidcTokenClaims: {
          iss: testIdentityProvider.issuer,
          email: 'phil.schiler@apple.dev',
          sub: expect.any(String),
        },
      });
    });

    it('should refresh the same connected account on a second sign-in', async () => {
      const [firstConnectedAccount] = await findPhilOidcConnectedAccounts();

      const verifyUrl = await signInAsPhil();

      expect(verifyUrl.searchParams.get('loginToken')).toEqual(
        expect.any(String),
      );

      const connectedAccounts = await findPhilOidcConnectedAccounts();

      expect(connectedAccounts).toHaveLength(1);
      expect(connectedAccounts[0].id).toBe(firstConnectedAccount.id);
      expect(connectedAccounts[0].lastSignedInAt.getTime()).toBeGreaterThan(
        firstConnectedAccount.lastSignedInAt.getTime(),
      );
      expect(connectedAccounts[0].oidcTokenClaims.jti).not.toBe(
        firstConnectedAccount.oidcTokenClaims.jti,
      );

      const [{ count: philAppleMemberships }] =
        await globalThis.testDataSource.query(
          `SELECT COUNT(*)::int AS count FROM core."userWorkspace"
           WHERE "userId" = $1 AND "workspaceId" = $2`,
          [USER_DATA_SEED_IDS.PHIL, SEED_APPLE_WORKSPACE_ID],
        );

      expect(philAppleMemberships).toBe(1);
    });
  });
});

import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { findMyConnectedAccounts } from 'test/integration/metadata/suites/connected-account/utils/find-my-connected-accounts.util';
import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { insertOtherWorkspaceOidcIdentityProvider } from 'test/integration/sso/utils/insert-other-workspace-oidc-identity-provider.util';
import { signInWithOidc } from 'test/integration/sso/utils/sign-in-with-oidc.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const findOidcConnectedAccounts = async (token: string) =>
  (await findMyConnectedAccounts({ token })).filter(
    ({ provider }) => provider === 'oidc',
  );

const findPhilOidcConnectedAccounts = () =>
  findOidcConnectedAccounts(APPLE_PHIL_GUEST_ACCESS_TOKEN);

const deleteOidcConnectedAccounts = async (token: string) => {
  for (const { id } of await findOidcConnectedAccounts(token)) {
    await deleteConnectedAccount({ id, expectToFail: false, token });
  }
};

const setOtherWorkspaceActivationStatus = (
  activationStatus: WorkspaceActivationStatus,
) =>
  globalThis.testDataSource.query(
    `UPDATE core."workspace" SET "activationStatus" = $1 WHERE "id" = $2`,
    [activationStatus, SEED_YCOMBINATOR_WORKSPACE_ID],
  );

const signInThroughVerifyUrl = async (verifyUrl: URL) => {
  expect(verifyUrl.searchParams.get('errorMessage')).toBeNull();

  const loginToken = verifyUrl.searchParams.get('loginToken');

  assertIsDefinedOrThrow(loginToken);

  const { data: authTokensData } = await getAuthTokensFromLoginToken({
    loginToken,
    origin: verifyUrl.origin,
    expectToFail: false,
  });

  const accessToken =
    authTokensData.getAuthTokensFromLoginToken.tokens
      .accessOrWorkspaceAgnosticToken.token;

  const { data: currentUserData } = await getCurrentUser({
    accessToken,
    expectToFail: false,
  });

  return { accessToken, currentUser: currentUserData.currentUser };
};

describe('SSO login should succeed', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  let identityProviderId: string;
  const insertedIdentityProviderIds: string[] = [];
  let otherWorkspaceAccessToken: string | undefined;
  let isOtherWorkspaceSuspended = false;

  const signInAsPhil = (signInIdentityProviderId = identityProviderId) =>
    signInWithOidc({
      identityProviderId: signInIdentityProviderId,
      username: testIdentityProvider.member.username,
      password: testIdentityProvider.member.password,
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

  afterEach(async () => {
    if (isOtherWorkspaceSuspended) {
      await setOtherWorkspaceActivationStatus(WorkspaceActivationStatus.ACTIVE);
      isOtherWorkspaceSuspended = false;
    }

    if (isDefined(otherWorkspaceAccessToken)) {
      await deleteOidcConnectedAccounts(otherWorkspaceAccessToken);
      otherWorkspaceAccessToken = undefined;
    }

    await globalThis.testDataSource.query(
      `DELETE FROM core."workspaceSSOIdentityProvider" WHERE "id" = ANY($1)`,
      [insertedIdentityProviderIds.splice(0)],
    );

    await deleteOidcConnectedAccounts(APPLE_PHIL_GUEST_ACCESS_TOKEN);
  });

  afterAll(async () => {
    await deleteOneSsoIdentityProvider({
      identityProviderId,
      expectToFail: false,
    });
  });

  describe('OIDC', () => {
    it('should sign an existing workspace member in', async () => {
      const { currentUser } = await signInThroughVerifyUrl(
        await signInAsPhil(),
      );

      expect(currentUser).toMatchObject({
        id: USER_DATA_SEED_IDS.PHIL,
        currentWorkspace: { id: SEED_APPLE_WORKSPACE_ID },
      });
    });

    it('should sign an existing member into a suspended workspace', async () => {
      const otherWorkspaceIdentityProviderId =
        await insertOtherWorkspaceOidcIdentityProvider();

      insertedIdentityProviderIds.push(otherWorkspaceIdentityProviderId);

      await setOtherWorkspaceActivationStatus(
        WorkspaceActivationStatus.SUSPENDED,
      );
      isOtherWorkspaceSuspended = true;

      const { accessToken, currentUser } = await signInThroughVerifyUrl(
        await signInAsPhil(otherWorkspaceIdentityProviderId),
      );

      otherWorkspaceAccessToken = accessToken;

      expect(currentUser).toMatchObject({
        id: USER_DATA_SEED_IDS.PHIL,
        currentWorkspace: { id: SEED_YCOMBINATOR_WORKSPACE_ID },
      });
    });

    it('should create an OIDC connected account for the member', async () => {
      await signInAsPhil();

      const connectedAccounts = await findPhilOidcConnectedAccounts();

      expect(connectedAccounts).toEqual([
        expect.objectContaining({
          handle: 'phil.schiler@apple.dev',
          provider: 'oidc',
          lastSignedInAt: expect.any(String),
        }),
      ]);
    });

    it('should refresh the same connected account on a second sign-in', async () => {
      await signInAsPhil();

      const connectedAccountsAfterFirstSignIn =
        await findPhilOidcConnectedAccounts();

      expect(connectedAccountsAfterFirstSignIn).toHaveLength(1);

      const [firstConnectedAccount] = connectedAccountsAfterFirstSignIn;
      const firstSignedInAt = firstConnectedAccount.lastSignedInAt;

      assertIsDefinedOrThrow(firstSignedInAt);

      const verifyUrl = await signInAsPhil();

      expect(verifyUrl.searchParams.get('loginToken')).toEqual(
        expect.any(String),
      );

      const connectedAccounts = await findPhilOidcConnectedAccounts();

      expect(connectedAccounts).toHaveLength(1);

      const [refreshedConnectedAccount] = connectedAccounts;
      const refreshedSignedInAt = refreshedConnectedAccount.lastSignedInAt;

      assertIsDefinedOrThrow(refreshedSignedInAt);

      expect(refreshedConnectedAccount.id).toBe(firstConnectedAccount.id);
      expect(new Date(refreshedSignedInAt).getTime()).toBeGreaterThan(
        new Date(firstSignedInAt).getTime(),
      );
    });
  });
});

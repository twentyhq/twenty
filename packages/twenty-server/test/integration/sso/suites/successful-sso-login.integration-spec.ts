import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { setWorkspaceActivationStatus } from 'test/integration/graphql/utils/set-workspace-activation-status.util';
import { findMyConnectedAccounts } from 'test/integration/metadata/suites/connected-account/utils/find-my-connected-accounts.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { SSO_TEST_PROTOCOLS } from 'test/integration/sso/constants/sso-test-protocols.constant';
import { createTestSamlIdentityProvider } from 'test/integration/sso/utils/create-test-saml-identity-provider.util';
import { deleteSsoConnectedAccounts } from 'test/integration/sso/utils/delete-sso-connected-accounts.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import { signInWithSaml } from 'test/integration/sso/utils/sign-in-with-saml.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const setYcombinatorActivationStatus = (
  activationStatus: WorkspaceActivationStatus,
) =>
  setWorkspaceActivationStatus({
    workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
    activationStatus,
  });

const signInThroughVerifyUrl = async (verifyUrl: URL) => {
  expect(verifyUrl.searchParams.get('errorMessage')).toBeNull();

  const accessToken = await exchangeLoginToken(verifyUrl);

  assertIsDefinedOrThrow(accessToken);

  const { data } = await getCurrentUser({ accessToken, expectToFail: false });

  return data.currentUser;
};

describe('SSO login should succeed', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  let ycombinatorAdminAccessToken: string;

  beforeAll(async () => {
    ycombinatorAdminAccessToken = await getYcombinatorAdminAccessToken();
  });

  describe.each(SSO_TEST_PROTOCOLS)(
    '$protocol',
    ({ connectedAccountProvider, createTestIdentityProvider, signIn }) => {
      let appleIdentityProviderId: string | undefined;
      let ycombinatorIdentityProviderId: string | undefined;
      let isYcombinatorSuspended = false;

      const findPhilSsoConnectedAccounts = async (
        token = APPLE_PHIL_GUEST_ACCESS_TOKEN,
      ) =>
        (await findMyConnectedAccounts({ token })).filter(
          ({ provider }) => provider === connectedAccountProvider,
        );

      const signInAsPhil = (identityProviderId: string | undefined) => {
        assertIsDefinedOrThrow(identityProviderId);

        return signIn({
          identityProviderId,
          username: testIdentityProvider.member.username,
          password: testIdentityProvider.member.password,
        });
      };

      afterEach(async () => {
        if (isYcombinatorSuspended) {
          await setYcombinatorActivationStatus(
            WorkspaceActivationStatus.ACTIVE,
          );
          isYcombinatorSuspended = false;
        }

        if (isDefined(ycombinatorIdentityProviderId)) {
          await deleteSsoConnectedAccounts({
            token: await getAccessTokenForCredentials({
              email: 'phil.schiler@apple.dev',
              workspaceSubdomain: 'yc',
            }),
          });

          await deleteOneSsoIdentityProvider({
            identityProviderId: ycombinatorIdentityProviderId,
            token: ycombinatorAdminAccessToken,
            expectToFail: false,
          });
          ycombinatorIdentityProviderId = undefined;
        }

        if (isDefined(appleIdentityProviderId)) {
          await deleteSsoConnectedAccounts({
            token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          });

          await deleteOneSsoIdentityProvider({
            identityProviderId: appleIdentityProviderId,
            expectToFail: false,
          });
          appleIdentityProviderId = undefined;
        }
      });

      it('should sign an existing workspace member in', async () => {
        appleIdentityProviderId = await createTestIdentityProvider();

        const currentUser = await signInThroughVerifyUrl(
          await signInAsPhil(appleIdentityProviderId),
        );

        expect(currentUser).toMatchObject({
          id: USER_DATA_SEED_IDS.PHIL,
          currentWorkspace: { id: SEED_APPLE_WORKSPACE_ID },
        });
      });

      it('should sign an existing member into a suspended workspace', async () => {
        ycombinatorIdentityProviderId = await createTestIdentityProvider({
          token: ycombinatorAdminAccessToken,
        });

        await setYcombinatorActivationStatus(
          WorkspaceActivationStatus.SUSPENDED,
        );
        isYcombinatorSuspended = true;

        const currentUser = await signInThroughVerifyUrl(
          await signInAsPhil(ycombinatorIdentityProviderId),
        );

        expect(currentUser).toMatchObject({
          id: USER_DATA_SEED_IDS.PHIL,
          currentWorkspace: { id: SEED_YCOMBINATOR_WORKSPACE_ID },
        });
      });

      it('should create a connected account for the member', async () => {
        appleIdentityProviderId = await createTestIdentityProvider();

        await signInAsPhil(appleIdentityProviderId);

        expect(await findPhilSsoConnectedAccounts()).toEqual([
          expect.objectContaining({
            handle: 'phil.schiler@apple.dev',
            provider: connectedAccountProvider,
            lastSignedInAt: expect.any(String),
          }),
        ]);
      });

      it('should refresh the same connected account on a second sign-in', async () => {
        appleIdentityProviderId = await createTestIdentityProvider();

        await signInAsPhil(appleIdentityProviderId);

        const connectedAccountsAfterFirstSignIn =
          await findPhilSsoConnectedAccounts();

        expect(connectedAccountsAfterFirstSignIn).toHaveLength(1);

        const [firstConnectedAccount] = connectedAccountsAfterFirstSignIn;
        const firstSignedInAt = firstConnectedAccount.lastSignedInAt;

        assertIsDefinedOrThrow(firstSignedInAt);

        const verifyUrl = await signInAsPhil(appleIdentityProviderId);

        expect(verifyUrl.searchParams.get('loginToken')).toEqual(
          expect.any(String),
        );

        const connectedAccounts = await findPhilSsoConnectedAccounts();

        expect(connectedAccounts).toHaveLength(1);

        const [refreshedConnectedAccount] = connectedAccounts;
        const refreshedSignedInAt = refreshedConnectedAccount.lastSignedInAt;

        assertIsDefinedOrThrow(refreshedSignedInAt);

        expect(refreshedConnectedAccount.id).toBe(firstConnectedAccount.id);
        expect(new Date(refreshedSignedInAt).getTime()).toBeGreaterThan(
          new Date(firstSignedInAt).getTime(),
        );
      });
    },
  );

  describe('SAML certificate', () => {
    let identityProviderId: string | undefined;

    afterEach(async () => {
      if (isDefined(identityProviderId)) {
        await deleteSsoConnectedAccounts({
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        });

        await deleteOneSsoIdentityProvider({
          identityProviderId,
          expectToFail: false,
        });
        identityProviderId = undefined;
      }
    });

    it('should sign a member in with a PEM certificate', async () => {
      identityProviderId = await createTestSamlIdentityProvider({
        certificate: [
          '-----BEGIN CERTIFICATE-----',
          ...(testIdentityProvider.saml.certificate.match(/.{1,64}/g) ?? []),
          '-----END CERTIFICATE-----',
        ].join('\n'),
      });

      const currentUser = await signInThroughVerifyUrl(
        await signInWithSaml({
          identityProviderId,
          username: testIdentityProvider.member.username,
          password: testIdentityProvider.member.password,
        }),
      );

      expect(currentUser).toMatchObject({
        id: USER_DATA_SEED_IDS.PHIL,
        currentWorkspace: { id: SEED_APPLE_WORKSPACE_ID },
      });
    });
  });
});

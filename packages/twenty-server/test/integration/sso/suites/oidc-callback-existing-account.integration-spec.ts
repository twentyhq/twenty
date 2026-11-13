import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { clearInvitationSendingThrottle } from 'test/integration/graphql/utils/clear-invitation-sending-throttle.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { createOneOidcIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-oidc-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import {
  countUserWorkspaceMemberships,
  deleteUserByEmail,
  deleteUserWorkspaceMembership,
  getUserIsEmailVerified,
  setUserCanAccessFullAdminPanel,
} from 'test/integration/saml-callback/utils/account-state-sql.util';
import { deleteSsoConnectedAccounts } from 'test/integration/sso/utils/delete-sso-connected-accounts.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import { signInWithLocalOidcIssuer } from 'test/integration/sso/utils/sign-in-with-local-oidc-issuer.util';
import {
  type LocalOidcIssuer,
  startLocalOidcIssuer,
} from 'test/integration/sso/utils/start-local-oidc-issuer.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const YCOMBINATOR_SUBDOMAIN = 'yc';
const YCOMBINATOR_INVITE_HASH = 'yc.dev-invite-hash';

// Phil is a member of both Apple and YCombinator; Scott is a member of Apple only.
const YC_MEMBER_EMAIL = 'phil.schiler@apple.dev';
const NON_YC_MEMBER_EMAIL = 'scott.forstall@apple.dev';

describe('OIDC callback sign-in', () => {
  let localOidcIssuer: LocalOidcIssuer;
  let ycombinatorAdminAccessToken: string;

  const registerLocalOidcIdentityProvider = async () => {
    const { data } = await createOneOidcIdentityProvider({
      expectToFail: false,
      token: ycombinatorAdminAccessToken,
      input: {
        name: 'Local OIDC issuer',
        issuer: localOidcIssuer.issuerUrl,
        clientID: 'local-oidc-client',
        clientSecret: 'local-oidc-client-secret',
      },
    });

    return data.createOIDCIdentityProvider.id;
  };

  const deleteLocalOidcIdentityProvider = (identityProviderId: string) =>
    deleteOneSsoIdentityProvider({
      identityProviderId,
      token: ycombinatorAdminAccessToken,
      expectToFail: false,
    });

  beforeAll(async () => {
    localOidcIssuer = await startLocalOidcIssuer();

    // The SSRF guard otherwise refuses the issuer's loopback address
    await updateConfigVariable({
      input: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: [localOidcIssuer.host],
      },
    });

    ycombinatorAdminAccessToken = await getYcombinatorAdminAccessToken();
  });

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });

    await localOidcIssuer.close();
  });

  describe('existing accounts that are not members of the workspace', () => {
    let identityProviderId: string | undefined;

    afterEach(async () => {
      if (isDefined(identityProviderId)) {
        await deleteLocalOidcIdentityProvider(identityProviderId);
        identityProviderId = undefined;
      }

      await clearInvitationSendingThrottle({ email: NON_YC_MEMBER_EMAIL });

      await deleteWorkspaceInvitationsByEmail({
        email: NON_YC_MEMBER_EMAIL,
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      });

      // Keeps the case rerunnable if the join went through
      await deleteUserWorkspaceMembership({
        email: NON_YC_MEMBER_EMAIL,
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      });

      await setUserCanAccessFullAdminPanel({
        email: NON_YC_MEMBER_EMAIL,
        canAccessFullAdminPanel: false,
      });
    });

    it('refuses an existing account holding a pending personal invitation', async () => {
      identityProviderId = await registerLocalOidcIdentityProvider();

      await sendInvitations({
        input: { emails: [NON_YC_MEMBER_EMAIL] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await signInWithLocalOidcIssuer({
        identityProviderId,
        email: NON_YC_MEMBER_EMAIL,
      });

      expect(redirectUrl.searchParams.get('loginToken')).toBeNull();
      expect(
        await countUserWorkspaceMemberships({
          email: NON_YC_MEMBER_EMAIL,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        }),
      ).toBe(0);
    });

    it('refuses an existing account joining through the public invite link', async () => {
      identityProviderId = await registerLocalOidcIdentityProvider();

      const redirectUrl = await signInWithLocalOidcIssuer({
        identityProviderId,
        email: NON_YC_MEMBER_EMAIL,
        workspaceInviteHash: YCOMBINATOR_INVITE_HASH,
      });

      expect(redirectUrl.searchParams.get('loginToken')).toBeNull();
      expect(
        await countUserWorkspaceMemberships({
          email: NON_YC_MEMBER_EMAIL,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        }),
      ).toBe(0);
    });

    it('refuses an existing account with admin panel access', async () => {
      await setUserCanAccessFullAdminPanel({
        email: NON_YC_MEMBER_EMAIL,
        canAccessFullAdminPanel: true,
      });

      identityProviderId = await registerLocalOidcIdentityProvider();

      await sendInvitations({
        input: { emails: [NON_YC_MEMBER_EMAIL] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await signInWithLocalOidcIssuer({
        identityProviderId,
        email: NON_YC_MEMBER_EMAIL,
      });

      expect(redirectUrl.searchParams.get('loginToken')).toBeNull();
      expect(
        await countUserWorkspaceMemberships({
          email: NON_YC_MEMBER_EMAIL,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        }),
      ).toBe(0);
    });
  });

  describe('unverified password accounts', () => {
    let identityProviderId: string | undefined;
    let unverifiedEmail: string | undefined;
    let isEmailVerificationRequired = false;

    beforeEach(async () => {
      unverifiedEmail = `unverified-${uuidv4()}@acme.test`;

      await signUp({
        input: { email: unverifiedEmail, password: 'Password123!' },
        expectToFail: false,
      });
    });

    afterEach(async () => {
      if (isDefined(identityProviderId)) {
        await deleteLocalOidcIdentityProvider(identityProviderId);
        identityProviderId = undefined;
      }

      if (isDefined(unverifiedEmail)) {
        await deleteWorkspaceInvitationsByEmail({
          email: unverifiedEmail,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        });
        await deleteUserByEmail(unverifiedEmail);
        unverifiedEmail = undefined;
      }

      if (isEmailVerificationRequired) {
        await updateConfigVariable({
          input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: false },
        });
        isEmailVerificationRequired = false;
      }
    });

    it('leaves an unverified password account unverified', async () => {
      assertIsDefinedOrThrow(unverifiedEmail);

      await updateConfigVariable({
        input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: true },
      });
      isEmailVerificationRequired = true;

      expect(await getUserIsEmailVerified(unverifiedEmail)).toBe(false);

      identityProviderId = await registerLocalOidcIdentityProvider();

      await sendInvitations({
        input: { emails: [unverifiedEmail] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await signInWithLocalOidcIssuer({
        identityProviderId,
        email: unverifiedEmail,
      });

      expect(redirectUrl.searchParams.get('loginToken')).toBeNull();
      expect(await getUserIsEmailVerified(unverifiedEmail)).toBe(false);
      expect(
        await countUserWorkspaceMemberships({
          email: unverifiedEmail,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        }),
      ).toBe(0);
    });
  });

  describe('successful sign-in', () => {
    let identityProviderId: string | undefined;
    let newcomerEmail: string | undefined;

    afterEach(async () => {
      if (isDefined(identityProviderId)) {
        await deleteLocalOidcIdentityProvider(identityProviderId);
        identityProviderId = undefined;
      }

      // The member sign-in leaves an SSO connected account behind
      await deleteSsoConnectedAccounts({
        token: await getAccessTokenForCredentials({
          email: YC_MEMBER_EMAIL,
          workspaceSubdomain: YCOMBINATOR_SUBDOMAIN,
        }),
      });

      if (isDefined(newcomerEmail)) {
        await deleteWorkspaceInvitationsByEmail({
          email: newcomerEmail,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        });
        await deleteUserByEmail(newcomerEmail);
        newcomerEmail = undefined;
      }
    });

    it('signs an existing workspace member in through their workspace identity provider', async () => {
      identityProviderId = await registerLocalOidcIdentityProvider();

      const redirectUrl = await signInWithLocalOidcIssuer({
        identityProviderId,
        email: YC_MEMBER_EMAIL,
      });

      expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();

      const accessToken = await exchangeLoginToken(redirectUrl);

      assertIsDefinedOrThrow(accessToken);

      const { data } = await getCurrentUser({
        accessToken,
        expectToFail: false,
      });

      expect(data.currentUser).toMatchObject({
        id: USER_DATA_SEED_IDS.PHIL,
        currentWorkspace: { id: SEED_YCOMBINATOR_WORKSPACE_ID },
      });
    });

    it('signs a brand new invited user up through the identity provider', async () => {
      newcomerEmail = `newcomer-${uuidv4()}@acme.test`;

      identityProviderId = await registerLocalOidcIdentityProvider();

      await sendInvitations({
        input: { emails: [newcomerEmail] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await signInWithLocalOidcIssuer({
        identityProviderId,
        email: newcomerEmail,
      });

      expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();

      const accessToken = await exchangeLoginToken(redirectUrl);

      assertIsDefinedOrThrow(accessToken);

      const { data } = await getCurrentUser({
        accessToken,
        expectToFail: false,
      });

      expect(data.currentUser).toMatchObject({
        email: newcomerEmail,
        currentWorkspace: { id: SEED_YCOMBINATOR_WORKSPACE_ID },
      });
    });
  });
});

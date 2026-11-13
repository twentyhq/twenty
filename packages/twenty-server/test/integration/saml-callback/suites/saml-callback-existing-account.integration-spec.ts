import { clearInvitationSendingThrottle } from 'test/integration/graphql/utils/clear-invitation-sending-throttle.util';
import { createApprovedAccessDomain } from 'test/integration/graphql/utils/create-approved-access-domain.util';
import { deleteApprovedAccessDomain } from 'test/integration/graphql/utils/delete-approved-access-domain.util';
import { getAccessTokenForCredentials } from 'test/integration/graphql/utils/get-access-token-for-credentials.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  countUserWorkspaceMemberships,
  deleteUserByEmail,
  deleteUserWorkspaceMembership,
  getUserIsEmailVerified,
  setUserCanAccessFullAdminPanel,
} from 'test/integration/saml-callback/utils/account-state-sql.util';
import {
  generateSelfSignedSamlCredentials,
  type SelfSignedSamlCredentials,
} from 'test/integration/saml-callback/utils/generate-self-signed-saml-credentials.util';
import { postSelfSignedSamlAssertion } from 'test/integration/saml-callback/utils/post-self-signed-saml-assertion.util';
import {
  deleteSelfSignedSamlIdentityProvider,
  registerSelfSignedSamlIdentityProvider,
} from 'test/integration/saml-callback/utils/register-self-signed-saml-identity-provider.util';
import { deleteSsoConnectedAccounts } from 'test/integration/sso/utils/delete-sso-connected-accounts.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
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
const YC_ADMIN_EMAIL = 'tim@apple.dev';
const UNVERIFIED_ACCOUNT_PASSWORD = 'Password123!';

describe('SAML callback sign-in', () => {
  const identityProviderCredentials: SelfSignedSamlCredentials =
    generateSelfSignedSamlCredentials();

  let ycombinatorAdminAccessToken: string;

  beforeAll(async () => {
    ycombinatorAdminAccessToken = await getYcombinatorAdminAccessToken();
  });

  describe('existing accounts that are not members of the workspace', () => {
    let identityProviderId: string | undefined;
    let approvedAccessDomainId: string | undefined;
    let isEmailVerificationRequired = false;

    afterEach(async () => {
      if (isDefined(identityProviderId)) {
        await deleteSelfSignedSamlIdentityProvider(identityProviderId);
        identityProviderId = undefined;
      }

      if (isDefined(approvedAccessDomainId)) {
        await deleteApprovedAccessDomain({
          input: { id: approvedAccessDomainId },
          expectToFail: false,
          token: ycombinatorAdminAccessToken,
        });
        approvedAccessDomainId = undefined;
      }

      if (isEmailVerificationRequired) {
        await updateConfigVariable({
          input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: false },
        });
        isEmailVerificationRequired = false;
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
      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      await sendInvitations({
        input: { emails: [NON_YC_MEMBER_EMAIL] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: NON_YC_MEMBER_EMAIL,
        credentials: identityProviderCredentials,
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
      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: NON_YC_MEMBER_EMAIL,
        credentials: identityProviderCredentials,
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

      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      await sendInvitations({
        input: { emails: [NON_YC_MEMBER_EMAIL] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: NON_YC_MEMBER_EMAIL,
        credentials: identityProviderCredentials,
      });

      expect(redirectUrl.searchParams.get('loginToken')).toBeNull();
      expect(
        await countUserWorkspaceMemberships({
          email: NON_YC_MEMBER_EMAIL,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        }),
      ).toBe(0);
    });
    it('refuses an existing account matching an approved access domain', async () => {
      await updateConfigVariable({
        input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: true },
      });
      isEmailVerificationRequired = true;

      const { data } = await createApprovedAccessDomain({
        input: { domain: 'apple.dev', email: YC_ADMIN_EMAIL },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      approvedAccessDomainId = data.createApprovedAccessDomain.id;

      // Validating needs the token Twenty emails, which integration tests can't read
      await globalThis.testDataSource.query(
        `UPDATE core."approvedAccessDomain" SET "isValidated" = true WHERE "id" = $1`,
        [approvedAccessDomainId],
      );

      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: NON_YC_MEMBER_EMAIL,
        credentials: identityProviderCredentials,
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
        input: {
          email: unverifiedEmail,
          password: UNVERIFIED_ACCOUNT_PASSWORD,
        },
        expectToFail: false,
      });
    });

    afterEach(async () => {
      if (isDefined(identityProviderId)) {
        await deleteSelfSignedSamlIdentityProvider(identityProviderId);
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

      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      await sendInvitations({
        input: { emails: [unverifiedEmail] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: unverifiedEmail,
        credentials: identityProviderCredentials,
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

    it('signs a member in without verifying their password account', async () => {
      assertIsDefinedOrThrow(unverifiedEmail);

      const joinResponse = await makeMetadataApiRequest(
        signUpInWorkspaceOperationFactory({
          email: unverifiedEmail,
          password: UNVERIFIED_ACCOUNT_PASSWORD,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
          workspaceInviteHash: YCOMBINATOR_INVITE_HASH,
        }),
        null,
      );

      expect(joinResponse.body.errors).toBeUndefined();
      expect(await getUserIsEmailVerified(unverifiedEmail)).toBe(false);

      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: unverifiedEmail,
        credentials: identityProviderCredentials,
      });

      expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();
      expect(await exchangeLoginToken(redirectUrl)).toBeDefined();
      expect(await getUserIsEmailVerified(unverifiedEmail)).toBe(false);
    });
  });

  describe('successful sign-in', () => {
    let identityProviderId: string | undefined;
    let newcomerEmail: string | undefined;

    afterEach(async () => {
      if (isDefined(identityProviderId)) {
        await deleteSelfSignedSamlIdentityProvider(identityProviderId);
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
      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: YC_MEMBER_EMAIL,
        credentials: identityProviderCredentials,
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

      identityProviderId = await registerSelfSignedSamlIdentityProvider({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        credentials: identityProviderCredentials,
      });

      await sendInvitations({
        input: { emails: [newcomerEmail] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const redirectUrl = await postSelfSignedSamlAssertion({
        identityProviderId,
        email: newcomerEmail,
        credentials: identityProviderCredentials,
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

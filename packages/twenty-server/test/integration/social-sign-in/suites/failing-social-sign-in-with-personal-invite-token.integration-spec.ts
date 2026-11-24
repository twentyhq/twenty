import { randomUUID } from 'crypto';

import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { SOCIAL_SIGN_IN_TEST_PROVIDERS } from 'test/integration/social-sign-in/constants/social-sign-in-test-providers.constant';
import { signInWithSocialProvider } from 'test/integration/social-sign-in/utils/sign-in-with-social-provider.util';
import { deleteSsoUser } from 'test/integration/sso/utils/delete-sso-user.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe.each(SOCIAL_SIGN_IN_TEST_PROVIDERS)(
  '$provider sign-in with a personal invite token should fail',
  ({ path, enabledConfigVariable, mockAccount }) => {
    const httpMock = setupHttpMock();

    const invitedEmail = `invited-${randomUUID()}@example.com`;
    let inviteToken: string;
    let accessToken: string | undefined;

    beforeAll(async () => {
      await updateConfigVariable({
        input: { key: enabledConfigVariable, value: true },
      });
    });

    beforeEach(async () => {
      inviteToken = `personal-invite-token-${randomUUID()}`;

      await seedWorkspaceInvitation({
        email: invitedEmail,
        value: inviteToken,
        expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
      });
    });

    afterEach(async () => {
      await deleteWorkspaceInvitationsByEmail({ email: invitedEmail });

      if (isDefined(accessToken)) {
        await deleteSsoUser({ accessToken });
        accessToken = undefined;
      }
    });

    afterAll(async () => {
      await deleteConfigVariable({ input: { key: enabledConfigVariable } });
    });

    it('refuses an account whose email differs from the invited one without the personal invite token', async () => {
      httpMock.use(...mockAccount(`alias-${randomUUID()}@example.com`));

      const verifyUrl = await signInWithSocialProvider({
        path,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });

      expect(verifyUrl.searchParams.get('loginToken')).toBeNull();
      expect(verifyUrl.searchParams.get('errorMessage')).toBe(
        'User does not have access to this workspace',
      );
      expect(
        await findWorkspaceInvitationsByEmail({ email: invitedEmail }),
      ).toHaveLength(1);
    });

    it('refuses a personal invite token another account already used', async () => {
      httpMock.use(...mockAccount(`alias-${randomUUID()}@example.com`));

      accessToken = await exchangeLoginToken(
        await signInWithSocialProvider({
          path,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          inviteToken,
        }),
      );

      assertIsDefinedOrThrow(accessToken);

      httpMock.use(...mockAccount(`alias-${randomUUID()}@example.com`));

      const verifyUrl = await signInWithSocialProvider({
        path,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        inviteToken,
      });

      expect(verifyUrl.searchParams.get('loginToken')).toBeNull();
      expect(verifyUrl.searchParams.get('errorMessage')).toBe(
        'User does not have access to this workspace',
      );
    });
  },
);

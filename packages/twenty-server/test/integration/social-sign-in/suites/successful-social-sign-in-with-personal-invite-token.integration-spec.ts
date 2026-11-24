import { randomUUID } from 'crypto';

import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { SOCIAL_SIGN_IN_TEST_PROVIDERS } from 'test/integration/social-sign-in/constants/social-sign-in-test-providers.constant';
import { signInWithSocialProvider } from 'test/integration/social-sign-in/utils/sign-in-with-social-provider.util';
import { deleteSsoUser } from 'test/integration/sso/utils/delete-sso-user.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe.each(SOCIAL_SIGN_IN_TEST_PROVIDERS)(
  '$provider sign-in with a personal invite token should succeed',
  ({ path, enabledConfigVariable, mockAccount }) => {
    const httpMock = setupHttpMock();

    const invitedEmail = `invited-${randomUUID()}@example.com`;
    const accountEmail = `alias-${randomUUID()}@example.com`;
    let accessToken: string | undefined;

    beforeAll(async () => {
      await updateConfigVariable({
        input: { key: enabledConfigVariable, value: true },
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

    it('joins with the invited role and consumes the invitation when the account email differs from the invited one', async () => {
      const invitedRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
      const inviteToken = `personal-invite-token-${randomUUID()}`;

      await seedWorkspaceInvitation({
        email: invitedEmail,
        value: inviteToken,
        expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
        roleId: invitedRoleId,
      });

      httpMock.use(...mockAccount(accountEmail));

      const verifyUrl = await signInWithSocialProvider({
        path,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        inviteToken,
      });

      expect(verifyUrl.searchParams.get('errorMessage')).toBeNull();

      accessToken = await exchangeLoginToken(verifyUrl);

      assertIsDefinedOrThrow(accessToken);

      const { data } = await getCurrentUser({
        accessToken,
        expectToFail: false,
      });

      expect(data.currentUser).toMatchObject({
        email: accountEmail,
        currentWorkspace: { id: SEED_APPLE_WORKSPACE_ID },
      });

      const roleTarget = await getCoreRepository<RoleTargetEntity>(
        RoleTargetEntity,
      ).findOneBy({
        userWorkspaceId: data.currentUser.currentUserWorkspace?.id,
      });

      expect(roleTarget?.roleId).toBe(invitedRoleId);
      expect(
        await findWorkspaceInvitationsByEmail({ email: invitedEmail }),
      ).toEqual([]);
    });
  },
);

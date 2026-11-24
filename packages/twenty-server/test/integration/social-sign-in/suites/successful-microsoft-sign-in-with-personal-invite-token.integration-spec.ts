import { randomUUID } from 'crypto';

import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { microsoftAuthHandlers } from 'test/integration/microsoft/mocks/microsoft-auth-handlers.util';
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

describe('Microsoft sign-in with a personal invite token should succeed', () => {
  const httpMock = setupHttpMock();

  const invitedEmail = `invited-${randomUUID()}@example.com`;
  let invitedRoleId: string;
  let inviteToken: string;
  let accessToken: string | undefined;

  const signInAndExpectInvitedMemberOfApple = async ({
    accountEmail,
    withInviteToken,
  }: {
    accountEmail: string;
    withInviteToken: boolean;
  }) => {
    httpMock.use(...microsoftAuthHandlers(accountEmail));

    const verifyUrl = await signInWithSocialProvider({
      path: '/auth/microsoft',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      inviteToken: withInviteToken ? inviteToken : undefined,
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
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'AUTH_MICROSOFT_ENABLED', value: true },
    });

    invitedRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
  });

  beforeEach(async () => {
    inviteToken = `personal-invite-token-${randomUUID()}`;

    await seedWorkspaceInvitation({
      email: invitedEmail,
      value: inviteToken,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
      roleId: invitedRoleId,
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
    await deleteConfigVariable({ input: { key: 'AUTH_MICROSOFT_ENABLED' } });
  });

  it('when the account email differs from the invited one and the invite token is present', async () => {
    await signInAndExpectInvitedMemberOfApple({
      accountEmail: `alias-${randomUUID()}@example.com`,
      withInviteToken: true,
    });
  });

  it('when the invited account signs in without the invite token', async () => {
    await signInAndExpectInvitedMemberOfApple({
      accountEmail: invitedEmail,
      withInviteToken: false,
    });
  });
});

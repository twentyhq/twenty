import { randomUUID } from 'crypto';

import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { microsoftAuthHandlers } from 'test/integration/microsoft/mocks/microsoft-auth-handlers.util';
import { signInWithSocialProvider } from 'test/integration/social-sign-in/utils/sign-in-with-social-provider.util';
import { deleteSsoUser } from 'test/integration/sso/utils/delete-sso-user.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { expectNotInternalServerErrorSsoRedirectSnapshot } from 'test/integration/sso/utils/expect-not-internal-server-error-sso-redirect-snapshot.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('Microsoft sign-in with a personal invite token should fail', () => {
  const httpMock = setupHttpMock();

  const invitedEmail = `invited-${randomUUID()}@example.com`;
  let inviteToken: string;
  let accessToken: string | undefined;

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'AUTH_MICROSOFT_ENABLED', value: true },
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
    await deleteConfigVariable({ input: { key: 'AUTH_MICROSOFT_ENABLED' } });
  });

  it('when the account is not the invited one and the invite token is missing', async () => {
    httpMock.use(...microsoftAuthHandlers(`alias-${randomUUID()}@example.com`));

    const verifyUrl = await signInWithSocialProvider({
      path: '/auth/microsoft',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    expectNotInternalServerErrorSsoRedirectSnapshot(verifyUrl);
    expect(
      await findWorkspaceInvitationsByEmail({ email: invitedEmail }),
    ).toHaveLength(1);
  });

  it('when another account already used the invite token', async () => {
    httpMock.use(...microsoftAuthHandlers(`alias-${randomUUID()}@example.com`));

    accessToken = await exchangeLoginToken(
      await signInWithSocialProvider({
        path: '/auth/microsoft',
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        inviteToken,
      }),
    );

    assertIsDefinedOrThrow(accessToken);

    httpMock.use(...microsoftAuthHandlers(`alias-${randomUUID()}@example.com`));

    const verifyUrl = await signInWithSocialProvider({
      path: '/auth/microsoft',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      inviteToken,
    });

    expectNotInternalServerErrorSsoRedirectSnapshot(verifyUrl);
  });
});

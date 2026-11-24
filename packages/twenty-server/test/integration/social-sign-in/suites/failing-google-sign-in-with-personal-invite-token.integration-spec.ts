import { randomUUID } from 'crypto';

import { googleIdentityHandlers } from 'test/integration/google/mocks/google-identity-handlers.util';
import { googleTokenHandlers } from 'test/integration/google/mocks/google-token-handlers.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signInWithSocialProvider } from 'test/integration/social-sign-in/utils/sign-in-with-social-provider.util';
import { deleteSsoUser } from 'test/integration/sso/utils/delete-sso-user.util';
import { exchangeLoginToken } from 'test/integration/sso/utils/exchange-login-token.util';
import { expectNotInternalServerErrorSsoRedirectSnapshot } from 'test/integration/sso/utils/expect-not-internal-server-error-sso-redirect-snapshot.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('Google sign-in with a personal invite token should fail', () => {
  const httpMock = setupHttpMock(...googleTokenHandlers());

  const invitedEmail = `invited-${randomUUID()}@example.com`;
  let inviteToken: string;
  let accessToken: string | undefined;

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

  it('when the account is not the invited one and the invite token is missing', async () => {
    httpMock.use(
      ...googleIdentityHandlers(`alias-${randomUUID()}@example.com`),
    );

    const verifyUrl = await signInWithSocialProvider({
      path: '/auth/google',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    expectNotInternalServerErrorSsoRedirectSnapshot(verifyUrl);
    expect(
      await findWorkspaceInvitationsByEmail({ email: invitedEmail }),
    ).toHaveLength(1);
  });

  it('when another account already used the invite token', async () => {
    httpMock.use(
      ...googleIdentityHandlers(`alias-${randomUUID()}@example.com`),
    );

    accessToken = await exchangeLoginToken(
      await signInWithSocialProvider({
        path: '/auth/google',
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        inviteToken,
      }),
    );

    assertIsDefinedOrThrow(accessToken);

    httpMock.use(
      ...googleIdentityHandlers(`alias-${randomUUID()}@example.com`),
    );

    const verifyUrl = await signInWithSocialProvider({
      path: '/auth/google',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      inviteToken,
    });

    expectNotInternalServerErrorSsoRedirectSnapshot(verifyUrl);
  });
});

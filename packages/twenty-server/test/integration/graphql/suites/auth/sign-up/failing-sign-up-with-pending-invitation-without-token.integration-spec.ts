import { randomUUID } from 'node:crypto';

import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getLoginTokenFromCredentials } from 'test/integration/graphql/utils/get-login-token-from-credentials.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { setEmailVerificationRequired } from 'test/integration/graphql/utils/set-email-verification-required.util';
import { signUpInWorkspace } from 'test/integration/graphql/utils/sign-up-in-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PASSWORD = 'Pending-invitation-1';

describe('Joining a workspace with the address of a pending invitation and no invitation token should fail', () => {
  let invitedEmail: string;
  let createdUserAccessToken: string | undefined;

  const signUpWithoutWorkspace = async () => {
    const { data } = await signUp({
      input: { email: invitedEmail, password: PASSWORD },
      expectToFail: false,
    });

    createdUserAccessToken =
      data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;
  };

  beforeAll(() => setEmailVerificationRequired(true));

  afterAll(() => setEmailVerificationRequired(false));

  beforeEach(async () => {
    invitedEmail = `pending-invitation-${randomUUID()}@example.com`;

    await sendInvitations({
      input: { emails: [invitedEmail] },
      expectToFail: false,
    });
  });

  afterEach(async () => {
    if (isDefined(createdUserAccessToken)) {
      await deleteUser({
        accessToken: createdUserAccessToken,
        expectToFail: false,
      });

      createdUserAccessToken = undefined;
    }

    await deleteWorkspaceInvitationsByEmail({ email: invitedEmail });
  });

  it('when signing up in the workspace', async () => {
    const { errors } = await signUpInWorkspace({
      input: {
        email: invitedEmail,
        password: PASSWORD,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when signing up in the workspace with an account that has not verified its email', async () => {
    await signUpWithoutWorkspace();

    const { errors } = await signUpInWorkspace({
      input: {
        email: invitedEmail,
        password: PASSWORD,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when logging in to the workspace with an account that has not verified its email', async () => {
    await signUpWithoutWorkspace();

    const { errors } = await getLoginTokenFromCredentials({
      input: {
        email: invitedEmail,
        password: PASSWORD,
        origin: buildAppleWorkspaceOrigin(),
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});

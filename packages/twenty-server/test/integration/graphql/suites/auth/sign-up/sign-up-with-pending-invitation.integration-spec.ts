import { randomUUID } from 'node:crypto';

import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findCurrentUserAvailableWorkspacesOperationFactory } from 'test/integration/graphql/utils/find-current-user-available-workspaces-operation-factory.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signInOperationFactory } from 'test/integration/graphql/utils/sign-in-operation-factory.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { type AvailableWorkspace } from 'src/engine/core-modules/auth/dto/available-workspaces.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PASSWORD = 'Pending-invitation-1';
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const setEmailVerificationRequired = (value: boolean) =>
  updateConfigVariable({
    input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value },
  });

const signInAvailableWorkspacesForSignUp = async (email: string) => {
  const response = await makeMetadataApiRequest(
    signInOperationFactory({ email, password: PASSWORD }),
    undefined,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.signIn.availableWorkspaces
    .availableWorkspacesForSignUp;
};

describe('signUp with a pending personal invitation (integration)', () => {
  let email: string;
  let inviteToken: string;
  let accessToken: string;
  let signUpAvailableWorkspacesForSignUp: AvailableWorkspace[];

  beforeEach(async () => {
    email = `pending-invite-${randomUUID()}@example.com`;
    inviteToken = `pending-invite-token-${randomUUID()}`;

    await seedWorkspaceInvitation({
      email,
      value: inviteToken,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    });

    const { data } = await signUp({
      input: { email, password: PASSWORD },
      expectToFail: false,
    });

    accessToken = data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;
    signUpAvailableWorkspacesForSignUp =
      data.signUp.availableWorkspaces.availableWorkspacesForSignUp;
  });

  afterEach(async () => {
    await deleteUser({ accessToken, expectToFail: false });
    await deleteWorkspaceInvitationsByEmail({ email });
  });

  describe('when email verification is required', () => {
    beforeAll(() => setEmailVerificationRequired(true));

    afterAll(() => setEmailVerificationRequired(false));

    it('does not list the invitation while the email is unverified', async () => {
      expect(signUpAvailableWorkspacesForSignUp).toEqual([]);

      const currentUserResponse = await makeMetadataApiRequest(
        findCurrentUserAvailableWorkspacesOperationFactory(),
        accessToken,
      );

      expect(currentUserResponse.body.errors).toBeUndefined();
      expect(
        currentUserResponse.body.data.currentUser.availableWorkspaces
          .availableWorkspacesForSignUp,
      ).toEqual([]);
    });

    it('lists the invitation once the email is verified', async () => {
      await testDataSource.query(
        'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
        [email],
      );

      expect(await signInAvailableWorkspacesForSignUp(email)).toEqual([
        { id: SEED_APPLE_WORKSPACE_ID, personalInviteToken: inviteToken },
      ]);
    });

    it('still joins the workspace through the invitation link while unverified', async () => {
      const response = await makeMetadataApiRequest(
        signUpInWorkspaceOperationFactory({
          email,
          password: PASSWORD,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workspacePersonalInviteToken: inviteToken,
        }),
        undefined,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.signUpInWorkspace.workspace.id).toBe(
        SEED_APPLE_WORKSPACE_ID,
      );
      expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(0);
    });
  });

  describe('when email verification is not required', () => {
    it('lists the invitation for an unverified email', async () => {
      expect(signUpAvailableWorkspacesForSignUp).toEqual([
        expect.objectContaining({
          id: SEED_APPLE_WORKSPACE_ID,
          personalInviteToken: inviteToken,
        }),
      ]);
    });
  });
});

import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PASSWORD = 'Pending-invitation-1';
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const signInOperation = (email: string) => ({
  query: gql`
    mutation SignIn($email: String!, $password: String!) {
      signIn(email: $email, password: $password) {
        availableWorkspaces {
          availableWorkspacesForSignUp {
            id
            personalInviteToken
          }
        }
      }
    }
  `,
  variables: { email, password: PASSWORD },
});

const currentUserAvailableWorkspacesOperation = {
  query: gql`
    query CurrentUserAvailableWorkspaces {
      currentUser {
        availableWorkspaces {
          availableWorkspacesForSignUp {
            id
            personalInviteToken
          }
        }
      }
    }
  `,
};

describe('signUp with a pending personal invitation (integration)', () => {
  let email: string;
  let inviteToken: string;
  let accessToken: string;

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

    expect(
      data.signUp.availableWorkspaces.availableWorkspacesForSignUp,
    ).toEqual([]);
  });

  afterEach(async () => {
    await deleteUser({ accessToken, expectToFail: false });
    await deleteWorkspaceInvitationsByEmail({ email });
  });

  it('does not list the invitation while the email is unverified', async () => {
    const signInResponse = await makeMetadataApiRequest(
      signInOperation(email),
      undefined,
    );

    expect(signInResponse.body.errors).toBeUndefined();
    expect(
      signInResponse.body.data.signIn.availableWorkspaces
        .availableWorkspacesForSignUp,
    ).toEqual([]);

    const currentUserResponse = await makeMetadataApiRequest(
      currentUserAvailableWorkspacesOperation,
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

    const signInResponse = await makeMetadataApiRequest(
      signInOperation(email),
      undefined,
    );

    expect(signInResponse.body.errors).toBeUndefined();
    expect(
      signInResponse.body.data.signIn.availableWorkspaces
        .availableWorkspacesForSignUp,
    ).toEqual([
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

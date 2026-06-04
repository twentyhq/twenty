import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUpOperationFactory } from 'test/integration/graphql/utils/sign-up-operation-factory.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('deleteUser', () => {
  it('should not allow to delete user if they are the unique admin of a workspace', async () => {
    const query = {
      query: `
        mutation DeleteUser {
            deleteUser {
                id
            }
        }
      `,
    };

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(query)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toBe(
          'Cannot delete account: user is the unique admin of a workspace',
        );
        expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
  });

  it('should deny deleting another user when caller lacks WORKSPACE_MEMBERS permission', async () => {
    const query = {
      query: `
        mutation DeleteUserFromWorkspace {
          deleteUserFromWorkspace(workspaceMemberIdToDelete: "${WORKSPACE_MEMBER_DATA_SEED_IDS.JANE}") {
            id
          }
        }
      `,
    };

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
      .send(query)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
  });

  it('should soft delete user and remove workspace relations when deleting a user in their only workspace', async () => {
    // 1.  Arrange
    // Enable public invite link to allow sign up without personal token
    const enablePublicInviteLinkMutation = {
      query: `
        mutation updateWorkspace {
          updateWorkspace(data: { isPublicInviteLinkEnabled: true }) {
            id
            isPublicInviteLinkEnabled
          }
        }
      `,
    };

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(enablePublicInviteLinkMutation)
      .expect(200)
      .expect((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.updateWorkspace.isPublicInviteLinkEnabled).toBe(
          true,
        );
      });

    // Sign up a new user into the current workspace via public invite link
    const testEmail = `test_user_${Date.now()}@example.com`;
    const signUpMutation = signUpOperationFactory({
      email: testEmail,
      password: 'Password123!',
    });

    const signUpResponse = await client.post('/metadata').send(signUpMutation);

    expect(signUpResponse.status).toBe(200);
    expect(signUpResponse.body.errors).toBeUndefined();

    // Query workspace members and find the created user by email to get workspaceMemberId
    const newWorkspaceMemberQuery = {
      query: `
        query WorkspaceMember($workspaceMemberFilter: WorkspaceMemberFilterInput!) {
          workspaceMember(filter: $workspaceMemberFilter) {
          id
            userId
          }
        }
      `,
      variables: {
        workspaceMemberFilter: {
          userEmail: {
            eq: testEmail,
          },
        },
      },
    } as const;

    const newMemberResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(newWorkspaceMemberQuery);

    expect(newMemberResponse.status).toBe(200);

    const createdMember = newMemberResponse.body.data.workspaceMember;

    expect(createdMember).toBeDefined();
    const createdWorkspaceMemberId = createdMember.id;

    // 2. Act
    const deleteUserFromWorkspaceMutation = {
      query: `
        mutation DeleteUserFromWorkspace {
          deleteUserFromWorkspace(workspaceMemberIdToDelete: "${createdWorkspaceMemberId}") {
            id
          }
        }
      `,
    };

    const deleteResponse = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteUserFromWorkspaceMutation);

    expect(deleteResponse.status).toBe(200);

    expect(deleteResponse.body.errors).toBeUndefined();

    // 3. Assert
    const membersAfterDeletionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(newWorkspaceMemberQuery);

    const createdMemberAfterDeletion =
      membersAfterDeletionResponse.body.data.workspaceMember;

    expect(createdMemberAfterDeletion).toBeNull();

    const getRolesWithMembersQuery = {
      query: `
        query GetRoles {
          getRoles { id label workspaceMembers { id } }
        }
      `,
    };

    const rolesResponse = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(getRolesWithMembersQuery);

    expect(rolesResponse.status).toBe(200);

    expect(rolesResponse.body.errors).toBeUndefined();
    const roles = rolesResponse.body.data.getRoles as Array<{
      id: string;
      workspaceMembers: Array<{ id: string }>;
    }>;

    for (const role of roles) {
      expect(
        role.workspaceMembers.find((wm) => wm.id === createdWorkspaceMemberId),
      ).toBeUndefined();
    }
  });
});

describe('updateUserEmail', () => {
  let newUserAccessToken: string | undefined;

  afterEach(async () => {
    if (newUserAccessToken) {
      await deleteUser({
        accessToken: newUserAccessToken,
        expectToFail: false,
      });
      newUserAccessToken = undefined;
    }
  });

  it('should update email directly when IS_EMAIL_VERIFICATION_REQUIRED is false', async () => {
    const originalEmail = `update-email-no-verif-${randomUUID()}@example.com`;
    const updatedEmail = `updated-${randomUUID()}@example.com`;

    newUserAccessToken =
      await signUpInWorkspaceAndGetAccessToken(originalEmail);

    const updateEmailMutation = gql`
      mutation UpdateUserEmail($newEmail: String!) {
        updateUserEmail(newEmail: $newEmail)
      }
    `;

    const updateResponse = await makeMetadataAPIRequest(
      {
        query: updateEmailMutation,
        variables: { newEmail: updatedEmail },
      },
      newUserAccessToken,
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateUserEmail).toBe(true);

    const { data } = await getCurrentUser({
      accessToken: newUserAccessToken,
      expectToFail: false,
    });

    expect(data.currentUser.email).toBe(updatedEmail);
  });

  it('should not update email immediately when IS_EMAIL_VERIFICATION_REQUIRED is true', async () => {
    const originalEmail = `update-email-with-verif-${randomUUID()}@example.com`;
    const updatedEmail = `updated-verif-${randomUUID()}@example.com`;

    newUserAccessToken =
      await signUpInWorkspaceAndGetAccessToken(originalEmail);

    await updateConfigVariable({
      input: {
        key: 'IS_EMAIL_VERIFICATION_REQUIRED',
        value: true,
      },
    });

    try {
      const updateEmailMutation = gql`
        mutation UpdateUserEmail($newEmail: String!) {
          updateUserEmail(newEmail: $newEmail)
        }
      `;

      const updateResponse = await makeMetadataAPIRequest(
        {
          query: updateEmailMutation,
          variables: { newEmail: updatedEmail },
        },
        newUserAccessToken,
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.errors).toBeUndefined();
      expect(updateResponse.body.data.updateUserEmail).toBe(true);

      // Email should remain unchanged — verification email was sent but not confirmed
      const { data } = await getCurrentUser({
        accessToken: newUserAccessToken,
        expectToFail: false,
      });

      expect(data.currentUser.email).toBe(originalEmail);
    } finally {
      await updateConfigVariable({
        input: {
          key: 'IS_EMAIL_VERIFICATION_REQUIRED',
          value: false,
        },
      });
    }
  });
});

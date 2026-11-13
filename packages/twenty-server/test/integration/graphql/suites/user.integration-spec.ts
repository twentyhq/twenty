import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { deleteCurrentWorkspace } from 'test/integration/graphql/utils/delete-current-workspace.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUpOperationFactory } from 'test/integration/graphql/utils/sign-up-operation-factory.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createPermissionTestActiveWorkspace } from 'test/integration/permissions/utils/create-permission-test-active-workspace.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { In, Not } from 'typeorm';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { PermissionsExceptionMessage } from 'src/engine/permissions/permissions.exception';
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

    const getRolesWithMembersQuery = {
      query: `
        query GetRoles {
          getRoles { id label workspaceMembers { id } }
        }
      `,
    };

    // Primes the memoized member cache, so a missed invalidation on join would hide the new member
    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(getRolesWithMembersQuery)
      .expect(200)
      .expect((res) => {
        expect(res.body.errors).toBeUndefined();
      });

    const testEmail = `test_user_${Date.now()}@example.com`;
    const signUpMutation = signUpOperationFactory({
      email: testEmail,
      password: 'Password123!',
    });

    const signUpResponse = await client.post('/metadata').send(signUpMutation);

    expect(signUpResponse.status).toBe(200);
    expect(signUpResponse.body.errors).toBeUndefined();

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

    const rolesAfterJoinResponse = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(getRolesWithMembersQuery);

    expect(rolesAfterJoinResponse.body.errors).toBeUndefined();
    expect(
      (
        rolesAfterJoinResponse.body.data.getRoles as Array<{
          workspaceMembers: Array<{ id: string }>;
        }>
      ).some((role) =>
        role.workspaceMembers.some(
          (workspaceMember) => workspaceMember.id === createdWorkspaceMemberId,
        ),
      ),
    ).toBe(true);

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

    const membersAfterDeletionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(newWorkspaceMemberQuery);

    const createdMemberAfterDeletion =
      membersAfterDeletionResponse.body.data.workspaceMember;

    expect(createdMemberAfterDeletion).toBeNull();

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

describe('last server admin removal', () => {
  let serverAdmin: {
    id: string;
    workspaceMemberId: string;
    accessToken: string;
  };
  let demotedServerAdminIds: string[] = [];

  const setCanAccessFullAdminPanel = async ({
    userIds,
    canAccessFullAdminPanel,
  }: {
    userIds: string[];
    canAccessFullAdminPanel: boolean;
  }) => {
    await getCoreRepository<UserEntity>(UserEntity).update(
      { id: In(userIds) },
      { canAccessFullAdminPanel },
    );

    const coreEntityCacheService =
      getAppProviderByClassName<CoreEntityCacheService>(
        'CoreEntityCacheService',
      );

    await Promise.all(
      userIds.map((userId) =>
        coreEntityCacheService.invalidate('user', userId),
      ),
    );
  };

  const promoteToServerAdmin = async (accessToken: string) => {
    const { data } = await currentUser({
      token: accessToken,
      gqlFields: 'id workspaceMember { id }',
      expectToFail: false,
    });

    const { id, workspaceMember } = data.currentUser;

    await setCanAccessFullAdminPanel({
      userIds: [id],
      canAccessFullAdminPanel: true,
    });

    return { id, workspaceMemberId: workspaceMember.id, accessToken };
  };

  const demoteOtherServerAdmins = async () => {
    const otherServerAdmins = await getCoreRepository<UserEntity>(
      UserEntity,
    ).find({
      select: { id: true },
      where: { id: Not(serverAdmin.id), canAccessFullAdminPanel: true },
    });

    demotedServerAdminIds = otherServerAdmins.map(({ id }) => id);

    await setCanAccessFullAdminPanel({
      userIds: demotedServerAdminIds,
      canAccessFullAdminPanel: false,
    });
  };

  const isServerAdminActive = () =>
    getCoreRepository<UserEntity>(UserEntity).exists({
      where: { id: serverAdmin.id },
    });

  afterEach(async () => {
    await setCanAccessFullAdminPanel({
      userIds: demotedServerAdminIds,
      canAccessFullAdminPanel: true,
    });

    demotedServerAdminIds = [];

    if (await isServerAdminActive()) {
      await deleteUser({
        accessToken: serverAdmin.accessToken,
        expectToFail: false,
      });
    }
  });

  describe('in a shared workspace', () => {
    beforeEach(async () => {
      serverAdmin = await promoteToServerAdmin(
        await signUpInWorkspaceAndGetAccessToken(
          `last-server-admin-${randomUUID()}@example.com`,
        ),
      );
    });

    describe('when no other server admin is left', () => {
      beforeEach(demoteOtherServerAdmins);

      it('should not allow removing their member from their only workspace', async () => {
        const { data, errors } = await deleteUserFromWorkspace({
          input: { workspaceMemberIdToDelete: serverAdmin.workspaceMemberId },
          expectToFail: true,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        expect(data).toBeNull();
        expect(errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_DELETE_LAST_SERVER_ADMIN,
        );
        expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
        expect(await isServerAdminActive()).toBe(true);
      });

      it('should not allow deleting their account', async () => {
        const { data, errors } = await deleteUser({
          accessToken: serverAdmin.accessToken,
          expectToFail: true,
        });

        expect(data).toBeNull();
        expect(errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_DELETE_LAST_SERVER_ADMIN,
        );
        expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
        expect(await isServerAdminActive()).toBe(true);
      });
    });

    it('should remove their member from their only workspace when another server admin is left', async () => {
      const { errors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: serverAdmin.workspaceMemberId },
        expectToFail: false,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(errors).toBeUndefined();
      expect(await isServerAdminActive()).toBe(false);
    });
  });

  describe('as the only member of their workspace', () => {
    beforeEach(async () => {
      const { adminAccessToken } = await createPermissionTestActiveWorkspace();

      serverAdmin = await promoteToServerAdmin(adminAccessToken);
    });

    describe('when no other server admin is left', () => {
      beforeEach(demoteOtherServerAdmins);

      it('should not allow deleting their workspace', async () => {
        const { data, errors } = await deleteCurrentWorkspace({
          accessToken: serverAdmin.accessToken,
          expectToFail: true,
        });

        expect(data).toBeNull();
        expect(errors[0].message).toBe(
          PermissionsExceptionMessage.CANNOT_DELETE_LAST_SERVER_ADMIN,
        );
        expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
        expect(await isServerAdminActive()).toBe(true);
      });
    });

    it('should delete their workspace when another server admin is left', async () => {
      const { errors } = await deleteCurrentWorkspace({
        accessToken: serverAdmin.accessToken,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(await isServerAdminActive()).toBe(false);
    });
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

    const updateResponse = await makeMetadataApiRequest(
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

      const updateResponse = await makeMetadataApiRequest(
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

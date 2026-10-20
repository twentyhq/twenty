import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Role deletion should succeed', () => {
  it('should successfully delete a custom editable role', async () => {
    const { data: createData, errors: createErrors } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Deletable Custom Role',
        description: 'A custom role that can be deleted',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    expect(createErrors).toBeUndefined();
    expect(createData.createOneRole.id).toBeDefined();

    const customRoleId = createData.createOneRole.id;

    const { data, errors } = await deleteOneRole({
      expectToFail: false,
      input: {
        idToDelete: customRoleId,
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.deleteOneRole).toBe(customRoleId);
  });

  it('should delete a custom role and verify it can no longer be found', async () => {
    const testLabel = 'Role To Be Deleted And Verified';

    const { data: createData } = await createOneRole({
      expectToFail: false,
      input: {
        label: testLabel,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    const roleId = createData.createOneRole.id;

    const roleBefore = await findOneRoleByLabel({ label: testLabel });

    expect(roleBefore).toBeDefined();
    expect(roleBefore.id).toBe(roleId);

    const { data, errors } = await deleteOneRole({
      expectToFail: false,
      input: {
        idToDelete: roleId,
      },
    });

    expect(errors).toBeUndefined();
    expect(data.deleteOneRole).toBe(roleId);

    await expect(findOneRoleByLabel({ label: testLabel })).rejects.toThrow(
      `Role with label "${testLabel}" not found`,
    );
  });

  it('should delete a custom role right after removing its assigned member', async () => {
    const { data: workspaceData } = await currentUser({
      gqlFields: 'currentWorkspace { isPublicInviteLinkEnabled }',
    });
    const initialIsPublicInviteLinkEnabled =
      workspaceData.currentUser.currentWorkspace?.isPublicInviteLinkEnabled;

    try {
      const memberToken = await signUpInWorkspaceAndGetAccessToken(
        `role-deletion-${randomUUID()}@example.com`,
      );
      const { data: memberData } = await currentUser({
        token: memberToken,
        gqlFields: 'workspaceMember { id }',
      });
      const workspaceMemberId = memberData.currentUser.workspaceMember.id;

      const { data: createData } = await createOneRole({
        input: {
          label: `Removed member role ${randomUUID()}`,
          canBeAssignedToUsers: true,
        },
      });
      const roleId = createData.createOneRole.id;

      await updateWorkspaceMemberRole({
        input: { workspaceMemberId, roleId },
      });

      const { errors: removalErrors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: workspaceMemberId },
      });

      expect(removalErrors).toBeUndefined();

      const { data, errors } = await deleteOneRole({
        input: { idToDelete: roleId },
      });

      expect(errors).toBeUndefined();
      expect(data.deleteOneRole).toBe(roleId);
    } finally {
      await updateWorkspace({
        data: { isPublicInviteLinkEnabled: initialIsPublicInviteLinkEnabled },
      });
    }
  });
});

describe('Role deletion with targets still assigned', () => {
  let memberRoleId: string;
  let roleId: string;
  let apiKeyId: string;

  const findJonyRoleTargets = (): Promise<{ roleId: string }[]> =>
    global.testDataSource.query(
      `SELECT "roleId" FROM core."roleTarget" WHERE "userWorkspaceId" = $1`,
      [USER_WORKSPACE_DATA_SEED_IDS.JONY],
    );

  beforeAll(async () => {
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data: createData } = await createOneRole({
      expectToFail: false,
      input: {
        label: `Role with targets ${randomUUID()}`,
        canBeAssignedToUsers: true,
        canBeAssignedToApiKeys: true,
      },
    });

    roleId = createData.createOneRole.id;

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, roleId },
    });

    const apiKeyResponse = await makeMetadataApiRequest({
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: 'Role deletion API key',
          expiresAt: '2099-12-31T23:59:59Z',
          roleId,
        },
      },
    });

    apiKeyId = apiKeyResponse.body.data.createApiKey.id;
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: memberRoleId,
      },
    });

    await global.testDataSource.query(
      'DELETE FROM core."apiKey" WHERE id = $1',
      [apiKeyId],
    );
  });

  it('should refuse the deletion without moving any target when one cannot move to the default role', async () => {
    const { errors } = await deleteOneRole({
      expectToFail: true,
      input: { idToDelete: roleId },
    });

    expect(
      errors?.[0]?.extensions?.errors?.roleTarget?.[0]?.errors?.[0]?.code,
    ).toBe(RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY);
    expect(await findJonyRoleTargets()).toEqual([{ roleId }]);
  });

  it('should move members to the default role once the blocking API key is revoked', async () => {
    const revokeResponse = await makeMetadataApiRequest({
      query: gql`
        mutation RevokeApiKey($input: RevokeApiKeyInput!) {
          revokeApiKey(input: $input) {
            id
          }
        }
      `,
      variables: { input: { id: apiKeyId } },
    });

    expect(revokeResponse.body.errors).toBeUndefined();

    const { data, errors } = await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: roleId },
    });

    expect(errors).toBeUndefined();
    expect(data.deleteOneRole).toBe(roleId);
    expect(await findJonyRoleTargets()).toEqual([{ roleId: memberRoleId }]);
  });
});

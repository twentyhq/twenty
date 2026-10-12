import { randomUUID } from 'crypto';

import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';

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

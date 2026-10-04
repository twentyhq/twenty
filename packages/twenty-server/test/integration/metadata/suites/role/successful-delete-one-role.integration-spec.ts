import { randomUUID } from 'crypto';

import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

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

  it('should delete a custom role immediately after removing its accepted member', async () => {
    const { data: workspaceData } = await currentUser({
      gqlFields: 'currentWorkspace { isPublicInviteLinkEnabled }',
    });
    const initialPublicInviteLinkEnabled =
      workspaceData.currentUser.currentWorkspace?.isPublicInviteLinkEnabled;

    jestExpectToBeDefined(initialPublicInviteLinkEnabled);

    let workspaceMemberId: string | undefined;
    let roleId: string | undefined;

    try {
      const token = await signUpInWorkspaceAndGetAccessToken(
        `role-deletion-${randomUUID()}@example.com`,
      );
      const { data: memberData } = await currentUser({
        token,
        gqlFields: 'workspaceMember { id }',
      });

      workspaceMemberId = memberData.currentUser.workspaceMember.id;

      const roleLabel = `Removed member role ${randomUUID()}`;
      const { data: createData } = await createOneRole({
        input: { label: roleLabel, canBeAssignedToUsers: true },
      });

      roleId = createData.createOneRole.id;
      await updateWorkspaceMemberRole({
        input: { workspaceMemberId, roleId },
      });

      // Warm the assignment cache so removal must invalidate it.
      const roleBeforeRemoval = await findOneRoleByLabel({
        label: roleLabel,
        gqlFields: 'id label workspaceMembers { id }',
      });

      expect(roleBeforeRemoval.workspaceMembers).toEqual([
        expect.objectContaining({ id: workspaceMemberId }),
      ]);

      const { errors: removalErrors } = await deleteUserFromWorkspace({
        input: { workspaceMemberIdToDelete: workspaceMemberId },
      });

      expect(removalErrors).toBeUndefined();
      workspaceMemberId = undefined;

      const { data, errors } = await deleteOneRole({
        input: { idToDelete: roleId },
      });

      expect(errors).toBeUndefined();
      expect(data.deleteOneRole).toBe(roleId);
      roleId = undefined;
    } finally {
      try {
        if (workspaceMemberId) {
          await deleteUserFromWorkspace({
            input: { workspaceMemberIdToDelete: workspaceMemberId },
          });
        }
        if (roleId) {
          await deleteOneRole({ input: { idToDelete: roleId } });
        }
      } finally {
        await updateWorkspace({
          data: { isPublicInviteLinkEnabled: initialPublicInviteLinkEnabled },
        });
      }
    }
  });
});

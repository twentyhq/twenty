import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type RoleTargetRow = {
  id: string;
  roleId: string;
};

const findJonyRoleTargets = (): Promise<RoleTargetRow[]> =>
  global.testDataSource.query(
    `SELECT id, "roleId" FROM core."roleTarget"
     WHERE "userWorkspaceId" = $1 AND "workspaceId" = $2`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY, SEED_APPLE_WORKSPACE_ID],
  );

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

  it('should rebind the members of the deleted role to the workspace default role in place', async () => {
    const [originalJonyRoleTarget] = await findJonyRoleTargets();

    const [{ defaultRoleId }] = await global.testDataSource.query(
      `SELECT "defaultRoleId" FROM core."workspace" WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    const { data: createData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Role Deleted While Assigned To A Member',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
      },
    });

    const roleId = createData.createOneRole.id;

    try {
      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId,
        },
      });

      const [jonyRoleTargetBeforeDeletion] = await findJonyRoleTargets();

      expect(jonyRoleTargetBeforeDeletion.roleId).toBe(roleId);

      const { errors } = await deleteOneRole({
        expectToFail: false,
        input: {
          idToDelete: roleId,
        },
      });

      expect(errors).toBeUndefined();
      expect(await findJonyRoleTargets()).toEqual([
        { id: jonyRoleTargetBeforeDeletion.id, roleId: defaultRoleId },
      ]);
    } finally {
      await updateWorkspaceMemberRole({
        expectToFail: false,
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: originalJonyRoleTarget.roleId,
        },
      });
    }
  });
});

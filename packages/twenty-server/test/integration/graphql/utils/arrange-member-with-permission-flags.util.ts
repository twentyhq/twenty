import { createRoleWithPermissionFlags } from 'test/integration/metadata/suites/role/utils/create-role-with-permission-flags.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { type PermissionFlagType } from 'twenty-shared/constants';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

// Moves the seeded member Jony onto a role holding exactly these flags, and
// back onto the role he had when cleaned up.
export const arrangeMemberWithPermissionFlags = async ({
  permissionFlagKeys,
}: {
  permissionFlagKeys: PermissionFlagType[];
}): Promise<{ token: string; cleanup: () => Promise<void> }> => {
  const [{ roleId: previousRoleId }] = await globalThis.testDataSource.query(
    `SELECT "roleId" FROM core."roleTarget"
     WHERE "userWorkspaceId" = $1 AND "workspaceId" = $2`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY, SEED_APPLE_WORKSPACE_ID],
  );

  const roleId = await createRoleWithPermissionFlags({ permissionFlagKeys });

  const cleanup = async () => {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: previousRoleId,
      },
      expectToFail: false,
    });
    await deleteOneRole({ input: { idToDelete: roleId }, expectToFail: false });
  };

  try {
    await updateWorkspaceMemberRole({
      input: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, roleId },
      expectToFail: false,
    });
  } catch (error) {
    await cleanup();

    throw error;
  }

  return { token: APPLE_JONY_MEMBER_ACCESS_TOKEN, cleanup };
};

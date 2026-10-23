import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

export type RolesPermissionHolderSetup = {
  rolesPermissionRoleId: string;
  originalMemberRoleId: string;
};

export const setupRolesPermissionHolder = async ({
  label,
}: {
  label: string;
}): Promise<RolesPermissionHolderSetup> => {
  const memberRole = await findOneRoleByLabel({ label: 'Member' });

  const { data: roleData } = await createOneRole({
    expectToFail: false,
    input: {
      label,
      description: 'Role granting the roles settings permission only',
      icon: 'IconSettings',
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
    },
  });

  const rolesPermissionRoleId = roleData?.createOneRole?.id;

  jestExpectToBeDefined(rolesPermissionRoleId);

  await upsertPermissionFlags({
    expectToFail: false,
    input: {
      roleId: rolesPermissionRoleId,
      permissionFlagKeys: [PermissionFlagType.ROLES],
    },
  });

  await updateWorkspaceMemberRole({
    input: {
      roleId: rolesPermissionRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
    expectToFail: false,
  });

  return { rolesPermissionRoleId, originalMemberRoleId: memberRole.id };
};

export const cleanupRolesPermissionHolder = async (
  setup: Partial<RolesPermissionHolderSetup> = {},
): Promise<void> => {
  if (isDefined(setup.originalMemberRoleId)) {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: setup.originalMemberRoleId,
      },
      expectToFail: false,
    });
  }

  if (isDefined(setup.rolesPermissionRoleId)) {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: setup.rolesPermissionRoleId },
    });
  }
};

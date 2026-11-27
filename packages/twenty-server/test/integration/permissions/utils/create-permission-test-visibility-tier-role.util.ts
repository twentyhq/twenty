import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { type PermissionTestWorkspace } from 'test/integration/permissions/utils/permission-test-workspace.type';
import { upsertPermissionTestVisibilityTierRule } from 'test/integration/permissions/utils/upsert-permission-test-visibility-tier-rule.util';

export const createPermissionTestVisibilityTierRole = async ({
  workspace,
  label,
  ruleId,
  visibilityTiers,
}: {
  workspace: Pick<
    PermissionTestWorkspace,
    'objectMetadataId' | 'visibilityTierFieldMetadataId' | 'adminAccessToken'
  >;
  label: string;
  ruleId: string;
  visibilityTiers: string[];
}): Promise<string> => {
  const { data } = await createOneRole({
    input: {
      label,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: true,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: workspace.adminAccessToken,
  });
  const roleId: string = data.createOneRole.id;

  await revokeObjectRecordsPermissions({
    roleId,
    objectMetadataId: workspace.objectMetadataId,
    token: workspace.adminAccessToken,
  });
  await upsertPermissionTestVisibilityTierRule({
    workspace,
    roleId,
    ruleId,
    visibilityTiers,
  });

  return roleId;
};

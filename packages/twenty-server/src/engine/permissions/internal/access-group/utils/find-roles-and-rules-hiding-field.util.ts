/* @license Enterprise */

import { isFieldHiddenFromRole } from 'src/engine/permissions/internal/related-record-path/utils/is-field-hidden-from-role.util';
import { isFieldHiddenFromRule } from 'src/engine/permissions/internal/related-record-path/utils/is-field-hidden-from-rule.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findRolesAndRulesHidingField = ({
  rolesPermissions,
  objectMetadataId,
  fieldMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  objectMetadataId: string;
  fieldMetadataId: string;
}): { roleIds: string[]; ruleIds: string[] } => {
  const rolesPermissionsEntries = Object.entries(rolesPermissions);

  return {
    roleIds: rolesPermissionsEntries
      .filter(([, roleRecordsPermissions]) =>
        isFieldHiddenFromRole({
          roleRecordsPermissions,
          objectMetadataId,
          fieldMetadataId,
        }),
      )
      .map(([roleId]) => roleId),
    ruleIds: rolesPermissionsEntries.flatMap(([, roleRecordsPermissions]) =>
      (
        roleRecordsPermissions.objects[objectMetadataId]
          ?.rowLevelRecordsPermissions ?? []
      )
        .filter((rowLevelRecordsPermissions) =>
          isFieldHiddenFromRule({
            rowLevelRecordsPermissions,
            fieldMetadataId,
          }),
        )
        .map(({ ruleId }) => ruleId),
    ),
  };
};

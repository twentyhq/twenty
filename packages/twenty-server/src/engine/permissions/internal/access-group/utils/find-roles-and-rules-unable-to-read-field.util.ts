/* @license Enterprise */

import { isFieldUnreadableByRole } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-role.util';
import { isFieldUnreadableByRule } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-rule.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findRolesAndRulesUnableToReadField = ({
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
        isFieldUnreadableByRole({
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
          isFieldUnreadableByRule({
            rowLevelRecordsPermissions,
            fieldMetadataId,
          }),
        )
        .map(({ ruleId }) => ruleId),
    ),
  };
};

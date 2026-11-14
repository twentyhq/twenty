/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// a record reached by a rule that hides a relation gives no access to what hangs from that relation
export const omitRlsRulesHidingRelationField = ({
  rolesPermissions,
  roleIds,
  objectMetadataId,
  relationFieldMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  roleIds: string[];
  objectMetadataId: string;
  relationFieldMetadataId: string;
}): Record<string, RoleRecordsPermissions> => {
  const nextRolesPermissions = { ...rolesPermissions };

  for (const roleId of roleIds) {
    const roleRecordsPermissions = rolesPermissions[roleId];
    const objectRecordsPermissions =
      roleRecordsPermissions?.objects[objectMetadataId];
    const rowLevelRecordsPermissions =
      objectRecordsPermissions?.rowLevelRecordsPermissions;

    if (
      !isDefined(roleRecordsPermissions) ||
      !isDefined(objectRecordsPermissions) ||
      !isDefined(rowLevelRecordsPermissions) ||
      !rowLevelRecordsPermissions.some(({ unreadableFields }) =>
        unreadableFields.includes(relationFieldMetadataId),
      )
    ) {
      continue;
    }

    nextRolesPermissions[roleId] = {
      ...roleRecordsPermissions,
      objects: {
        ...roleRecordsPermissions.objects,
        [objectMetadataId]: {
          ...objectRecordsPermissions,
          rowLevelRecordsPermissions: rowLevelRecordsPermissions.filter(
            ({ unreadableFields }) =>
              !unreadableFields.includes(relationFieldMetadataId),
          ),
        },
      },
    };
  }

  return nextRolesPermissions;
};

/* @license Enterprise */

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findRoleIdsHidingField = ({
  rolesPermissions,
  objectMetadataId,
  fieldMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  objectMetadataId: string;
  fieldMetadataId: string;
}): string[] =>
  Object.entries(rolesPermissions)
    .filter(([, roleRecordsPermissions]) =>
      (
        roleRecordsPermissions.objects[objectMetadataId]?.unreadableFields ?? []
      ).includes(fieldMetadataId),
    )
    .map(([roleId]) => roleId);

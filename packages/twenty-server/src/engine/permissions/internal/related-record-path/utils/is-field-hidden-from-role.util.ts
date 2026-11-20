/* @license Enterprise */

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const isFieldHiddenFromRole = ({
  roleRecordsPermissions,
  objectMetadataId,
  fieldMetadataId,
}: {
  roleRecordsPermissions: RoleRecordsPermissions;
  objectMetadataId: string;
  fieldMetadataId: string;
}): boolean =>
  (
    roleRecordsPermissions.objects[objectMetadataId]?.unreadableFields ?? []
  ).includes(fieldMetadataId);

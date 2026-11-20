/* @license Enterprise */

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const isFieldUnreadableByRole = ({
  roleRecordsPermissions,
  objectMetadataId,
  fieldMetadataId,
}: {
  roleRecordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  objectMetadataId: string;
  fieldMetadataId: string;
}): boolean =>
  (
    roleRecordsPermissions.objects[objectMetadataId]?.unreadableFields ?? []
  ).includes(fieldMetadataId);

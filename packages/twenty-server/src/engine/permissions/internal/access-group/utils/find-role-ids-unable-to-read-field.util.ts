/* @license Enterprise */

import { isFieldUnreadableByRole } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-role.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findRoleIdsUnableToReadField = ({
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
      isFieldUnreadableByRole({
        roleRecordsPermissions,
        objectMetadataId,
        fieldMetadataId,
      }),
    )
    .map(([roleId]) => roleId);

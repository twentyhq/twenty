/* @license Enterprise */

import { isFieldHiddenFromRole } from 'src/engine/permissions/internal/related-record-path/utils/is-field-hidden-from-role.util';
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
      isFieldHiddenFromRole({
        roleRecordsPermissions,
        objectMetadataId,
        fieldMetadataId,
      }),
    )
    .map(([roleId]) => roleId);

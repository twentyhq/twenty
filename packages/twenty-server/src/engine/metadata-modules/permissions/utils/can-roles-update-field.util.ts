import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';

// Same rule the attach step enforces: every role in the intersection must be
// allowed to update the object, system objects included through the ORM
// exemption, and no role may restrict updates on the field.
export const canRolesUpdateField = ({
  roleIds,
  rolesPermissions,
  objectMetadata,
  fieldMetadataId,
}: {
  roleIds: string[];
  rolesPermissions: ObjectsPermissionsByRoleId;
  objectMetadata: FlatObjectMetadata;
  fieldMetadataId: string;
}): boolean => {
  if (!isNonEmptyArray(roleIds)) {
    return false;
  }

  const objectsPermissions = getObjectsPermissionsFromRolePermissionConfig({
    rolesPermissions,
    rolePermissionConfig: { intersectionOf: roleIds },
  });

  return (
    isObjectOperationPermitted({
      objectMetadata,
      operationType: 'update',
      objectsPermissions,
    }) &&
    objectsPermissions[objectMetadata.id]?.restrictedFields[fieldMetadataId]
      ?.canUpdate !== false
  );
};

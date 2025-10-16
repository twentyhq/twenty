import {
  type ObjectsPermissionsDeprecated,
  type RestrictedFieldPermissions,
} from 'twenty-shared/types';

export const computePermissionIntersection = (
  permissionsArray: ObjectsPermissionsDeprecated[],
): ObjectsPermissionsDeprecated => {
  if (permissionsArray.length === 0) {
    return {};
  }

  if (permissionsArray.length === 1) {
    return permissionsArray[0];
  }

  const result: ObjectsPermissionsDeprecated = {};

  const allObjectMetadataIds = new Set<string>();

  for (const permissions of permissionsArray) {
    for (const id of Object.keys(permissions)) {
      allObjectMetadataIds.add(id);
    }
  }

  for (const objectMetadataId of allObjectMetadataIds) {
    let canRead = true;
    let canUpdate = true;
    let canSoftDelete = true;
    let canDestroy = true;
    const restrictedFields: Record<string, RestrictedFieldPermissions> = {};

    for (const permissions of permissionsArray) {
      const objPerm = permissions[objectMetadataId];

      if (!objPerm) {
        canRead = false;
        canUpdate = false;
        canSoftDelete = false;
        canDestroy = false;
        continue;
      }

      canRead = canRead && objPerm.canRead === true;
      canUpdate = canUpdate && objPerm.canUpdate === true;
      canSoftDelete = canSoftDelete && objPerm.canSoftDelete === true;
      canDestroy = canDestroy && objPerm.canDestroy === true;

      if (objPerm.restrictedFields) {
        for (const [fieldName, fieldPerm] of Object.entries(
          objPerm.restrictedFields,
        )) {
          if (!restrictedFields[fieldName]) {
            restrictedFields[fieldName] = {
              canRead: null,
              canUpdate: null,
            };
          }

          const current = restrictedFields[fieldName];

          restrictedFields[fieldName] = {
            canRead:
              current.canRead === false || fieldPerm.canRead === false
                ? false
                : null,
            canUpdate:
              current.canUpdate === false || fieldPerm.canUpdate === false
                ? false
                : null,
          };
        }
      }
    }

    result[objectMetadataId] = {
      canRead,
      canUpdate,
      canSoftDelete,
      canDestroy,
      restrictedFields,
    };
  }

  return result;
};

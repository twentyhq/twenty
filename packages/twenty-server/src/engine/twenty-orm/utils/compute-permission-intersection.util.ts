import {
  type ObjectsPermissions,
  type RestrictedFieldPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';

export const computePermissionIntersection = (
  permissionsArray: ObjectsPermissions[],
): ObjectsPermissions => {
  if (permissionsArray.length === 0) {
    return {};
  }

  if (permissionsArray.length === 1) {
    return permissionsArray[0];
  }

  const result: ObjectsPermissions = {};

  const allObjectMetadataIds = new Set<string>();

  for (const permissions of permissionsArray) {
    for (const id of Object.keys(permissions)) {
      allObjectMetadataIds.add(id);
    }
  }

  for (const objectMetadataId of allObjectMetadataIds) {
    let canReadObjectRecords = true;
    let canUpdateObjectRecords = true;
    let canSoftDeleteObjectRecords = true;
    let canDestroyObjectRecords = true;
    const restrictedFields: Record<string, RestrictedFieldPermissions> = {};
    const rowLevelPermissionPredicates: RowLevelPermissionPredicate[] = [];
    const rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroup[] =
      [];

    for (const permissions of permissionsArray) {
      const objPerm = permissions[objectMetadataId];

      if (!objPerm) {
        canReadObjectRecords = false;
        canUpdateObjectRecords = false;
        canSoftDeleteObjectRecords = false;
        canDestroyObjectRecords = false;
        continue;
      }

      canReadObjectRecords =
        canReadObjectRecords && objPerm.canReadObjectRecords === true;
      canUpdateObjectRecords =
        canUpdateObjectRecords && objPerm.canUpdateObjectRecords === true;
      canSoftDeleteObjectRecords =
        canSoftDeleteObjectRecords &&
        objPerm.canSoftDeleteObjectRecords === true;
      canDestroyObjectRecords =
        canDestroyObjectRecords && objPerm.canDestroyObjectRecords === true;

      // Kept from every role rather than discarded. Callers use these to ask
      // which fields a row-level rule constrains, so a rule from any role has
      // to be visible. Enforcement does not read them: it compiles each role's
      // predicates separately and ANDs the results, which is why concatenating
      // here cannot produce a misleading combined tree.
      rowLevelPermissionPredicates.push(
        ...objPerm.rowLevelPermissionPredicates,
      );
      rowLevelPermissionPredicateGroups.push(
        ...objPerm.rowLevelPermissionPredicateGroups,
      );

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
      canReadObjectRecords,
      canUpdateObjectRecords,
      canSoftDeleteObjectRecords,
      canDestroyObjectRecords,
      restrictedFields,
      rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroups,
    };
  }

  return result;
};

import {
  type ObjectsPermissions,
  type RestrictedFieldPermissions,
  type RowLevelPermissionPredicate,
} from 'twenty-shared/types';

// An intersection has no combined predicate tree to expose: enforcement
// compiles each role's rules on its own and ANDs the results. What it can
// state is which fields every role constrains, which is what the insert guard
// reads to excuse a field-update deny the role's own rule forced. Keeping a
// field constrained by only one role would let that role's rule cancel another
// role's deny, so only fields common to all of them survive.
const intersectRowLevelPermissionPredicates = (
  rowLevelPermissionPredicatesPerRole: RowLevelPermissionPredicate[][],
): RowLevelPermissionPredicate[] => {
  const [firstRolePredicates = [], ...otherRolesPredicates] =
    rowLevelPermissionPredicatesPerRole;

  const constrainedFieldMetadataIdsPerOtherRole = otherRolesPredicates.map(
    (predicates) =>
      new Set(predicates.map((predicate) => predicate.fieldMetadataId)),
  );

  return firstRolePredicates.filter((predicate) =>
    constrainedFieldMetadataIdsPerOtherRole.every((fieldMetadataIds) =>
      fieldMetadataIds.has(predicate.fieldMetadataId),
    ),
  );
};

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
    const rowLevelPermissionPredicatesPerRole: RowLevelPermissionPredicate[][] =
      [];

    for (const permissions of permissionsArray) {
      const objPerm = permissions[objectMetadataId];

      if (!objPerm) {
        canReadObjectRecords = false;
        canUpdateObjectRecords = false;
        canSoftDeleteObjectRecords = false;
        canDestroyObjectRecords = false;
        rowLevelPermissionPredicatesPerRole.push([]);
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

      rowLevelPermissionPredicatesPerRole.push(
        objPerm.rowLevelPermissionPredicates,
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
      rowLevelPermissionPredicates: intersectRowLevelPermissionPredicates(
        rowLevelPermissionPredicatesPerRole,
      ),
      rowLevelPermissionPredicateGroups: [],
    };
  }

  return result;
};

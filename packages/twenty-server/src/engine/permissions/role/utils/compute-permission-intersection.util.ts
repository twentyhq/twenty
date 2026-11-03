import {
  type RestrictedFieldPermissions,
  type RowLevelPermissionPredicate,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/role/constants/no-role-records-permissions.constant';
import { canReachSomeRecords } from 'src/engine/permissions/role/utils/can-reach-some-records.util';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';
import { type ObjectRecordsPermissions } from 'src/engine/permissions/types/object-records-permissions.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// Keeping a field constrained by one role alone would let it cancel another role's deny in the insert guard
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

const intersectRestrictedFields = (
  objectRecordsPermissionsPerRole: (ObjectRecordsPermissions | undefined)[],
): Record<string, RestrictedFieldPermissions> => {
  const restrictedFields: Record<string, RestrictedFieldPermissions> = {};

  for (const objectRecordsPermissions of objectRecordsPermissionsPerRole) {
    for (const [fieldMetadataId, fieldPermissions] of Object.entries(
      objectRecordsPermissions?.restrictedFields ?? {},
    )) {
      const current = restrictedFields[fieldMetadataId] ?? {
        canRead: null,
        canUpdate: null,
      };

      restrictedFields[fieldMetadataId] = {
        canRead:
          current.canRead === false || fieldPermissions.canRead === false
            ? false
            : null,
        canUpdate:
          current.canUpdate === false || fieldPermissions.canUpdate === false
            ? false
            : null,
      };
    }
  }

  return restrictedFields;
};

const intersectObjectRecordsPermissions = (
  objectRecordsPermissionsPerRole: (ObjectRecordsPermissions | undefined)[],
): ObjectRecordsPermissions => {
  const isGrantedToAllRecordsByEveryRole = (
    isGranted: (objectRecordsPermissions: ObjectRecordsPermissions) => boolean,
  ) =>
    objectRecordsPermissionsPerRole.every(
      (objectRecordsPermissions) =>
        isDefined(objectRecordsPermissions) &&
        isGranted(objectRecordsPermissions),
    );
  const isReachingSomeRecordsForEveryRole = (operationType: OperationType) =>
    objectRecordsPermissionsPerRole.every((objectRecordsPermissions) =>
      canReachSomeRecords({ objectRecordsPermissions, operationType }),
    );

  const intersectedObjectRecordsPermissions: ObjectRecordsPermissions = {
    canReadAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canReadAllRecords }) => canReadAllRecords,
    ),
    canUpdateAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canUpdateAllRecords }) => canUpdateAllRecords,
    ),
    canSoftDeleteAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canSoftDeleteAllRecords }) => canSoftDeleteAllRecords,
    ),
    canDestroyAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canDestroyAllRecords }) => canDestroyAllRecords,
    ),
    restrictedFields: intersectRestrictedFields(
      objectRecordsPermissionsPerRole,
    ),
  };

  const hasRowLevelPermissions = objectRecordsPermissionsPerRole.some(
    (objectRecordsPermissions) => isDefined(objectRecordsPermissions?.rls),
  );

  if (!hasRowLevelPermissions) {
    return intersectedObjectRecordsPermissions;
  }

  return {
    ...intersectedObjectRecordsPermissions,
    rls: {
      canReadRecords: isReachingSomeRecordsForEveryRole('select'),
      canUpdateRecords: isReachingSomeRecordsForEveryRole('update'),
      canSoftDeleteRecords: isReachingSomeRecordsForEveryRole('soft-delete'),
      canDestroyRecords: isReachingSomeRecordsForEveryRole('delete'),
      predicates: intersectRowLevelPermissionPredicates(
        objectRecordsPermissionsPerRole.map(
          (objectRecordsPermissions) =>
            objectRecordsPermissions?.rls?.predicates ?? [],
        ),
      ),
      predicateGroups: [],
    },
  };
};

export const computePermissionIntersection = (
  recordsPermissionsPerRole: RoleRecordsPermissions[],
): RoleRecordsPermissions => {
  if (recordsPermissionsPerRole.length === 0) {
    return NO_ROLE_RECORDS_PERMISSIONS;
  }

  if (recordsPermissionsPerRole.length === 1) {
    return recordsPermissionsPerRole[0];
  }

  const objectMetadataIds = new Set(
    recordsPermissionsPerRole.flatMap((recordsPermissions) =>
      Object.keys(recordsPermissions.objects),
    ),
  );
  const objects: RoleRecordsPermissions['objects'] = {};

  for (const objectMetadataId of objectMetadataIds) {
    objects[objectMetadataId] = intersectObjectRecordsPermissions(
      recordsPermissionsPerRole.map(
        (recordsPermissions) => recordsPermissions.objects[objectMetadataId],
      ),
    );
  }

  return {
    canReadAllRecords: recordsPermissionsPerRole.every(
      ({ canReadAllRecords }) => canReadAllRecords,
    ),
    canUpdateAllRecords: recordsPermissionsPerRole.every(
      ({ canUpdateAllRecords }) => canUpdateAllRecords,
    ),
    canSoftDeleteAllRecords: recordsPermissionsPerRole.every(
      ({ canSoftDeleteAllRecords }) => canSoftDeleteAllRecords,
    ),
    canDestroyAllRecords: recordsPermissionsPerRole.every(
      ({ canDestroyAllRecords }) => canDestroyAllRecords,
    ),
    objects,
  };
};
